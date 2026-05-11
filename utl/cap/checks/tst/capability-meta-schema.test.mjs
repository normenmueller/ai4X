/**
 * Tests for Story #38: Central capability metadata schema definition.
 *
 * Verifies the structural correctness of
 * adm/gdl/dev/schemas/capability-meta.schema.yaml against acceptance criteria
 * AC-01 through AC-09 (schema definition scope only — no validation behavior).
 *
 * The schema uses a Custom YAML DSL (architecture decision U1) with:
 *   - schema.version for schema versioning
 *   - fields: as field container (not properties:)
 *   - per-field required: true/false (not a top-level required array)
 *
 * Run: node --test utl/cap/checks/tst/capability-meta-schema.test.mjs
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.resolve(
  __dirname,
  '../../../../adm/gdl/dev/schemas/capability-meta.schema.yaml',
);

function loadSchema() {
  const content = fs.readFileSync(SCHEMA_PATH, 'utf8');
  return YAML.parse(content);
}

describe('capability-meta.schema.yaml — AC-01: existence and parseability', () => {
  it('schema file exists at the canonical path', () => {
    assert.ok(
      fs.existsSync(SCHEMA_PATH),
      `Schema file not found at ${SCHEMA_PATH}`,
    );
  });

  it('schema file is parseable YAML', () => {
    const schema = loadSchema();
    assert.equal(typeof schema, 'object');
    assert.notEqual(schema, null);
  });

  it('schema declares a version under schema.version', () => {
    const schema = loadSchema();
    assert.ok(schema.schema, 'schema block must exist');
    assert.equal(typeof schema.schema.version, 'string');
    assert.ok(schema.schema.version.length > 0, 'schema.version must be non-empty');
  });

  it('schema uses fields: as field container', () => {
    const schema = loadSchema();
    assert.ok(schema.fields, 'fields block must exist');
    assert.equal(typeof schema.fields, 'object');
  });
});

describe('capability-meta.schema.yaml — AC-02: required fields', () => {
  it('exactly three fields are marked required: true', () => {
    const schema = loadSchema();
    const requiredFields = Object.entries(schema.fields)
      .filter(([, def]) => def.required === true)
      .map(([name]) => name);
    assert.equal(requiredFields.length, 3);
  });

  it('required fields are exactly [id, version, owner]', () => {
    const schema = loadSchema();
    const requiredFields = Object.entries(schema.fields)
      .filter(([, def]) => def.required === true)
      .map(([name]) => name);
    const expected = ['id', 'version', 'owner'];
    assert.deepEqual(requiredFields.sort(), [...expected].sort());
  });
});

describe('capability-meta.schema.yaml — AC-03: optional fields', () => {
  it('fields contains exactly 8 field declarations (3 required + 5 optional)', () => {
    const schema = loadSchema();
    const allKeys = Object.keys(schema.fields);
    assert.equal(allKeys.length, 8);
  });

  it('optional fields are exactly [do_not_use_when, distinguish_from, requires, conflicts, sources]', () => {
    const schema = loadSchema();
    const optionalFields = Object.entries(schema.fields)
      .filter(([, def]) => def.required === false)
      .map(([name]) => name);
    const expected = [
      'do_not_use_when',
      'distinguish_from',
      'requires',
      'conflicts',
      'sources',
    ];
    assert.deepEqual(optionalFields.sort(), [...expected].sort());
  });
});

describe('capability-meta.schema.yaml — AC-05: excluded fields', () => {
  const EXCLUDED = [
    'approved_by',
    'approved_at',
    'scope',
    'status',
    'review_due',
    'migration_note',
  ];

  for (const field of EXCLUDED) {
    it(`field "${field}" is NOT declared in schema fields`, () => {
      const schema = loadSchema();
      assert.ok(
        !(field in schema.fields),
        `Excluded field "${field}" must not be present in schema fields`,
      );
    });
  }
});

describe('capability-meta.schema.yaml — AC-07: owner semantics', () => {
  it('owner description contains "Semantic Authority over the cognitive contract"', () => {
    const schema = loadSchema();
    const desc = schema.fields.owner.description;
    assert.ok(
      desc.includes('Semantic Authority over the cognitive contract'),
      `owner description must reference "Semantic Authority over the cognitive contract"`,
    );
  });
});

describe('capability-meta.schema.yaml — AC-08: do_not_use_when type', () => {
  it('do_not_use_when is typed as array', () => {
    const schema = loadSchema();
    assert.equal(schema.fields.do_not_use_when.type, 'array');
  });

  it('do_not_use_when items are typed as string', () => {
    const schema = loadSchema();
    assert.equal(schema.fields.do_not_use_when.items.type, 'string');
  });
});

describe('capability-meta.schema.yaml — AC-09: distinguish_from structure', () => {
  it('distinguish_from is typed as array', () => {
    const schema = loadSchema();
    assert.equal(schema.fields.distinguish_from.type, 'array');
  });

  it('distinguish_from items are typed as object', () => {
    const schema = loadSchema();
    assert.equal(schema.fields.distinguish_from.items.type, 'object');
  });

  it('distinguish_from items have exactly {id, boundary} properties', () => {
    const schema = loadSchema();
    const keys = Object.keys(schema.fields.distinguish_from.items.properties);
    assert.deepEqual(keys.sort(), ['boundary', 'id']);
  });

  it('distinguish_from.items.properties.id is typed as string and required', () => {
    const schema = loadSchema();
    const idProp = schema.fields.distinguish_from.items.properties.id;
    assert.equal(idProp.type, 'string');
    assert.equal(idProp.required, true);
  });

  it('distinguish_from.items.properties.boundary is typed as string and required', () => {
    const schema = loadSchema();
    const boundaryProp = schema.fields.distinguish_from.items.properties.boundary;
    assert.equal(boundaryProp.type, 'string');
    assert.equal(boundaryProp.required, true);
  });
});

describe('capability-meta.schema.yaml — sources structure (U2)', () => {
  it('sources is typed as array', () => {
    const schema = loadSchema();
    assert.equal(schema.fields.sources.type, 'array');
  });

  it('sources items are typed as object', () => {
    const schema = loadSchema();
    assert.equal(schema.fields.sources.items.type, 'object');
  });

  it('sources items have exactly 5 properties', () => {
    const schema = loadSchema();
    const keys = Object.keys(schema.fields.sources.items.properties);
    assert.equal(keys.length, 5);
  });

  it('sources items declare {title, organization, url, kind, accessed_at}', () => {
    const schema = loadSchema();
    const keys = Object.keys(schema.fields.sources.items.properties);
    const expected = ['title', 'organization', 'url', 'kind', 'accessed_at'];
    assert.deepEqual(keys.sort(), [...expected].sort());
  });

  it('sources.title is typed as string and required', () => {
    const schema = loadSchema();
    const prop = schema.fields.sources.items.properties.title;
    assert.equal(prop.type, 'string');
    assert.equal(prop.required, true);
  });

  it('sources.organization is typed as string and required', () => {
    const schema = loadSchema();
    const prop = schema.fields.sources.items.properties.organization;
    assert.equal(prop.type, 'string');
    assert.equal(prop.required, true);
  });

  it('sources.url is typed as string and required', () => {
    const schema = loadSchema();
    const prop = schema.fields.sources.items.properties.url;
    assert.equal(prop.type, 'string');
    assert.equal(prop.required, true);
  });

  it('sources.kind is typed as string with enum and required', () => {
    const schema = loadSchema();
    const kind = schema.fields.sources.items.properties.kind;
    assert.equal(kind.type, 'string');
    assert.equal(kind.required, true);
    assert.ok(Array.isArray(kind.enum), 'kind must declare an enum');
    const expectedEnum = [
      'standard',
      'architecture-guidance',
      'security-guidance',
      'adoption-guidance',
      'domain-reference',
    ];
    assert.deepEqual([...kind.enum].sort(), [...expectedEnum].sort());
  });

  it('sources.accessed_at is typed as string with format: date and required', () => {
    const schema = loadSchema();
    const accessed = schema.fields.sources.items.properties.accessed_at;
    assert.equal(accessed.type, 'string');
    assert.equal(accessed.required, true);
    assert.equal(accessed.format, 'date');
  });
});
