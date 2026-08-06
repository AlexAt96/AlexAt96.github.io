/* Reference extract: getDashboardPlanModel(...) from app/src/app.js:2241-2316. */

function getDashboardPlanModel() {
  const laneWidth = 180;
  const weekWidth = 88;
  const plan = getDashboardPlanSettings();
  const weekCount = clampNumber(plan.weekCount, DASHBOARD_PLAN_MIN_WEEK_COUNT, DASHBOARD_PLAN_MAX_WEEK_COUNT, DEFAULT_DASHBOARD_PLAN.weekCount);
  const resolvedPlanRows = resolveProjectPlanSchedule(plan.rows, weekCount);
  const startDate = dateFromPlanInput(plan.startDate);
  const today = new Date();
  const weeks = Array.from({ length: weekCount }, (_, index) => {
    const weekStart = addDays(startDate, index * 7);
    return {
      number: index + 1,
      label: formatPlanDate(weekStart),
      date: weekStart,
    };
  });
  const elapsedDays = Math.max(0, Math.min(weekCount * 7, Math.floor((startOfDay(today) - startDate) / 86400000)));
  const currentWeek = Math.min(weekCount, Math.max(1, Math.floor(elapsedDays / 7) + 1));
  const todayOffset = Math.round((elapsedDays / 7) * weekWidth);
  const todayProgress = Number((elapsedDays / Math.max(1, weekCount * 7)).toFixed(4));
  const fitToFrame = weekCount <= 15;
  const initiationRow = resolvedPlanRows.find((row) => row.phaseKey === "initiation") || createDefaultProjectPlanRows(weekCount)[0];
  const decisionRow = resolvedPlanRows.find((row) => row.phaseKey === "decision") || createDefaultProjectPlanRows(weekCount).at(-1);
  const buRows = businessUnits.map((bu) => {
    const scheduleRows = resolvedPlanRows.filter((row) => row.businessUnitId === bu.id);
    const bars = stackPlanBars(scheduleRows.map((row) => createPlanBarFromScheduleRow(row, weekCount)));
    const firstStartWeek = scheduleRows.length ? Math.min(...scheduleRows.map((row) => row.startWeek)) : 1;
    return {
      type: "business-unit",
      title: bu.name,
      subtitle: bu.lead || "BU lead",
      startLabel: weeks[Math.max(0, Math.min(firstStartWeek, weekCount) - 1)]?.label || weeks[0].label,
      laneCount: Math.max(1, ...bars.map((bar) => (bar.stackIndex || 0) + 1)),
      laneHeight: 28 + (Math.max(1, ...bars.map((bar) => (bar.stackIndex || 0) + 1)) * 36),
      bars,
    };
  });
  const initiationBars = stackPlanBars([createPlanBarFromScheduleRow(initiationRow, weekCount)]);
  const decisionBars = stackPlanBars([createPlanBarFromScheduleRow(decisionRow, weekCount)]);
  const rows = [
    {
      type: "programme",
      title: "Project initiation",
      subtitle: "Programme-wide setup",
      startLabel: weeks[initiationRow.startWeek - 1]?.label || weeks[0].label,
      laneCount: 1,
      laneHeight: 58,
      bars: initiationBars,
    },
    ...buRows,
    {
      type: "decision",
      title: "Decision",
      subtitle: "Across all business units",
      startLabel: weeks[decisionRow.startWeek - 1]?.label || weeks[0].label,
      laneCount: 1,
      laneHeight: 58,
      bars: decisionBars,
    },
  ];
  return {
    weekCount,
    fitToFrame,
    planWidth: laneWidth + (weekWidth * weekCount),
    weekLabel: weeks[0].label,
    projectedFinishWeek: weekCount,
    projectedFinishLabel: weeks[weekCount - 1]?.label || weeks.at(-1)?.label || weeks[0].label,
    todayLabel: formatPlanDate(today),
    currentWeek,
    todayOffset,
    todayProgress,
    weeks,
    rows,
    dependencies: getProjectPlanDependencies(resolvedPlanRows),
  };
}
