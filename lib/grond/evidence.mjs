import { participantCanAccessSource, projectHasParticipant, projectSourceKeys } from "./projects.mjs";

export const OUTPUT_TYPES = Object.freeze(["feit", "afleiding", "hypothese", "vraag", "onbekend"]);

const GROUNDED_TYPES = new Set(["feit", "afleiding"]);

function cleanText(value, maximum = 4_000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maximum);
}

function uniqueStrings(values, maximum = 100) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((value) => cleanText(value, 200)).filter(Boolean))].slice(0, maximum);
}

function evidenceIsCurrent(record, now) {
  if (record.status !== "geldig") return false;
  if (!record.validUntil) return true;
  const until = Date.parse(record.validUntil);
  return Number.isFinite(until) && until >= now.getTime();
}

export function validateEvidenceOutput(input, { project, participantId, evidence = [], now = new Date() }) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Uitkomst ontbreekt");
  }
  if (!projectHasParticipant(project, participantId)) {
    throw new Error("Uitkomst geweigerd: deelnemer hoort niet bij dit project");
  }
  const type = cleanText(input.type, 40);
  const text = cleanText(input.text);
  const evidenceIds = uniqueStrings(input.evidenceIds);
  if (!OUTPUT_TYPES.includes(type)) throw new Error("Onbekende uitkomstsoort");
  if (!text) throw new Error("Uitkomst bevat geen tekst");

  const catalog = new Map(evidence.map((record) => [record.id, record]));
  const permittedSources = new Set(projectSourceKeys(project));
  const usable = evidenceIds.every((id) => {
    const record = catalog.get(id);
    return record
      && permittedSources.has(record.source)
      && participantCanAccessSource(project, participantId, record.source)
      && evidenceIsCurrent(record, now);
  });

  if (GROUNDED_TYPES.has(type) && (!evidenceIds.length || !usable)) {
    throw new Error("Uitkomst geweigerd: voor deze deelnemer ontbreekt geldig en toegankelijk bewijs");
  }
  if (evidenceIds.length && !usable) {
    throw new Error("Uitkomst geweigerd: opgegeven bewijs is niet beschikbaar voor deze deelnemer");
  }

  return { type, text, evidenceIds };
}
