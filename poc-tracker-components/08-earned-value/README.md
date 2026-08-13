# Earned-value screen template

The template now includes editable screen context, three starter scenarios, eight KPI cards, an explicit forecast assumption, a performance curve, plain-language interpretation, illustrative work-package rows and JSON export.

```js
const evm = EarnedValue.mount(root, {
  title: "Portfolio earned value",
  reference: "Portfolio A",
  baselineLabel: "Approved baseline · Version 2",
  reportingLabel: "Reporting period 7 of 12",
  unit: "hours",
  bac: 240,
  plannedPercent: 68,
  earnedPercent: 59,
  actualCost: 158,
  period: 7,
  totalPeriods: 12,
  assumption: "Explain the approved forecast method.",
  workPackages: [{ label: "Discovery", budget: 40, planned: 40, earned: 40, actual: 38, status: "Complete" }]
}, {
  onChange(result) {},
  onExport(data) {}
});
```

Public methods: `setInput(next)`, `setData(next)`, `getData()`, `calculate()`, and `destroy()`.

The sample uses `PV = BAC × plannedPercent`, `EV = BAC × earnedPercent`, `SV = EV − PV`, `SPI = EV ÷ PV`, `CV = EV − AC`, `CPI = EV ÷ AC`, and a simplified `EAC = BAC ÷ CPI`. Pass host-approved forecast values or adapt `calculate()` when governance uses another method.
