# Assistant screen template

A generic assistant beside screen context, with configurable starter prompts, async host responses, loading and error states, editable proposals, explicit approve/reject actions and source buttons.

```js
const assistant = AssistantReview.mount(root, {
  title: "Workspace assistant",
  description: "Explain what the assistant can do.",
  contextTitle: "Starter prompts",
  assistantName: "Programme helper",
  assistantDescription: "Ask about this workspace.",
  prompts: ["Summarise the position"],
  response: {
    body: "A deterministic sample response.",
    proposal: {
      tone: "warning", label: "Draft change", recordId: "ITEM-104",
      title: "Update the selected record", description: "Describe the draft change.",
      sources: ["ITEM-104", "DECISION-12"]
    }
  }
}, {
  async onSubmit(text, data) { return await retrieveResponse(text); },
  onApprove(proposal) {}, onEdit(proposal) {}, onReject(proposal) {}, onOpenSource(source) {}
});
```

Public methods: `addMessage(message)`, `setData(next)`, `getData()`, and `destroy()`. Generation, retrieval, permission checks and persistence remain host responsibilities.
