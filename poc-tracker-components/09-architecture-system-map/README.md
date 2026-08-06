# Architecture/system-map screen template

The richer template preserves the supplied diagram structure: fixed architecture lanes, grouped system cards, directional relationship lines and a contextual inspector. The default data demonstrates 15 systems and 16 typed relationships without turning repository discovery into renderer logic.

```js
const map = SystemMap.mount(root, {
  name: "Current-state landscape",
  description: "Describe the scope and purpose of the map.",
  lanes: [{ id: "experience", label: "Channels", shortLabel: "Channels" }],
  nodes: [{
    id: "portal", layer: "experience", type: "Web application",
    title: "Operations portal", owner: "Product team", status: "Live",
    environment: "Production", technology: "Web UI", criticality: "High",
    data: "Operational records", description: "Primary workspace.",
    evidence: ["Runbook"], tags: ["internal"]
  }],
  edges: [{
    from: "portal", to: "gateway", label: "uses", protocol: "HTTPS / JSON",
    data: "Commands", frequency: "Interactive", criticality: "Critical"
  }]
}, {
  onSelect(node) {}
});
```

Public methods: `setData(next)`, `select(id)`, `getData()`, and `destroy()`.

Filters always move the inspector to a visible record. System discovery, secrets, health checks and persistence belong outside the renderer.
