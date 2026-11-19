import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import { load } from "js-yaml";

const failureModesDirectoryPath = join(process.cwd(), "data", "failure-modes");
const taxonomyFilePath = join(process.cwd(), "data", "taxonomy.yaml");
const editionsFilePath = join(process.cwd(), "data", "editions.yaml");

const errors = [];

const taxonomyDoc = readYaml(taxonomyFilePath);
const categories =
  taxonomyDoc && typeof taxonomyDoc === "object" && !Array.isArray(taxonomyDoc) && Array.isArray(taxonomyDoc.categories)
    ? taxonomyDoc.categories
    : null;

if (!categories) {
  errors.push('data/taxonomy.yaml must be an object with a "categories" array');
}

const categoryIds = new Set(
  Array.isArray(categories) ? categories.map((category) => category?.id).filter(Boolean) : [],
);

const files = readdirSync(failureModesDirectoryPath)
  .filter((fileName) => fileName.endsWith(".yaml"))
  .sort((left, right) => left.localeCompare(right));

const modes = files.map((fileName) => {
  const filePath = join(failureModesDirectoryPath, fileName);
  const mode = readYaml(filePath);
  const fileSlug = basename(fileName, ".yaml");

  if (!mode || typeof mode !== "object" || Array.isArray(mode)) {
    errors.push(`${filePath} must contain a mapping`);
    return { id: fileSlug, fileName, mode: {} };
  }

  if (mode.id !== fileSlug) {
    errors.push(`${filePath} has id "${mode.id}" but filename slug is "${fileSlug}"`);
  }

  if (!categoryIds.has(mode.categoryId)) {
    errors.push(`${filePath} references unknown category "${mode.categoryId}"`);
  }

  for (const field of ["name", "def", "why", "examples"]) {
    const value = mode[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`${filePath} is missing required field "${field}"`);
    }
  }

  // A plain scalar containing ": " (common in citation titles) parses as a
  // mapping rather than a string, so check the type of every `why` entry.
  if (mode.why !== undefined && mode.why !== null && mode.why !== "") {
    if (!Array.isArray(mode.why)) {
      errors.push(`${filePath} why must be an array`);
    } else {
      mode.why.forEach((entry, index) => {
        if (typeof entry !== "string" || entry.trim() === "") {
          errors.push(
            `${filePath} why[${index}] must be a non-empty string (write entries containing ": " as a block scalar)`,
          );
        }
      });
    }
  }

  return { id: mode.id, fileName, mode };
});

const ids = new Set();
const nameById = new Map();
for (const { id, fileName, mode } of modes) {
  if (ids.has(id)) {
    errors.push(`duplicate failure mode id "${id}" in ${fileName}`);
  }
  ids.add(id);
  if (mode.name) nameById.set(id, mode.name);
}

const phraseOwners = new Map();
for (const { id, fileName, mode } of modes) {
  const phrases = mode.searchPhrases ?? [];

  if (!Array.isArray(phrases)) {
    errors.push(`${fileName} searchPhrases must be an array`);
    continue;
  }

  const seenInMode = new Set();
  for (const phrase of phrases) {
    if (typeof phrase !== "string") {
      errors.push(`${fileName} searchPhrases contains a non-string value`);
      continue;
    }

    const normalized = phrase.trim().toLowerCase();

    if (seenInMode.has(normalized)) {
      errors.push(`${fileName} has duplicate search phrase "${phrase}"`);
    }
    seenInMode.add(normalized);

    const previousOwner = phraseOwners.get(normalized);
    if (previousOwner && previousOwner !== id) {
      errors.push(`search phrase "${phrase}" is used by both ${previousOwner} and ${id}`);
    }

    phraseOwners.set(normalized, id);
  }
}

for (const { id, fileName, mode } of modes) {
  const related = mode.related ?? [];

  if (!Array.isArray(related)) {
    errors.push(`${fileName} related must be an array when present`);
    continue;
  }

  for (const item of related) {
    if (!item?.id) {
      errors.push(`${fileName} related item is missing id`);
      continue;
    }

    if (item.id === id) {
      errors.push(`${fileName} related item points to itself`);
    }

    if (!ids.has(item.id)) {
      errors.push(`${fileName} related item points to missing mode "${item.id}"`);
    } else if (item.name !== undefined) {
      const actualName = nameById.get(item.id);
      if (actualName !== undefined && item.name !== actualName) {
        errors.push(
          `${fileName} related item "${item.id}" has name "${item.name}" but the mode is named "${actualName}"`,
        );
      }
    }
  }
}

const taxonomyOwnerByModeId = new Map();
if (Array.isArray(categories)) {
  for (const category of categories) {
    const modeIds = category?.modes;

    if (!Array.isArray(modeIds) || modeIds.length === 0) {
      errors.push(`taxonomy category "${category?.id}" must list its modes in display order`);
      continue;
    }

    for (const modeId of modeIds) {
      if (taxonomyOwnerByModeId.has(modeId)) {
        errors.push(`mode "${modeId}" appears in taxonomy mode lists more than once`);
        continue;
      }
      taxonomyOwnerByModeId.set(modeId, category.id);

      if (!ids.has(modeId)) {
        errors.push(`taxonomy category "${category.id}" lists unknown mode "${modeId}"`);
      }
    }
  }

  for (const { id, fileName, mode } of modes) {
    const owner = taxonomyOwnerByModeId.get(id);
    if (owner === undefined) {
      errors.push(`${fileName} is missing from the taxonomy mode list for "${mode.categoryId}"`);
    } else if (owner !== mode.categoryId) {
      errors.push(
        `${fileName} has categoryId "${mode.categoryId}" but is listed under taxonomy category "${owner}"`,
      );
    }
  }
}

validateEditions();

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${modes.length} failure modes across ${categoryIds.size} categories.`);

function readYaml(filePath) {
  try {
    return load(readFileSync(filePath, "utf8").replace(/\r\n/g, "\n"));
  } catch (err) {
    errors.push(`${filePath} YAML parse error: ${err.message}`);
    return null;
  }
}

function validateEditions() {
  const doc = readYaml(editionsFilePath);
  const editions = doc && typeof doc === "object" && !Array.isArray(doc) ? doc.editions : null;

  if (!Array.isArray(editions) || editions.length === 0) {
    errors.push('data/editions.yaml must be an object with a non-empty "editions" array');
    return;
  }

  const seen = new Set();
  editions.forEach((edition, index) => {
    const where = `data/editions.yaml editions[${index}]`;
    for (const field of ["version", "name", "date", "summary"]) {
      if (typeof edition?.[field] !== "string" || edition[field].trim() === "") {
        errors.push(`${where} is missing string field "${field}"`);
      }
    }
    if (typeof edition?.date === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(edition.date)) {
      errors.push(`${where} date must be YYYY-MM-DD`);
    }
    for (const field of ["modes", "categories", "sources"]) {
      if (!Number.isInteger(edition?.stats?.[field])) {
        errors.push(`${where} stats.${field} must be an integer`);
      }
    }
    if (edition?.highlights !== undefined && !Array.isArray(edition.highlights)) {
      errors.push(`${where} highlights must be an array`);
    }
    if (edition?.writeupUrl !== undefined && !/^https:\/\//.test(edition.writeupUrl)) {
      errors.push(`${where} writeupUrl must be an https URL`);
    }
    if (seen.has(edition?.version)) {
      errors.push(`${where} duplicates version "${edition.version}"`);
    }
    seen.add(edition?.version);
  });

  const [current] = editions;
  const taxonomyVersion = taxonomyDoc?.taxonomyVersion;
  if (current?.version !== taxonomyVersion) {
    errors.push(
      `data/editions.yaml newest edition is "${current?.version}" but taxonomyVersion is "${taxonomyVersion}"`,
    );
  }
  if (current?.stats?.modes !== modes.length) {
    errors.push(`data/editions.yaml newest edition lists ${current?.stats?.modes} modes; the data has ${modes.length}`);
  }
  if (current?.stats?.categories !== categoryIds.size) {
    errors.push(
      `data/editions.yaml newest edition lists ${current?.stats?.categories} categories; the data has ${categoryIds.size}`,
    );
  }
}
