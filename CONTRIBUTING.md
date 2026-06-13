# Contributing

Thanks for helping improve Fail Modes taxonomy.

This repository is curated as a canonical knowledge base, so contributions should make the taxonomy clearer, more precise, or more useful to AI reliability practitioners.

## Good Contributions

- Add a missing failure mode with a clear boundary from existing modes.
- Improve a definition that is vague, overlapping, or too implementation-specific.
- Add concrete examples that make a failure easier to recognize.
- Improve detection or mitigation guidance so it is more actionable.
- Add or correct relationships between nearby failure modes.
- Fix taxonomy placement when a mode belongs in a better category.

## Authoring Rules

- Follow `SCHEMA.md`.
- Keep YAML structured; do not add Markdown bodies inside failure mode files.
- Use stable, lowercase slug IDs.
- Keep `categoryId` aligned with `taxonomy.yaml`.
- Write definitions as concepts, not incidents.
- Prefer implementation-agnostic language unless a failure is specific to a system pattern such as retrieval, tools, memory, or agents.
- Keep examples short and diagnostic.
- Cite research inline in plain text when a causal claim relies on a paper or trusted source.

## Pull Request Checklist

- [ ] New or changed failure mode files follow `SCHEMA.md`.
- [ ] `taxonomy.yaml` includes every failure mode exactly once.
- [ ] Related modes use existing failure mode IDs.
- [ ] Examples are short enough to scan.
- [ ] Detection and mitigation entries name concrete signals, controls, or enforcement points.
- [ ] The change avoids unnecessary renames of stable IDs.

## Style

Write for AI engineers and reliability practitioners. The tone should be precise, plain, and useful: more like a field guide than a marketing page.

Avoid:

- vendor-specific framing unless necessary
- claims that only apply to one model family
- vague mitigations such as "improve prompting"
- examples that require long setup to understand
- duplicating an existing failure mode under a new name
