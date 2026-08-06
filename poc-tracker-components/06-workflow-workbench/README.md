# Workflow workbench screen template

This keeps the layout of the original experiment workbench but removes the experiment-specific contract. Use it for any staged record-detail screen: a workflow, review, readiness check, case, proposal or decision.

```js
const workbench = WorkflowWorkbench.mount(root, {
  title: "Workflow workbench",
  description: "Explain what this screen supports.",
  stages: ["Brief", "Shape", "Work", "Review", "Decide"],
  labels: {
    selector: "Work items", summary: "Primary statement", measures: "Measures",
    evidence: "Supporting information", outcome: "Current position",
    nextAction: "Next action", action: "Record action"
  },
  items: [{
    id: "ITEM-01", title: "Example record", owner: "Product", status: "In progress", stage: "Work",
    summary: "The main statement or question for this record.",
    metrics: [{ label: "Completion", target: "85%", value: "78%", status: "watch" }],
    sections: [{ title: "Approach", body: "Supporting section content." }],
    evidence: ["A source or supporting record"], outcome: "Current position.",
    nextAction: "The next explicit action.", confidence: "Medium", tags: ["Template"]
  }]
}, {
  onSelect(item) {}, onChange(nextData, change) {}, onAction(item) {}
});
```

Public methods: `select(id)`, `setData(next)`, `getData()`, and `destroy()`. `ExperimentHub` remains as a compatibility alias for `WorkflowWorkbench`.
