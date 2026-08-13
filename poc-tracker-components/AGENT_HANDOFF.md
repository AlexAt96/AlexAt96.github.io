# Agent handoff

## Objective

Integrate one or more of the seven screen templates into a target application while preserving the white-canvas and purple-rail visual language, documented data contract, responsive behaviour and accessible interaction model.

## Instructions

1. Run the relevant `demo.html` unchanged and read its README.
2. Load `00-foundations/tokens.css`, `base.css` and `components.css` before component CSS.
3. Map host records at an integration boundary and keep fetch/save logic outside the renderer.
4. Keep calculations, architecture discovery, retrieval, permissions and mutations in governed host logic.
5. Preserve native controls, focus rings, live regions, source links, status text and mobile fallbacks.
6. Supply loading, empty, error and save-failure states when connecting live data.

## Acceptance checks

- Every template remains usable by keyboard and at 200% zoom.
- No page-level horizontal overflow occurs at 390px; only labelled planning or map canvases may scroll internally.
- Dashboard lenses render distinct data, charts and inspector content.
- Backlog filtering keeps the selected detail visible and reordering retains focus.
- Gantt dragging, resizing, row reordering, direct editing, undo, phase collapse and phase roll-up work; keyboard alternatives remain available.
- Workflow stages, labels, sections and actions come from input data rather than experiment-specific assumptions.
- Assistant proposals expose sources and explicit approve/edit/reject controls.
- Earned-value inputs, units, formula assumptions and forecast method remain explicit.
- Architecture filters never leave a stale inspector selection or relationship line, and lane order remains stable.
