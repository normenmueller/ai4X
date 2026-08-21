export const ACCEPTED_CODEX_VERSIONS = Object.freeze(["0.147.0", "0.148.0"]);

const acceptedVersions = new Set(ACCEPTED_CODEX_VERSIONS);

export function acceptsCodexVersion(version) {
  return acceptedVersions.has(version);
}
