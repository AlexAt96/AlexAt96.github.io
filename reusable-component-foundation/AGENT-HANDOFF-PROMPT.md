# Agent Handoff Prompt

Use this bundle to create individual, interactive, reusable templates from the CGI Migration Compass reference implementation. The Architecture Upload Wizard example is the quality bar: behaviour preserved, safe mock data, slightly improved presentation, a polished interactive demo, technical details and downloadable code.

Work one directory at a time under `individual-templates/`:

1. Read `TEMPLATE-BRIEF.md`; it is the implementation contract for that one component.
2. Open `driver-map.json` and the matching `code/*.reference.*` files. These identify exactly which source functions drive the component and their original line ranges.
3. Build a standalone interactive demo using the local `template-data.json`; do not wait for the real API.
4. Preserve every behaviour, state transition, validation rule and output listed in the brief.
5. Improve hierarchy, spacing, responsiveness and clarity where helpful, without removing or inventing workflow behaviour.
6. Keep rendering separate from network, storage, routing and analytics concerns by using typed props, events and adapters.
7. Add a technical-details panel and downloadable component code, matching the Architecture Upload Wizard example.
8. Demonstrate default, interactive happy-path, validation/empty and read-only/completed states where applicable.
9. Preserve keyboard access, accessible names, focus behaviour, empty states, validation feedback and reduced-motion support.
10. Add unit tests for calculations/state transitions and interaction tests for the demonstrated flow.

Prioritise foundational primitives in this order:

1. Feedback/modal, cards, status, tables and chart/diagram primitives.
2. Kanban/list, wizard and document-feedback compositions.
3. Metadata, evidence, complexity, rationalisation and report workflows.
4. Decision, lineage, DORA and test-coverage dashboards.

Do not copy project-specific globals or API paths into the reusable layer. Keep them in adapters supplied by the consuming application.
