# Failure Mode Schema

This document defines the canonical content schema for files in `data/failure-modes/`.

## Goals

- Keep every failure mode file on the same structure.
- Allow global rendering changes without editing each YAML file.
- Store UI-shaped sections as structured data instead of parsing Markdown headings.

## Format

Each failure mode lives in one `.yaml` file.

- The YAML document contains the canonical structured data used by downstream tools.
- There is no Markdown body.

## Canonical YAML Shape

```yaml
id: arithmetic-error
categoryId: reasoning
name: Arithmetic Error
def: Produces incorrect calculations or numeric transformations.

status: draft

searchPhrases:
  - got the math wrong
  - added it up wrong
  - miscalculated the total
  - wrong sum

why:
  - Tokenizers split numbers into arbitrary fragments, so models represent digits poorly and arithmetic does not generalize the way it would on a calculator.
  - Models learn arithmetic as statistical association, not algorithm execution, so accuracy tracks how often an operation appears in training data.

examples:
  - kind: fail
    label: Incorrect total
    text: Adds line items incorrectly and returns the wrong invoice total.
    quote: |-
      User: What does the invoice come to? Line items are $52, $48, and $46.
      Assistant: The total is $142.

detection:
  - icon: 🧮
    heading: Deterministic recomputation
    body: Recompute outputs with a trusted arithmetic engine.

mitigation:
  - icon: 🧮
    heading: Tool-backed math
    body: Route arithmetic to a calculator or code executor.

related:
  - id: numerical-hallucination
```

## Required Core Fields

- `id: string` - Stable slug for the failure mode.
- `categoryId: string` - References a category in `data/taxonomy.yaml`.
- `name: string` - Display name for the failure mode.
- `def: string` - Short canonical definition.

## Optional Metadata

- `status: string` - Suggested values: `draft`, `review`, `published`.
- `updatedAt: string` - ISO-8601 timestamp of when this failure mode was last substantively updated (e.g. `"2026-06-13T09:00:00-04:00"`). Update this field whenever content changes so consumers can detect freshness without re-fetching everything.
- `searchPhrases: string[]` - Plain-language symptom phrases that help people discover a mode through search.

Search phrases should sound like how a frustrated user would describe the issue: short, concrete, lowercase, and distinct.

## Structured Sections

### `why: string[]`

A list of upstream causes that skew the model or system toward this failure mode.

Focus on factors such as training data, objective design, RL tuning, prompting patterns, retrieval setup, memory behavior, tool routing, and evaluation gaps.

When a cause is grounded in a research paper or trusted source, cite it inline as parenthetical plain text. Use the form `(Author et al., 2024, "Exact Title")`; write two authors as "A and B" and use the organization as author for standards and company posts.

A plain YAML scalar that contains a colon followed by a space parses as a mapping, and citation titles often contain one. Write any such entry as a block scalar (`>-`). The validator rejects `why` entries that are not strings.

### `examples: Example[]`

Structured examples that clarify the mode.

```yaml
- kind: fail
  label: Incorrect total
  text: Adds line items incorrectly and returns the wrong invoice total.
  quote: |-
    User: What does the invoice come to? Line items are $52, $48, and $46.
    Assistant: The total is $142.
```

Fields:

- `kind: "ok" | "warn" | "fail"`
- `label: string`
- `text: string`
- `quote?: string`

Quote fields should be short mini transcripts. Use role prefixes such as `User:`, `Assistant:`, `System:`, and `Tool:`. Use a bracketed line with an ellipsis for elided turns or events the transcript does not show verbatim: `[… 40 turns later …]`.

For non-text input, put what the image, page, screen, or audio actually contained on a bracketed line that names the medium (`[… image: … …]`, `[… screenshot: … …]`, `[… page 7 of pricing.pdf: … …]`, `[… audio: … …]`), and put what a parser, OCR step, speech recognizer, or click executor passed on in a `Tool:` line. In voice examples, mark spoken turns as `User: (spoken)` and `Assistant: (spoken)`. The failure is the gap between the bracketed ground truth and the `Tool:` or `Assistant:` line.

### `detection: Approach[]`

Approaches for identifying the failure.

### `mitigation: Approach[]`

Approaches for reducing or preventing the failure.

```yaml
- icon: 🧮
  heading: Deterministic recomputation
  body: Recompute outputs with a trusted arithmetic engine.
```

Fields:

- `icon: string` - A single emoji.
- `heading: string`
- `body: string`

Every detection and mitigation entry should be actionable by an AI engineer. Lead with the action, name the concrete signal or enforcement point, and keep the body short.

### `related: RelatedMode[]`

Links to related failure modes.

```yaml
- id: numerical-hallucination
```

Fields:

- `id: string`
- `kind?: string`
- `name?: string`
- `gloss?: string`

The required `id` field should point to another failure mode file. Optional fields are reserved for authored relationship notes and compatibility with older entries.

## Taxonomy File (`data/taxonomy.yaml`)

The taxonomy file is a YAML object with the following top-level fields:

- `taxonomyVersion: string` - Semver version of the taxonomy (e.g. `"0.0.1"`). Bump on any structural change.
- `updatedAt: string` - ISO-8601 timestamp of the last taxonomy-level change (not a build timestamp).
- `categories: Category[]` - Ordered list of category definitions.

Each `Category` has `id`, `name`, `blurb`, `desc`, and `modes` (ordered list of failure mode ids).

## Editions File (`data/editions.yaml`)

A YAML object with one field, `editions: Edition[]`, ordered newest first. Each `Edition` has:

- `version: string` - Semver version. The newest entry must equal `taxonomyVersion`.
- `name: string` - Edition name, e.g. `"November 2026"`. Rendered as "November 2026 edition".
- `date: string` - Release date, `YYYY-MM-DD`.
- `summary: string` - One or two sentences on what changed.
- `stats: { modes: integer, categories: integer, sources: integer }` - Counts at release. For the newest entry the validator checks `modes` and `categories` against the data.
- `highlights?: string[]` - Short bullet points.
- `writeupUrl?: string` - Link to a longer write-up of the edition.

`CHANGELOG.md` at the repo root is the human-readable version of the same history. Add a new entry to both when bumping `taxonomyVersion`.

## Rendering Contract

Consumers should treat this YAML schema as the source of truth for failure mode files.

- New optional sections can be added over time.
- Existing keys should remain stable once consumers depend on them.
