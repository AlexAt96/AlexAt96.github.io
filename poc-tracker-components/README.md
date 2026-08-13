# Reusable screen templates

This focused bundle contains seven complete, data-driven screen templates:

1. Dashboard
2. Planning backlog
3. Interactive Gantt chart
4. Workflow workbench
5. Assistant
6. Earned value
7. Architecture/system map

Each folder contains a direct-open `demo.html`, component CSS and JavaScript, neutral fictional starter data, an input contract and integration notes. `00-foundations` supplies the shared premium white-canvas visual system, compact controls and purple navigation rail. `shared/fonts` contains Source Sans 3 and its licence.

## Start

Open `index.html`, then choose a screen template. No build step, package manager, backend or network connection is required.

To use one template in another application, copy:

- `00-foundations`
- `shared`
- the selected numbered component folder

Preserve the relative paths or update the stylesheet and font URLs. Run the sample unchanged first, then replace the starter data passed to `mount()`.

## Integration boundary

The templates use plain HTML, CSS and JavaScript so they can be ported to React, Vue, Svelte, Angular or server-rendered HTML. Every component exposes a `mount(root, data, options)` boundary plus read/update methods documented in its README.

- Map host records into the documented data shape before rendering.
- Keep fetching, saving, permissions, discovery and governed calculations outside the renderer.
- Use callbacks to persist user changes.
- Preserve visible labels, focus rings, source links, keyboard alternatives and responsive fallbacks.
- Supply loading, empty, error and save-failure states from the host when live data is introduced.

All included data is fictional, neutral and safe to replace.
