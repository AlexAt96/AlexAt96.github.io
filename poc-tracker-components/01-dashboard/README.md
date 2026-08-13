# Dashboard screen template

A data-driven dashboard page with four genuinely different lenses. Each lens supplies its own question, KPI cards, time series, allocation breakdown, matrix and inspector copy.

```js
const dashboard = DashboardCharts.mount(root, {
  title: "Portfolio overview",
  description: "A short explanation of this dashboard.",
  defaultLens: "Delivery",
  lenses: {
    Delivery: {
      question: "Are outcomes landing at the expected pace?",
      chartTitle: "Outcome progress",
      chartSummary: "Seven reporting periods",
      unit: "%",
      kpis: [{ label: "Progress", value: "64%", note: "+6 points", tone: "info" }],
      trend: [{ label: "P1", value: 28, note: "Baseline" }],
      allocationTitle: "By workstream",
      allocation: [{ label: "Data", value: 72, display: "72%" }],
      matrixTitle: "Health",
      matrix: [{ label: "Data", value: "Watch", tone: "warn", note: "One check open" }],
      insight: { title: "Current position", value: "64%", body: "Explain the position." }
    }
  }
}, {
  onLensChange(name) {},
  onOpenSource(context) {}
});
```

Public methods: `selectLens(name)`, `setData(next)`, `getData()`, and `destroy()`.
