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
- `searchPhrases: string[]` - Plain-language symptom phrases that help people discover a mode through search.

Search phrases should sound like how a frustrated user would describe the issue: short, concrete, lowercase, and distinct.

## Structured Sections

### `why: string[]`

A list of upstream causes that skew the model or system toward this failure mode.

Focus on factors such as training data, objective design, RL tuning, prompting patterns, retrieval setup, memory behavior, tool routing, and evaluation gaps.

When a cause is grounded in a research paper or trusted source, cite it inline as parenthetical plain text.

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

Quote fields should be short mini transcripts. Use role prefixes such as `User:`, `Assistant:`, `System:`, and `Tool:`.

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

## Rendering Contract

Consumers should treat this YAML schema as the source of truth for failure mode files.

- New optional sections can be added over time.
- Existing keys should remain stable once consumers depend on them.
