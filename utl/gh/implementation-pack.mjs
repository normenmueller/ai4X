import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const IMPLEMENTATION_PACK_LIMITS = Object.freeze({
  nonEmptyLines: 100,
  utf8Bytes: 12_000,
});

export const IMPLEMENTATION_PACK_SECTIONS = Object.freeze([
  "Authority bindings",
  "Changed boundaries",
  "Decisions and failure behavior",
  "Acceptance evidence",
  "Verification and candidate",
  "Residual risks and follow-ups",
]);

const canonicalHeading = "## Implementation Pack";
const forbiddenSpecificationHeadings = new Set([
  "api specification",
  "architecture",
  "implementation strategy",
  "intended behavior",
  "requirements",
  "schema specification",
  "test specification",
]);
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

function failure(kind, message, details = {}) {
  return { ok: false, error: { kind, message, ...details } };
}

function decodeUtf8(input) {
  if (!Buffer.isBuffer(input)) {
    return failure("INPUT_NOT_BUFFER", "Input must be a Buffer containing the raw pull-request body.");
  }
  try {
    return { ok: true, value: utf8Decoder.decode(input) };
  } catch {
    return failure("INVALID_UTF8", "Pull-request body is not valid UTF-8.");
  }
}

function rawLines(input) {
  const lines = [];
  let start = 0;
  for (let index = 0; index <= input.length; index += 1) {
    if (index === input.length || input[index] === 0x0a) {
      const raw = input.subarray(start, index);
      const content = raw.length > 0 && raw[raw.length - 1] === 0x0d ? raw.subarray(0, -1) : raw;
      lines.push({ start, end: index === input.length ? index : index + 1, raw, content });
      start = index + 1;
    }
  }
  return lines;
}

function decodedLine(line) {
  return utf8Decoder.decode(line.content);
}

function extractRawSection(input) {
  const decoded = decodeUtf8(input);
  if (!decoded.ok) return decoded;

  const lines = rawLines(input);
  const matches = lines
    .map((line, index) => ({ line, index, text: decodedLine(line) }))
    .filter(({ text }) => text === canonicalHeading);

  if (matches.length === 0) {
    return failure("IMPLEMENTATION_PACK_MISSING", `Missing exact heading: ${canonicalHeading}`);
  }
  if (matches.length !== 1) {
    return failure("IMPLEMENTATION_PACK_DUPLICATE", "The pull-request body must contain exactly one Implementation Pack section.", {
      occurrences: matches.length,
    });
  }

  const match = matches[0];
  let end = input.length;
  for (let index = match.index + 1; index < lines.length; index += 1) {
    const text = decodedLine(lines[index]);
    if (/^## [^#]/u.test(text)) {
      end = lines[index].start;
      break;
    }
  }

  return { ok: true, value: input.subarray(match.line.start, end) };
}

function measureRawSection(section) {
  const nonEmptyLines = rawLines(section).filter(({ content }) =>
    content.some((byte) => byte !== 0x20 && byte !== 0x09),
  ).length;
  return { nonEmptyLines, utf8Bytes: section.length };
}

function parseCanonicalSections(section) {
  const normalized = utf8Decoder.decode(section).replaceAll("\r\n", "\n");
  const lines = normalized.split("\n");
  const headings = [];
  for (let index = 1; index < lines.length; index += 1) {
    const match = /^### (.+)$/u.exec(lines[index]);
    if (match) headings.push({ name: match[1], index });
  }

  const forbidden = headings.find(({ name }) => forbiddenSpecificationHeadings.has(name.toLowerCase()));
  if (forbidden) {
    return failure("STRUCTURAL_DUPLICATION", "Implementation Pack contains a competing specification heading.", {
      heading: forbidden.name,
    });
  }

  if (
    headings.length !== IMPLEMENTATION_PACK_SECTIONS.length ||
    !headings.every(({ name }, index) => name === IMPLEMENTATION_PACK_SECTIONS[index])
  ) {
    return failure("PACK_STRUCTURE_INVALID", "Implementation Pack must contain the six canonical sections exactly once and in order.", {
      expected: IMPLEMENTATION_PACK_SECTIONS,
      actual: headings.map(({ name }) => name),
    });
  }

  const sections = Object.fromEntries(headings.map(({ name, index }, headingIndex) => {
    const next = headings[headingIndex + 1];
    const body = lines.slice(index + 1, next ? next.index : lines.length);
    while (body.length > 0 && body.at(-1).trim() === "") body.pop();
    while (body.length > 0 && body[0].trim() === "") body.shift();
    return [name, body];
  }));

  const empty = IMPLEMENTATION_PACK_SECTIONS.find((name) => sections[name].length === 0);
  if (empty) {
    return failure("PACK_SECTION_EMPTY", "Every canonical section requires concise content or an explicit n/a entry.", {
      section: empty,
    });
  }

  return { ok: true, value: sections };
}

function hasBinding(lines, label, valuePattern) {
  const prefix = `- ${label}: `;
  return lines.some((line) => line.startsWith(prefix) && valuePattern.test(line.slice(prefix.length)));
}

function validateRequiredBindings(sections) {
  const authority = sections["Authority bindings"];
  if (
    !hasBinding(authority, "Work item", /^`#\d+`$/u) ||
    !hasBinding(authority, "Requirements", /^`(?!n\/a`$).+`$/u)
  ) {
    return failure("AUTHORITY_BINDING_MISSING", "Authority bindings require a canonical work item and immutable Requirements binding.");
  }

  const evidence = sections["Acceptance evidence"];
  if (!evidence.some((line) => /^- AC-\d+[a-z]?:\s+\S/u.test(line))) {
    return failure("ACCEPTANCE_EVIDENCE_MISSING", "Acceptance evidence requires at least one AC-to-artifact/test/evidence mapping.");
  }

  const verification = sections["Verification and candidate"];
  const candidate = verification.find((line) => line.startsWith("- Candidate identity: `"));
  const candidateValue = candidate?.slice("- Candidate identity: `".length, -1);
  if (!candidate || !candidate.endsWith("`") || !candidateValue || candidateValue === "n/a") {
    return failure("CANDIDATE_BINDING_MISSING", "Verification requires one exact reproducible candidate identity.");
  }
  if (!verification.some((line) => /^- Verification:\s+\S/u.test(line))) {
    return failure("VERIFICATION_BINDING_MISSING", "Verification requires at least one exact command/evidence binding.");
  }

  return { ok: true };
}

export function validateImplementationPack(input) {
  const extracted = extractRawSection(input);
  if (!extracted.ok) return extracted;

  const measures = measureRawSection(extracted.value);
  if (
    measures.nonEmptyLines > IMPLEMENTATION_PACK_LIMITS.nonEmptyLines ||
    measures.utf8Bytes > IMPLEMENTATION_PACK_LIMITS.utf8Bytes
  ) {
    return failure("PACK_TOO_LARGE", "Implementation Pack exceeds a deterministic size limit; factor the Story or owning authority.", {
      ...measures,
      lineLimit: IMPLEMENTATION_PACK_LIMITS.nonEmptyLines,
      byteLimit: IMPLEMENTATION_PACK_LIMITS.utf8Bytes,
    });
  }

  const parsed = parseCanonicalSections(extracted.value);
  if (!parsed.ok) return parsed;
  const bindings = validateRequiredBindings(parsed.value);
  if (!bindings.ok) return bindings;

  const canonicalFacts = JSON.stringify(
    IMPLEMENTATION_PACK_SECTIONS.map((name) => [name, parsed.value[name]]),
  );
  return {
    ok: true,
    value: {
      ...measures,
      lineLimit: IMPLEMENTATION_PACK_LIMITS.nonEmptyLines,
      byteLimit: IMPLEMENTATION_PACK_LIMITS.utf8Bytes,
      sectionCount: IMPLEMENTATION_PACK_SECTIONS.length,
      canonicalFactsDigest: createHash("sha256").update(canonicalFacts).digest("hex"),
    },
  };
}

export function compareImplementationPacks(transientInput, publishedInput) {
  const transient = validateImplementationPack(transientInput);
  if (!transient.ok) return failure("TRANSIENT_PACK_INVALID", "Transient pre-PR map is invalid.", { cause: transient.error });
  const published = validateImplementationPack(publishedInput);
  if (!published.ok) return failure("PUBLISHED_PACK_INVALID", "Published PR Implementation Pack is invalid.", { cause: published.error });
  if (transient.value.canonicalFactsDigest !== published.value.canonicalFactsDigest) {
    return failure("PACK_FACTS_CHANGED", "Published Implementation Pack does not preserve the transient map's canonical facts.", {
      transientDigest: transient.value.canonicalFactsDigest,
      publishedDigest: published.value.canonicalFactsDigest,
    });
  }
  return { ok: true, value: { canonicalFactsDigest: transient.value.canonicalFactsDigest } };
}

const findingStatuses = new Set(["open", "remediated", "closed", "escalation-required"]);
const terminalFindingStatuses = new Set(["closed", "escalation-required"]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.length > 0;
}

function hasExactKeys(value, expected) {
  return (
    isRecord(value) &&
    Object.keys(value).sort().join("\0") === [...expected].sort().join("\0")
  );
}

function validPredecessorProvenance(value) {
  return (
    hasExactKeys(value, ["candidateRevision", "evidence", "verification"]) &&
    isNonEmptyString(value.candidateRevision) &&
    isNonEmptyString(value.evidence) &&
    isNonEmptyString(value.verification)
  );
}

function validRereviewEvidence(value, findingId) {
  return (
    hasExactKeys(value, ["reviewer", "findingId", "evidence", "verification"]) &&
    isNonEmptyString(value.reviewer) &&
    value.findingId === findingId &&
    isNonEmptyString(value.evidence) &&
    isNonEmptyString(value.verification)
  );
}

function validEscalationPosition(value) {
  return (
    hasExactKeys(value, ["provenance", "position", "evidence"]) &&
    isNonEmptyString(value.provenance) &&
    isNonEmptyString(value.position) &&
    isNonEmptyString(value.evidence)
  );
}

function validateFindingRecord(record) {
  if (
    !isRecord(record) ||
    !/^R?\d+-F\d+$/u.test(record.id) ||
    !["high", "medium", "low"].includes(record.severity) ||
    !isNonEmptyString(record.obligation) ||
    !isNonEmptyString(record.artifact) ||
    !isNonEmptyString(record.candidateRevision) ||
    !isNonEmptyString(record.evidence) ||
    !isNonEmptyString(record.verification) ||
    !findingStatuses.has(record.status) ||
    !Number.isInteger(record.remediationCount) ||
    record.remediationCount < 0 ||
    !Number.isInteger(record.rereviewCount) ||
    record.rereviewCount < 0
  ) {
    return failure("FINDING_RECORD_INVALID", "Finding lifecycle record is incomplete or malformed.");
  }

  if (record.status === "open") {
    if (
      record.remediationCount !== 0 ||
      record.rereviewCount !== 0 ||
      record.remediation !== null ||
      Object.hasOwn(record, "predecessor") ||
      Object.hasOwn(record, "rereview") ||
      Object.hasOwn(record, "positions") ||
      Object.hasOwn(record, "recommendation")
    ) {
      return failure("FINDING_RECORD_INVALID", "An open finding must be the unremediated 0/0 lifecycle anchor.");
    }
    return { ok: true };
  }

  if (
    record.remediationCount !== 1 ||
    !isNonEmptyString(record.remediation) ||
    !validPredecessorProvenance(record.predecessor)
  ) {
    return failure("FINDING_RECORD_INVALID", "A post-remediation finding requires one remediation and exact predecessor provenance.");
  }

  if (record.status === "remediated") {
    if (
      record.rereviewCount !== 0 ||
      Object.hasOwn(record, "rereview") ||
      Object.hasOwn(record, "positions") ||
      Object.hasOwn(record, "recommendation")
    ) {
      return failure("FINDING_RECORD_INVALID", "A remediated finding must await its sole bounded re-review at 1/0.");
    }
    return { ok: true };
  }

  if (record.rereviewCount !== 1 || !validRereviewEvidence(record.rereview, record.id)) {
    return failure("FINDING_RECORD_INVALID", "A terminal finding requires one explicit finding-bounded re-review at 1/1.");
  }

  if (record.status === "closed") {
    if (Object.hasOwn(record, "positions") || Object.hasOwn(record, "recommendation")) {
      return failure("FINDING_RECORD_INVALID", "A closed finding cannot carry escalation-only evidence.");
    }
    return { ok: true };
  }

  if (
    !Array.isArray(record.positions) ||
    record.positions.length !== 2 ||
    !record.positions.every(validEscalationPosition) ||
    !isNonEmptyString(record.recommendation)
  ) {
    return failure("ESCALATION_EVIDENCE_MISSING", "Escalation requires exactly two evidence-backed positions and one concrete recommendation.");
  }
  return { ok: true };
}

function exactPredecessorProvenance(previous, next) {
  return (
    next.predecessor.candidateRevision === previous.candidateRevision &&
    next.predecessor.evidence === previous.evidence &&
    next.predecessor.verification === previous.verification
  );
}

export function validateFindingTransition(previous, next) {
  const previousValidation = validateFindingRecord(previous);
  if (!previousValidation.ok) return previousValidation;
  if (terminalFindingStatuses.has(previous.status)) {
    return failure("FINDING_LOOP_EXHAUSTED", "The finding already exhausted its one remediation and one bounded re-review.");
  }
  const nextValidation = validateFindingRecord(next);
  if (!nextValidation.ok) return nextValidation;
  if (previous.id !== next.id) {
    return failure("FINDING_ID_CHANGED", "A remediation or re-review may not rename the stable finding.");
  }
  if (
    previous.severity !== next.severity ||
    previous.obligation !== next.obligation ||
    previous.artifact !== next.artifact
  ) {
    return failure("FINDING_IDENTITY_CHANGED", "A finding transition may not change severity, normative obligation, or owning artifact.");
  }
  if (previous.status === "open") {
    if (next.status !== "remediated") {
      return failure("FINDING_TRANSITION_INVALID", "An open finding permits exactly one direct remediation.");
    }
    if (!exactPredecessorProvenance(previous, next)) {
      return failure("FINDING_PROVENANCE_INVALID", "A finding transition must retain exact predecessor candidate and evidence provenance.");
    }
    return { ok: true, value: { status: next.status } };
  }

  if (previous.status === "remediated") {
    if (!terminalFindingStatuses.has(next.status)) {
      return failure("FINDING_TRANSITION_INVALID", "A remediated finding permits exactly one independent bounded re-review.");
    }
    if (!exactPredecessorProvenance(previous, next)) {
      return failure("FINDING_PROVENANCE_INVALID", "A finding transition must retain exact predecessor candidate and evidence provenance.");
    }
    return { ok: true, value: { status: next.status } };
  }

  return failure("FINDING_TRANSITION_INVALID", "Unknown or unsupported finding lifecycle state.");
}

async function main(argv) {
  const [command, ...paths] = argv;
  let result;
  if (command === "validate" && paths.length === 1) {
    result = validateImplementationPack(await readFile(paths[0]));
  } else if (command === "compare" && paths.length === 2) {
    result = compareImplementationPacks(await readFile(paths[0]), await readFile(paths[1]));
  } else if (command === "transition" && paths.length === 2) {
    result = validateFindingTransition(
      JSON.parse(await readFile(paths[0], "utf8")),
      JSON.parse(await readFile(paths[1], "utf8")),
    );
  } else {
    result = failure("USAGE", "Usage: implementation-pack.mjs validate FILE | compare TRANSIENT PUBLISHED | transition BEFORE AFTER");
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main(process.argv.slice(2));
}
