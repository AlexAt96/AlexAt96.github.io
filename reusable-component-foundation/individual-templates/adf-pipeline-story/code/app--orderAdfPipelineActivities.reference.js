/* Reference extract: orderAdfPipelineActivities(...) from app/src/app.js:11842-11877. */

function orderAdfPipelineActivities(activities = [], dependencies = []) {
  const byName = new Map(activities.map((row, index) => [normaliseImportHeader(row.activity_name || `activity-${index}`), { ...row, __index: index }]));
  const incoming = new Map([...byName.keys()].map((key) => [key, new Set()]));
  const outgoing = new Map([...byName.keys()].map((key) => [key, new Set()]));
  dependencies.forEach((row) => {
    const from = normaliseImportHeader(row.depends_on_activity_name);
    const to = normaliseImportHeader(row.activity_name);
    if (!incoming.has(to) || !outgoing.has(from)) return;
    incoming.get(to).add(from);
    outgoing.get(from).add(to);
  });
  activities.forEach((row) => {
    const to = normaliseImportHeader(row.activity_name);
    parseAdfLineageListValue(row.depends_on_json).forEach((dependencyName) => {
      const from = normaliseImportHeader(dependencyName);
      if (!incoming.has(to) || !outgoing.has(from)) return;
      incoming.get(to).add(from);
      outgoing.get(from).add(to);
    });
  });
  const ready = [...incoming.entries()].filter(([, deps]) => deps.size === 0).map(([key]) => key);
  const result = [];
  while (ready.length) {
    const key = ready.sort((a, b) => (byName.get(a)?.__index || 0) - (byName.get(b)?.__index || 0)).shift();
    result.push(byName.get(key));
    (outgoing.get(key) || new Set()).forEach((next) => {
      incoming.get(next).delete(key);
      if (incoming.get(next).size === 0 && !result.some((row) => normaliseImportHeader(row.activity_name) === next) && !ready.includes(next)) ready.push(next);
    });
  }
  const emitted = new Set(result.map((row) => normaliseImportHeader(row.activity_name)));
  activities.forEach((row, index) => {
    if (!emitted.has(normaliseImportHeader(row.activity_name))) result.push({ ...row, __index: index });
  });
  return result;
}
