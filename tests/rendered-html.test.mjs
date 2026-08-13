import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

const compassPatternSections = [
  ["dashboard", "dashboard", "Dashboard"],
  ["gantt-chart", "gantt", "Gantt chart"],
  ["work-queue", "workQueue", "Work queue"],
  ["charts", "charts", "Charts"],
  ["compact-charts", "compactCharts", "Compact charts"],
  ["board-and-list", "kanban", "Board and list"],
  ["editable-data-table", "editableDataTable", "Editable data table"],
  ["read-only-data-table", "readOnlyDataTable", "Read-only data table"],
  ["csv-import-export-wizard", "csvImportExport", "CSV import / export wizard"],
  ["configuration-form", "configurationForm", "Configuration form"],
  ["confirmation-handoff", "confirmationHandoff", "Confirmation handoff"],
  ["report-review-feedback", "reportReviewFeedback", "Report review and feedback"],
  ["questionnaire", "questionnaire", "Questionnaire"],
  ["results-statistics", "resultsStatistics", "Results statistics"],
  ["branch-chart", "branchChart", "Branch chart"],
  ["calculator", "calculator", "Calculator"],
  ["flow-diagram", "flowDiagram", "Flow diagram"],
  ["structure-diagram", "structureDiagram", "Structure diagram"],
  ["evidence-matrix", "evidenceMatrix", "Evidence matrix"],
  ["evidence-list", "evidenceTaskList", "Evidence list"],
  ["review-list", "reviewList", "Review list"],
  ["final-report", "finalReport", "Final report"],
  ["cost-scenario-analysis", "costScenario", "Cost scenario analysis"],
  ["data-lineage", "dataLineage", "Data lineage"],
  ["operational-reports", "operationalReports", "Operational reports"],
  ["test-runs", "testRuns", "Test runs and coverage"],
];

const trackerScreenContracts = [
  {
    id: "poc-dashboard",
    galleryId: "dashboard",
    folder: "01-dashboard",
    global: "DashboardCharts",
    title: "Dashboard",
    description: "KPI cards, distinct planning lenses, progress trends, effort allocation and drill-down context.",
    baseMarker: "Programme delivery overview",
  },
  {
    id: "poc-planning-backlog",
    galleryId: "planning-backlog",
    folder: "02-planning-backlog",
    global: "PlanningBacklog",
    title: "Planning backlog",
    description: "Phase groups, accessible reordering, filters, estimates, dependencies and task detail.",
    baseMarker: "Define the intended outcome",
  },
  {
    id: "poc-gantt-chart",
    galleryId: "gantt-chart",
    folder: "03-gantt-chart",
    global: "PlanningGantt",
    title: "Gantt chart",
    description: "A draggable weekly planning canvas with resizing, reordering, direct editing, undo and phase roll-ups.",
    baseMarker: "Define the outcome",
  },
  {
    id: "poc-workflow-workbench",
    galleryId: "workbench",
    folder: "06-workflow-workbench",
    global: "WorkflowWorkbench",
    title: "Workflow workbench",
    description: "A configurable record-detail screen with stages, measures, supporting sections and an explicit next action.",
    baseMarker: "Workflow decision workbench",
  },
  {
    id: "poc-chatbot",
    galleryId: "chatbot",
    folder: "07-chatbot",
    global: "AssistantReview",
    title: "Chatbot assistant",
    description: "Source-linked answers and proposed changes with approve, edit, reject and feedback controls.",
    baseMarker: "Guided workspace assistant",
  },
  {
    id: "poc-earned-value",
    galleryId: "earned-value",
    folder: "08-earned-value",
    global: "EarnedValue",
    title: "Earned value",
    description: "Explicit assumptions, schedule and cost variance, efficiency indicators and forecast curves.",
    baseMarker: "Delivery performance forecast",
  },
  {
    id: "poc-architecture-map",
    galleryId: "architecture-map",
    folder: "09-architecture-system-map",
    global: "SystemMap",
    title: "Architecture map",
    description: "A rich five-lane system landscape with typed interfaces, architecture filters, evidence and node inspection.",
    baseMarker: "Current-state architecture landscape",
  },
];

const trackerRendererHashes = {
  "01-dashboard": {
    js: "b08604e4a624a4bcb512dd653faabfc100b0c849bf69e0733bf34b2aaeac374c",
    css: "8ed785513561c35206a59b499a2be815c0a72a0188dbed1d3976d45cf0a7141b",
  },
  "02-planning-backlog": {
    js: "90368eb0c711cfb1e4c3606f84b9e33297b66e200e0d0c4a8f0ecf6619d7625d",
    css: "e396199cd77eaf6a79cda5711b0b9a6b9964cc20cb6d8823ed4c064e7c5301f3",
  },
  "03-gantt-chart": {
    js: "de81d6b737d1eee94c2fcecf54395b117d2ea6aaa889c280a22779189a8fd767",
    css: "fa2a41d3ce483f4103e2bb742bca1e20a7e9896504ea15898f71c55737b30b49",
  },
  "06-workflow-workbench": {
    js: "b0425bd04f2d3205f1f20ab8aac1784d2c06fb73cfb21d34fa45837f531d06e1",
    css: "5289a5afdd8706a9bf39f75a66d7c3b861776a61e18d83a571f5561f3909fbcd",
  },
  "07-chatbot": {
    js: "1e6a3e2a939c3e1f784746285927cb322fd654530a6a193190f450621289a9c9",
    css: "ffafd3ef4c5f0a233d4b255a892a93f6fcfb0a630fc8b8d49c54b239623093c7",
  },
  "08-earned-value": {
    js: "a918d5c546695c372659dfb03f183db6056177ff69fbc0d6d94dff19edef6072",
    css: "d43b34cdd9089aada6e34ce1b668deb726609040e09a40e5f4d6f28903d89b9f",
  },
  "09-architecture-system-map": {
    js: "183ca994029876aa0f01e60adb677a62bad6a01df7f9a10b213b7f6cdf723b9b",
    css: "eea32cea3a008b2d1931dd9d1d47704d0c9693e5cf743686f4f01491e388cd68",
  },
};

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

function attributeValues(html, attribute) {
  return [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))].map((match) => match[1]);
}

function compassPatternHtml(html, patternId) {
  const index = compassPatternSections.findIndex(([id]) => id === patternId);
  assert.ok(index >= 0, `${patternId} is a known Compass pattern`);
  const start = html.indexOf(`id="compass-pattern-${patternId}"`);
  assert.ok(start >= 0, `${patternId} is present in the rendered showroom`);
  const nextId = compassPatternSections[index + 1]?.[0];
  const end = nextId ? html.indexOf(`id="compass-pattern-${nextId}"`, start) : html.length;
  return html.slice(start, end > start ? end : html.length);
}

function trackerScreenHtml(html, screenId) {
  const index = trackerScreenContracts.findIndex(({ id }) => id === screenId);
  assert.ok(index >= 0, `${screenId} is a known Tracker screen`);
  const marker = `id="${screenId}"`;
  const markerOffset = html.indexOf(marker);
  assert.ok(markerOffset >= 0, `${screenId} is present in the rendered showroom`);
  const start = html.lastIndexOf("<section", markerOffset);
  const nextId = trackerScreenContracts[index + 1]?.id;
  const nextMarkerOffset = nextId ? html.indexOf(`id="${nextId}"`, markerOffset + marker.length) : -1;
  const end = nextMarkerOffset >= 0
    ? html.lastIndexOf("<section", nextMarkerOffset)
    : html.indexOf("<footer", markerOffset);
  return html.slice(start, end > start ? end : html.length);
}

function elementContract(html) {
  return [...html.matchAll(/<([a-z][\w-]*)(\s[^<>]*?)?>/gi)].map(([, tag, attributeSource]) => {
    const attributes = [...(attributeSource ?? "").matchAll(/\s([:@a-z_][\w:.-]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi)]
      .map(([, attribute]) => attribute.toLowerCase())
      .sort();
    return `${tag.toLowerCase()}[${attributes.join(",")}]`;
  });
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function templateContracts(source) {
  const block = source.match(/const templates:[\s\S]*?= \{([\s\S]*?)\n\};/)?.[1] ?? "";
  return [...block.matchAll(/^\s{2}(\w+):\s*(\w+),$/gm)].map(([, key, component]) => [key, component]);
}

test("portfolio navigation has a dedicated route and rejects ambiguous showroom queries", async () => {
  const [homeResponse,portfolioResponse,invalidResponse,scenarioOnlyResponse,legacyCompassResponse] = await Promise.all([
    render("/"),
    render("/portfolio"),
    render("/?system=not-a-showroom"),
    render("/?scenario=dcc-hackathon"),
    render("/?system=compass"),
  ]);
  [homeResponse,portfolioResponse,invalidResponse,scenarioOnlyResponse,legacyCompassResponse].forEach((response) => assert.equal(response.status,200));

  const [homeHtml,portfolioHtml,invalidHtml,scenarioOnlyHtml,legacyCompassHtml] = await Promise.all([
    homeResponse.text(),
    portfolioResponse.text(),
    invalidResponse.text(),
    scenarioOnlyResponse.text(),
    legacyCompassResponse.text(),
  ]);

  for (const html of [homeHtml,portfolioHtml,invalidHtml,scenarioOnlyHtml]) {
    assert.match(html,/class="portfolio-home"/);
    assert.match(html,/Alex(?:<!-- -->)?[\s\S]*Atkinson/);
    assert.match(html,/href="\/compass"/);
    assert.match(html,/href="\/tracker"/);
    assert.doesNotMatch(html,/data-system="compass"|data-system="tracker"/);
  }
  assert.match(portfolioHtml,/href="\/portfolio"/);
  assert.match(legacyCompassHtml,/data-system="compass"/);

  const layoutSource = readFileSync(`${projectRoot}/app/layout.tsx`, "utf8");
  const portfolioStyles = ["portfolio-system.css", "minimal-brand.css"];
  for (const stylesheet of portfolioStyles) {
    assert.match(layoutSource,new RegExp(`import "\\./${stylesheet.replace(".", "\\.")}"`),`${stylesheet} is included in every rendered route`);
    assert.match(readFileSync(`${projectRoot}/app/${stylesheet}`, "utf8"),/\.portfolio-home\s*\{/,`${stylesheet} contains the portfolio layout layer`);
  }
});

test("server-renders the Compass UI component library", async () => {
  const response = await render("/compass");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Migration Compass — AA Portfolio<\/title>/i);
  assert.match(html, /AA Portfolio/);
  assert.match(html, /Clever stuff\. Done properly\./);
  assert.match(html, /Navigate complex/);
  assert.match(html, /Choose library collection/);
  assert.match(html, /Collapse sidebar/);
  assert.match(html, /Migration Compass/);
  assert.match(html, /PoC Tracker/);
  assert.match(html, /Individual Components/);
  assert.match(html, /Agent Methods/);
  assert.match(html, /href="\/compass"[^>]*aria-current="page"/);
  assert.match(html, /href="\/foundation"[^>]*>.*Focused gallery/s);
  assert.match(html, /View focused gallery/);
  assert.doesNotMatch(html, /gallery-view-link/);
  assert.match(html, /Architecture upload &amp; human review/);
  assert.match(html, /Dependency explorer/);
  assert.match(html, /id="compass-template-library"/);
  assert.match(html, /data-compass-pattern-sections/);
  const patternsStart = html.lastIndexOf("<div", html.indexOf("data-compass-pattern-sections"));
  const patternsEnd = html.length;
  const patternsHtml = html.slice(patternsStart, patternsEnd);
  assert.equal((patternsHtml.match(/\d{2}(?:<!-- -->)? · COMPASS PATTERN/g) ?? []).length, 26);
  assert.match(patternsHtml, /08(?:<!-- -->)? · COMPASS PATTERN/);
  assert.match(patternsHtml, /33(?:<!-- -->)? · COMPASS PATTERN/);

  let previousPatternOffset = -1;
  for (const [id, templateKey, title] of compassPatternSections) {
    const sectionId = `id="compass-pattern-${id}"`;
    const patternOffset = html.indexOf(sectionId);
    assert.ok(patternOffset > previousPatternOffset, `${title} is rendered as an ordered individual section`);
    previousPatternOffset = patternOffset;

    const nextPattern = compassPatternSections[compassPatternSections.findIndex(([patternId]) => patternId === id) + 1];
    const nextOffset = nextPattern ? html.indexOf(`id="compass-pattern-${nextPattern[0]}"`) : html.length;
    const sectionStart = html.lastIndexOf("<section", patternOffset);
    const sectionHtml = html.slice(sectionStart, nextOffset > patternOffset ? nextOffset : undefined);
    assert.match(sectionHtml, new RegExp(`data-compass-pattern="${id}"`), `${title} exposes its stable pattern identifier`);
    assert.match(sectionHtml, new RegExp(`data-template-key="${templateKey}"`), `${title} exposes its template contract`);
    assert.ok(sectionHtml.includes(`Technical details for ${title}`), `${title} has its own technical-details action`);
    assert.ok(sectionHtml.includes(`Download source for ${title}`), `${title} has its own source action`);
    assert.ok(sectionHtml.includes(`View ${title} full screen`), `${title} has its own fullscreen action`);
    assert.ok(sectionHtml.includes(`Choose ${title} demo state`), `${title} has its own preview-state controls`);
    assert.ok(sectionHtml.includes('data-preview-mode="default"'), `${title} has its own interactive preview`);
    assert.ok(sectionHtml.includes("Interactive preview"), `${title} renders an interactive preview surface`);
    assert.ok(sectionHtml.includes('class="section-heading"'), `${title} reuses the 06/07 heading layout`);
    assert.ok(sectionHtml.includes('class="component-actions"'), `${title} reuses the 06/07 resource bar`);
    assert.ok(sectionHtml.includes('fullscreen-pattern-button'), `${title} reuses the 06/07 fullscreen action`);
    assert.ok(sectionHtml.includes('tech-details-button'), `${title} reuses the 06/07 technical action`);
    assert.ok(sectionHtml.includes('download-code-button'), `${title} reuses the 06/07 download action`);
    assert.ok(sectionHtml.includes('pattern-frame pattern-fullscreen-target'), `${title} reuses the 06/07 frame and fullscreen shell`);
    assert.ok(sectionHtml.includes('fullscreen-exit-control'), `${title} reuses the 06/07 fullscreen exit control`);
    assert.ok(sectionHtml.includes('class="frame-toolbar"'), `${title} reuses the 06/07 frame toolbar`);
    assert.ok(!sectionHtml.includes("Live React preview"), `${title} does not expose framework preview chrome`);
    assert.ok(!sectionHtml.includes(`${templateKey.toUpperCase()} · DEFAULT`), `${title} does not expose its internal template key and mode`);
  }

  const csvPatternStart = html.indexOf('id="compass-pattern-csv-import-export-wizard"');
  const csvPatternEnd = html.indexOf('id="compass-pattern-configuration-form"');
  const csvPatternHtml = html.slice(csvPatternStart, csvPatternEnd);
  for (const internalBoundary of ["CsvWizard", "TemplateDownload", "FileDropzone", "ColumnMapper", "RowValidation", "ExportBuilder"]) {
    assert.doesNotMatch(
      csvPatternHtml,
      new RegExp(`>(?:<!-- -->)?${internalBoundary}(?:<!-- -->)?<`),
      `${internalBoundary} remains implementation metadata rather than visible preview chrome`,
    );
  }
  assert.doesNotMatch(patternsHtml, /Typed props · explicit states · reusable boundaries/i);
  assert.doesNotMatch(patternsHtml, /Interactive React preview/i);

  assert.equal((patternsHtml.match(/class="content-section pattern-section [^"]+"/g) ?? []).length, 26);
  assert.equal((patternsHtml.match(/data-compass-pattern="/g) ?? []).length, 26);
  assert.equal((patternsHtml.match(/data-preview-mode="default"/g) ?? []).length, 26);
  assert.equal((patternsHtml.match(/Technical details for /g) ?? []).length, 26);
  assert.equal((patternsHtml.match(/Download source for /g) ?? []).length, 26);
  assert.equal((patternsHtml.match(/View .*? full screen/g) ?? []).length, 26);
  assert.doesNotMatch(html, /Pattern index|Search Compass patterns|Choose a pattern, try its complete behaviour|compass-template-library-selector-/);
  assert.match(html, /Colour palette preview mode/);
  assert.match(html, /Edit colours/);
  assert.match(html, /Reset defaults/);
  assert.match(html, /Typography preview mode/);
  assert.match(html, /SEMANTIC TOKENS/);
  assert.match(html, /TYPOGRAPHY SPECIMEN/);
  assert.match(html, /Take the complete UI system with you/);
  assert.match(html, /Export typography/);
  assert.match(html, /Export colours/);
  assert.match(html, /Export full UI/);
  assert.match(html, /compass-ui-code\.zip/);
  assert.match(html, /dependency-explorer\.html/);
  assert.match(html, /INTERACTIVE PATTERN/);
  assert.doesNotMatch(html, /FULL COMPONENT INDEX|Every reusable part, in one place/);
  assert.doesNotMatch(html, /data-individual-component-name=|data-component-index-name=/);
  assert.match(html, /RecommendationPanel/);
  assert.equal((html.match(/id="full-component-index"/g) ?? []).length, 0);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("all twenty-six Compass Tech details actions share the complete developer workbench", async () => {
  const response = await render("/compass");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const [patternId, , title] of compassPatternSections) {
    const section = compassPatternHtml(html, patternId);
    assert.ok(section.includes(`Technical details for ${title}`), `${title} exposes the shared developer-workbench trigger`);
  }

  const sectionsSource = readFileSync(`${projectRoot}/app/CompassPatternSections.tsx`, "utf8");
  const gallerySource = readFileSync(`${projectRoot}/app/foundation/FoundationGallery.tsx`, "utf8");
  const workbenchPath = `${projectRoot}/app/CompassPatternWorkbench.tsx`;
  const technicalDetailsPath = `${projectRoot}/app/foundation/patternTechnicalDetails.ts`;
  assert.equal(existsSync(workbenchPath), true, "Compass patterns have a reusable developer-workbench implementation");
  assert.equal(existsSync(technicalDetailsPath), true, "Compass patterns have reusable example-data and API contracts");
  const workbenchSource = readFileSync(workbenchPath, "utf8");
  const technicalDetailsSource = readFileSync(technicalDetailsPath, "utf8");
  const developerHandoffSource = `${workbenchSource}\n${technicalDetailsSource}`;

  assert.match(sectionsSource, /import[^;]*CompassPatternWorkbench[^;]*from/, "the integrated showroom imports the shared workbench");
  assert.match(
    sectionsSource,
    /function CompassPatternSection[\s\S]*?<CompassPatternWorkbench[\s\S]*?pattern=\{pattern\}/,
    "the workbench is mounted inside the section renderer shared by every Compass pattern",
  );
  assert.match(sectionsSource, /compassPatterns\.map[\s\S]*?<CompassPatternSection/, "all catalogue patterns use that shared section renderer");
  assert.match(gallerySource, /CompassPatternWorkbench/, "the focused gallery uses the same complete technical handoff");
  for (const [, templateKey, title] of compassPatternSections) {
    assert.ok(
      (technicalDetailsSource.match(new RegExp(`^  ${templateKey}:`, "gm")) ?? []).length >= 2,
      `${title} has both a technical profile and representative example payload`,
    );
  }

  assert.match(workbenchSource, /COMPONENT WORKBENCH/i);
  assert.match(workbenchSource, /role="tablist"/);
  assert.match(workbenchSource, /role="tab"/);
  assert.match(workbenchSource, /aria-selected=/);
  assert.match(workbenchSource, /role="tabpanel"/);
  assert.match(
    workbenchSource,
    /tabs\.map\(\(tab\) => <div[\s\S]*?id=\{`compass-workbench-\$\{pattern\.id\}-panel-\$\{tab\.id\}`\}[\s\S]*?hidden=\{activeTab !== tab\.id\}/,
    "all four tabpanel targets stay in the DOM so every aria-controls reference resolves",
  );
  for (const [label, purpose] of [
    ["Overview", "implementation guidance"],
    ["Component", "rendered React and TypeScript source"],
    ["Example data", "a representative payload"],
    ["API / Props", "the integration contract"],
  ]) {
    assert.match(workbenchSource, new RegExp(label.replace("/", "\\/"), "i"), `the workbench includes ${purpose}`);
  }

  assert.match(workbenchSource, /React \+ TypeScript/);
  assert.match(workbenchSource, /<pre[\s\S]*?<code/, "developer artefacts are readable directly in a code panel");
  assert.match(workbenchSource, /fetch\(/, "the component view loads the real downloadable pattern source");
  assert.match(workbenchSource, /\.text\(\)/, "the fetched React source is rendered rather than merely linked");
  for (const requiredAsset of [
    "PlanningTemplates.tsx",
    "PlanningTemplates.module.css",
    "CollectionTemplates.tsx",
    "CollectionTemplates.module.css",
    "ImportExportCsvTemplate.tsx",
    "ImportExportCsvTemplate.module.css",
    "AnalysisTemplates.tsx",
    "AnalysisTemplates.module.css",
    "OutcomeTemplates.tsx",
    "OutcomeTemplates.module.css",
    "shared.tsx",
    "shared.module.css",
    "types.ts",
    "scenarios.ts",
    "TemplatePreview.tsx",
    "README.md",
    "COMPASS-UI-EXPORT-README.md",
  ]) {
    assert.match(workbenchSource, new RegExp(requiredAsset.replaceAll(".", "\\.")), `${requiredAsset} is included in the recreate-this-pattern source handoff`);
  }
  assert.match(workbenchSource, /orderedFamilies[\s\S]*?familySource === sourceName/, "the selected pattern family remains first in the complete source list");
  for (const requiredFixturePath of [
    "individual-templates/dashboard-page/template-data.json",
    "individual-templates/advanced-discovery-pie-chart/template-data.json",
    "individual-templates/phase-kanban-board/template-data.json",
    "template-data/template-data.json",
  ]) {
    assert.match(workbenchSource, new RegExp(requiredFixturePath.replaceAll(".", "\\.")), `${requiredFixturePath} is visible for every pattern because a supplied template family imports it`);
  }
  assert.match(workbenchSource, /Download complete source/, "developers can also take the complete working source bundle");
  assert.doesNotMatch(workbenchSource, /href="[^"]*\$\{pattern\.[^}]+\}[^"]*"/, "pattern-specific guidance links are interpolated instead of emitted as literal placeholders");
  assert.match(workbenchSource, /pattern\.boundaries/, "the implementation guidance is specific to the selected pattern");
  assert.match(workbenchSource, /pattern\.states/, "the selected pattern's supported states remain visible");
  assert.match(developerHandoffSource, /pattern\.dataContracts/, "example and API guidance follows the selected pattern's data contracts");
  assert.match(workbenchSource, /Exact source props \+ recommended adapter/i, "the API view distinguishes implemented props from the recommended host adapter");
  for (const contractField of ["mode", "resetToken", "scenarioId", "onChange", "onSave", "onSubmit", "onNavigate", "onExport"]) {
    assert.match(developerHandoffSource, new RegExp(`\\b${contractField}\\b`), `the handoff documents ${contractField}`);
  }

  assert.match(workbenchSource, /navigator\.clipboard\.writeText\(/, "the active source, data or API view can be copied");
  assert.match(workbenchSource, /new Blob\(\[/, "the active developer artefact can be downloaded");
  assert.match(workbenchSource, /URL\.createObjectURL\(/, "downloads use a generated file URL");
  assert.match(workbenchSource, /URL\.revokeObjectURL\(/, "generated download URLs are cleaned up");
  assert.match(workbenchSource, />\s*(?:\{[^}]*\?[^:]*:\s*)?["']?Copy/i, "the code panel exposes its copy action");
  assert.match(workbenchSource, /Download/i, "the code panel exposes its download action");
});

test("downloadable Compass source stays aligned with the live workbench dependencies", () => {
  const liveRoot = `${projectRoot}/app/foundation/templates`;
  const publicRoot = `${projectRoot}/public/reusable-component-foundation/showroom-templates`;
  const mirroredFiles = [
    "PlanningTemplates.tsx",
    "PlanningTemplates.module.css",
    "CollectionTemplates.tsx",
    "CollectionTemplates.module.css",
    "ImportExportCsvTemplate.tsx",
    "ImportExportCsvTemplate.module.css",
    "AnalysisTemplates.tsx",
    "AnalysisTemplates.module.css",
    "OutcomeTemplates.tsx",
    "OutcomeTemplates.module.css",
    "TemplatePreview.tsx",
    "shared.tsx",
    "shared.module.css",
    "types.ts",
  ];

  for (const file of mirroredFiles) {
    assert.equal(
      readFileSync(`${publicRoot}/${file}`, "utf8"),
      readFileSync(`${liveRoot}/${file}`, "utf8"),
      `${file} download mirrors the implementation rendered by the app`,
    );
  }

  assert.equal(
    readFileSync(`${publicRoot}/scenarios.ts`, "utf8"),
    readFileSync(`${projectRoot}/app/scenarios.ts`, "utf8"),
    "the visible ScenarioId dependency mirrors app/scenarios.ts",
  );
  assert.equal(existsSync(`${publicRoot}/README.md`), true, "the visible source set includes setup and file-layout guidance");

  const archive = readFileSync(`${projectRoot}/public/reusable-component-foundation/compass-ui-code.zip`).toString("latin1");
  for (const includedPath of [
    "compass-ui/app/CompassPatternWorkbench.tsx",
    "compass-ui/app/CompassPatternWorkbench.module.css",
    "compass-ui/app/foundation/patternTechnicalDetails.ts",
    "compass-ui/app/foundation/templates/shared.tsx",
    "compass-ui/app/foundation/templates/shared.module.css",
    "compass-ui/app/foundation/templates/types.ts",
    "compass-ui/app/scenarios.ts",
    "compass-ui/public/reusable-component-foundation/template-data/template-data.json",
    "compass-ui/public/reusable-component-foundation/individual-templates/dashboard-page/template-data.json",
    "compass-ui/public/reusable-component-foundation/individual-templates/advanced-discovery-pie-chart/template-data.json",
    "compass-ui/public/reusable-component-foundation/individual-templates/phase-kanban-board/template-data.json",
  ]) {
    assert.ok(archive.includes(includedPath), `${includedPath} is present in the complete source archive`);
  }
});

test("Base preserves the original showroom copy and semantics across every template family", async () => {
  const response = await render("/compass");
  assert.equal(response.status, 200);
  const html = await response.text();
  const snapshotRoot = `${projectRoot}/public/reusable-component-foundation/showroom-templates`;
  const contracts = [
    {
      family: "Planning",
      source: "PlanningTemplates.tsx",
      patternId: "dashboard",
      markers: [
        "Portfolio overview",
        "Programme snapshot",
        "Metrics, health and progress in one reusable summary",
        'aria-label="Completion rose from 20 to 72 percent over four weeks"',
      ],
    },
    {
      family: "Collection",
      source: "CollectionTemplates.tsx",
      patternId: "report-review-feedback",
      markers: [
        "Two-actor review pattern · RPT-001 · Version 3",
        "Report review feedback",
        "Report author · Updated today",
        'role="tablist" aria-label="Report review views"',
      ],
    },
    {
      family: "CSV",
      source: "ImportExportCsvTemplate.tsx",
      patternId: "csv-import-export-wizard",
      markers: [
        "Reusable data exchange pattern",
        "Import / export CSV wizard",
        "Download a clean template, validate an uploaded file, map its columns, review every row and emit approved data through explicit callbacks.",
        'role="tablist" aria-label="CSV workflow"',
        'aria-label="CSV import wizard"',
      ],
    },
    {
      family: "Analysis",
      source: "AnalysisTemplates.tsx",
      patternId: "branch-chart",
      markers: [
        "Pipeline explorer",
        "Customer insight daily",
        "Prepare a governed daily customer insight dataset for reporting and activation.",
        'aria-label="Pipeline definition"',
      ],
    },
    {
      family: "Outcome",
      source: "OutcomeTemplates.tsx",
      patternId: "final-report",
      markers: [
        "Report review and feedback",
        "Edit source-linked sections and respond to reviewer comments.",
        'aria-label="Report sections"',
      ],
    },
  ];

  for (const { family, source, patternId, markers } of contracts) {
    const snapshot = readFileSync(`${snapshotRoot}/${source}`, "utf8");
    const section = compassPatternHtml(html, patternId);
    for (const marker of markers) {
      const semanticMarker = marker.match(/^aria-label="([^"]+)"$/)?.[1];
      assert.ok(snapshot.includes(marker) || Boolean(semanticMarker && snapshot.includes(semanticMarker)), `${family} truth snapshot retains ${marker}`);
      assert.ok(section.includes(marker), `${family} Base preview retains the exact original ${marker}`);
    }
  }
});

test("DCC supplies contextual fixtures through the same original template contracts", async () => {
  const response = await render("/compass?scenario=dcc-hackathon");
  assert.equal(response.status, 200);
  const html = await response.text();
  const contextualPatterns = [
    ["dashboard", "Assurance run snapshot"],
    ["csv-import-export-wizard", "Import / export assurance standards"],
    ["configuration-form", "Standards configuration"],
    ["confirmation-handoff", "Document submission &amp; verification"],
    ["report-review-feedback", "Assurance report feedback"],
    ["results-statistics", "AI findings &amp; results"],
    ["branch-chart", "Documentation assurance pipeline"],
    ["calculator", "Customer portal assurance profile"],
    ["evidence-matrix", "Standards evidence matrix"],
    ["evidence-list", "Documentation evidence tasks"],
    ["review-list", "Documentation findings register"],
    ["final-report", "Assurance report review and feedback"],
    ["cost-scenario-analysis", "Standards library integration"],
    ["data-lineage", "Interactive standards-to-assurance-outcome relationships"],
    ["operational-reports", "DCC assurance service"],
    ["test-runs", "Interactive assurance map"],
  ];

  for (const [patternId, marker] of contextualPatterns) {
    assert.ok(compassPatternHtml(html, patternId).includes(marker), `${patternId} receives DCC fixture copy inside its original preview`);
  }

  for (const [patternId, templateKey, title] of compassPatternSections) {
    const section = compassPatternHtml(html, patternId);
    assert.match(section, new RegExp(`data-template-key="${templateKey}"`), `${title} keeps its original template contract in DCC`);
    assert.match(section, /data-preview-mode="default"/, `${title} keeps the shared preview state contract in DCC`);
  }
});

test("scenario routing retains the original 26-component preview map without replacement renderers", () => {
  const snapshotPreview = readFileSync(`${projectRoot}/public/reusable-component-foundation/showroom-templates/TemplatePreview.tsx`, "utf8");
  const sharedPreview = readFileSync(`${projectRoot}/app/foundation/templates/TemplatePreview.tsx`, "utf8");
  const integratedSections = readFileSync(`${projectRoot}/app/CompassPatternSections.tsx`, "utf8");
  const foundationGallery = readFileSync(`${projectRoot}/app/foundation/FoundationGallery.tsx`, "utf8");
  const showroom = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");

  const originalContracts = templateContracts(snapshotPreview);
  assert.equal(originalContracts.length, 26, "the public showroom snapshot defines 26 original component contracts");
  assert.deepEqual(templateContracts(sharedPreview), originalContracts, "the live preview map still resolves every key to the original component");
  assert.deepEqual(originalContracts.map(([key]) => key), compassPatternSections.map(([, key]) => key));
  assert.doesNotMatch(sharedPreview, /DccPattern|dccCustom|scenarioId\s*(?:===|\?)/, "the shared preview dispatcher has no DCC component branch");

  for (const [routeName, source] of [["integrated library", integratedSections], ["focused gallery", foundationGallery]]) {
    assert.equal((source.match(/<TemplatePreview\b/g) ?? []).length, 1, `${routeName} owns exactly one TemplatePreview render path`);
    assert.match(source, /<TemplatePreview[\s\S]*?scenarioId=\{scenarioId\}/, `${routeName} passes scenario data into that shared path`);
    assert.doesNotMatch(source, /DccPatternPreview|dccCustomPatternIds|legacy-graph-frame/, `${routeName} has no scenario replacement renderer`);
  }
  assert.doesNotMatch(showroom, /legacy-graph-frame|className="edge e[1-6]"|DccPatternPreview|dccCustomPatternIds/);
  assert.equal(existsSync(`${projectRoot}/app/DccPatternPreviews.tsx`), false);
  assert.equal(existsSync(`${projectRoot}/app/DccPatternPreviews.module.css`), false);
});

test("server-renders the DCC hackathon scenario with its curated assurance journey", async () => {
  const response = await render("/compass?scenario=dcc-hackathon");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /data-system="compass"/);
  assert.match(html, /data-scenario="dcc-hackathon"/);
  assert.match(html, /DCC HACKATHON · DOCUMENTATION ASSURANCE/);
  assert.match(html, /Assure documents[\s\S]*against standards\./);
  assert.match(html, /loading standards, scanning uploaded documents with AI/);
  assert.match(html, /aria-label="Change demo scenario"[^>]*aria-controls="scenario-popover"[^>]*aria-expanded="false"/);
  assert.match(html, /href="\/foundation\?scenario=dcc-hackathon"/);

  const shelfStart = html.indexOf('<section class="scenario-library"');
  const shelfEnd = html.indexOf("</section>", shelfStart);
  assert.ok(shelfStart >= 0 && shelfEnd > shelfStart, "the DCC recommendation shelf is rendered");
  const shelfHtml = html.slice(shelfStart, shelfEnd);
  assert.match(shelfHtml, /DCC HACKATHON · CURATED ROUTE/);
  assert.match(shelfHtml, /Recommended for DCC documentation assurance/);
  assert.match(shelfHtml, /<strong>6<\/strong><span>recommended patterns<\/span>/);
  assert.equal((shelfHtml.match(/<article/g) ?? []).length, 6);
  let previousRecommendationOffset = -1;
  for (const id of [
    "compass-pattern-read-only-data-table",
    "upload",
    "compass-pattern-evidence-matrix",
    "compass-pattern-review-list",
    "dependencies",
    "compass-pattern-final-report",
  ]) {
    const offset = shelfHtml.indexOf(`href="#${id}"`);
    assert.ok(offset > previousRecommendationOffset, `${id} is present in the curated DCC order`);
    previousRecommendationOffset = offset;
  }

  assert.match(html, /Standards-based document assurance\./);
  assert.match(html, /Choose standards to assure against/);
  for (const standard of [
    "ISO\/IEC 27001:2022",
    "WCAG 2.2 AA",
    "GDS Service Standard",
    "NIST AI RMF 1.0",
    "DCC Assurance Profile · HACK-01",
  ]) assert.match(html, new RegExp(standard));

  assert.match(html, /Standards and document relationships\./);
  assert.match(html, /class="pattern-frame original-explorer-frame pattern-fullscreen-target" id="pattern-dependency" data-scenario="dcc-hackathon"/);
  assert.match(html, /<iframe title="DCC standards and documentation relationship visualiser"/);
  assert.doesNotMatch(html, /dependency-explorer\.html\?key=/);
  assert.doesNotMatch(html, /legacy-graph-frame|class="edge e1"/);

  const patternsStart = html.lastIndexOf("<div", html.indexOf("data-compass-pattern-sections"));
  const patternsHtml = html.slice(patternsStart);
  assert.equal((patternsHtml.match(/data-compass-pattern="/g) ?? []).length, 26);
  assert.equal((patternsHtml.match(/data-preview-mode="default"/g) ?? []).length, 26);
  for (const [id, templateKey, title] of compassPatternSections) {
    const patternOffset = patternsHtml.indexOf(`id="compass-pattern-${id}"`);
    const nextPattern = compassPatternSections[compassPatternSections.findIndex(([patternId]) => patternId === id) + 1];
    const nextOffset = nextPattern ? patternsHtml.indexOf(`id="compass-pattern-${nextPattern[0]}"`) : patternsHtml.length;
    const sectionHtml = patternsHtml.slice(patternOffset, nextOffset > patternOffset ? nextOffset : undefined);
    assert.ok(patternOffset >= 0, `${title} remains in the DCC showroom`);
    assert.match(sectionHtml, new RegExp(`data-template-key="${templateKey}"`), `${title} keeps its Base template contract in DCC`);
    assert.match(sectionHtml, /data-preview-mode="default"/, `${title} renders through the shared interactive preview shell`);
  }
  for (const scenarioCopy of [
    "Assurance run snapshot",
    "Import / export assurance standards",
    "Standards configuration",
    "Document submission &amp; verification",
    "AI findings &amp; results",
    "Documentation assurance pipeline",
    "Customer portal assurance profile",
    "Standards evidence matrix",
    "Documentation evidence tasks",
    "Documentation findings register",
    "Assurance report review and feedback",
    "Standards library integration",
    "DCC assurance service",
    "Interactive assurance map",
  ]) assert.ok(patternsHtml.includes(scenarioCopy), `${scenarioCopy} is supplied through a shared pattern fixture`);
});

test("Base and DCC use one dependency explorer with a scenario launch payload", async () => {
  const baseResponse = await render("/compass");
  const dccResponse = await render("/compass?scenario=dcc-hackathon");
  assert.equal(baseResponse.status, 200);
  assert.equal(dccResponse.status, 200);
  const baseHtml = await baseResponse.text();
  const dccHtml = await dccResponse.text();

  assert.equal((baseHtml.match(/class="pattern-frame original-explorer-frame pattern-fullscreen-target"/g) ?? []).length, 1);
  assert.equal((dccHtml.match(/class="pattern-frame original-explorer-frame pattern-fullscreen-target"/g) ?? []).length, 1);
  assert.match(baseHtml, /id="pattern-dependency" data-scenario="base"/);
  assert.match(baseHtml, /<iframe src="\/dependency-explorer\.html" title="Environment dependency visualiser"/);
  assert.doesNotMatch(baseHtml, /dependency-explorer\.html\?key=/);
  assert.match(dccHtml, /id="pattern-dependency" data-scenario="dcc-hackathon"/);
  assert.match(dccHtml, /<iframe title="DCC standards and documentation relationship visualiser"/);
  assert.doesNotMatch(dccHtml, /dependency-explorer\.html\?key=/, "the DCC iframe source is withheld until its launch payload is stored in the browser");

  const scenarioSource = readFileSync(`${projectRoot}/app/scenarios.ts`, "utf8");
  assert.match(scenarioSource, /export const dccDependencyExplorerLaunchKey = "dcc-hackathon-assurance"/);
  const payloadStart = scenarioSource.indexOf("export const dccDependencyExplorerPayload");
  const payloadEnd = scenarioSource.indexOf("export function cloneDefaultStarredPatterns", payloadStart);
  assert.ok(payloadStart >= 0 && payloadEnd > payloadStart, "the DCC dependency launch fixture is exported");
  const payloadSource = scenarioSource.slice(payloadStart, payloadEnd);
  assert.match(payloadSource, /datasetName: "DCC standards and documentation relationships"/);
  const relationships = [...payloadSource.matchAll(/"Source Environment":"([^"]+)"[^\n]+"Target Environment":"([^"]+)"/g)]
    .map((match) => `${match[1]}->${match[2]}`)
    .sort();
  assert.equal(relationships.length, 6);
  assert.deepEqual(relationships, [
    "Assurance Run #018->Assurance Review",
    "ISO/IEC 27001->Solution Design v0.8",
    "ISO/IEC 27001->Threat Model v0.4",
    "Solution Design v0.8->Assurance Run #018",
    "Threat Model v0.4->Assurance Run #018",
    "WCAG 2.2 AA->Solution Design v0.8",
  ]);
  assert.equal((payloadSource.match(/Direction:"downstream"/g) ?? []).length, 6);
});

test("the shared dependency explorer prevents dangling edges after filtering or deletion", () => {
  const explorer = readFileSync(`${projectRoot}/public/dependency-explorer.html`, "utf8");
  const showroom = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");
  const integratedSections = readFileSync(`${projectRoot}/app/CompassPatternSections.tsx`, "utf8");
  const foundationGallery = readFileSync(`${projectRoot}/app/foundation/FoundationGallery.tsx`, "utf8");

  assert.match(showroom, /function DependencyExplorerFrame/);
  assert.match(showroom, /localStorage\.setItem\(`\$\{DEPENDENCY_LAUNCH_STORAGE_PREFIX\}\$\{dccDependencyExplorerLaunchKey\}`,[^\n]*JSON\.stringify\(dccDependencyExplorerPayload\)\)/);
  assert.match(showroom, /localStorage\.setItem\([\s\S]*frame\.setAttribute\("src",src\);/, "the scenario URL is assigned only after storage succeeds");
  assert.match(showroom, /catch \{[\s\S]*frame\.removeAttribute\("src"\);[\s\S]*frame\.setAttribute\("srcdoc",DEPENDENCY_EXPLORER_UNAVAILABLE_DOCUMENT\);/, "storage failure leaves the scenario URL withheld and supplies an in-frame error");
  assert.match(showroom, /<iframe key=\{src\} ref=\{frameRef\} src=\{dcc \? undefined : src\}/, "Base and DCC keep one iframe JSX path while DCC waits for its payload");
  assert.equal((showroom.match(/<DependencyExplorerFrame /g) ?? []).length, 1);
  assert.doesNotMatch(showroom, /legacy-graph-frame|className="edge e1"/);
  assert.doesNotMatch(integratedSections, /DccPatternPreview|dccCustomPatternIds/);
  assert.doesNotMatch(foundationGallery, /DccPatternPreview|dccCustomPatternIds/);
  assert.equal((integratedSections.match(/<TemplatePreview/g) ?? []).length, 1, "the integrated library has one shared preview render path");
  assert.equal((foundationGallery.match(/<TemplatePreview/g) ?? []).length, 1, "the focused gallery has one shared preview render path");
  assert.equal(existsSync(`${projectRoot}/app/DccPatternPreviews.tsx`), false, "the scenario-specific replacement renderer is removed");
  assert.match(integratedSections, /<TemplatePreview[\s\S]*scenarioId=\{scenarioId\}/);
  assert.match(foundationGallery, /<TemplatePreview[\s\S]*scenarioId=\{scenarioId\}/);

  assert.match(explorer, /const LAUNCH_STORAGE_PREFIX = "migration-compass-dependency-explorer:"/);
  assert.match(explorer, /localStorage\.getItem\(`\$\{LAUNCH_STORAGE_PREFIX\}\$\{key\}`\)/);
  assert.match(explorer, /if \(!source \|\| !target\) return;/, "relationships with a missing endpoint never enter the graph");
  assert.match(explorer, /const passesFilter = nodes\.every\(nodePassesVisualFilters\)/, "edges remain visible only when both visual endpoints pass filters");
  assert.match(
    explorer,
    /state\.sourceRows = state\.sourceRows\.filter\(row =>\s*normaliseKey\(rowSourceEnvironment\(row\)\) !== normaliseKey\(envId\) &&\s*normaliseKey\(rowTargetEnvironment\(row\)\) !== normaliseKey\(envId\)/,
    "deleting an environment removes rows where it is either edge endpoint",
  );
});

test("main showroom includes every PoC Tracker screen", async () => {
  const response = await render("/tracker");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Route-aware process flow/);
  assert.match(html, /08 · TRACKER PATTERN/);
  assert.match(html, /14 · TRACKER PATTERN/);
  assert.match(html, /poc-tracker-components\/01-dashboard\/demo\.html/);
  assert.match(html, /poc-tracker-components\/02-planning-backlog\/demo\.html/);
  assert.match(html, /poc-tracker-components\/03-gantt-chart\/demo\.html/);
  assert.match(html, /poc-tracker-components\/06-workflow-workbench\/demo\.html/);
  assert.match(html, /poc-tracker-components\/07-chatbot\/demo\.html/);
  assert.match(html, /poc-tracker-components\/08-earned-value\/demo\.html/);
  assert.match(html, /poc-tracker-components\/09-architecture-system-map\/demo\.html/);
  assert.match(html, /Planning backlog/);
  assert.match(html, /Chatbot assistant/);
  assert.match(html, /Architecture map/);
  assert.match(html, /href="\/tracker"[^>]*aria-current="page"/);
  assert.match(html, /Edit colours/);
  assert.match(html, /Reset defaults/);
  assert.match(html, /href="\/poc-tracker"[^>]*>.*Focused gallery/s);
  assert.doesNotMatch(html, /gallery-view-link/);
  assert.match(html, /poc-inline-embed/);
  assert.match(html, /fullscreen-pattern-button/);
  assert.match(html, /pattern-critical-path/);
  assert.match(html, /<title>frame to scope<\/title>/);
  assert.match(html, /pattern-poc-dashboard/);
  assert.match(html, /Exit full-screen Architecture map/);
  assert.doesNotMatch(html, /poc-showroom-intro|poc-embedded-frame|COMPLETE SCREEN COLLECTION/);
  assert.doesNotMatch(html, /FULL COMPONENT INDEX|Every reusable part, in one place|GanttBar/);
  assert.doesNotMatch(html, /data-individual-component-name=|data-component-index-name=|id="full-component-index"/);
  assert.doesNotMatch(html, /id="compass-template-library"/);
  assert.doesNotMatch(html, /data-compass-pattern-sections|data-compass-pattern=/);
});

test("Base preserves the original seven PoC Tracker screen contracts and copy", async () => {
  const response = await render("/tracker");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /data-system="tracker"/);
  assert.match(html, /data-scenario="base"/);
  assert.match(html, /Seven live product experiences|A delivery system for critical dependencies/);
  assert.doesNotMatch(html, /DCC HACKATHON · TRACKER|DCC TRACKER · CURATED ROUTE|DCC documentation assurance scenario/);

  let previousOffset = -1;
  for (const contract of trackerScreenContracts) {
    const section = trackerScreenHtml(html, contract.id);
    const offset = html.indexOf(`id="${contract.id}"`);
    assert.ok(offset > previousOffset, `${contract.title} keeps its original Tracker order`);
    previousOffset = offset;

    assert.ok(section.includes(contract.title), `${contract.title} keeps its original pattern title`);
    assert.ok(section.includes(contract.description), `${contract.title} keeps its exact Base description`);
    assert.match(section, new RegExp(`src="/poc-tracker-components/${contract.folder}/demo\\.html"`));
    assert.doesNotMatch(section, /demo\.html\?scenario=/, `${contract.title} does not receive scenario data in Base`);
    assert.match(section, new RegExp(`title="${contract.title} PoC Tracker pattern"`));
    assert.equal((section.match(/<iframe\b/g) ?? []).length, 1, `${contract.title} has one original iframe render path`);
    assert.ok(section.includes(`aria-label="Open ${contract.title} in full screen"`), `${contract.title} keeps its fullscreen action`);
    assert.match(section, /class="tech-details-button"/, `${contract.title} keeps its technical-details action`);
    assert.match(section, /class="download-code-button"/, `${contract.title} keeps its download action`);

    const component = readFileSync(`${projectRoot}/public/poc-tracker-components/${contract.folder}/component.js`, "utf8");
    assert.ok(component.includes(contract.baseMarker), `${contract.title} retains its original sample copy`);
  }
});

test("DCC supplies Tracker fixtures through the same seven section and iframe contracts", async () => {
  const [baseResponse, dccResponse] = await Promise.all([
    render("/tracker"),
    render("/tracker?scenario=dcc-hackathon"),
  ]);
  assert.equal(baseResponse.status, 200);
  assert.equal(dccResponse.status, 200);
  const [baseHtml, dccHtml] = await Promise.all([baseResponse.text(), dccResponse.text()]);

  assert.match(dccHtml, /data-system="tracker"/);
  assert.match(dccHtml, /data-scenario="dcc-hackathon"/);
  assert.match(dccHtml, /aria-label="Change demo scenario"[^>]*aria-controls="scenario-popover"[^>]*aria-expanded="false"/);
  assert.match(dccHtml, /href="\/tracker\?scenario=dcc-hackathon"[^>]*aria-current="page"/);
  assert.match(dccHtml, /href="\/poc-tracker\?scenario=dcc-hackathon"[^>]*>.*Focused gallery/s);

  for (const contract of trackerScreenContracts) {
    const baseSection = trackerScreenHtml(baseHtml, contract.id);
    const dccSection = trackerScreenHtml(dccHtml, contract.id);
    assert.deepEqual(
      elementContract(dccSection),
      elementContract(baseSection),
      `${contract.title} keeps the exact Base element and attribute contract in DCC`,
    );
    assert.match(dccSection, new RegExp(`src="/poc-tracker-components/${contract.folder}/demo\\.html\\?scenario=dcc-hackathon"`));
    assert.match(dccSection, new RegExp(`title="${contract.title} PoC Tracker pattern"`));
    assert.equal((dccSection.match(/<iframe\b/g) ?? []).length, 1, `${contract.title} still has one iframe renderer in DCC`);
    assert.ok(dccSection.includes(`aria-label="Open ${contract.title} in full screen"`));
    assert.match(dccSection, /class="tech-details-button"/);
    assert.match(dccSection, /class="download-code-button"/);
  }
});

test("Tracker and Compass recommendations remain collection-specific in DCC", async () => {
  const [trackerResponse, compassResponse] = await Promise.all([
    render("/tracker?scenario=dcc-hackathon"),
    render("/compass?scenario=dcc-hackathon"),
  ]);
  assert.equal(trackerResponse.status, 200);
  assert.equal(compassResponse.status, 200);
  const [trackerHtml, compassHtml] = await Promise.all([trackerResponse.text(), compassResponse.text()]);

  const recommendationShelf = (html) => {
    const start = html.indexOf('<section class="scenario-library"');
    const end = html.indexOf("</section>", start);
    assert.ok(start >= 0 && end > start, "the collection recommendation shelf is rendered");
    return html.slice(start, end);
  };
  const trackerShelf = recommendationShelf(trackerHtml);
  const compassShelf = recommendationShelf(compassHtml);
  const trackerRecommendationIds = [
    "poc-dashboard",
    "poc-workflow-workbench",
    "poc-chatbot",
    "poc-architecture-map",
  ];

  assert.match(trackerShelf, /<strong>4<\/strong><span>recommended patterns<\/span>/);
  assert.equal((trackerShelf.match(/<article/g) ?? []).length, 4);
  let previousRecommendationOffset = -1;
  for (const id of trackerRecommendationIds) {
    const offset = trackerShelf.indexOf(`href="#${id}"`);
    assert.ok(offset > previousRecommendationOffset, `${id} appears in the intended Tracker DCC route`);
    previousRecommendationOffset = offset;
  }
  assert.doesNotMatch(trackerShelf, /href="#(?:upload|dependencies|compass-pattern-)/, "Compass recommendations do not leak into Tracker");

  assert.match(compassShelf, /<strong>6<\/strong><span>recommended patterns<\/span>/);
  assert.equal((compassShelf.match(/<article/g) ?? []).length, 6);
  for (const id of trackerRecommendationIds) {
    assert.doesNotMatch(compassShelf, new RegExp(`href="#${id}"`), `${id} does not leak into Compass recommendations`);
  }

  const scenarioHook = readFileSync(`${projectRoot}/app/useScenario.ts`, "utf8");
  const scenarioDefinitions = readFileSync(`${projectRoot}/app/scenarios.ts`, "utf8");
  const showroom = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");
  assert.match(scenarioHook, /compass:\s*"compass-ui-starred-patterns"/);
  assert.match(scenarioHook, /tracker:\s*"poc-tracker-ui-starred-patterns"/);
  assert.match(showroom, /useScenario\(initialScenario, system\)/, "the main showroom selects recommendation storage for its current collection");
  let previousDefaultOffset = -1;
  const trackerDefaultsStart = scenarioDefinitions.indexOf('title: "Recommended PoC Tracker views for DCC assurance"');
  assert.ok(trackerDefaultsStart >= 0, "DCC defines a Tracker-specific recommendation collection");
  const trackerDefaults = scenarioDefinitions.slice(trackerDefaultsStart, scenarioDefinitions.indexOf("],", trackerDefaultsStart) + 2);
  for (const id of trackerRecommendationIds) {
    const offset = trackerDefaults.indexOf(`"${id}"`);
    assert.ok(offset > previousDefaultOffset, `${id} is retained in the default Tracker recommendation order`);
    previousDefaultOffset = offset;
  }
});

test("server-renders the consolidated agent use-case catalogue", async () => {
  const response = await render("/methods");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Agent Methods — AA Portfolio<\/title>/i);
  assert.match(html, /How we manage/);
  assert.match(html, /Name the Authority/);
  assert.match(html, /Migration Compass/);
  assert.match(html, /PoC Tracker/);
  assert.match(html, /Choose library collection/);
  assert.match(html, /Choose the level that fits the work\./);
  assert.match(html, /Run Parallel Pods/);
  assert.match(html, /30(?:<!-- -->)? methods/);
  assert.match(html, /Establish the Approved Baseline/);
  assert.match(html, /Govern Architecture and Standards/);
  assert.match(html, /Select the Delivery Route/);
  assert.match(html, /Baseline, Forecast and Control Change/);
  assert.match(html, /Stop Before Build/);
  assert.match(html, /Package Every Handoff/);
  assert.match(html, /Prove the Feature Alone/);
  assert.match(html, /Separate Build from Review/);
  assert.match(html, /Return Conflict to Its Owner/);
  assert.match(html, /Control Integration and Convergence/);
  assert.match(html, /Record AI Activity Safely/);
  assert.match(html, /Use a Governed Prompt Pack/);
  assert.match(html, /Separate Environments and Data/);
  assert.match(html, /Protect Identity, Secrets and Client Data/);
  assert.match(html, /Back Up, Restore, Retain and Audit/);
  assert.match(html, /Observe Health and Recover Safely/);
  assert.match(html, /Run Boards as the Delivery Spine/);
  assert.match(html, /Make Every PR a Proof Pack/);
  assert.match(html, /Prove from Task to Release/);
  assert.match(html, /Build Stat Packs from Source Facts/);
  assert.match(html, /Reconcile the Delivery System/);
  assert.match(html, /Prompt pack/);
  assert.match(html, /data-method-stage-explorer/);
  assert.match(html, /data-method-card-grid/);
  assert.match(html, /data-methods-sidebar/);
  assert.match(html, /data-method-sidebar-summary/);
  assert.match(html, /Where do you need help\?/);
  assert.match(html, /aria-label="30 methods across 7 delivery stages and three control levels"/);
  assert.match(html, /data-level="low"/);
  assert.match(html, /data-level="mid"/);
  assert.match(html, /data-level="high"/);
  assert.match(html, /Match the governance to the risk · not a score/);
  const methodCards = [...html.matchAll(/data-method-card="true"/g)];
  const methodTriggers = [...html.matchAll(/id="([^"]+)-trigger"[^>]*aria-haspopup="dialog"[^>]*aria-controls="(method-presentation-dialog)"/g)];
  assert.equal(methodCards.length, 30);
  assert.equal(methodTriggers.length, 30);
  assert.equal(new Set(methodTriggers.map((match) => match[1])).size, 30);
  assert.equal(new Set(methodTriggers.map((match) => match[2])).size, 1);
  const azureDevOpsMethodIds = ["boards-delivery-spine", "pr-proof-pack", "assurance-ladder", "source-stat-pack", "delivery-system-alignment"];
  const methodDataSource = readFileSync(`${projectRoot}/app/AgentMethods.tsx`, "utf8");
  for (const id of azureDevOpsMethodIds) {
    assert.match(html, new RegExp(`id="${id}-trigger"`), `${id} has a stable presentation trigger`);
    const recordStart = methodDataSource.indexOf(`id:"${id}"`);
    const nextRecord = methodDataSource.indexOf("\n  {\n    id:", recordStart + 1);
    const arrayEnd = methodDataSource.indexOf("\n];", recordStart + 1);
    const recordEnd = nextRecord === -1 ? arrayEnd : Math.min(nextRecord, arrayEnd);
    const record = methodDataSource.slice(recordStart, recordEnd);
    assert.ok(recordStart >= 0 && recordEnd > recordStart, `${id} has a complete method record`);
    assert.match(record, /projects:\["mar"\]/, `${id} is tagged to Meter Reconciliation in the source model`);
    assert.doesNotMatch(record, /projects:\[[^\]]*(?:compass|tracker)/, `${id} is not assigned to another portfolio`);
  }
  const methodsSource = readFileSync(`${projectRoot}/app/MethodOverviewDiagrams.tsx`, "utf8");
  const methodsPageSource = readFileSync(`${projectRoot}/app/AgentUseCases.tsx`, "utf8");
  const methodsCss = readFileSync(`${projectRoot}/app/globals.css`, "utf8");
  const diagramCases = [...methodsSource.matchAll(/case "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(diagramCases.length, 30, "every method has an explicit overview diagram");
  assert.equal(new Set(diagramCases).size, 30, "overview diagram identifiers are unique");
  for (const methodTrigger of methodTriggers) {
    const methodId = methodTrigger[1];
    assert.ok(diagramCases.includes(methodId), `${methodId} has a source-specific overview diagram`);
  }
  for (const requiredDiagramPhrase of [
    "Protected integration branch",
    "VERIFIED SNAPSHOT — 05 AUG — 497 METRIC ROWS",
    "P50",
    "50% confidence date",
    "P80",
    "80% confidence date",
    "Schedule Performance Index",
    "Cost Performance Index",
    "Estimate at Completion",
    "Human release decision",
    "Runtime status; health when implemented",
  ]) {
    assert.ok(methodsSource.includes(requiredDiagramPhrase), `diagram system retains ${requiredDiagramPhrase}`);
  }
  assert.match(methodsSource, /role="group" aria-label=\{label\}/, "diagram summaries preserve child semantics");
  assert.match(methodsCss, /container:method-overview \/ inline-size/, "diagrams own a responsive container");
  assert.match(methodsCss, /@container method-overview \(max-width:720px\)/, "diagram layouts have a tablet/mobile mode");
  assert.match(methodsCss, /\.overview-three-stage\.overview-two-stage,[^{]+\{grid-template-columns:1fr\}/, "two-stage decisions stack on mobile");
  assert.match(methodsCss, /@media\(prefers-reduced-motion:reduce\)/, "diagram motion respects reduced-motion preferences");
  assert.match(methodsCss, /\.method-visual-v6>header span>i\{[^}]*animation:none/, "the diagram header marker is static");
  assert.match(methodsSource, /data-diagram-node/, "diagram nodes expose contextual help metadata");
  assert.match(methodsSource, /createPortal/, "diagram help escapes the slide canvas instead of being clipped");
  assert.match(methodsSource, /role="tooltip"/, "the contextual pop-up exposes tooltip semantics");
  assert.match(methodsSource, /data-method-node-tooltip/, "the contextual pop-up has a stable test hook");
  assert.match(methodsSource, /aria-describedby/, "the active diagram node is associated with its extra explanation");
  assert.match(methodsSource, /onPointerOver=\{handlePointerOver\}/, "diagram help opens on pointer hover");
  assert.match(methodsSource, /onPointerMove=\{handlePointerMove\}/, "diagram help follows pointer movement");
  assert.match(methodsSource, /onFocusCapture=\{handleFocus\}/, "diagram help responds to keyboard focus");
  assert.match(methodsSource, /onPointerDown=\{handleTouchStart\}/, "diagram help supports deliberate touch selection");
  assert.match(methodsSource, /touchGestureRef/, "touch selection is separated from scrolling gestures");
  assert.match(methodsSource, /document\.addEventListener\("scroll",handleViewportScroll,true\)/, "the pop-up closes if its viewport position becomes stale while remaining scrollable on touch");
  assert.match(methodsSource, /onKeyDown=\{handleNodeKey\}/, "diagram nodes support roving arrow-key navigation");
  assert.match(methodsSource, /method-node-tooltip__content/, "tooltip content scrolls independently without clipping its pointer");
  assert.match(methodsSource, /type NodeHelp =/, "node explanations have a structured additive-content model");
  assert.match(methodsSource, /data-node-owner/, "node explanations identify ownership");
  assert.match(methodsSource, /data-node-keeps/, "node explanations identify retained evidence");
  assert.match(methodsSource, /data-node-moves/, "node explanations identify the move-on condition");
  assert.match(methodsSource, /data-node-stops/, "node explanations identify the stop condition");
  assert.doesNotMatch(methodsSource, /method-node-inspector/, "the old fixed diagram inspector has been removed");
  assert.match(methodsSource, /tabIndex:0/, "diagram nodes can be explored without a mouse");
  assert.match(methodsCss, /\.method-node-tooltip\{[^}]*position:fixed/, "the explanation appears beside the pointer at viewport level");
  assert.match(methodsCss, /\.method-node-tooltip\[data-placement="below"\]:before/, "the tooltip arrow follows its flipped placement");
  assert.match(methodsCss, /@media\(pointer:coarse\)/, "touch devices receive a stable bottom-sheet presentation");
  assert.match(methodsCss, /overview-node-interactive\[data-diagram-node\]:focus-visible/, "custom diagram nodes have a visible keyboard focus state");
  assert.match(methodsSource, /event\.preventDefault\(\);\s*event\.stopPropagation\(\);\s*event\.stopImmediatePropagation\(\)/, "closing a diagram tooltip with Escape does not also close the presentation");
  assert.match(methodsPageSource, /const methodChapters = \[/, "method detail is divided into explicit presentation chapters");
  assert.equal((methodsPageSource.match(/\{id:"(?:overview|setup|run|proof|controls)",number:/g) ?? []).length, 5, "the reader retains five familiar chapters");
  assert.match(methodsPageSource, /const presentationSlides:PresentationSlide\[\] = methodChapters\.map/, "each chapter maps directly to one complete slide");
  assert.doesNotMatch(methodsPageSource, /buildPresentationPages|activeChapterPages|activeChapterPageIndex/, "the five-slide reader has no nested micro-pagination");
  assert.doesNotMatch(methodsPageSource, /searchParams\.(?:set|get)\("page"/, "method links no longer carry an inner page number");
  assert.match(methodsPageSource, /data-method-slide-tab/, "the five direct slide controls have a stable test hook");
  assert.match(methodsPageSource, /data-method-slide=\{page\.id\}/, "the five complete slide panels have a stable test hook");
  assert.match(methodsPageSource, /const renderedMethods = filtered;/, "opening a method keeps the surrounding catalogue rendered");
  assert.match(methodsPageSource, /<dialog className="method-presentation"/, "method detail opens in a native modal presentation");
  assert.match(methodsPageSource, /role="dialog" aria-modal="true" aria-labelledby="method-presentation-title" aria-describedby="method-presentation-subtitle(?: method-presentation-zoom-help)?"/, "the presentation exposes complete modal semantics");
  assert.match(methodsPageSource, /aria-haspopup="dialog" aria-controls="method-presentation-dialog"/, "method cards announce that they open a dialog");
  assert.match(methodsPageSource, /if \(!dialog\.open\) dialog\.showModal\(\)/, "the reader uses the browser's modal layer");
  assert.match(methodsPageSource, /event\.target === event\.currentTarget/, "only a direct backdrop press closes the presentation");
  assert.doesNotMatch(methodsPageSource, /className="method-dossier method-slide-deck"/, "the old inline expansion has been removed");
  assert.match(methodsPageSource, /className="method-stage-explorer__scope"/, "the stage explorer reports the currently visible scope");
  assert.match(methodsPageSource, /<p>\{item\.copy\}<\/p>/, "stage choices explain what each part of the journey contains");
  assert.doesNotMatch(methodsPageSource, /className="method-focus-pager"/, "the reader keeps previous and next controls in one predictable place");
  assert.match(methodsPageSource, /role="tablist"/, "slide selection uses accessible tab semantics");
  assert.match(methodsPageSource, /role="tabpanel"/, "the active slide uses accessible panel semantics");
  const methodDialogSource = methodsPageSource.match(/<dialog className="method-presentation"[\s\S]*?<\/dialog>/)?.[0] ?? "";
  assert.doesNotMatch(methodDialogSource, /method-presentation__footer|method-presentation__status|>Previous<|>Next<|>Done</, "the five visible tabs replace Previous and Next controls");
  assert.match(methodsPageSource, /event\.key === "PageDown"/, "Page Down remains an optional keyboard shortcut");
  assert.match(methodsPageSource, /event\.key === "PageUp"/, "Page Up remains an optional keyboard shortcut");
  assert.match(methodsPageSource, /onPointerDown=\{handleSlidePointerDown\}/, "the presentation keeps horizontal swipe navigation");
  assert.match(methodsPageSource, /onPointerUp=\{handleSlidePointerUp\}/, "the presentation completes horizontal swipe navigation");
  assert.match(methodsPageSource, /aria-label="Zoom out"/, "the slide viewer exposes a labelled zoom-out control");
  assert.match(methodsPageSource, /aria-label="Zoom in"/, "the slide viewer exposes a labelled zoom-in control");
  assert.match(methodsPageSource, /Reset zoom and position\. Current zoom/, "the zoom percentage also resets and recentres the slide");
  assert.match(methodsPageSource, /<output aria-live="polite">/, "zoom changes are announced without moving focus");
  assert.match(methodsPageSource, /event\.key === "\+" \|\| event\.key === "="/, "plus keys zoom in");
  assert.match(methodsPageSource, /event\.key === "-" \|\| event\.key === "_"/, "minus keys zoom out");
  assert.match(methodsPageSource, /event\.key === "0"/, "zero resets the slide view");
  assert.match(methodsPageSource, /onPointerMove=\{handleSlidePointerMove\}/, "zoomed slides follow captured pointer movement");
  assert.match(methodsPageSource, /Math\.hypot\(deltaX,deltaY\) < 6/, "a deliberate drag is separated from a diagram-node click or tap");
  assert.match(methodsPageSource, /addEventListener\("wheel",handleTrackpad,\{passive:false\}\)/, "trackpad gestures use a non-passive native wheel listener");
  assert.match(methodsPageSource, /if \(event\.ctrlKey\)/, "trackpad pinch is recognised separately from two-finger movement");
  assert.match(methodsPageSource, /Math\.exp\(exponent\)/, "trackpad pinch changes zoom continuously");
  assert.match(methodsPageSource, /Math\.max\(-\.25,Math\.min\(\.25,-event\.deltaY\*deltaScale\*\.01\)\)/, "trackpad pinch deltas are normalised and safely bounded");
  assert.match(methodsPageSource, /pointX-\(pointX-currentPan\.x\)\*ratio/, "trackpad pinch keeps the point under the pointer in place");
  assert.match(methodsPageSource, /TWO-FINGER SCROLL TO PAN/, "the viewer explains its trackpad gesture directly in the interface");
  assert.doesNotMatch(methodsPageSource, /onWheel=\{handleSlideWheel\}/, "the passive React wheel handler is not used for trackpad gestures");
  assert.match(methodsPageSource, /setPointerCapture\(event\.pointerId\)/, "panning remains stable when the pointer leaves its start point");
  assert.match(methodsPageSource, /mode:"pan"/, "zoomed pointer gestures enter pan mode");
  assert.match(methodsPageSource, /mode:"swipe"/, "fit-to-screen touch gestures retain slide swipe mode");
  assert.match(methodsPageSource, /if \(gesture\.mode !== "swipe"\) return;/, "a pan can never turn into slide navigation");
  assert.match(methodsPageSource, /data-method-zoom-surface/, "zoom transforms a nested canvas rather than the slide strip");
  assert.match(methodsPageSource, /data-zoomed=\{slideZoom > 1/, "the stage exposes its zoom interaction state");
  assert.match(methodsPageSource, /data-gesturing=\{isTrackpadGesturing/, "the stage exposes active trackpad movement so it can respond without animation lag");
  assert.match(methodsPageSource, /function changePage\([\s\S]*?resetSlideView\(\);[\s\S]*?setActivePage\(bounded\);/, "changing slides restores the fitted view before moving on");
  assert.match(methodsPageSource, /id="method-focus-back"/, "the presentation exposes one persistent close control");
  assert.match(methodsPageSource, /catalogueAnchorRef/, "the catalogue records the originating card position");
  assert.match(methodsPageSource, /trigger\.focus\(\{preventScroll:true\}\)/, "closing returns focus without moving the catalogue");
  assert.match(methodsPageSource, /body\.style\.position = "fixed"/, "the catalogue is locked in place while the presentation is open");
  assert.match(methodsPageSource, /window\.scrollTo\(\{top:scrollY,left:0,behavior:"auto"\}\)/, "the original catalogue position is restored after closing");
  assert.match(methodsPageSource, /methodsFocus/, "browser history distinguishes catalogue and reading states");
  assert.doesNotMatch(methodsPageSource, /scrollIntoView\(\{[^}]*behavior:"smooth"/, "opening a method never forces a disorienting smooth scroll");
  assert.doesNotMatch(methodsPageSource, /readingBandBottom|method-slide-deck"\)\?\.scrollIntoView/, "the modal never repositions the catalogue window");
  assert.match(methodsCss, /\.compass-methods-v5 \.method-presentation__shell\{[^}]*grid-template-rows:70px 72px minmax\(0,1fr\)/, "the presentation uses all remaining space for the five slide boards");
  assert.match(methodsCss, /grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,360px\),1fr\)\)/, "the method grid responds to the space left by the navigation rail");
  assert.match(methodsCss, /@container method-stage-explorer \(max-width:1100px\)/, "the stage explorer adapts to its own available width");
  assert.match(methodsCss, /\.method-node-tooltip__content\{[^}]*max-height:calc\(100dvh - 24px\)/, "tooltip content stays within the visible viewport");
  assert.match(methodsCss, /\.compass-methods-v5 \.method-presentation__stage\{[^}]*overflow:hidden/, "normal presentation pages never scroll vertically");
  assert.match(methodsCss, /transform:translate3d\(calc\(var\(--method-page-index\) \* -100%\),0,0\)/, "pages move as a horizontal slide strip");
  assert.match(methodsCss, /\.compass-methods-v5 \.method-presentation__zoom-surface\{[\s\S]*?transform:translate3d\(var\(--method-pan-x,0\),var\(--method-pan-y,0\),0\) scale\(var\(--method-zoom,1\)\)/, "the active slide has an independently transformed zoom canvas");
  assert.match(methodsCss, /\.compass-methods-v5 \.method-presentation__stage\[data-zoomed="true"\]\{touch-action:none;cursor:grab\}/, "zoomed touch gestures pan the canvas instead of changing slides");
  assert.match(methodsCss, /\.method-presentation__stage\[data-gesturing="true"\] \.method-presentation__zoom-surface\{transition:none\}/, "trackpad movement follows the gesture without a trailing transition");
  assert.doesNotMatch(methodsCss, /\.compass-methods-v5 \.method-presentation__strip\{[^}]*scale\(/, "zoom never overwrites slide-strip navigation");
  assert.match(methodsCss, /\.compass-methods-v5 \.method-presentation::backdrop/, "the presentation separates itself from the catalogue with a backdrop");
  assert.match(methodsCss, /@media\(max-width:620px\)[\s\S]*\.compass-methods-v5 \.method-presentation\{width:100vw;height:100dvh/, "small screens receive a full-screen presentation");
  assert.match(methodsCss, /@media\(max-height:620px\)[\s\S]*overflow-y:auto/, "very short or highly zoomed views retain an accessibility fallback");
  assert.match(methodsPageSource, /"prompt-pack":"Prompt pack"/, "methods use short everyday catalogue titles");
  assert.match(methodsPageSource, /<em>\{method\.name\}<\/em>/, "the original method title is retained as a subtitle");
  assert.match(methodsPageSource, /WHY WE USE IT/, "method copy uses direct, practical language");
  assert.doesNotMatch(methodsSource, /Protected (?:main|master)|PROTECTED (?:MAIN|MASTER)|Essential Pack|Extended Pack|8\/8 layers|invented usage figures/);
  for (const id of azureDevOpsMethodIds) {
    assert.match(methodsSource, new RegExp(`case "${id}"`), `${id} has its own diagram component`);
    assert.match(methodsCss, new RegExp(`\\.method-visual-${id}`), `${id} has scoped visual styling`);
  }
  assert.match(html, /data-category="governance"/);
  assert.match(html, /data-category="delivery"/);
  assert.match(html, /data-category="evidence"/);
  assert.match(html, /data-category="quality"/);
  assert.match(html, /data-category="safety"/);
  assert.match(html, /CONTROL LEVEL/);
  const methodsSidebar = html.match(/<aside class="library-nav methods-library-nav"[\s\S]*?<\/aside>/)?.[0] ?? "";
  assert.match(methodsSidebar, /aria-label="Methods page navigation"/);
  assert.match(methodsSidebar, /id="methods-page-navigation" aria-label="On this page"/);
  assert.match(methodsSidebar, /aria-controls="methods-sidebar-content" aria-expanded="true"/);
  assert.equal((methodsSidebar.match(/href="#overview"/g) ?? []).length, 1);
  assert.equal((methodsSidebar.match(/href="#sources"/g) ?? []).length, 1);
  assert.equal((methodsSidebar.match(/href="#catalogue"/g) ?? []).length, 1);
  assert.equal((methodsSidebar.match(/href="#prompt-pack"/g) ?? []).length, 0);
  assert.equal((methodsSidebar.match(/data-method-stage-filter="true"/g) ?? []).length, 8);
  assert.equal((methodsSidebar.match(/data-method-stage-filter="true"[^>]*aria-pressed="true"/g) ?? []).length, 1);
  assert.match(methodsSidebar, /Introduction/);
  assert.match(methodsSidebar, /Control levels/);
  assert.match(methodsSidebar, /Method catalogue/);
  assert.match(methodsSidebar, /Practical guidance/);
  assert.doesNotMatch(html, /class="method-row open"|class="method-dossier"|class="method-row-claims"/);
  assert.doesNotMatch(html, /Open the prompt pack|Catalogue principles|One clear owner|Clear working boundaries|Evidence before claims|People make the decisions/);
  assert.doesNotMatch(html, /HOW TO READ THE CATALOGUE|Method names, journey stages and adoption labels are catalogue classifications|Proven does not mean the method is operational in every tagged project/);
  assert.doesNotMatch(html, /Search controls, roles or evidence|Filter methods by project|All categories/);
  assert.doesNotMatch(html, /We create one signed release artefact|The complete delivery control system|Every project tag and implementation detail|MIGRATION COMPASS · HOW WE WORK/);
});

test("server-renders the dedicated individual component showroom", async () => {
  const response = await render("/components");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Individual Components — AA Portfolio<\/title>/i);
  assert.match(html, /class="showcase"[^>]*data-collection="generic"[^>]*data-component-theme="atelier"/);
  assert.match(html, /Choose library collection/);
  assert.match(html, /Switch to dark theme/);
  assert.match(html, /Collapse sidebar/);
  assert.match(html, /Actions with a clear hierarchy/);
  assert.match(html, /Feedback at the right level of interruption/);
  assert.match(html, /Working patterns for dense records/);
  assert.match(html, /Guidance without hidden decisions/);
  assert.match(html, /Toast/);
  assert.match(html, /ConfirmDialog/);
  assert.match(html, /NodeCard/);
  assert.match(html, /EvidenceLink/);
  assert.match(html, /RecommendationPanel/);
  assert.match(html, /View details/);
  assert.match(html, /Download code/i);
});

test("the common component page covers every approved boundary without duplicating its index in the showrooms", async () => {
  const commonResponse = await render("/components");
  assert.equal(commonResponse.status, 200);
  const commonHtml = await commonResponse.text();
  const styles = readFileSync(`${projectRoot}/app/globals.css`, "utf8");
  const componentNames = attributeValues(commonHtml, "data-individual-component-name");
  const indexNames = attributeValues(commonHtml, "data-component-index-name");
  const aliasCanonicalNames = attributeValues(commonHtml, "data-component-index-alias-of");
  const patternNames = attributeValues(commonHtml, "data-pattern-component");
  const cardIds = attributeValues(commonHtml, "id").filter((id) => id.startsWith("component-"));
  const indexHrefs = [...commonHtml.matchAll(/<a[^>]*href="(#component-[^"]+)"[^>]*data-component-index-name=/g)].map((match) => match[1]);

  assert.equal(componentNames.length, 172);
  assert.equal(new Set(componentNames).size, 172);
  assert.equal(indexNames.length, 196);
  assert.equal(new Set(indexNames).size, 196);
  assert.equal(aliasCanonicalNames.length, 24);
  for (const name of componentNames) assert.ok(indexNames.includes(name), `${name} is present in the complete component index`);
  for (const name of aliasCanonicalNames) assert.ok(componentNames.includes(name), `${name} resolves every indexed alias to a canonical specimen`);
  assert.equal(patternNames.length, 152);
  assert.equal(attributeValues(commonHtml, "data-component-origin").filter((origin) => origin === "pattern").length, 117);
  assert.equal(attributeValues(commonHtml, "data-preview-kind").length, 117);
  assert.doesNotMatch(commonHtml, /individual-boundary-anatomy/);
  for (const [name, kind, variant] of [
    ["PhaseGroup", "group", "phase"],
    ["DependencyList", "list", "relationships"],
    ["PromptList", "list", "prompts"],
    ["ChatThread", "conversation", "thread"],
    ["ChatMessage", "conversation", "message"],
    ["ThinkingIndicator", "activity", "thinking"],
  ]) {
    const preview = commonHtml.match(new RegExp(`data-individual-component-name="${name}"[\\s\\S]*?data-preview-kind="([^"]+)" data-preview-variant="([^"]+)"`));
    assert.deepEqual(preview?.slice(1), [kind, variant], `${name} renders a distinct semantic specimen`);
  }
  assert.equal(cardIds.length, 172);
  assert.equal(new Set(cardIds).size, 172);
  assert.equal(indexHrefs.length, 196);
  for (const href of indexHrefs) assert.ok(cardIds.includes(href.slice(1)), `${href} resolves to a common component specimen`);
  assert.equal((commonHtml.match(/id="full-component-index"/g) ?? []).length, 1);
  assert.match(commonHtml, /id="individual-actions"[^>]*data-component-category="actions"/);
  assert.match(commonHtml, /class="full-index-directory"[^>]*>[\s\S]*?<section data-component-category="actions"/);
  assert.match(styles, /\.showcase\[data-collection="generic"\]\[data-component-theme="atelier"\]\{/);
  assert.match(styles, /\.showcase\[data-collection="generic"\]\[data-component-theme="atelier"\]\[data-theme="dark"\]\{/);
  assert.match(styles, /--atelier-highlight:#e31937/);
  assert.doesNotMatch(styles, /--atelier-lime|#b5d63b|#c6e95b/);
  assert.doesNotMatch(styles, /\.showcase\[data-system="compass"\]\[data-collection="generic"\]/);

  const compassResponse = await render("/compass");
  const trackerResponse = await render("/tracker");
  const compassHtml = await compassResponse.text();
  const trackerHtml = await trackerResponse.text();
  for (const [route, html] of [["Compass", compassHtml], ["Tracker", trackerHtml]]) {
    assert.doesNotMatch(html, /data-individual-component-name=|data-component-index-name=|id="full-component-index"/, `${route} keeps the common catalogue off its pattern page`);
    assert.doesNotMatch(html, /data-component-theme="atelier"|data-collection="generic"/, `${route} does not inherit the component atelier theme`);
  }

  const availableNames = [...indexNames].sort();
  const compassBoundaries = [...new Set(attributeValues(compassHtml, "data-component-boundaries").flatMap((value) => value.split("|")))];
  assert.equal(compassBoundaries.length, 132);
  for (const boundary of compassBoundaries) assert.ok(availableNames.includes(boundary), `${boundary} is present in the common component library`);

  for (const trackerBoundary of ["DiagramCanvas", "WorkflowStage", "PhaseGroup", "ChatMessage", "RelationshipRow"]) {
    assert.ok(availableNames.includes(trackerBoundary), `${trackerBoundary} is present from the Tracker patterns`);
  }
});

test("server-renders the isolated PoC Tracker component gallery", async () => {
  const response = await render("/poc-tracker");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>PoC Tracker Showcase — AA Portfolio<\/title>/i);
  assert.match(html, /Seven live product experiences, ready to explore\./);
  assert.match(html, /Planning backlog/);
  assert.match(html, /Workflow workbench/);
  assert.match(html, /Architecture map/);
  assert.match(html, /poc-tracker-components\/01-dashboard\/demo\.html/);
  assert.match(html, /All Migration Compass patterns/);
  assert.match(html, /Full Tracker showroom/);
  assert.match(html, /Open full Migration Compass showroom/);
  assert.match(html, /data-scenario="base"/);
  assert.match(html, /src="\/poc-tracker-components\/01-dashboard\/demo\.html"/);
  assert.doesNotMatch(html, /demo\.html\?scenario=/);
  assert.match(html, /☆[\s\S]*Star pattern/);
  assert.doesNotMatch(html, /Review queue|RAID log/);
});

test("focused PoC Tracker gallery promotes DCC recommendations while reusing its original preview", async () => {
  const [baseResponse, dccResponse] = await Promise.all([
    render("/poc-tracker"),
    render("/poc-tracker?scenario=dcc-hackathon"),
  ]);
  assert.equal(baseResponse.status, 200);
  assert.equal(dccResponse.status, 200);
  const [baseHtml, dccHtml] = await Promise.all([baseResponse.text(), dccResponse.text()]);

  assert.match(dccHtml, /data-scenario="dcc-hackathon"/);
  assert.match(dccHtml, /DCC Hackathon data|DCC scenario library/);
  assert.match(dccHtml, /4 (?:starred|recommended)/i);
  assert.match(dccHtml, /href="\/tracker\?scenario=dcc-hackathon"/);
  assert.match(dccHtml, /href="\/compass\?scenario=dcc-hackathon"/);
  assert.match(dccHtml, /href="\/poc-tracker-components\/01-dashboard\/demo\.html\?scenario=dcc-hackathon"/);
  assert.match(dccHtml, /src="\/poc-tracker-components\/01-dashboard\/demo\.html\?scenario=dcc-hackathon"/);
  assert.match(dccHtml, /★[\s\S]*Recommended/);

  const baseFrame = baseHtml.match(/<iframe\b[^>]*title="Dashboard interactive experience"[^>]*>/)?.[0] ?? "";
  const dccFrame = dccHtml.match(/<iframe\b[^>]*title="Dashboard interactive experience"[^>]*>/)?.[0] ?? "";
  assert.ok(baseFrame && dccFrame, "Base and DCC both render the Dashboard through the focused gallery iframe");
  assert.deepEqual(elementContract(dccFrame), elementContract(baseFrame), "the focused gallery changes only the iframe fixture URL, not its render contract");

  const catalogStart = dccHtml.indexOf("Experience index");
  const catalogEnd = dccHtml.indexOf(/<article/.source, catalogStart);
  const catalogHtml = dccHtml.slice(catalogStart, catalogEnd > catalogStart ? catalogEnd : dccHtml.indexOf("Explore full screen", catalogStart));
  const recommendationTitles = ["Dashboard", "Workflow workbench", "Workspace assistant", "Architecture map"];
  let previousOffset = -1;
  for (const title of recommendationTitles) {
    const offset = catalogHtml.indexOf(title);
    assert.ok(offset > previousOffset, `${title} is promoted in the focused DCC recommendation order`);
    previousOffset = offset;
  }
  const firstSupportingPattern = catalogHtml.indexOf("Planning backlog");
  assert.ok(firstSupportingPattern > previousOffset, "recommended experiences appear before the supporting catalogue");

  const gallerySource = readFileSync(`${projectRoot}/app/poc-tracker/PoCTrackerGallery.tsx`, "utf8");
  assert.equal((gallerySource.match(/<iframe\b/g) ?? []).length, 1, "the focused gallery owns one iframe JSX path");
  assert.doesNotMatch(gallerySource, /DccTracker|DCCTracker|DccPoC|dcc-hackathon\s*\?\s*</, "the focused gallery has no DCC replacement preview branch");
});

test("ships seven reusable screen templates with the requested interactions", () => {
  const componentRoot = `${projectRoot}/public/poc-tracker-components`;
  const folders = [
    "01-dashboard",
    "02-planning-backlog",
    "03-gantt-chart",
    "06-workflow-workbench",
    "07-chatbot",
    "08-earned-value",
    "09-architecture-system-map",
  ];

  for (const folder of folders) {
    assert.equal(existsSync(`${componentRoot}/${folder}/demo.html`), true, `${folder} demo is present`);
    assert.equal(existsSync(`${componentRoot}/${folder}/component.js`), true, `${folder} script is present`);
  }

  assert.equal(existsSync(`${componentRoot}/04-review-queue`), false);
  assert.equal(existsSync(`${componentRoot}/05-raid-log`), false);

  const dashboard = readFileSync(`${componentRoot}/01-dashboard/component.js`, "utf8");
  assert.match(dashboard, /Delivery:[\s\S]*Effort:[\s\S]*Evidence:[\s\S]*Quality:/);

  const gantt = readFileSync(`${componentRoot}/03-gantt-chart/component.js`, "utf8");
  assert.match(gantt, /pointerdown/);
  assert.match(gantt, /data-resize/);
  assert.match(gantt, /dragstart/);
  assert.match(gantt, /data-undo/);

  const systemMap = readFileSync(`${componentRoot}/09-architecture-system-map/component.js`, "utf8");
  assert.match(systemMap, /Channels & experience/);
  assert.match(systemMap, /Interfaces/);
  assert.match(systemMap, /Directional connections/);
  assert.match(systemMap, /protocol/);
});

test("DCC leaves all seven PoC Tracker renderer and style files byte-identical", () => {
  const componentRoot = `${projectRoot}/public/poc-tracker-components`;

  for (const contract of trackerScreenContracts) {
    const expected = trackerRendererHashes[contract.folder];
    const scriptPath = `${componentRoot}/${contract.folder}/component.js`;
    const stylePath = `${componentRoot}/${contract.folder}/component.css`;
    const script = readFileSync(scriptPath, "utf8");

    assert.equal(sha256(scriptPath), expected.js, `${contract.title} renderer is byte-identical to the original Base component`);
    assert.equal(sha256(stylePath), expected.css, `${contract.title} styling is byte-identical to the original Base component`);
    assert.equal((script.match(/function mount\(/g) ?? []).length, 1, `${contract.title} still owns one mount implementation`);
    assert.match(script, new RegExp(`global\\.${contract.global} = \\{ mount`), `${contract.title} retains its original public contract`);
    assert.doesNotMatch(script, /dcc-hackathon|DCC Hackathon|URLSearchParams|location\.search/, `${contract.title} renderer remains unaware of scenarios`);
  }
});

test("Tracker DCC examples are plain fixtures passed through one shared bootstrap", () => {
  const componentRoot = `${projectRoot}/public/poc-tracker-components`;
  const fixturePath = `${componentRoot}/scenarios/dcc-hackathon.json`;
  const bootstrapPath = `${componentRoot}/scenario-bootstrap.js`;
  assert.equal(existsSync(fixturePath), true, "the shared DCC Tracker fixture pack is present");
  assert.equal(existsSync(bootstrapPath), true, "the shared Tracker scenario bootstrap is present");

  const fixtureSource = readFileSync(fixturePath, "utf8");
  const fixtures = JSON.parse(fixtureSource);
  const bootstrap = readFileSync(bootstrapPath, "utf8");
  const normaliseFixtureKey = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^poc/, "").replace(/^\d+/, "");
  const fixtureContainer = fixtures.screens && typeof fixtures.screens === "object" ? fixtures.screens : fixtures;
  const fixtureEntries = Object.entries(fixtureContainer).filter(([key]) => !["metadata", "id", "name", "description"].includes(normaliseFixtureKey(key)));
  const fixtureFor = (...aliases) => {
    const match = fixtureEntries.find(([key]) => aliases.includes(normaliseFixtureKey(key)));
    assert.ok(match, `${aliases[0]} has one shared scenario fixture`);
    const value = match[1];
    return value && typeof value === "object" && !Array.isArray(value) && "data" in value ? value.data : value;
  };
  assert.equal(fixtureEntries.length, 7, "the fixture pack contains exactly one payload per original Tracker screen, plus optional metadata");
  const dashboardFixture = fixtureFor("dashboard");
  const backlogFixture = fixtureFor("planningbacklog", "backlog");
  const ganttFixture = fixtureFor("ganttchart", "gantt");
  const workbenchFixture = fixtureFor("workflowworkbench", "workbench");
  const assistantFixture = fixtureFor("assistant", "chatbot");
  const earnedValueFixture = fixtureFor("earnedvalue");
  assert.ok(dashboardFixture?.lenses, "dashboard data retains the original lens model");
  assert.ok(Array.isArray(backlogFixture), "planning backlog data retains the original item-list model");
  assert.ok(Array.isArray(ganttFixture), "Gantt data retains the original task-list model");
  assert.ok(Array.isArray(workbenchFixture?.items), "workbench data retains the original record model");
  assert.ok(assistantFixture?.response, "assistant data retains the original response model");
  assert.ok(Array.isArray(earnedValueFixture?.workPackages), "earned-value data retains the original work-package model");
  const architectureFixture = fixtureFor("architecturemap", "systemmap");
  assert.ok(Array.isArray(architectureFixture?.nodes) && Array.isArray(architectureFixture?.edges), "architecture data retains the original node-and-edge model");
  for (const [fixture, marker] of [
    [dashboardFixture, "Documentation assurance overview"],
    [backlogFixture, "standards selection"],
    [ganttFixture, "Curate standards library"],
    [workbenchFixture, "Document assurance workbench"],
    [assistantFixture, "Documentation assurance assistant"],
    [earnedValueFixture, "DCC assurance prototype delivery forecast"],
    [architectureFixture, "Documentation assurance system landscape"],
  ]) {
    assert.ok(JSON.stringify(fixture).includes(marker), `${marker} is supplied as fixture data to its original renderer`);
  }
  for (const marker of ["DCC", "standard", "document", "assurance", "ISO/IEC 27001", "Solution Design", "AI"]) {
    assert.match(fixtureSource, new RegExp(marker, "i"), `the shared fixture pack includes ${marker} context`);
  }
  assert.doesNotMatch(fixtureSource, /<\/?(?:section|article|div|button|iframe)\b|innerHTML|createElement|function\s*\(|=>/, "the fixture pack contains data and text, not UI implementation");
  assert.match(bootstrap, /URLSearchParams|searchParams/, "the bootstrap reads the selected scenario");
  assert.match(bootstrap, /dcc-hackathon\.json/, "the bootstrap loads the one shared DCC fixture pack");
  assert.match(bootstrap, /\.mount\(/, "the bootstrap delegates rendering to the existing component contract");
  assert.doesNotMatch(bootstrap, /innerHTML|insertAdjacentHTML|<\/?(?:article|div|button|iframe)\b/, "the bootstrap never contains a replacement screen renderer");
  assert.match(bootstrap, /componentModule\.mount\(root\)/, "Base still invokes the renderer with its untouched default sample contract");
  assert.match(bootstrap, /componentModule\.mount\(root, fixtureData, fixtureOptions\)/, "DCC changes only the data and options supplied to that renderer");
  for (const contract of trackerScreenContracts) {
    assert.doesNotMatch(bootstrap, new RegExp(contract.global), "the shared bootstrap is not coupled to an individual renderer");
    const demo = readFileSync(`${componentRoot}/${contract.folder}/demo.html`, "utf8");
    assert.equal((demo.match(/src="component\.js"/g) ?? []).length, 1, `${contract.title} demo still loads its one original renderer`);
    assert.equal((demo.match(/scenario-bootstrap\.js/g) ?? []).length, 1, `${contract.title} demo uses the shared scenario adapter`);
    assert.match(demo, new RegExp(contract.global), `${contract.title} demo passes its original public module to the adapter`);
    assert.equal((demo.match(/<main\b/g) ?? []).length, 1, `${contract.title} demo keeps one mount root`);
    assert.doesNotMatch(demo, /DccTracker|DCCTracker|dcc-[a-z-]+\.(?:html|css|js)/, `${contract.title} demo has no scenario replacement renderer`);
  }
});

test("server-renders the reusable component foundation separately from the showroom", async () => {
  const response = await render("/foundation");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Compass Pattern Library — AA Portfolio<\/title>/i);
  assert.match(html, /Built for real work\./);
  assert.match(html, /Ready to reuse\./);
  assert.match(html, /Approved collection/);
  assert.match(html, /Full Migration Compass showroom/);
  assert.match(html, /View the full showroom/);
  assert.match(html, /26(?:<!-- -->)? of (?:<!-- -->)?26/);
  assert.match(html, /Dashboard/);
  assert.match(html, /Gantt chart/);
  assert.match(html, /Work queue/);
  assert.match(html, />Charts</);
  assert.match(html, /Compact charts/);
  assert.match(html, /CSV import \/ export wizard/);
  assert.match(html, /Evidence list/);
  assert.match(html, /Final report/);
  assert.match(html, /Operational reports/);
  assert.match(html, /Test runs and coverage/);
  assert.match(html, /Preview state/);
  assert.match(html, /View specifications/);
  assert.match(html, /Empty state/);
  assert.match(html, /Read-only/);
  assert.match(html, /Full-screen preview/);
  assert.match(html, /Export the complete UI system/);
  assert.match(html, /Export typography/);
  assert.match(html, /Export colours/);
  assert.match(html, /Export full UI/);
  assert.match(html, /compass-ui-code\.zip/);
  assert.match(html, /Complete pattern index/);
  assert.doesNotMatch(html, /data-compass-pattern-sections|\d{2} · COMPASS PATTERN/);
  assert.doesNotMatch(html, /Diagram and dependency-map primitives|<iframe|Open original screen|original\/app\/|Original event wiring/i);
});

test("foundation gallery brings DCC recommendations to the top with assurance example data", async () => {
  const response = await render("/foundation?scenario=dcc-hackathon");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /DCC scenario library/);
  assert.match(html, /DCC Hackathon data/);
  assert.match(html, /DCC Hackathon · Recommended pattern library/);
  assert.match(html, /Assurance patterns\.[\s\S]*DCC scenario data\./);
  assert.match(html, /4 starred gallery patterns are brought to the top/);
  assert.match(html, /DCC recommended first/);
  assert.match(html, /26(?:<!-- -->)? of (?:<!-- -->)?26/);
  assert.match(html, /href="\/poc-tracker\?scenario=dcc-hackathon"/, "the gallery keeps DCC selected when opening Tracker");
  assert.match(html, /href="\/compass\?scenario=dcc-hackathon"/);
  const footerStart = html.indexOf("AA Portfolio · approved pattern library");
  assert.ok(footerStart >= 0, "the focused gallery footer is rendered");
  assert.match(html.slice(footerStart), /href="\/poc-tracker\?scenario=dcc-hackathon"/, "the footer keeps DCC selected when opening Tracker");
  assert.match(html.slice(footerStart), /href="\/compass\?scenario=dcc-hackathon"/, "the footer keeps the selected scenario when returning to the showroom");

  const catalogStart = html.indexOf("DCC recommended first");
  const stageStart = html.indexOf('id="template-stage"', catalogStart);
  assert.ok(catalogStart >= 0 && stageStart > catalogStart, "the DCC catalogue precedes the selected preview");
  const catalogHtml = html.slice(catalogStart, stageStart);
  const recommendedTitles = ["Read-only data table", "Evidence matrix", "Review list", "Final report"];
  let previousRecommendationOffset = -1;
  for (const title of recommendedTitles) {
    const offset = catalogHtml.indexOf(`<strong>${title}</strong>`);
    assert.ok(offset > previousRecommendationOffset, `${title} is promoted in DCC recommendation order`);
    previousRecommendationOffset = offset;
  }
  assert.ok(
    catalogHtml.indexOf("<strong>Final report</strong>") < catalogHtml.indexOf("<strong>Dashboard</strong>"),
    "all DCC recommendations appear before the unstarred catalogue",
  );
  assert.equal((catalogHtml.match(/★ Recommended for DCC/g) ?? []).length, 4);

  const stageEnd = html.indexOf("</article>", stageStart);
  const stageHtml = html.slice(stageStart, stageEnd > stageStart ? stageEnd : undefined);
  assert.match(stageHtml, /Read-only data table/);
  assert.match(stageHtml, /aria-pressed="true"/);
  assert.match(stageHtml, /★ Recommended/);
  assert.match(stageHtml, /Standards library/);
  assert.match(stageHtml, /Published assurance standards/);
  assert.match(html, /ISO\/IEC 27001:2022/);
  assert.match(html, /Standards library ready/);
});

test("ships twenty source capability packs and all ninety-six focused behaviour contracts", () => {
  const foundationRoot = `${projectRoot}/public/reusable-component-foundation`;
  const componentRoot = `${foundationRoot}/components`;
  const individualRoot = `${foundationRoot}/individual-templates`;
  const componentFolders = readdirSync(componentRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const individualFolders = readdirSync(individualRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  assert.equal(componentFolders.length, 20);
  for (const folder of componentFolders) {
    assert.equal(existsSync(`${componentRoot}/${folder}/README.md`), true, `${folder} handoff is present`);
    assert.equal(existsSync(`${componentRoot}/${folder}/component.json`), true, `${folder} contract is present`);
  }

  const catalogue = JSON.parse(readFileSync(`${foundationRoot}/component-catalogue.json`, "utf8"));
  const starterData = JSON.parse(readFileSync(`${foundationRoot}/template-data/template-data.json`, "utf8"));
  assert.equal(catalogue.componentCount, 20);
  assert.equal(catalogue.individualTemplateCount, 96);
  assert.equal(catalogue.components.length, 20);
  assert.equal(individualFolders.length, 96);
  for (const folder of individualFolders) {
    assert.equal(existsSync(`${individualRoot}/${folder}/TEMPLATE-BRIEF.md`), true, `${folder} brief is present`);
    assert.equal(existsSync(`${individualRoot}/${folder}/template-contract.json`), true, `${folder} contract is present`);
    assert.equal(existsSync(`${individualRoot}/${folder}/template-data.json`), true, `${folder} fixture is present`);
    assert.equal(existsSync(`${individualRoot}/${folder}/driver-map.json`), true, `${folder} driver map is present`);
  }
  assert.equal(starterData.generatedFor, "Reusable component extraction and prototyping");
  assert.equal(existsSync(`${foundationRoot}/AGENT-HANDOFF-PROMPT.md`), true);
  assert.equal(existsSync(`${foundationRoot}/TARGET-OUTPUT-STANDARD.md`), true);
  assert.equal(existsSync(`${foundationRoot}/TEMPLATE-BUILD-ORDER.md`), true);
  assert.equal(existsSync(`${foundationRoot}/styling/typography.css`), true);
  assert.equal(existsSync(`${foundationRoot}/styling/colours.css`), true);
  assert.equal(existsSync(`${foundationRoot}/compass-ui-code.zip`), true);
  assert.equal(existsSync(`${foundationRoot}/source-snapshot`), false);
  assert.equal(existsSync(`${foundationRoot}/original`), false);
  for (const file of ["PlanningTemplates.tsx", "CollectionTemplates.tsx", "AnalysisTemplates.tsx", "OutcomeTemplates.tsx", "ImportExportCsvTemplate.tsx", "ImportExportCsvTemplate.module.css", "shared.tsx", "types.ts"]) {
    assert.equal(existsSync(`${foundationRoot}/showroom-templates/${file}`), true, `${file} is downloadable`);
  }
});

test("foundation templates retain the contracted interactions without legacy app coupling", () => {
  const templateRoot = `${projectRoot}/app/foundation/templates`;
  const catalogue = readFileSync(`${projectRoot}/app/foundation/patternCatalogue.ts`, "utf8");
  const integratedSections = readFileSync(`${projectRoot}/app/CompassPatternSections.tsx`, "utf8");
  const integratedSectionStyles = readFileSync(`${projectRoot}/app/CompassPatternSections.module.css`, "utf8");
  const showroom = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");
  const planning = readFileSync(`${templateRoot}/PlanningTemplates.tsx`, "utf8");
  const collection = readFileSync(`${templateRoot}/CollectionTemplates.tsx`, "utf8");
  const analysis = readFileSync(`${templateRoot}/AnalysisTemplates.tsx`, "utf8");
  const outcomes = readFileSync(`${templateRoot}/OutcomeTemplates.tsx`, "utf8");
  const csvExchange = readFileSync(`${templateRoot}/ImportExportCsvTemplate.tsx`, "utf8");
  const shared = readFileSync(`${templateRoot}/shared.tsx`, "utf8");
  const themedStyleFiles = [
    "shared.module.css",
    "PlanningTemplates.module.css",
    "CollectionTemplates.module.css",
    "AnalysisTemplates.module.css",
    "OutcomeTemplates.module.css",
    "ImportExportCsvTemplate.module.css",
  ];
  const combined = [planning, collection, analysis, outcomes, csvExchange].join("\n");

  for (const exportName of [
    "DashboardOverviewTemplate", "ProjectPlanTemplate", "WorkQueueTemplate", "ComfortableChartsTemplate", "CompactChartsTemplate", "KanbanTemplate", "EditableDataTableTemplate", "ReadOnlyDataTableTemplate",
    "ConfigurationFormTemplate", "ConfirmationHandoffTemplate", "ReportReviewFeedbackTemplate", "QuestionnaireTemplate", "ResultsStatisticsTemplate",
    "AdfPipelineTemplate", "BuComplexityTemplate", "FlowDiagramTemplate", "StructureDiagramTemplate", "EvidenceMatrixTemplate", "EvidenceTaskListTemplate", "EvidenceReviewTemplate",
    "FinalBuReportTemplate", "DecisionTemplate", "DataLineageTemplate", "DoraMetricsTemplate", "TestCoverageTemplate",
    "CsvImportExportTemplate",
  ]) assert.match(combined, new RegExp(`export function ${exportName}`));

  assert.match(planning, /onPointerDown/);
  assert.match(planning, /kind: "move" \| "left" \| "right"/);
  assert.match(planning, /undo/i);
  assert.match(planning, /dependency/i);
  assert.match(planning, /moveKanbanCard|moveCard|status/i);
  assert.match(planning, /Preview import/);
  assert.match(collection, /AccessibleModal/);
  assert.match(collection, /Escape|draft|Draft/i);
  assert.match(collection, /Resolve|Reopen/);
  assert.match(analysis, /merge target|mergeTarget/i);
  assert.match(analysis, /follow-up question/i);
  assert.match(analysis, /function PipelineConnector/);
  assert.match(analysis, /ResizeObserver/);
  assert.match(outcomes, /Save scenario/);
  assert.match(outcomes, /Author · edit/);
  assert.match(outcomes, /Reviewer · respond/);
  assert.match(outcomes, /Order database/);
  assert.match(outcomes, /genericLineageEdges/);
  assert.match(outcomes, /upstreamLineagePaths/);
  assert.match(outcomes, /Open source trace/);
  assert.match(outcomes, /Customer transform/);
  assert.match(csvExchange, /parseCsv/);
  assert.match(csvExchange, /Map source columns/);
  assert.match(csvExchange, /Review parsed rows/);
  assert.match(csvExchange, /Download CSV/);
  assert.match(shared, /event\.key === "Escape"/);
  assert.match(shared, /event\.key !== "Tab"/);
  assert.match(catalogue, /export const compassPatterns/);
  assert.match(integratedSections, /export (?:default )?function CompassPatternSections/);
  assert.match(integratedSections, /function CompassPatternSection[\s\S]*TemplatePreview/);
  assert.match(integratedSections, /compassPatterns\.map[\s\S]*<CompassPatternSection/);
  assert.match(integratedSections, /compass-pattern-/);
  assert.match(integratedSections, /Technical details for/);
  assert.match(integratedSections, /Download source for/);
  assert.match(integratedSections, /full screen/);
  assert.match(integratedSections, /className="component-actions"/);
  assert.match(integratedSections, /className="frame-toolbar"/);
  assert.match(integratedSections, /pattern-frame pattern-fullscreen-target/);
  assert.doesNotMatch(integratedSections, /styles\.(?:sectionHeading|resourceBar|previewHeader|fullscreenExit)/);
  assert.match(integratedSectionStyles, /--template-accent/);
  assert.match(integratedSectionStyles, /--template-surface/);
  assert.match(integratedSectionStyles, /--template-text/);
  assert.match(integratedSectionStyles, /--template-border/);
  assert.match(integratedSectionStyles, /--template-success/);
  assert.doesNotMatch(integratedSectionStyles, /\.section\s+(?:button|a)[\s\S]{0,80}font:\s*inherit/);
  for (const styleFile of themedStyleFiles) {
    const source = readFileSync(`${templateRoot}/${styleFile}`, "utf8");
    for (const token of ["--template-surface", "--template-text", "--template-border", "--template-success"]) {
      assert.match(source, new RegExp(token), `${styleFile} inherits the showroom ${token} token`);
    }
  }
  assert.match(showroom, /from "\.\/CompassPatternSections"/);
  assert.doesNotMatch(showroom, /from "\.\/CompassTemplateGallery"/);
  assert.doesNotMatch(combined, /originalCompassRoutes|\/api\/business-units|<iframe/i);
});

test("all shared-showroom Tech details use complete source handoffs instead of legacy snippets", async () => {
  const response = await render("/components");
  assert.equal(response.status, 200);
  const html = await response.text();
  const showcase = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");
  const workbench = readFileSync(`${projectRoot}/app/ShowcaseDeveloperWorkbench.tsx`, "utf8");

  const componentNames = attributeValues(html, "data-individual-component-name");
  assert.equal(componentNames.length, 172, "the complete canonical component catalogue is under the shared handoff");
  assert.equal(new Set(componentNames).size, 172, "every canonical component has one handoff entry point");
  assert.equal(
    (html.match(/<footer><button[^>]*>View details<\/button><button class="download"[^>]*>[^<]*Download code<\/button><\/footer>/g) ?? []).length,
    172,
    "every individual component exposes details and a complete-package action",
  );

  assert.match(showcase, /import ShowcaseDeveloperWorkbench,[\s\S]*?downloadShowcaseDeveloperHandoff[\s\S]*?from "\.\/ShowcaseDeveloperWorkbench"/);
  assert.match(showcase, /const activeHandoff = techPanel \? handoffFor\(techPanel\) : null/);
  assert.match(showcase, /\{activeHandoff && <ShowcaseDeveloperWorkbench[^>]*handoff=\{activeHandoff\}/);
  assert.equal((showcase.match(/<ShowcaseDeveloperWorkbench\b/g) ?? []).length, 1, "there is one visible shared modal path");
  assert.doesNotMatch(showcase, /<section className="tech-modal tech-workbench-modal"/, "Showcase no longer retains its old inline modal");
  assert.doesNotMatch(showcase, /\b(?:getComponentCode|workbenchContent|workbenchFile|activeStructure|activeComponent|trackerScreenSources|dependencySource)\b/);
  assert.doesNotMatch(showcase, /(?:componentCatalog\[[^\]]+\]|activeComponent|component)\.code\b/, "legacy illustrative .code fields are not read by the visible modal or download action");
  assert.match(showcase, /async function downloadComponentCode\(componentKey:ComponentKey\) \{[\s\S]*?const handoff = handoffFor\(componentKey\);[\s\S]*?downloadShowcaseDeveloperHandoff\(handoff\)/);
  assert.doesNotMatch(
    showcase.match(/async function downloadComponentCode\(componentKey:ComponentKey\) \{[\s\S]*?\n  \}/)?.[0] ?? "",
    /new Blob|\.code\b/,
    "card downloads cannot fall back to a one-file snippet",
  );

  assert.match(showcase, /individualComponents\.forEach\(\(item\) => \{[\s\S]*?componentCatalog\[item\.key\][\s\S]*?componentStructures\[item\.key\]/, "all generated entries receive metadata and a typed contract");
  assert.match(showcase, /items\.map\(\(item,index\) => <article[\s\S]*?onDetails\(item\.key\)[\s\S]*?onDownload\(item\.key\)/, "every catalogue card passes its own key to both handoff actions");
  assert.match(showcase, /sourceAssets:sourceAssetsForComponent\(componentKey\)/);
  assert.match(showcase, /if \(componentKey === "upload"\) return architectureSourceAssets\(\)/);
  assert.match(showcase, /if \(componentKey === "dependency"\) return \[[\s\S]*?dependency-explorer\.html[\s\S]*?DependencyExplorer\.README\.md[\s\S]*?Showcase\.tsx[\s\S]*?scenarios\.ts[\s\S]*?package\.json[\s\S]*?\n  \];/);
  assert.match(showcase, /if \(componentKey\.startsWith\("tracker-screen-"\)\) return trackerSourceAssets\(componentKey\)/);
  assert.match(showcase, /return legacyLiveSourceAssets\(componentKey\)/);

  const legacyBaseAssets = showcase.match(/function legacyLiveSourceAssets[\s\S]*?const assets:DeveloperSourceAsset\[\] = \[([\s\S]*?)\n  \];/)?.[1] ?? "";
  assert.ok((legacyBaseAssets.match(/(?:sourceAsset\(|\{ name:)/g) ?? []).length >= 6, "every default shared handoff starts with a multi-file live source and integrity package");
  for (const requiredAsset of ["Showcase.tsx", "globals.css", "package.json", "tsconfig.json", "manifest.json"]) {
    assert.match(legacyBaseAssets, new RegExp(requiredAsset.replaceAll(".", "\\.")), `${requiredAsset} is present in every default handoff`);
  }
  assert.match(showcase, /if \(\["critical","flow"\]\.includes\(componentKey\)\) \{[\s\S]*?trackerScenarioFixtures\.ts/);
  for (const componentKey of ["controls", "feedback", "upload", "dependency", "critical", "flow"]) {
    assert.match(showcase, new RegExp(`<ComponentActions componentKey="${componentKey}"`), `${componentKey} is wired to complete handoff actions`);
  }
  assert.match(showcase, /const componentKey = `tracker-screen-\$\{example\.id\}`[\s\S]*?<ComponentActions componentKey=\{componentKey\}/, "all Tracker screens use screen-specific handoffs");

  assert.match(workbench, /handoff\.sourceAssets\.map\(/, "the Source files tab lists every supplied asset");
  assert.match(workbench, /async function resolveAsset[\s\S]*?fetch\(asset\.href\)/, "linked source is loaded into the code viewer");
  assert.match(workbench, /sourceFiles = await Promise\.all\(handoff\.sourceAssets\.map/, "downloads resolve every source file");
  assert.match(workbench, /\.\.\.sourceFiles,[\s\S]*?handoff\.example\.name[\s\S]*?handoff\.contract\.name/, "generated packages combine source, data and the typed contract");
  for (const requiredDetail of ["Package & dependencies", "Complete working source", "Valid TypeScript contract", "Download complete package"]) {
    assert.match(workbench, new RegExp(requiredDetail.replace("&", "&")));
  }
});

test("Architecture upload exposes its complete standalone package and a valid TypeScript contract", () => {
  const showcase = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");
  const architectureRoot = `${projectRoot}/public/developer-handoffs/architecture-upload`;
  const assetBlock = showcase.match(/function architectureSourceAssets\(\):DeveloperSourceAsset\[\] \{[\s\S]*?return \[([\s\S]*?)\n  \];\n\}/)?.[1] ?? "";
  const visibleAssets = [...assetBlock.matchAll(/sourceAsset\("([^"]+)"/g)].map((match) => match[1]);
  const expectedVisibleAssets = [
    "ArchitectureUploadWizard.tsx",
    "ArchitectureUploadWizard.module.css",
    "ArchitectureUploadWizard.module.css.d.ts",
    "architecture-upload.types.ts",
    "architecture-upload.fixtures.ts",
    "architecture-upload.adapter.ts",
    "architecture-upload.contract.ts",
    "StatusDot.tsx",
    "ArchitectureUploadWizard.example.tsx",
    "ArchitectureUploadWizard.test.tsx",
    "index.ts",
    "README.md",
    "package.json",
    "tsconfig.json",
    "vitest.config.ts",
    "setupTests.ts",
  ];
  assert.deepEqual(visibleAssets, expectedVisibleAssets, "the workbench names all eleven implementation files and five build/test support files");
  for (const filename of expectedVisibleAssets) {
    const path = `${architectureRoot}/${filename}`;
    assert.equal(existsSync(path), true, `${filename} exists`);
    assert.ok(readFileSync(path).length > 0, `${filename} is not an empty placeholder`);
  }

  const standaloneFiles = readdirSync(architectureRoot).sort();
  for (const supportFile of ["ArchitectureUploadWizard.module.css.d.ts", "index.ts", "setupTests.ts", "tsconfig.json", "vitest.config.ts"]) {
    assert.ok(standaloneFiles.includes(supportFile), `${supportFile} completes the runnable standalone package`);
  }
  assert.equal(standaloneFiles.length, 16, "the eleven visible files and five build/test support files are packaged together");

  const packageContract = JSON.parse(readFileSync(`${architectureRoot}/package.json`, "utf8"));
  assert.equal(packageContract.name, "@migration-compass/architecture-upload-handoff");
  assert.equal(packageContract.scripts.check, "tsc --noEmit");
  assert.equal(packageContract.peerDependencies.react, ">=18.2.0 <20");
  assert.equal(packageContract.peerDependencies["react-dom"], ">=18.2.0 <20");

  const contract = readFileSync(`${architectureRoot}/architecture-upload.contract.ts`, "utf8");
  for (const exportedContract of ["ArchitectureUploadBootstrapResponse", "ArchitectureUploadDraftRequest", "ArchitectureUploadCompletionRequest", "ArchitectureUploadCompletionResponse", "ArchitectureUploadAdapter"]) {
    assert.match(contract, new RegExp(`export interface ${exportedContract}\\b`));
  }
  for (const operation of ["load", "uploadEvidence", "saveDraft", "complete"]) assert.match(contract, new RegExp(`\\b${operation}\\(`));
  assert.match(contract, /assertArchitectureUploadBootstrap[\s\S]*?asserts value is ArchitectureUploadBootstrapResponse/);

  const typecheck = spawnSync(process.execPath, [
    `${projectRoot}/node_modules/typescript/bin/tsc`, "--pretty", "false", "--noEmit", "--strict", "--skipLibCheck",
    "--target", "ES2022", "--module", "ESNext", "--moduleResolution", "Bundler", "--lib", "ES2022,DOM,DOM.Iterable",
    `${architectureRoot}/architecture-upload.contract.ts`, `${architectureRoot}/architecture-upload.types.ts`,
  ], { cwd:projectRoot, encoding:"utf8" });
  assert.equal(typecheck.status, 0, `Architecture contract must type-check:\n${typecheck.stdout}${typecheck.stderr}`);
});

test("every Tracker screen handoff includes its runnable screen, foundations, bootstrap and scenario", () => {
  const showcase = readFileSync(`${projectRoot}/app/Showcase.tsx`, "utf8");
  const assetBlock = showcase.match(/function trackerSourceAssets\(componentKey:ComponentKey\):DeveloperSourceAsset\[\] \{[\s\S]*?return \[([\s\S]*?)\n  \];\n\}/)?.[1] ?? "";
  assert.deepEqual([...assetBlock.matchAll(/sourceAsset\("([^"]+)"/g)].map((match) => match[1]), [
    "component.js", "component.css", "README.md", "demo.html", "tokens.css", "base.css", "components.css", "scenario-bootstrap.js", "dcc-hackathon.json",
  ]);
  for (const relativePath of ["00-foundations/tokens.css", "00-foundations/base.css", "00-foundations/components.css", "scenario-bootstrap.js", "scenarios/dcc-hackathon.json"]) {
    const path = `${projectRoot}/public/poc-tracker-components/${relativePath}`;
    assert.equal(existsSync(path), true, `${relativePath} exists`);
    assert.ok(readFileSync(path).length > 0, `${relativePath} is not empty`);
  }
  for (const { folder, title } of trackerScreenContracts) {
    for (const filename of ["component.js", "component.css", "README.md", "demo.html"]) {
      const path = `${projectRoot}/public/poc-tracker-components/${folder}/${filename}`;
      assert.equal(existsSync(path), true, `${title} includes ${filename}`);
      assert.ok(readFileSync(path).length > 0, `${title} ${filename} is not empty`);
    }
  }
});

test("the generated live-source manifest and archive match their recorded hashes and bytes", () => {
  const handoffRoot = `${projectRoot}/public/developer-handoffs`;
  const liveRoot = `${handoffRoot}/live-source`;
  const manifestPath = `${liveRoot}/manifest.json`;
  const archivePath = `${handoffRoot}/live-source-complete.tar`;
  assert.equal(existsSync(manifestPath), true, "the synchronized manifest exists");
  assert.equal(existsSync(archivePath), true, "the complete source archive exists");

  const manifestBuffer = readFileSync(manifestPath);
  const manifest = JSON.parse(manifestBuffer.toString("utf8"));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.generator, "scripts/sync-developer-handoffs.mjs");
  assert.equal(manifest.root, "public/developer-handoffs/live-source");
  assert.ok(manifest.files.length >= 67, "the complete synchronized source graph is recorded");
  assert.equal(new Set(manifest.files.map(({ path }) => path)).size, manifest.files.length, "manifest paths are unique");

  for (const entry of manifest.files) {
    assert.doesNotMatch(entry.path, /^(?:\/|\.\.?(?:\/|$))/, "manifest paths stay inside the package");
    assert.ok(entry.language && entry.detail, `${entry.path} records language and purpose metadata`);
    assert.match(entry.hash, /^sha256:[a-f0-9]{64}$/);
    assert.ok(Number.isInteger(entry.bytes) && entry.bytes > 0, `${entry.path} records a positive byte count`);
    const mirrored = readFileSync(`${liveRoot}/${entry.path}`);
    assert.deepEqual(mirrored, readFileSync(`${projectRoot}/${entry.path}`), `${entry.path} is synchronized with the authoritative source`);
    assert.equal(mirrored.length, entry.bytes, `${entry.path} byte metadata matches`);
    assert.equal(`sha256:${createHash("sha256").update(mirrored).digest("hex")}`, entry.hash, `${entry.path} hash metadata matches`);
  }

  const archive = readFileSync(archivePath);
  assert.ok(archive.length > 1024);
  const archiveEntries = new Map();
  let offset = 0;
  while (offset + 512 <= archive.length) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0.*$/, "").trim();
    const name = field(0, 100);
    const prefix = field(345, 155);
    const size = Number.parseInt(field(124, 12) || "0", 8);
    assert.ok(Number.isSafeInteger(size) && size >= 0);
    const path = prefix ? `${prefix}/${name}` : name;
    const contentStart = offset + 512;
    archiveEntries.set(path, archive.subarray(contentStart, contentStart + size));
    offset = contentStart + Math.ceil(size / 512) * 512;
  }
  assert.deepEqual(archiveEntries.get("live-source/manifest.json"), manifestBuffer, "the archive carries the checked manifest");
  for (const entry of manifest.files) {
    assert.deepEqual(archiveEntries.get(`live-source/${entry.path}`), readFileSync(`${liveRoot}/${entry.path}`), `${entry.path} archive entry matches the mirror`);
  }
});
