/* Reference extract: getAdfActivityDependencyLevels(...) from app/src/app.js:11879-11907. */

function getAdfActivityDependencyLevels(activities = [], dependencies = []) {
  const names = new Set(activities.map((row) => normaliseImportHeader(row.activity_name)).filter(Boolean));
  const depsByTarget = new Map([...names].map((name) => [name, new Set()]));
  dependencies.forEach((row) => {
    const source = normaliseImportHeader(row.depends_on_activity_name);
    const target = normaliseImportHeader(row.activity_name);
    if (names.has(source) && names.has(target)) depsByTarget.get(target).add(source);
  });
  activities.forEach((row) => {
    const target = normaliseImportHeader(row.activity_name);
    parseAdfLineageListValue(row.depends_on_json).forEach((dependencyName) => {
      const source = normaliseImportHeader(dependencyName);
      if (names.has(source) && names.has(target)) depsByTarget.get(target).add(source);
    });
  });
  const levels = new Map();
  const resolve = (name, stack = new Set()) => {
    if (levels.has(name)) return levels.get(name);
    if (stack.has(name)) return 0;
    stack.add(name);
    const deps = [...(depsByTarget.get(name) || new Set())];
    const level = deps.length ? Math.max(...deps.map((dep) => resolve(dep, stack))) + 1 : 0;
    stack.delete(name);
    levels.set(name, level);
    return level;
  };
  names.forEach((name) => resolve(name));
  return levels;
}
