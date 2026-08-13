# Reusable Compass showroom templates

These are the implementation files shared by the main Compass showroom and the `/foundation` reference page. The same 26 interactive templates render in both places; the main showroom embeds each one as its own numbered pattern section and supplies Compass CGI-red semantic accent tokens, while the reference page keeps the standalone selector and original fallbacks.

- `PlanningTemplates.tsx`: separate dashboard, Gantt chart, work queue, comfortable/compact charts, board/list, editable-table and read-only-table patterns.
- `CollectionTemplates.tsx`: configuration form, confirmation hand-off, report review/feedback, questionnaire and results-statistics patterns.
- `ImportExportCsvTemplate.tsx`: four-step CSV import, mapping, validation, review and export builder.
- `AnalysisTemplates.tsx`: branch chart, calculator, flow/structure diagram renderers, evidence matrix, evidence list and review list patterns.
- `OutcomeTemplates.tsx`: final report, cost-scenario analysis, lineage, operational reports and test coverage.
- `TemplatePreview.tsx`: the 26-pattern composition map.
- `shared.tsx`, `types.ts` and the CSS modules: reusable presentation and interaction primitives.

The reference view components accept `mode`, `resetToken` and optional `scenarioId` props and keep safe fixture data inside the demo. The in-product Component Workbench shows that exact API alongside a clearly labelled recommended data/event adapter. When productising a pattern, promote the relevant fixture to a typed `data` prop and keep network, storage, routing and analytics in the host adapter layer.

The Component Workbench lists a closed recreation set rather than only the file that contains the selected export. The selected family appears first, followed by every other TSX and CSS Module imported by `TemplatePreview.tsx`, shared accessible primitives and styles, shared types, `app/scenarios.ts`, all four imported JSON fixtures and this setup guide. The displayed `scenarios.ts` mirrors the application file required by the `ScenarioId` import in `types.ts`; copy it to `app/scenarios.ts`, two levels above `app/foundation/templates/types.ts`.

Keep the JSON files at the paths shown beside them in the workbench because `PlanningTemplates.tsx` and `OutcomeTemplates.tsx` use those exact relative imports. If you only want one exported pattern, you may remove the unused entries and imports from `TemplatePreview.tsx`; until then, the complete import map needs all five template families to compile. `compass-ui-code.zip` preserves this working folder structure for you.

To apply another product skin without changing component behaviour, set `--template-accent`, `--template-accent-strong`, `--template-accent-muted`, `--template-accent-pale`, `--template-accent-soft`, `--template-accent-border` and `--template-accent-rgb` on an ancestor.
