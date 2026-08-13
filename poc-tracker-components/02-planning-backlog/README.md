# Planning-backlog screen template

A reusable planning page with phase groups, filters, accessible reorder controls, task selection, status and priority language, estimates, dependencies, acceptance criteria and a detail inspector.

```js
const backlog = PlanningBacklog.mount(root, items, {
  title: "Portfolio backlog",
  description: "Explain the purpose of this backlog.",
  onChange(nextItems) { save(nextItems); },
  onOpen(item) { openTask(item.id); }
});
```

Items use `{id,key,title,phase,priority,status,owner,estimate,dependencies,acceptance,summary}`. Public methods: `setItems(items)`, `select(id)`, `getItems()`, and `destroy()`.

The Move up/down controls are the keyboard-accessible reorder path and remain available when a host adds pointer drag-and-drop.
