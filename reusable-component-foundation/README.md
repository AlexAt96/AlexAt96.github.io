# Reusable Component Foundation Export

This bundle contains the current CGI Migration Compass implementation references and a capability-by-capability handoff for converting the requested screens into reusable components.

Source commit: `7f5f816e5f691e3a4fd429b49d62311718d15f71`
Capability packs: 20
Individual interactive template briefs: 96

## Start here

1. Read `AGENT-HANDOFF-PROMPT.md`.
2. Read `TARGET-OUTPUT-STANDARD.md` so the deliverable matches the interactive Architecture Upload Wizard example.
3. Use `INDIVIDUAL-TEMPLATE-INDEX.md` and choose one individual component template.
4. Read its `TEMPLATE-BRIEF.md`, `driver-map.json` and focused `code/` files.
5. Build that one component as an interactive mock using its local `template-data.json`.
6. Use `source-snapshot/` only when the focused extracts need surrounding context.

## Important boundary

The extracted JavaScript is reference code from a large page-level application module. It intentionally preserves the original implementation for traceability, but it should not be pasted unchanged into a component library. Convert global workspace reads, query-string access, DOM lookups and direct API calls into explicit component inputs, events and adapter interfaces.

## Contents

- `components/`: one pack per requested capability.
- `individual-templates/`: one independently buildable interactive template brief per actual UI component.
- `INDIVIDUAL-TEMPLATE-INDEX.md`: the primary component-by-component work queue.
- `COMPONENT-DRIVER-MAP.md`: exact source functions and line ranges for every individual component.
- `TEMPLATE-BUILD-ORDER.md`: recommended primitive-to-screen implementation order.
- `template-data/`: synthetic data covering every pack.
- `source-snapshot/`: exact implementation and canonical documentation references.
- `component-catalogue.json`: machine-readable catalogue for another agent or build tool.
- `SOURCE-MAP.md`: source-file map and extraction rules.
- `MANIFEST.sha256`: integrity hashes for every file in the bundle.

No customer data, credentials or live uploaded evidence is included.
