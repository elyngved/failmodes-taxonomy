import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import { load } from "js-yaml";

const failureModesDirectoryPath = join(process.cwd(), "data", "failure-modes");
const taxonomyFilePath = join(process.cwd(), "data", "taxonomy.yaml");

const errors = [];

const categories = readYaml(taxonomyFilePath);
if (!Array.isArray(categories)) {
  errors.push("data/taxonomy.yaml must contain an array of categories");
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
