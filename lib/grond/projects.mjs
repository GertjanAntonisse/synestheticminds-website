import crypto from "node:crypto";
import path from "node:path";

export const PROJECT_SCHEMA_VERSION = 5;

export const ASSISTANTS = Object.freeze([
  { id: "codex", label: "Codex", kind: "agent" },
  { id: "claude", label: "Claude Code", kind: "agent" },
]);

const MODEL_TASKS = new Set(["gesprek", "onderzoek", "controle"]);
const ASSISTANT_IDS = new Set(ASSISTANTS.map(({ id }) => id));
const PARTICIPANT_ROLES = new Set(["deelnemer", "beoordelaar"]);
const MODEL_POLICIES = new Set(["persoonlijk", "projectstandaard", "alleen-lokaal"]);
const SOURCE_TYPES = new Set(["github", "local", "folder"]);

function cleanText(value, maximum = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maximum);
}

function uniqueStrings(values, maximum = 100) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => cleanText(value, 500)).filter(Boolean))].slice(0, maximum);
}

function participantId(name) {
  const stem = cleanText(name, 120)
    .toLocaleLowerCase("nl")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  if (!stem) throw new Error("Deelnemer heeft geen geldige naam");
  return `persoon-${stem}`;
}

export function normalizeLogin(value) {
  const login = cleanText(value, 254).toLocaleLowerCase("en");
  if (!login) return "";
  if (/\s|[\u0000-\u001f\u007f]/.test(login)) throw new Error("Aanmeldidentiteit is ongeldig");
  return login;
}

function validateParticipants(values, owner) {
  if (!Array.isArray(values)) return [];
  const found = new Map();
  const logins = new Set();
  for (const entry of values.slice(0, 50)) {
    const name = cleanText(entry?.name, 120);
    if (!name || name.toLocaleLowerCase("nl") === owner.toLocaleLowerCase("nl")) continue;
    const id = participantId(name);
    const role = cleanText(entry?.role, 40) || "deelnemer";
    const login = normalizeLogin(entry?.login);
    if (!PARTICIPANT_ROLES.has(role)) throw new Error("Onbekende deelnemersrol");
    if (found.has(id)) throw new Error("Deelnemers moeten een unieke naam hebben");
    if (login && logins.has(login)) throw new Error("Aanmeldidentiteiten moeten uniek zijn");
    if (login) logins.add(login);
    found.set(id, { id, name, login, role });
  }
  return [...found.values()];
}

export function sourceKey(type, id) {
  if (!SOURCE_TYPES.has(type)) throw new Error("Onbekend brontype");
  const cleanId = cleanText(id, 500);
  if (!cleanId) throw new Error("Bronidentiteit ontbreekt");
  return `${type}:${cleanId}`;
}

export function projectSourceKeys(project) {
  return [
    ...(project.githubRepositories || []).map((id) => sourceKey("github", id)),
    ...(project.localRepositories || []).map((id) => sourceKey("local", id)),
    ...(project.sourceFolders || []).map((id) => sourceKey("folder", id)),
  ];
}

function validateSourceGrants(values, participants, allowedSources) {
  if (!Array.isArray(values)) return [];
  const participantIds = new Set(participants.map(({ id }) => id));
  const sourceKeys = new Set(allowedSources);
  const seen = new Set();
  const grants = [];
  for (const entry of values.slice(0, 1_000)) {
    const participantIdValue = cleanText(entry?.participantId, 80);
    const source = cleanText(entry?.source, 600);
    const identity = `${participantIdValue}\u0000${source}`;
    if (!participantIds.has(participantIdValue)) throw new Error("Bronrecht verwijst naar een onbekende deelnemer");
    if (!sourceKeys.has(source)) throw new Error("Bronrecht verwijst naar een bron buiten het project");
    if (seen.has(identity)) continue;
    seen.add(identity);
    grants.push({ participantId: participantIdValue, source });
  }
  return grants;
}

export function safeProjectId(value = "") {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9-]{5,63}$/.test(value)) {
    throw new Error("Ongeldig projectnummer");
  }
  return value;
}

export function createProjectId(name) {
  const stem = cleanText(name, 48)
    .toLocaleLowerCase("nl")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36) || "project";
  return `${stem}-${crypto.randomBytes(3).toString("hex")}`;
}

export function resolveWorkspacePath(workspaceRoot, candidate) {
  const relative = cleanText(candidate, 500);
  if (!relative) throw new Error("Kies een map binnen de werkmap");
  const root = path.resolve(workspaceRoot);
  const resolved = path.resolve(root, relative);
  if (resolved === root || !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("Map valt buiten de toegestane werkmap");
  }
  return resolved;
}

function validateRelativePaths(values, workspaceRoot) {
  return uniqueStrings(values).map((value) => {
    resolveWorkspacePath(workspaceRoot, value);
    return value;
  });
}

export function validateGitHubRepository(value) {
  const repository = cleanText(value, 200);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error("Ongeldige GitHub-repository");
  }
  return repository;
}

function validateGitHubRepositories(values) {
  return uniqueStrings(values).map(validateGitHubRepository);
}

function validateModels(values) {
  if (!Array.isArray(values)) return [];
  return values.slice(0, 20).map((entry) => {
    const task = cleanText(entry?.task, 40);
    const provider = cleanText(entry?.provider, 80);
    const model = cleanText(entry?.model, 160);
    if (!MODEL_TASKS.has(task)) throw new Error("Onbekende modeltaak");
    if (!provider && !model) return null;
    if (!provider || !model) throw new Error("Vul bij een model zowel aanbieder als modelnaam in");
    return { task, provider, model };
  }).filter(Boolean);
}

export function validateProject(input, workspaceRoot, existing = null) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Projectgegevens ontbreken");
  }
  const name = cleanText(input.name, 120);
  if (!name) throw new Error("Geef het project een naam");

  const assistants = uniqueStrings(input.assistants, 10);
  if (assistants.some((id) => !ASSISTANT_IDS.has(id))) {
    throw new Error("Onbekende assistent in project");
  }

  const owner = cleanText(input.owner, 120);
  const modelPolicy = cleanText(input.modelPolicy, 40) || "persoonlijk";
  if (!MODEL_POLICIES.has(modelPolicy)) throw new Error("Onbekend modelbeleid");
  const participants = validateParticipants(input.participants, owner);
  const now = new Date().toISOString();
  const base = {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id: existing?.id || createProjectId(name),
    name,
    goal: cleanText(input.goal, 2_000),
    owner,
    ownerLogin: normalizeLogin(input.ownerLogin),
    modelPolicy,
    githubRepositories: validateGitHubRepositories(input.githubRepositories),
    localRepositories: validateRelativePaths(input.localRepositories || input.repositories, workspaceRoot),
    sourceFolders: validateRelativePaths(input.sourceFolders, workspaceRoot),
    assistants,
    models: validateModels(input.models),
    boundaries: cleanText(input.boundaries, 2_000),
    participants,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  base.sourceGrants = validateSourceGrants(input.sourceGrants, participants, projectSourceKeys(base));
  return base;
}

export function publicProject(project) {
  return structuredClone(project);
}

export function participantCanAccessSource(project, participantIdValue, source) {
  if (participantIdValue === "eigenaar") return projectSourceKeys(project).includes(source);
  return (project.sourceGrants || []).some((grant) => (
    grant.participantId === participantIdValue && grant.source === source
  ));
}

export function projectHasParticipant(project, participantIdValue) {
  return participantIdValue === "eigenaar"
    || (project.participants || []).some(({ id }) => id === participantIdValue);
}

export function accessibleSourceKeys(project, participantIdValue) {
  return projectSourceKeys(project).filter((source) => participantCanAccessSource(project, participantIdValue, source));
}
