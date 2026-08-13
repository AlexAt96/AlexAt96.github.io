/* Reference extracts from server/lib/dora-metrics.js. See the full source snapshot for surrounding context. */

function buildDoraMetrics(options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const db = options.db || {};
  const projectMetrics = options.projectMetrics || {};
  const deploymentMetrics = options.deploymentMetrics || {};
  const repoQuality = options.repoQuality || {};
  const gitChanges = options.useGit === false ? [] : collectRecentGitChanges(PERIOD_DAYS);
  const mainDeployments = collectMainDeploymentEvents(PERIOD_DAYS);
  const sourceChanges = firstNonEmptyChangeSet([
    gitChanges,
    normaliseChanges(deploymentMetrics.recentChanges || []),
    recentChangesFromHistory(projectMetrics.consistencyScoreHistory?.commits || []),
    recentChangesFromHistory(repoQuality.commitQualityHistory?.commits || []),
  ]);
  const fixSignals = sourceChanges.filter((change) => isFixLikeChange(change.subject));
  const regressionSignals = Array.isArray(repoQuality.commitQualityHistory?.regressions)
    ? repoQuality.commitQualityHistory.regressions
    : [];
  const branchLifecycle = collectCurrentBranchLifecycle(generatedAt);
  const branchLeadStats = collectRecentBranchLeadTimes(generatedAt, PERIOD_DAYS);
  const featureHours = Array.isArray(projectMetrics.estimates?.featureHours)
    ? projectMetrics.estimates.featureHours
    : [];
  const averageFeatureHours = averageNumber(featureHours.map((item) => Number(item.totalHours || 0)).filter((value) => value > 0));
  const recentCommitCount = sourceChanges.length;
  const deploymentStats = buildDeploymentStats(mainDeployments);
  const correctiveDeployments = mainDeployments.filter((change) => isCorrectiveDeployment(change.subject));
  const failureDeployments = mainDeployments.filter((change) => isFailureLikeDeployment(change.subject));
  const recoveryProxy = buildRecoveryProxy(mainDeployments);
  const deploymentDenominator = mainDeployments.length || recentCommitCount;
  const proxyFailureEvents = mainDeployments.length ? Math.max(failureDeployments.length, correctiveDeployments.length) : Math.max(fixSignals.length, regressionSignals.length);
  const proxyReworkEvents = mainDeployments.length ? correctiveDeployments.length : fixSignals.length;
  const proxyFailRate = deploymentDenominator ? roundNumber((proxyFailureEvents / deploymentDenominator) * 100, 1) : 0;
  const proxyReworkRate = deploymentDenominator ? roundNumber((proxyReworkEvents / deploymentDenominator) * 100, 1) : 0;
  const tableCounts = tableAvailability(db);
  const deploymentSourceLabel = mainDeployments.length ? "main first-parent commits as production estimate" : "recent repository change estimate";
  const branchLeadHours = Number(branchLifecycle.openHours || 0);
  const leadTimeValue = branchLeadStats.averageHours || branchLeadHours || averageFeatureHours || 0;
  const frequencyStats = mainDeployments.length
    ? deploymentStats
    : {
      perDay: recentCommitCount ? roundNumber(recentCommitCount / PERIOD_DAYS, 2) : 0,
      perWeek: recentCommitCount ? roundNumber((recentCommitCount / PERIOD_DAYS) * 7, 1) : 0,
      lastDeploymentAt: sourceChanges[0]?.date || "",
    };

  const metrics = [
    metric({
      id: "deployment-frequency",
      value: mainDeployments.length ? `${mainDeployments.length} main deploys / ${PERIOD_DAYS}d` : (recentCommitCount ? `${recentCommitCount} repo changes / ${PERIOD_DAYS}d` : "Needs deployment data"),
      numericValue: mainDeployments.length || recentCommitCount,
      unit: mainDeployments.length ? "main deployments per 30 days" : "repo changes per 30 days",
      status: mainDeployments.length || recentCommitCount ? "proxy" : "needs-data",
      confidence: mainDeployments.length ? "medium" : (recentCommitCount ? "low" : "missing"),
      source: mainDeployments.length ? "main first-parent git history" : "local git history estimate",
      formula: mainDeployments.length ? "count(first-parent commits on main) over last 30 days; main is treated as production" : "count(recent git commits) over last 30 days; not a production deployment count",
      interpretation: mainDeployments.length ? "Main is being treated as production for this dashboard, so each first-parent main commit is counted as a deployment event." : "Useful as delivery activity context only. A true DORA deployment-frequency value needs production deployment events.",
      currentData: mainDeployments.length ? ["main first-parent commit dates", "main commit subject", "main commit SHA"] : ["Git commit dates", "Current branch/head metadata", "Local System Map deployment summary"],
      requiredData: ["deployment_events.environment", "deployment_events.status", "deployment_events.finished_at", "deployment_events.production_flag", "ci_runs.status"],
      dashboard: {
        stats: [
          { label: "Per day", value: `${roundNumber(frequencyStats.perDay, 2)}/day` },
          { label: "Per week", value: `${roundNumber(frequencyStats.perWeek, 1)}/week` },
          { label: "Last", value: frequencyStats.lastDeploymentAt ? compactDateTime(frequencyStats.lastDeploymentAt) : "n/a" },
        ],
      },
    }),
    metric({
      id: "change-lead-time",
      value: branchLeadStats.branchCount ? `${roundNumber(branchLeadStats.averageHours, 1)}h avg branch / ${PERIOD_DAYS}d` : (branchLeadHours ? `${roundNumber(branchLeadHours, 1)}h current branch` : (averageFeatureHours ? `${roundNumber(averageFeatureHours, 1)}h avg feature estimate` : "Needs change lifecycle data")),
      numericValue: leadTimeValue || null,
      unit: branchLeadStats.branchCount ? "average branch lead hours in last 30 days" : (branchLeadHours ? "current branch open hours" : "estimated hours per feature"),
      status: leadTimeValue ? "proxy" : "needs-data",
      confidence: branchLeadStats.branchCount ? "medium" : (branchLeadHours ? "medium" : (averageFeatureHours ? "low" : "missing")),
      source: branchLeadStats.branchCount ? "recent feature branch lifecycle estimate" : (branchLeadHours ? "current feature branch lifecycle" : (averageFeatureHours ? "System Map feature-hour estimate" : "change-to-deployment links missing")),
      formula: branchLeadStats.branchCount ? "average(latest branch commit - first branch commit after merge-base(main, branch)) for branches active in the last 30 days" : (branchLeadHours ? "generated_at - first commit on current branch after merge-base(main, HEAD)" : "average(projectMetrics.estimates.featureHours.totalHours); not commit-to-production elapsed time"),
      interpretation: branchLeadStats.branchCount ? "This averages recent branch lifecycles visible in local git. True lead time still needs branch or PR lifecycle events linked to the production deployment that first carries each change." : (branchLeadHours ? "This uses the current branch age as a lead-time estimate. True lead time needs merged branch or PR lifecycle linked to the main deployment that carries it." : "This is an effort estimate, not true lead time. True lead time needs first commit or PR open through production deployment."),
      currentData: branchLeadStats.branchCount ? ["Recent feature branch refs", "merge-base(main, branch)", "first branch commit timestamp", "latest branch commit timestamp"] : (branchLeadHours ? ["Current branch name", "merge-base(main, HEAD)", "first branch commit timestamp", "branch commit count"] : ["Feature-hour estimates", "Commit windows", "Recent change subjects"]),
      requiredData: ["change_events.first_commit_at", "change_events.merged_at", "deployment_change_links", "deployment_events.finished_at"],
      dashboard: {
        stats: [
          { label: "Branches", value: String(branchLeadStats.branchCount || 0) },
          { label: "Median", value: branchLeadStats.branchCount ? `${roundNumber(branchLeadStats.medianHours, 1)}h` : "n/a" },
          { label: "Current", value: branchLifecycle.openHours ? `${roundNumber(branchLifecycle.openHours, 1)}h` : "n/a" },
        ],
      },
    }),
    metric({
      id: "failed-deployment-recovery-time",
      value: recoveryProxy.recoveryCount ? `${roundNumber(recoveryProxy.medianHours, 1)}h recovery estimate` : (mainDeployments.length ? "0 corrective cycles detected" : "Needs data"),
      numericValue: recoveryProxy.recoveryCount ? recoveryProxy.medianHours : (mainDeployments.length ? 0 : null),
      unit: recoveryProxy.recoveryCount ? "hours from previous main deploy to corrective deploy" : "duration",
      status: mainDeployments.length ? "proxy" : "needs-data",
      confidence: recoveryProxy.recoveryCount ? "low" : (mainDeployments.length ? "low" : "missing"),
      source: mainDeployments.length ? "corrective main deployment subject estimate" : "incident and failed deployment records missing",
      formula: mainDeployments.length ? "median(corrective main deployment time - previous main deployment time)" : "median(incident.restored_at - failed_deployment.failed_at)",
      interpretation: mainDeployments.length ? "Without persisted smoke-test outcomes, corrective main commits are treated as recovery signals after the previous main deployment." : "The app has audit events and job/export records, but no production incident or failed-deployment recovery timestamps yet.",
      currentData: mainDeployments.length ? ["main first-parent commits", "fix/hotfix/revert/harden/stabilise commit subjects"] : ["Audit event timestamps", "Export job status history"],
      requiredData: ["deployment_events.failed_at", "ci_runs.status", "incident_events.detected_at", "incident_events.restored_at", "incident_events.caused_by_deployment_id"],
      dashboard: {
        stats: [
          { label: "Cycles", value: String(recoveryProxy.recoveryCount || 0) },
          { label: "Corrective", value: String(correctiveDeployments.length) },
          { label: "Source", value: "main" },
        ],
      },
    }),
    metric({
      id: "change-fail-rate",
      value: deploymentDenominator ? `${proxyFailureEvents}/${deploymentDenominator} deploys (${proxyFailRate}%)` : "Needs deployment failure data",
      numericValue: deploymentDenominator ? proxyFailRate : null,
      unit: mainDeployments.length ? "percent of main deployments" : "percent of recent repo changes",
      status: deploymentDenominator ? "proxy" : "needs-data",
      confidence: mainDeployments.length ? "medium" : (deploymentDenominator ? "low" : "missing"),
      source: mainDeployments.length ? "corrective/failure-like main deployment subject estimate" : "fix/revert/regression signals in git and repo-quality history",
      formula: mainDeployments.length ? "corrective or failure-like main deployments / all main deployments" : "(fix-like commits or quality regressions) / recent commits; not failed deployments / deployments",
      interpretation: mainDeployments.length ? "This treats main as production and flags deployments with fix, hotfix, revert, rollback, fail, smoke, harden, or stabilise wording as possible failures." : "This highlights possible instability work, but true DORA change fail rate needs deployment outcomes.",
      currentData: ["Fix-like commit subjects", "Repo quality regression history", "Tier/test status signals"],
      requiredData: ["deployment_events.status", "ci_runs.status", "deployment_events.rollback_required", "deployment_events.hotfix_required", "incident_events.caused_by_deployment_id"],
      dashboard: {
        stats: [
          { label: "Flagged", value: String(proxyFailureEvents) },
          { label: "Main deploys", value: String(mainDeployments.length || deploymentDenominator) },
          { label: "Smoke hist.", value: "needed" },
        ],
      },
    }),
    metric({
      id: "deployment-rework-rate",
      value: deploymentDenominator ? `${proxyReworkEvents}/${deploymentDenominator} deploys (${proxyReworkRate}%)` : "Needs unplanned deployment data",
      numericValue: deploymentDenominator ? proxyReworkRate : null,
      unit: mainDeployments.length ? "percent of main deployments" : "percent of recent repo changes",
      status: deploymentDenominator ? "proxy" : "needs-data",
      confidence: mainDeployments.length ? "medium" : (deploymentDenominator ? "low" : "missing"),
      source: mainDeployments.length ? "corrective main deployment subject estimate" : "fix/hotfix/revert commit subject estimate",
      formula: mainDeployments.length ? "corrective main deployments / all main deployments" : "fix-like commits / recent commits; not unplanned incident deployments / all deployments",
      interpretation: mainDeployments.length ? "This uses main deployments with corrective wording as rework. It should be replaced by explicit planned/unplanned and incident-trigger flags once captured." : "This is a weak rework smell. True deployment rework rate needs planned-vs-unplanned deployment classification and incident links.",
      currentData: mainDeployments.length ? ["main first-parent commits", "corrective deployment subject signals"] : ["Recent commit subjects", "Current branch workflow"],
      requiredData: ["deployment_events.planned_flag", "deployment_events.trigger_reason", "ci_runs.status", "incident_events.incident_id", "deployment_events.incident_id"],
      dashboard: {
        stats: [
          { label: "Rework", value: String(proxyReworkEvents) },
          { label: "Main deploys", value: String(mainDeployments.length || deploymentDenominator) },
          { label: "Basis", value: mainDeployments.length ? "main" : "repo" },
        ],
      },
    }),
  ];

  const proxyCount = metrics.filter((item) => item.status === "proxy").length;
  const needsDataCount = metrics.filter((item) => item.status === "needs-data").length;

  return {
    generatedAt,
    source: "System Map read-only repository scan, local JSON data inventory, and platform-foundation production-data recommendations",
    scope: "whole-application",
    service: "CGI Migration Compass",
    periodDays: PERIOD_DAYS,
    model: {
      name: "DORA software delivery performance metrics",
      metricCount: DORA_METRIC_DEFINITIONS.length,
      note: "Current dashboard separates true DORA data from local estimates so production-readiness is not overstated.",
    },
    summary: {
      trueMetricCount: 0,
      proxyMetricCount: proxyCount,
      needsDataCount,
      confidence: proxyCount ? "low" : "missing",
      recentRepoChanges: recentCommitCount,
      mainDeploymentEvents: mainDeployments.length,
      deploymentFrequencyPerDay: frequencyStats.perDay,
      latestMainDeploymentAt: deploymentStats.lastDeploymentAt,
      currentBranchOpenHours: branchLeadHours,
      averageBranchLeadHours: branchLeadStats.averageHours,
      recentBranchLeadCount: branchLeadStats.branchCount,
      fixLikeChanges: fixSignals.length,
      correctiveMainDeployments: correctiveDeployments.length,
      failureLikeMainDeployments: failureDeployments.length,
      recoveryProxyCycles: recoveryProxy.recoveryCount,
      repoQualityRegressions: regressionSignals.length,
      availableOperationalTables: tableCounts.available,
      missingOperationalTables: tableCounts.missing,
    },
    metrics,
    deploymentProxy: {
      productionAssumption: "main branch is treated as production until explicit deployment_events exist",
      source: deploymentSourceLabel,
      periodDays: PERIOD_DAYS,
      mainRef: deploymentStats.mainRef,
      deployments: mainDeployments.slice(0, 12),
      stats: deploymentStats,
      currentBranch: branchLifecycle,
      branchLeadTimes: branchLeadStats,
    },
    availableSignals: buildAvailableSignals({ db, projectMetrics, deploymentMetrics, repoQuality, sourceChanges, mainDeployments, branchLifecycle, branchLeadStats }),
    missingData: buildMissingData(),
    recommendedDataModel: buildRecommendedDataModel(),
    recentSignals: firstNonEmptyChangeSet([mainDeployments, sourceChanges]).slice(0, 12).map((change) => ({
      shortSha: change.shortSha || "",
      date: change.date || "",
      subject: change.subject || "",
      signalType: mainDeployments.length ? (isCorrectiveDeployment(change.subject) ? "corrective-main-deploy" : "main-deploy") : (isFixLikeChange(change.subject) ? "possible-rework" : "delivery-activity"),
    })),
  };
}
