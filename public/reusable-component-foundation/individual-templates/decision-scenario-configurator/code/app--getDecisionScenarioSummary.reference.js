/* Reference extract: getDecisionScenarioSummary(...) from app/src/app.js:26933-27021. */

function getDecisionScenarioSummary(models = getDecisionBuModels()) {
  const summary = {
    totalBuCount: models.length,
    selectedBuIds: new Set(),
    buContributions: {},
    totalProducts: 0,
    selectedProducts: 0,
    migrationCost: 0,
    fiveYearSavings: 0,
    netSavings: 0,
    yearOneTwoSavings: 0,
    yearThreeFiveSavings: 0,
    weightedRiceTotal: 0,
    weightedRiceCount: 0,
    configurationRows: [],
  };
  models.forEach((model) => {
    const productRows = model.products.length ? model.products : [{ id: `${model.bu.id}-estate` }];
    const weight = productRows.length ? 1 / productRows.length : 1;
    summary.totalProducts += productRows.length;
    summary.buContributions[model.bu.id] = {
      buId: model.bu.id,
      buName: model.bu.name,
      selectedProducts: 0,
      totalProducts: productRows.length,
      migrationCost: 0,
      fiveYearSavings: 0,
      yearOneTwoSavings: 0,
      yearThreeFiveSavings: 0,
      netSavings: 0,
      reachScore: model.rice.reachScore,
      impactScore: model.rice.impactScore,
      confidenceScore: model.rice.confidenceScore,
      effortScore: model.rice.effortScore,
      riceScore: 0,
      weight: 0,
      cgiRecommendation: model.cgiRecommendation,
      currentAction: model.defaultAction,
      currentScenarioLabel: getDecisionScenarioActionLabel(model.defaultAction),
    };
    productRows.forEach((product) => {
      const productContribution = {
        buId: model.bu.id,
        buName: model.bu.name,
        productId: product.id || `${model.bu.id}-estate`,
        productName: product.name || `${model.bu.name} Databricks estate`,
        action: model.defaultAction,
        counted: model.defaultAction === "Migrate",
        netSavings: (model.cost.fiveYearSavings - model.bu.migrationCost) * weight,
        migrationCost: model.bu.migrationCost * weight,
        fiveYearSavings: model.cost.fiveYearSavings * weight,
        riceScore: Number(model.rice.riceScore || 0) * weight,
        cgiRecommendation: model.cgiRecommendation,
      };
      summary.configurationRows.push(productContribution);
      if (model.defaultAction !== "Migrate") return;
      const contribution = summary.buContributions[model.bu.id];
      summary.selectedProducts += 1;
      summary.selectedBuIds.add(model.bu.id);
      summary.migrationCost += model.bu.migrationCost * weight;
      summary.fiveYearSavings += model.cost.fiveYearSavings * weight;
      summary.yearOneTwoSavings += model.cost.yearOneTwoSavings * weight;
      summary.yearThreeFiveSavings += model.cost.yearThreeFiveSavings * weight;
      summary.weightedRiceTotal += Number(model.rice.riceScore || 0) * weight;
      summary.weightedRiceCount += weight;
      contribution.selectedProducts += 1;
      contribution.migrationCost += model.bu.migrationCost * weight;
      contribution.fiveYearSavings += model.cost.fiveYearSavings * weight;
      contribution.yearOneTwoSavings += model.cost.yearOneTwoSavings * weight;
      contribution.yearThreeFiveSavings += model.cost.yearThreeFiveSavings * weight;
      contribution.riceScore += Number(model.rice.riceScore || 0) * weight;
      contribution.weight += weight;
    });
  });
  setDecisionCurrentScenarioLabels(summary);
  Object.values(summary.buContributions).forEach((contribution) => {
    contribution.netSavings = contribution.fiveYearSavings - contribution.migrationCost;
    contribution.avgRice = contribution.weight ? contribution.riceScore / contribution.weight : 0;
    contribution.points = getDecisionCumulativePoints(contribution);
    contribution.breakEvenLabel = getDecisionBreakEvenLabel(contribution.points);
  });
  summary.selectedBuCount = summary.selectedBuIds.size;
  summary.netSavings = summary.fiveYearSavings - summary.migrationCost;
  summary.avgRice = summary.weightedRiceCount ? summary.weightedRiceTotal / summary.weightedRiceCount : 0;
  summary.points = getDecisionCumulativePoints(summary);
  summary.buSeries = Object.values(summary.buContributions).filter((contribution) => contribution.selectedProducts > 0);
  summary.breakEvenLabel = getDecisionBreakEvenLabel(summary.points);
  return summary;
}
