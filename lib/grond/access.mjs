import { accessibleSourceKeys, projectSourceKeys } from "./projects.mjs";

const LOCAL_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

function header(headers, name) {
  const value = headers?.[name];
  return Array.isArray(value) ? value[0] : (typeof value === "string" ? value.trim() : "");
}

function normalizeLogin(value) {
  return String(value || "").trim().toLocaleLowerCase("en");
}

export function identityFromRequest({ remoteAddress = "", headers = {} }) {
  if (!LOCAL_ADDRESSES.has(remoteAddress)) return null;
  const tailscaleLogin = normalizeLogin(header(headers, "tailscale-user-login"));
  if (tailscaleLogin) {
    return {
      kind: "tailscale",
      login: tailscaleLogin,
      name: header(headers, "tailscale-user-name") || tailscaleLogin,
    };
  }
  return { kind: "local", login: "", name: "Lokaal" };
}

export function projectAccess(project, identity) {
  if (!identity) return null;
  if (identity.kind === "local") return { role: "eigenaar", participantId: "eigenaar", canManage: true };
  if (project.ownerLogin && normalizeLogin(project.ownerLogin) === identity.login) {
    return { role: "eigenaar", participantId: "eigenaar", canManage: true };
  }
  const participant = (project.participants || []).find(({ login }) => (
    login && normalizeLogin(login) === identity.login
  ));
  return participant
    ? { role: participant.role, participantId: participant.id, canManage: false }
    : null;
}

export function sourcesForIdentity(project, identity) {
  const access = projectAccess(project, identity);
  if (!access) return [];
  return access.role === "eigenaar"
    ? projectSourceKeys(project)
    : accessibleSourceKeys(project, access.participantId);
}

export function projectForIdentity(project, identity) {
  const access = projectAccess(project, identity);
  if (!access) return null;
  const result = structuredClone(project);
  result.access = access;
  if (access.role === "eigenaar") return result;

  const sources = new Set(sourcesForIdentity(project, identity));
  result.githubRepositories = result.githubRepositories.filter((id) => sources.has(`github:${id}`));
  result.localRepositories = result.localRepositories.filter((id) => sources.has(`local:${id}`));
  result.sourceFolders = result.sourceFolders.filter((id) => sources.has(`folder:${id}`));
  result.participants = result.participants.filter(({ id }) => id === access.participantId)
    .map(({ id, name, role }) => ({ id, name, role }));
  result.sourceGrants = [];
  result.ownerLogin = "";
  return result;
}
