import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { projectAccess, sourcesForIdentity } from "./access.mjs";
import { validateEvidenceOutput } from "./evidence.mjs";
import { generateModelAnswer } from "./model.mjs";
import { retrieveEvidence } from "./retrieval.mjs";

function cleanQuestion(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 2_000);
}

function publicEvidence(record) {
  return {
    id: record.id,
    source: record.source,
    path: record.path,
    version: record.version,
    startLine: record.startLine,
    endLine: record.endLine,
    text: record.text,
  };
}

export class QuestionLog {
  constructor(file) {
    this.file = file;
  }

  async append(entry) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.appendFile(this.file, `${JSON.stringify(entry)}\n`, { mode: 0o600 });
  }
}

export async function answerQuestion({
  project,
  identity,
  question: input,
  workspaceRoot,
  retrieve = retrieveEvidence,
  generate = generateModelAnswer,
  log,
  personalConnection = null,
}) {
  const question = cleanQuestion(input);
  if (question.length < 3) throw new Error("Stel een vraag van ten minste drie tekens");
  const access = projectAccess(project, identity);
  if (!access) throw new Error("Project niet gevonden");
  const sources = sourcesForIdentity(project, identity);
  if (!sources.length) throw new Error("Voor deze deelnemer zijn geen bronnen vrijgegeven");
  const projectRoute = (project.models || []).find(({ task }) => task === "gesprek");
  const route = personalConnection
    ? { provider: personalConnection.provider, model: personalConnection.model, apiKey: personalConnection.apiKey, authHome: personalConnection.authHome }
    : projectRoute;
  if (!route) throw new Error("Richt eerst de modelroute ‘gesprek’ in");

  const retrieved = await retrieve({ sources, question, workspaceRoot });
  let claims;
  let requestId = "";
  if (!retrieved.evidence.length) {
    claims = [{ type: "onbekend", text: "In de toegankelijke bronnen zijn geen passende passages gevonden.", evidenceIds: [] }];
  } else {
    const generated = await generate({ route, question, project, evidence: retrieved.evidence });
    claims = generated.claims;
    requestId = generated.requestId || "";
  }
  const validateClaims = (candidateClaims) => candidateClaims.map((claim) => validateEvidenceOutput(claim, {
      project,
      participantId: access.participantId,
      evidence: retrieved.evidence,
    }));
  let validated;
  try {
    validated = validateClaims(claims);
  } catch (error) {
    if (!retrieved.evidence.length) throw error;
    const repair = await generate({
      route,
      question: `${question}\n\nHERSTEL HET BEOORDELINGSCONTRACT. De vorige uitvoer is deterministisch geweigerd: ${error.message}. Gebruik voor ieder feit en iedere afleiding ten minste één exacte id uit BRONPASSAGES. Vorige uitvoer: ${JSON.stringify({ claims })}`,
      project,
      evidence: retrieved.evidence,
    });
    claims = repair.claims;
    requestId = repair.requestId || requestId;
    validated = validateClaims(claims);
  }
  const used = new Set(validated.flatMap(({ evidenceIds }) => evidenceIds));
  const evidence = retrieved.evidence.filter(({ id }) => used.has(id)).map(publicEvidence);
  const result = {
    id: crypto.randomUUID(),
    projectId: project.id,
    askedAt: new Date().toISOString(),
    participant: { id: access.participantId, role: access.role, name: identity.name },
    question,
    claims: validated,
    evidence,
    sourceFailures: retrieved.failures || [],
    model: { provider: route.provider, name: route.model, requestId },
  };
  if (log) await log.append(result);
  return result;
}
