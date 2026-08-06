# Interactive Gantt screen template

The template keeps the original phase-grouped weekly layout and adds complete local planning interactions:

- drag a task bar horizontally to change its start week;
- drag the right-hand grip to change duration;
- drag a task label vertically to reorder it or move it into another phase;
- use arrow controls for accessible row and date movement;
- use Left/Right on a focused bar to move it, Shift+Left/Right to resize it, and Up/Down to reorder it;
- edit start, duration, progress and status in the selected-task panel;
- switch between task and phase roll-up views, collapse phases, reset, undo and use the full-screen canvas.

```js
const gantt = PlanningGantt.mount(root, tasks, {
  weeks: 12,
  onChange(nextTasks, change) { save(nextTasks); }
});
```

Tasks use `{id,key,title,phase,owner,status,progress,startWeek,durationWeeks,dependencies}`. Public methods: `setTasks(next)`, `getTasks()`, `select(id)`, and `destroy()`.

The component edits supplied relative schedule fields. Calendar rules, working days, dependency validation and persistence remain host responsibilities.
