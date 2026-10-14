import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolveWorkspacePath } from "./projects.mjs";

const execFileAsync = promisify(execFile);
const TEXT_EXTENSIONS = new Set([
  ".md", ".mdx", ".txt", ".json", ".yaml", ".yml", ".html", ".csv",
  ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".css", ".py", ".java",
]);
const IGNORED_PARTS = new Set([
  ".git", ".data", "node_modules", "dist", "build", "coverage", ".next", "vendor",
]);
const STOP_WORDS = new Set([
  "aan", "als", "bij", "dan", "dat", "de", "deze", "die", "dit", "door", "een", "en",
  "er", "het", "hoe", "ik", "in", "is", "kan", "kun", "maar", "met", "naar", "of", "om",
  "op", "te", "tot", "uit", "van", "voor", "wat", "we", "welke", "wie", "wordt", "zijn",
]);
const MAX_FILES_PER_SOURCE = 80;
const MAX_FILE_BYTES = 220_000;
const MAX_PASSAGES = 12;
const CHUNK_LINES = 45;
const CHUNK_OVERLAP = 8;

function words(value) {
  return String(value || "")
    .toLocaleLowerCase("nl")
    .normalize("NFKD")
    .match(/[a-z0-9]{2,}/g) || [];
}

export function questionTerms(question) {
  return [...new Set(words(question).filter((word) => !STOP_WORDS.has(word)))].slice(0, 24);
}

function textualFile(file) {
  const normalized = file.replaceAll("\\", "/");
  const parts = normalized.split("/");
  if (parts.some((part) => IGNORED_PARTS.has(part))) return false;
  const basename = path.basename(normalized).toLocaleLowerCase("en");
  if (["license", "readme", "changelog", "agents.md"].includes(basename)) return true;
  if (/lock(?:\.json)?$/.test(basename)) return false;
  return TEXT_EXTENSIONS.has(path.extname(basename));
}

function filePriority(file) {
  const lower = file.toLocaleLowerCase("en");
  let score = 0;
  if (/readme|visie|vision|product|doel|besluit|specificatie|requirements/.test(lower)) score += 5;
  if (/docs?\//.test(lower)) score += 3;
  if (/test|fixture|snapshot|package-lock/.test(lower)) score -= 4;
  return score;
}

function passagesFromFile(file, terms) {
  const lines = String(file.content || "").replaceAll("\r\n", "\n").split("\n");
  const passages = [];
  const step = CHUNK_LINES - CHUNK_OVERLAP;
  for (let start = 0; start < lines.length; start += step) {
    const selected = lines.slice(start, start + CHUNK_LINES);
    const text = selected.join("\n").trim();
    if (!text) continue;
    const lower = text.toLocaleLowerCase("nl").normalize("NFKD");
    const hits = terms.filter((term) => lower.includes(term));
    let score = hits.length * 10;
    for (const term of hits) score += Math.min(5, lower.split(term).length - 1);
    score += filePriority(file.path);
    passages.push({
      source: file.source,
      path: file.path,
      version: file.version,
      startLine: start + 1,
      endLine: Math.min(lines.length, start + CHUNK_LINES),
      text,
      score,
    });
  }
  return passages;
}

export function rankPassages(files, question, maximum = MAX_PASSAGES) {
  const terms = questionTerms(question);
  const passages = files.flatMap((file) => passagesFromFile(file, terms));
  passages.sort((left, right) => right.score - left.score
    || filePriority(right.path) - filePriority(left.path)
    || left.path.localeCompare(right.path, "nl")
    || left.startLine - right.startLine);
  const withHits = passages.filter(({ score }) => score > 0);
  const chosen = (withHits.length ? withHits : passages).slice(0, maximum);
  return chosen.map((passage, index) => ({
    id: `bewijs-${index + 1}`,
    status: "geldig",
    ...passage,
  }));
}

async function localFiles(source, relative, workspaceRoot) {
  const root = resolveWorkspacePath(workspaceRoot, relative);
  const stats = await fs.stat(root).catch(() => null);
  if (!stats) return [];
  const found = [];

  async function visit(directory) {
    if (found.length >= MAX_FILES_PER_SOURCE) return;
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
    entries.sort((left, right) => left.name.localeCompare(right.name, "nl"));
    for (const entry of entries) {
      if (found.length >= MAX_FILES_PER_SOURCE || IGNORED_PARTS.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && textualFile(absolute)) {
        const fileStats = await fs.stat(absolute);
        if (fileStats.size <= MAX_FILE_BYTES) found.push(absolute);
      }
    }
  }

  if (stats.isDirectory()) await visit(root);
  else if (stats.isFile() && textualFile(root) && stats.size <= MAX_FILE_BYTES) found.push(root);
  return Promise.all(found.map(async (absolute) => ({
    source,
    path: path.relative(root, absolute) || path.basename(absolute),
    version: `${Math.trunc((await fs.stat(absolute)).mtimeMs)}`,
    content: await fs.readFile(absolute, "utf8"),
  })));
}

async function githubJson(args) {
  const { stdout } = await execFileAsync("gh", ["api", ...args], {
    timeout: 30_000,
    maxBuffer: 8_000_000,
    encoding: "utf8",
  });
  return JSON.parse(stdout);
}

async function githubFiles(source, repository) {
  const tree = await githubJson([`repos/${repository}/git/trees/HEAD?recursive=1`]);
  const entries = (tree.tree || [])
    .filter((entry) => entry.type === "blob" && entry.size <= MAX_FILE_BYTES && textualFile(entry.path))
    .sort((left, right) => filePriority(right.path) - filePriority(left.path)
      || left.path.localeCompare(right.path, "nl"))
    .slice(0, MAX_FILES_PER_SOURCE);
  const files = [];
  for (const entry of entries) {
    const blob = await githubJson([`repos/${repository}/git/blobs/${entry.sha}`]);
    if (blob.encoding !== "base64") continue;
    files.push({
      source,
      path: entry.path,
      version: entry.sha,
      content: Buffer.from(blob.content.replaceAll("\n", ""), "base64").toString("utf8"),
    });
  }
  return files;
}

export async function retrieveEvidence({ sources, question, workspaceRoot, loaders = {} }) {
  const loaded = await Promise.all(sources.map(async (source) => {
    const separator = source.indexOf(":");
    const type = source.slice(0, separator);
    const id = source.slice(separator + 1);
    try {
      if (type === "github") return { files: await (loaders.github || githubFiles)(source, id), failures: [] };
      else if (type === "local" || type === "folder") {
        return { files: await (loaders.local || localFiles)(source, id, workspaceRoot), failures: [] };
      }
      return { files: [], failures: [] };
    } catch (error) {
      return { files: [], failures: [{ source, message: error.message || "Bron kon niet worden gelezen" }] };
    }
  }));
  const files = loaded.flatMap((result) => result.files);
  const failures = loaded.flatMap((result) => result.failures);
  return { evidence: rankPassages(files, question), failures };
}
