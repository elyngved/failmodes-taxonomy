# Changelog

The taxonomy is released in editions. Each edition's version matches `taxonomyVersion` in `data/taxonomy.yaml`. Structured edition data is in `data/editions.yaml`.

## 0.1.0 · November 2026 edition (2026-11-19)

Adds 21 failure modes and two categories, most of them about agents that do work on real systems and report back to people who did not watch them work. Goes from 104 modes in 13 categories to 125 in 15, and from 143 cited sources to 370.

Full write-up: https://eriklyngved.com/posts/fail-modes-november-2026-edition/

### New categories

- **Oversight**: action-misreporting, safeguard-circumvention, unfaithful-reasoning, strategic-deception, evaluation-awareness, approval-fatigue.
- **Perception**: visual-misperception, document-parsing-error, gui-grounding-error, transcription-error, turn-taking-failure.

### New modes in existing categories

- agency: goal-drift, handoff-context-loss, unverified-peer-trust
- tools: unnecessary-tool-invocation, environment-misidentification
- security: tool-poisoning, confused-deputy
- memory: memory-poisoning
- alignment: delusion-reinforcement
- reasoning: reasoning-action-mismatch

### Changed scope

If you map to these modes, check the new definitions.

- `multi-agent-coordination-failure` is narrowed to how several agents' work fits together (ownership, overlapping scope, colliding writes, conflicting decisions). Its handoff and peer-checking content moved to `handoff-context-loss` and `unverified-peer-trust`.
- `model-update-regression` now covers a change to the model or to the stack serving it.
- `refusal-underreach` now covers safeguards that weaken over long conversations.
- `retrieval-distractor` now covers a relevant but unreliable source when nobody planted it.
- `query-rewrite-failure` now covers queries an agent writes itself.
- `error-accumulation` now covers errors passing between agents, stages and sessions.
- `priority-confusion` gained a clause on unverified claims of authority.
- `extrinsic-hallucination` now says which sense of the term it uses.

### Revisions

- 102 of 104 existing modes revised against research published since mid-2025.
- Every cited source was opened and checked against the claim it supports. Citations that did not support their sentence were moved or removed.
- Claims that had aged were rewritten, including that models default to answering without their tools.

## 0.0.1 · June 2026 edition (2026-06-13)

First public edition: 104 failure modes in 13 categories.
