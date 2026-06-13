# Fail Modes Taxonomy

Fail Modes Taxonomy is the public, versioned knowledge base behind Fail Modes: a structured taxonomy of AI system failure modes.

The repository defines how AI systems fail so those patterns can be named, detected, evaluated, and mitigated consistently across products, evaluations, observability tools, and research.

## Contents

- `taxonomy.yaml` defines the category tree and the display order of failure modes.
- `failure-modes/*.yaml` defines each canonical failure mode.
- `SCHEMA.md` describes the authoring schema for failure mode files.

## Repository Layout

```text
.
+-- failure-modes/
|   +-- <failure-mode-id>.yaml
+-- taxonomy.yaml
+-- SCHEMA.md
+-- CONTRIBUTING.md
+-- CITATION.cff
+-- LICENSE.md
```

## Design Principles

- **Failure modes are the stable unit.** Models, frameworks, benchmarks, and tools change quickly; named failure patterns are more durable.
- **The taxonomy is curated.** Contributions are welcome, but canonical entries should stay coherent, precise, and implementation-agnostic.
- **The data is machine-readable.** YAML files should stay structured enough for websites, APIs, MCP servers, evaluations, and other tools to consume without scraping prose.
- **The writing is practical.** Definitions, examples, detection approaches, and mitigations should help AI engineers recognize and act on real production failures.

## Data Model

Each failure mode file uses YAML and includes:

- a stable `id`
- a `categoryId` matching `taxonomy.yaml`
- a display `name`
- a short canonical `def`
- optional `searchPhrases`
- structured `why`, `examples`, `detection`, `mitigation`, and `related` sections

See `SCHEMA.md` for the full schema and authoring guidance.

## License

Recommended license: **Creative Commons Attribution 4.0 International (CC BY 4.0)**.

This is a good fit for a public taxonomy because it permits copying, redistribution, adaptation, commercial use, and integration into tools while requiring attribution.

See `LICENSE.md`.

If this repository later grows executable software, put that code under a separate software license such as MIT and keep the taxonomy content under CC BY 4.0.

## Citation

If you use this taxonomy in research, documentation, datasets, evaluations, or products, cite it as described in `CITATION.cff`.

## Status

This taxonomy is evolving. Entries may be renamed, split, merged, or reclassified as the project sharpens its boundaries.
