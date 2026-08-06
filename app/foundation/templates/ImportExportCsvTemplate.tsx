"use client";

import { useMemo, useState } from "react";
import type { TemplateProps } from "./types";
import {
  ActionButton,
  Badge,
  InlineNotice,
  Metric,
  ProgressBar,
  Segmented,
  downloadText,
} from "./shared";
import styles from "./ImportExportCsvTemplate.module.css";

type Flow = "import" | "export";
type WizardStep = 0 | 1 | 2 | 3;
type ColumnKey = "name" | "category" | "owner" | "status" | "inScope";
type CsvRecord = Record<string, string>;

interface DataRow {
  id: string;
  name: string;
  category: string;
  owner: string;
  status: string;
  inScope: boolean;
}

type CsvScenarioId = NonNullable<TemplateProps["scenarioId"]>;
type TargetColumn = { key: ColumnKey; label: string; required: boolean; aliases: string[] };

type CsvCopy = {
  initialNotice: string;
  emptyNotice: string;
  continueNotice: string;
  lockedNotice: string;
  resetNotice: string;
  eyebrow: string;
  title: string;
  description: string;
  readyBadge: string;
  lockedBadge: string;
  importTabEyebrow: string;
  importTabTitle: string;
  exportTabEyebrow: string;
  exportTabTitle: string;
  stepLabels: [string, string, string, string];
  stepHints: [string, string, string, string];
  sourceTitle: string;
  sourceCopy: string;
  templateTitle: string;
  templateCopy: string;
  sampleTitle: string;
  sampleCopy: string;
  sampleAction: string;
  dropTitle: string;
  dropCopy: string;
  fileTypeNotice: string;
  fileSizeNotice: string;
  parsedNoticeSuffix: string;
  nameRequiredError: string;
  ownerRequiredError: string;
  statusError: string;
  scopeError: string;
  mappingTitle: string;
  mappingCopy: string;
  mappingCopySuffix: string;
  mappingReadyNotice: string;
  mappingAcceptedNotice: string;
  reviewTitle: string;
  reviewCopy: string;
  reviewCaption: string;
  reviewScopeColumn: string;
  rowValidationNotice: string;
  invalidRowsSuffix: string;
  completeEyebrow: string;
  completeTitleSuffix: string;
  completeCopy: string;
  completeMetricLabel: string;
  readyDetail: string;
  completeBadge: string;
  pendingBadge: string;
  applyBlockedNotice: string;
  applyNoticeSuffix: string;
  exportTitle: string;
  exportCopy: string;
  exportSampleDetail: string;
  exportPreviewEyebrow: string;
  exportPreviewNotice: string;
  templateFileName: string;
  sampleFileName: string;
  errorSampleFileName: string;
  errorsFileName: string;
  stagedFileName: string;
  exportFileName: string;
};

type CsvFixture = {
  targetColumns: TargetColumn[];
  statusOptions: string[];
  starterRows: DataRow[];
  validExample: string;
  invalidExample: string;
  readOnlyFileName: string;
  copy: CsvCopy;
};

const BASE_TARGET_COLUMNS: TargetColumn[] = [
  { key:"name", label:"Name", required:true, aliases:["name", "item", "resource"] },
  { key:"category", label:"Category", required:false, aliases:["category", "type", "group"] },
  { key:"owner", label:"Owner", required:true, aliases:["owner", "lead", "assignee"] },
  { key:"status", label:"Status", required:true, aliases:["status", "state"] },
  { key:"inScope", label:"In scope", required:false, aliases:["in scope", "inscope", "scope"] },
];

const BASE_STATUS_OPTIONS = ["Ready", "In review", "Blocked", "Complete"];

const BASE_STARTER_ROWS: DataRow[] = [
  { id:"row-1", name:"Service Alpha", category:"Application", owner:"Platform team", status:"Ready", inScope:true },
  { id:"row-2", name:"Dataset Beta", category:"Data", owner:"Analytics team", status:"In review", inScope:true },
  { id:"row-3", name:"Interface Gamma", category:"Integration", owner:"Delivery team", status:"Blocked", inScope:false },
  { id:"row-4", name:"Report Delta", category:"Reporting", owner:"Product team", status:"Complete", inScope:true },
];

const BASE_VALID_EXAMPLE = `Name,Category,Owner,Status,In scope
Service Epsilon,Application,Platform team,Ready,Yes
Dataset Zeta,Data,Analytics team,In review,Yes
Interface Eta,Integration,Delivery team,Complete,No`;

const BASE_INVALID_EXAMPLE = `Item,Type,Lead,State,Scope
,Application,Platform team,Ready,Yes
Dataset Zeta,Data,,Unknown,Maybe
Interface Eta,Integration,Delivery team,Complete,No`;

const DCC_TARGET_COLUMNS: TargetColumn[] = [
  { key:"name", label:"Requirement", required:true, aliases:["requirement", "control", "clause", "name", "item"] },
  { key:"category", label:"Standard", required:false, aliases:["standard", "framework", "category", "type"] },
  { key:"owner", label:"Control owner", required:true, aliases:["control owner", "owner", "custodian", "lead"] },
  { key:"status", label:"Mapping status", required:true, aliases:["mapping status", "status", "state"] },
  { key:"inScope", label:"Applicable", required:false, aliases:["applicable", "in scope", "inscope", "scope"] },
];

const DCC_STATUS_OPTIONS = ["Ready", "Needs mapping", "In review", "Complete"];

const DCC_STARTER_ROWS: DataRow[] = [
  { id:"dcc-row-1", name:"Security roles and responsibilities", category:"ISO/IEC 27001:2022", owner:"Security assurance", status:"Needs mapping", inScope:true },
  { id:"dcc-row-2", name:"Minimum text contrast", category:"WCAG 2.2 AA", owner:"Accessibility lead", status:"In review", inScope:true },
  { id:"dcc-row-3", name:"Named human accountability", category:"NIST AI RMF 1.0", owner:"AI governance", status:"Ready", inScope:true },
  { id:"dcc-row-4", name:"Retain source evidence for every finding", category:"DCC HACK-01", owner:"DCC assurance team", status:"Complete", inScope:true },
];

const DCC_VALID_EXAMPLE = `Requirement,Standard,Control owner,Mapping status,Applicable
Security roles and responsibilities,ISO/IEC 27001:2022,Security assurance,Needs mapping,Yes
Minimum text contrast,WCAG 2.2 AA,Accessibility lead,In review,Yes
Named human accountability,NIST AI RMF 1.0,AI governance,Ready,Yes`;

const DCC_INVALID_EXAMPLE = `Control,Framework,Custodian,State,Scope
,ISO/IEC 27001:2022,Security assurance,Ready,Yes
Minimum text contrast,WCAG 2.2 AA,,Unknown,Maybe
Named human accountability,NIST AI RMF 1.0,AI governance,Complete,Yes`;

const CSV_FIXTURES: Record<CsvScenarioId, CsvFixture> = {
  base: {
    targetColumns: BASE_TARGET_COLUMNS,
    statusOptions: BASE_STATUS_OPTIONS,
    starterRows: BASE_STARTER_ROWS,
    validExample: BASE_VALID_EXAMPLE,
    invalidExample: BASE_INVALID_EXAMPLE,
    readOnlyFileName: "approved-import.csv",
    copy: {
      initialNotice: "Download the template or load an example CSV to begin.",
      emptyNotice: "Choose a CSV file before continuing.",
      continueNotice: "Choose or drop a CSV before continuing.",
      lockedNotice: "Import completed and locked by the host application.",
      resetNotice: "Import reset. Choose a CSV file to start again.",
      eyebrow: "Reusable data exchange pattern",
      title: "Import / export CSV wizard",
      description: "Download a clean template, validate an uploaded file, map its columns, review every row and emit approved data through explicit callbacks.",
      readyBadge: "Local adapter",
      lockedBadge: "Completed & locked",
      importTabEyebrow: "Bring data in",
      importTabTitle: "Import CSV",
      exportTabEyebrow: "Take data out",
      exportTabTitle: "Export CSV",
      stepLabels: ["Upload", "Map columns", "Review", "Complete"],
      stepHints: ["Choose source", "Match fields", "Check rows", "Adapter output"],
      sourceTitle: "Choose a CSV source",
      sourceCopy: "Start from the generic column template or provide an existing comma- or semicolon-separated file.",
      templateTitle: "Start with the template",
      templateCopy: "Download the required headers and fill it in offline.",
      sampleTitle: "Try the interaction",
      sampleCopy: "Load safe generic data without selecting a local file.",
      sampleAction: "Load example",
      dropTitle: "Drop a CSV here or choose a file",
      dropCopy: "CSV only · maximum 1 MB · nothing is uploaded to a server",
      fileTypeNotice: "Import failed: choose a .csv file.",
      fileSizeNotice: "Import failed: this demonstration accepts CSV files up to 1 MB.",
      parsedNoticeSuffix: "rows parsed. Confirm how the source columns should map.",
      nameRequiredError: "Name is required",
      ownerRequiredError: "Owner is required",
      statusError: "Status is not recognised",
      scopeError: "In scope must be Yes or No",
      mappingTitle: "Map source columns",
      mappingCopy: "Match the columns in",
      mappingCopySuffix: "to the reusable data contract.",
      mappingReadyNotice: "All required fields are mapped and ready for row validation.",
      mappingAcceptedNotice: "Column mapping accepted. Review the row-level validation results.",
      reviewTitle: "Review parsed rows",
      reviewCopy: "No rows are applied until the validation result is accepted.",
      reviewCaption: "CSV import review",
      reviewScopeColumn: "Scope",
      rowValidationNotice: "Every row passed the reusable validation contract.",
      invalidRowsSuffix: "Correct the CSV and upload it again; no partial import will be applied.",
      completeEyebrow: "Import adapter output",
      completeTitleSuffix: "rows staged successfully",
      completeCopy: "The parsed rows are available to the host application through the component callback. This template does not save or transmit them itself.",
      completeMetricLabel: "Rows emitted",
      readyDetail: "typed records",
      completeBadge: "Parsed rows emitted",
      pendingBadge: "Awaiting host save",
      applyBlockedNotice: "Resolve every mapping and row error before applying the import.",
      applyNoticeSuffix: "rows emitted through the import adapter and staged for save.",
      exportTitle: "Create a reusable CSV extract",
      exportCopy: "Select the fields and delimiter, inspect the generated output and emit a download action through the browser adapter.",
      exportSampleDetail: "generic starter data",
      exportPreviewEyebrow: "Live CSV preview",
      exportPreviewNotice: "The preview uses generic data and escapes delimiters, quotes and line breaks.",
      templateFileName: "generic-import-template.csv",
      sampleFileName: "generic-example.csv",
      errorSampleFileName: "example-with-errors.csv",
      errorsFileName: "csv-import-errors.csv",
      stagedFileName: "staged-import.csv",
      exportFileName: "generic-data-export.csv",
    },
  },
  "dcc-hackathon": {
    targetColumns: DCC_TARGET_COLUMNS,
    statusOptions: DCC_STATUS_OPTIONS,
    starterRows: DCC_STARTER_ROWS,
    validExample: DCC_VALID_EXAMPLE,
    invalidExample: DCC_INVALID_EXAMPLE,
    readOnlyFileName: "iso-27001-requirements.csv",
    copy: {
      initialNotice: "Download the standards template or load DCC requirements to begin.",
      emptyNotice: "Choose a standards CSV before continuing.",
      continueNotice: "Choose or drop a standards CSV before continuing.",
      lockedNotice: "Standard import completed and locked by the assurance library.",
      resetNotice: "Standard import reset. Choose a CSV file to start again.",
      eyebrow: "Standards library",
      title: "Import / export assurance standards",
      description: "Download a governed template, import requirement rows, map fields, validate every control and export the reviewed standard.",
      readyBadge: "Standards adapter",
      lockedBadge: "Standard locked",
      importTabEyebrow: "Add requirements",
      importTabTitle: "Import standard",
      exportTabEyebrow: "Share governed data",
      exportTabTitle: "Export standard",
      stepLabels: ["Upload", "Map fields", "Validate", "Publish"],
      stepHints: ["Choose standard", "Match fields", "Check requirements", "Library adapter"],
      sourceTitle: "Choose a standards CSV",
      sourceCopy: "Start with the governed requirement template or provide an existing comma- or semicolon-separated standards file.",
      templateTitle: "Start with the standards template",
      templateCopy: "Download the required assurance fields and complete the requirement register offline.",
      sampleTitle: "Try a DCC standard",
      sampleCopy: "Load safe ISO, WCAG and NIST requirement data without choosing a file.",
      sampleAction: "Load standard",
      dropTitle: "Drop a standards CSV here or choose a file",
      dropCopy: "CSV only · maximum 1 MB · processed locally for this demo",
      fileTypeNotice: "Import failed: choose a standards .csv file.",
      fileSizeNotice: "Import failed: this standards demonstration accepts CSV files up to 1 MB.",
      parsedNoticeSuffix: "requirements parsed. Confirm how the source columns should map.",
      nameRequiredError: "Requirement is required",
      ownerRequiredError: "Control owner is required",
      statusError: "Mapping status is not recognised",
      scopeError: "Applicable must be Yes or No",
      mappingTitle: "Map standard fields",
      mappingCopy: "Match the columns in",
      mappingCopySuffix: "to the governed requirement fields.",
      mappingReadyNotice: "All required standard fields are mapped and ready for requirement validation.",
      mappingAcceptedNotice: "Standard field mapping accepted. Review the requirement-level validation results.",
      reviewTitle: "Validate requirement rows",
      reviewCopy: "No standard is published until every requirement passes validation.",
      reviewCaption: "Assurance standard import review",
      reviewScopeColumn: "Applicable",
      rowValidationNotice: "Every requirement passed the assurance validation contract.",
      invalidRowsSuffix: "Correct the standards CSV and upload it again; no partial standard import will be applied.",
      completeEyebrow: "Standards import adapter output",
      completeTitleSuffix: "requirements staged successfully",
      completeCopy: "The validated requirements are available to the standards library through the component callback. This template does not publish or transmit them itself.",
      completeMetricLabel: "Requirements emitted",
      readyDetail: "validated requirements",
      completeBadge: "Requirements emitted",
      pendingBadge: "Awaiting library save",
      applyBlockedNotice: "Resolve every mapping and requirement error before applying the standards import.",
      applyNoticeSuffix: "requirements emitted through the standards import adapter and staged for library save.",
      exportTitle: "Create a standards extract",
      exportCopy: "Select assurance fields and a delimiter, inspect the generated standard and emit a governed download through the browser adapter.",
      exportSampleDetail: "DCC standards data",
      exportPreviewEyebrow: "Live standards CSV preview",
      exportPreviewNotice: "The preview uses DCC standards data and escapes delimiters, quotes and line breaks.",
      templateFileName: "assurance-standard-template.csv",
      sampleFileName: "dcc-standard-requirements.csv",
      errorSampleFileName: "dcc-standard-errors.csv",
      errorsFileName: "requirement-import-errors.csv",
      stagedFileName: "staged-standard-requirements.csv",
      exportFileName: "standards-library-export.csv",
    },
  },
};

function parseCsv(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error("A quoted value is not closed.");
  if (rows.length < 2) throw new Error("The CSV needs a header and at least one data row.");

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("Every CSV column needs a header.");
  if (new Set(headers.map((header) => header.toLowerCase())).size !== headers.length) throw new Error("CSV headers must be unique.");
  const records = rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
  return { headers, records, delimiter };
}

function suggestedMapping(headers: string[], targetColumns: TargetColumn[]) {
  return Object.fromEntries(targetColumns.map((column) => {
    const header = headers.find((candidate) => column.aliases.includes(candidate.trim().toLowerCase()));
    return [column.key, header ?? ""];
  })) as Record<ColumnKey, string>;
}

function booleanValue(value: string) {
  if (/^(yes|true|1|y)$/i.test(value.trim())) return true;
  if (/^(no|false|0|n|)$/i.test(value.trim())) return false;
  return null;
}

function escapeCsv(value: string | number | boolean, delimiter: string) {
  const text = String(value);
  return new RegExp(`["\\n\\r${delimiter}]`).test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function createCsv(rows: DataRow[], columns: ColumnKey[], targetColumns: TargetColumn[], delimiter = ",") {
  const labels = Object.fromEntries(targetColumns.map((column) => [column.key, column.label])) as Record<ColumnKey, string>;
  const header = columns.map((column) => escapeCsv(labels[column], delimiter)).join(delimiter);
  const body = rows.map((row) => columns.map((column) => escapeCsv(column === "inScope" ? row.inScope ? "Yes" : "No" : row[column], delimiter)).join(delimiter));
  return [header, ...body].join("\n");
}

export function CsvImportExportTemplate({ mode, scenarioId = "base" }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = CSV_FIXTURES[scenarioId];
  const { targetColumns, statusOptions, starterRows } = fixture;
  const [flow, setFlow] = useState<Flow>(readOnly ? "export" : "import");
  const [step, setStep] = useState<WizardStep>(readOnly ? 3 : 0);
  const [fileName, setFileName] = useState(readOnly ? fixture.readOnlyFileName : "");
  const [headers, setHeaders] = useState<string[]>(readOnly ? targetColumns.map((column) => column.label) : []);
  const [rawRows, setRawRows] = useState<CsvRecord[]>([]);
  const [mapping, setMapping] = useState<Record<ColumnKey, string>>(() => suggestedMapping(readOnly ? targetColumns.map((column) => column.label) : [], targetColumns));
  const [importedRows, setImportedRows] = useState<DataRow[]>(readOnly ? starterRows : []);
  const [notice, setNotice] = useState(readOnly ? fixture.copy.lockedNotice : mode === "empty" ? fixture.copy.emptyNotice : fixture.copy.initialNotice);
  const [noticeTone, setNoticeTone] = useState<"info" | "success" | "warning" | "danger">(mode === "empty" ? "danger" : readOnly ? "success" : "info");
  const [exportColumns, setExportColumns] = useState<ColumnKey[]>(targetColumns.map((column) => column.key));
  const [delimiter, setDelimiter] = useState<"," | ";">(",");

  const mappingIssues = useMemo(() => {
    const issues: string[] = [];
    targetColumns.filter((column) => column.required && !mapping[column.key]).forEach((column) => issues.push(`Map the required ${column.label} column.`));
    const selected = Object.values(mapping).filter(Boolean);
    if (new Set(selected).size !== selected.length) issues.push("A source column can only be mapped once.");
    return issues;
  }, [mapping, targetColumns]);

  const reviewedRows = useMemo(() => rawRows.map((source, index) => {
    const get = (key: ColumnKey) => mapping[key] ? source[mapping[key]]?.trim() ?? "" : "";
    const scope = booleanValue(get("inScope"));
    const errors: string[] = [];
    if (!get("name")) errors.push(fixture.copy.nameRequiredError);
    if (!get("owner")) errors.push(fixture.copy.ownerRequiredError);
    if (!statusOptions.includes(get("status"))) errors.push(fixture.copy.statusError);
    if (scope === null) errors.push(fixture.copy.scopeError);
    const row: DataRow = { id:`import-${index + 1}`, name:get("name"), category:get("category"), owner:get("owner"), status:get("status"), inScope:scope ?? false };
    return { row, errors };
  }), [fixture.copy.nameRequiredError, fixture.copy.ownerRequiredError, fixture.copy.scopeError, fixture.copy.statusError, mapping, rawRows, statusOptions]);

  const validRows = reviewedRows.filter((row) => row.errors.length === 0).map((item) => item.row);
  const invalidCount = reviewedRows.length - validRows.length;
  const rowsForExport = importedRows.length ? importedRows : starterRows;
  const exportCsv = createCsv(rowsForExport, exportColumns, targetColumns, delimiter);

  const loadText = (text: string, name: string) => {
    if (readOnly) return;
    try {
      const result = parseCsv(text);
      setFileName(name);
      setHeaders(result.headers);
      setRawRows(result.records);
      setMapping(suggestedMapping(result.headers, targetColumns));
      setStep(1);
      setNotice(`${result.records.length} ${fixture.copy.parsedNoticeSuffix}`);
      setNoticeTone("success");
    } catch (error) {
      setFileName(name);
      setHeaders([]);
      setRawRows([]);
      setStep(0);
      setNotice(`Import failed: ${error instanceof Error ? error.message : "The file could not be read."}`);
      setNoticeTone("danger");
    }
  };

  const readFile = async (file?: File) => {
    if (!file || readOnly) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setNotice(fixture.copy.fileTypeNotice);
      setNoticeTone("danger");
      return;
    }
    if (file.size > 1_000_000) {
      setNotice(fixture.copy.fileSizeNotice);
      setNoticeTone("danger");
      return;
    }
    loadText(await file.text(), file.name);
  };

  const resetImport = () => {
    if (readOnly) return;
    setStep(0);
    setFileName("");
    setHeaders([]);
    setRawRows([]);
    setMapping(suggestedMapping([], targetColumns));
    setImportedRows([]);
    setNotice(fixture.copy.resetNotice);
    setNoticeTone("info");
  };

  const applyImport = () => {
    if (mappingIssues.length || invalidCount || !validRows.length) {
      setNotice(fixture.copy.applyBlockedNotice);
      setNoticeTone("danger");
      return;
    }
    setImportedRows(validRows);
    setStep(3);
    setNotice(`${validRows.length} ${fixture.copy.applyNoticeSuffix}`);
    setNoticeTone("success");
  };

  const stepLabels = fixture.copy.stepLabels;

  return <div className={styles.templateRoot}>
    <header className={styles.templateHeader}>
      <div><small>{fixture.copy.eyebrow}</small><h2>{fixture.copy.title}</h2><p>{fixture.copy.description}</p></div>
      <Badge tone={readOnly ? "good" : "neutral"}>{readOnly ? fixture.copy.lockedBadge : fixture.copy.readyBadge}</Badge>
    </header>

    <div className={styles.flowTabs} role="tablist" aria-label="CSV workflow">
      <button type="button" role="tab" aria-selected={flow === "import"} onClick={() => setFlow("import")}><i>⇧</i><span><small>{fixture.copy.importTabEyebrow}</small><strong>{fixture.copy.importTabTitle}</strong></span></button>
      <button type="button" role="tab" aria-selected={flow === "export"} onClick={() => setFlow("export")}><i>⇩</i><span><small>{fixture.copy.exportTabEyebrow}</small><strong>{fixture.copy.exportTabTitle}</strong></span></button>
    </div>

    {flow === "import" ? <section className={styles.wizardShell} aria-label="CSV import wizard">
      <aside className={styles.stepRail}>
        <small>Import progress</small>
        {stepLabels.map((label, index) => <button key={label} type="button" disabled={index > step || readOnly} data-active={step === index} data-complete={step > index} onClick={() => setStep(index as WizardStep)}><i>{step > index ? "✓" : index + 1}</i><span><strong>{label}</strong><small>{fixture.copy.stepHints[index]}</small></span></button>)}
        <ProgressBar value={Math.round((step + 1) / stepLabels.length * 100)} label="Wizard complete" />
      </aside>

      <div className={styles.stepContent}>
        {step === 0 && <>
          <div className={styles.stepHeading}><span>Step 1 of 4</span><h3>{fixture.copy.sourceTitle}</h3><p>{fixture.copy.sourceCopy}</p></div>
          <div className={styles.sourceActions}><article><i>↓</i><div><strong>{fixture.copy.templateTitle}</strong><p>{fixture.copy.templateCopy}</p></div><ActionButton onClick={() => downloadText(fixture.copy.templateFileName, `${targetColumns.map((column) => column.label).join(",")}\n`, "text/csv")}>Download template</ActionButton></article><article><i>◇</i><div><strong>{fixture.copy.sampleTitle}</strong><p>{fixture.copy.sampleCopy}</p></div><span><ActionButton onClick={() => loadText(fixture.validExample, fixture.copy.sampleFileName)}>{fixture.copy.sampleAction}</ActionButton><ActionButton onClick={() => loadText(fixture.invalidExample, fixture.copy.errorSampleFileName)}>Load errors</ActionButton></span></article></div>
          <label className={styles.dropZone} data-disabled={readOnly} onDragOver={(event) => { if (!readOnly) event.preventDefault(); }} onDrop={(event) => { event.preventDefault(); void readFile(event.dataTransfer.files[0]); }}><input type="file" accept=".csv,text/csv" disabled={readOnly} onChange={(event) => void readFile(event.target.files?.[0])} /><i>⇧</i><strong>{fixture.copy.dropTitle}</strong><span>{fixture.copy.dropCopy}</span></label>
        </>}

        {step === 1 && <>
          <div className={styles.stepHeading}><span>Step 2 of 4</span><h3>{fixture.copy.mappingTitle}</h3><p>{fixture.copy.mappingCopy} <strong>{fileName}</strong> {fixture.copy.mappingCopySuffix}</p></div>
          <div className={styles.mappingSummary}><Metric label="Source columns" value={headers.length} detail="unique headers" /><Metric label="Parsed rows" value={rawRows.length} detail="not saved yet" /><Metric label="Required mappings" value={`${targetColumns.filter((column) => column.required && mapping[column.key]).length}/${targetColumns.filter((column) => column.required).length}`} detail="must be complete" tone={mappingIssues.length ? "watch" : "good"} /></div>
          <div className={styles.mappingTable}><div><span>Target field</span><span>Requirement</span><span>Source column</span><span>Sample</span></div>{targetColumns.map((column) => <label key={column.key}><span><strong>{column.label}</strong><small>{column.key}</small></span><Badge tone={column.required ? "watch" : "neutral"}>{column.required ? "Required" : "Optional"}</Badge><select value={mapping[column.key]} disabled={readOnly} onChange={(event) => setMapping((current) => ({ ...current, [column.key]:event.target.value }))}><option value="">Do not import</option>{headers.map((header) => <option key={header}>{header}</option>)}</select><code>{mapping[column.key] ? rawRows[0]?.[mapping[column.key]] || "—" : "—"}</code></label>)}</div>
          {mappingIssues.length ? <InlineNotice tone="danger">{mappingIssues.join(" ")}</InlineNotice> : <InlineNotice tone="success">{fixture.copy.mappingReadyNotice}</InlineNotice>}
        </>}

        {step === 2 && <>
          <div className={styles.stepHeading}><span>Step 3 of 4</span><h3>{fixture.copy.reviewTitle}</h3><p>{fixture.copy.reviewCopy}</p></div>
          <div className={styles.reviewMetrics}><Metric label="Rows read" value={reviewedRows.length} detail={fileName} /><Metric label="Valid" value={validRows.length} detail="ready to emit" tone="good" /><Metric label="Errors" value={invalidCount} detail="must be corrected" tone={invalidCount ? "risk" : "good"} /></div>
          <div className={styles.reviewTable}><table><caption>{fixture.copy.reviewCaption}</caption><thead><tr><th>Row</th><th>{targetColumns[0].label}</th><th>{targetColumns[1].label}</th><th>{targetColumns[2].label}</th><th>{targetColumns[3].label}</th><th>{fixture.copy.reviewScopeColumn}</th><th>Validation</th></tr></thead><tbody>{reviewedRows.map((item, index) => <tr key={item.row.id} data-error={item.errors.length > 0}><td>{index + 2}</td><td><strong>{item.row.name || "Missing"}</strong></td><td>{item.row.category || "—"}</td><td>{item.row.owner || "Missing"}</td><td>{item.row.status || "Missing"}</td><td>{item.row.inScope ? "Yes" : "No"}</td><td>{item.errors.length ? <span>{item.errors.join(" · ")}</span> : <Badge tone="good">Valid</Badge>}</td></tr>)}</tbody></table></div>
          {invalidCount ? <InlineNotice tone="danger">{invalidCount} row{invalidCount === 1 ? " has" : "s have"} errors. {fixture.copy.invalidRowsSuffix}</InlineNotice> : <InlineNotice tone="success">{fixture.copy.rowValidationNotice}</InlineNotice>}
        </>}

        {step === 3 && <div className={styles.completeState}><i>✓</i><small>{fixture.copy.completeEyebrow}</small><h3>{importedRows.length} {fixture.copy.completeTitleSuffix}</h3><p>{fixture.copy.completeCopy}</p><div><Metric label="Source" value="CSV" detail={fileName} /><Metric label={fixture.copy.completeMetricLabel} value={importedRows.length} detail={fixture.copy.readyDetail} tone="good" /><Metric label="Errors" value="0" detail="validation complete" tone="good" /></div><span><Badge tone="good">{fixture.copy.completeBadge}</Badge><Badge tone="neutral">{fixture.copy.pendingBadge}</Badge></span></div>}

        <InlineNotice tone={noticeTone}>{notice}</InlineNotice>
        <footer className={styles.wizardActions}>{step > 0 && step < 3 && <ActionButton disabled={readOnly} onClick={() => setStep((step - 1) as WizardStep)}>Back</ActionButton>}{step === 0 && <ActionButton disabled={readOnly} onClick={() => { setNotice(fixture.copy.continueNotice); setNoticeTone("danger"); }}>Continue</ActionButton>}{step === 1 && <ActionButton variant="primary" disabled={readOnly || mappingIssues.length > 0} onClick={() => { setStep(2); setNotice(fixture.copy.mappingAcceptedNotice); setNoticeTone("info"); }}>Validate rows</ActionButton>}{step === 2 && <><ActionButton onClick={() => downloadText(fixture.copy.errorsFileName, reviewedRows.filter((row) => row.errors.length).map((row) => `${row.row.name},${row.errors.join(" | ")}`).join("\n"), "text/csv")} disabled={!invalidCount}>Download errors</ActionButton><ActionButton variant="primary" disabled={readOnly || invalidCount > 0 || !validRows.length} onClick={applyImport}>Apply {validRows.length} rows</ActionButton></>}{step === 3 && <><ActionButton onClick={() => downloadText(fixture.copy.stagedFileName, createCsv(importedRows, targetColumns.map((column) => column.key), targetColumns), "text/csv")}>Export staged rows</ActionButton><ActionButton disabled={readOnly} onClick={resetImport}>Import another file</ActionButton></>}</footer>
      </div>
    </section> : <section className={styles.exportShell} aria-label="CSV export builder">
      <div className={styles.exportIntro}><div><small>Export builder</small><h3>{fixture.copy.exportTitle}</h3><p>{fixture.copy.exportCopy}</p></div><div><Metric label="Rows" value={rowsForExport.length} detail={importedRows.length ? "from this import" : fixture.copy.exportSampleDetail} /><Metric label="Columns" value={exportColumns.length} detail="selected for export" tone={exportColumns.length ? "good" : "risk"} /></div></div>
      <div className={styles.exportGrid}><aside><small>Fields</small>{targetColumns.map((column) => <label key={column.key}><input type="checkbox" checked={exportColumns.includes(column.key)} onChange={(event) => setExportColumns((current) => event.target.checked ? [...current, column.key] : current.filter((key) => key !== column.key))} /><span><strong>{column.label}</strong><small>{column.required ? "Core field" : "Optional field"}</small></span></label>)}<small>Delimiter</small><Segmented value={delimiter} onChange={setDelimiter} label="CSV delimiter" options={[{ value:",", label:"Comma" }, { value:";", label:"Semicolon" }]} /></aside><div className={styles.exportPreview}><header><div><small>{fixture.copy.exportPreviewEyebrow}</small><strong>{fixture.copy.exportFileName}</strong></div><Badge>{rowsForExport.length} rows</Badge></header>{exportColumns.length ? <pre>{exportCsv.split("\n").slice(0, 5).join("\n")}</pre> : <div><i>◇</i><strong>No fields selected</strong><span>Select at least one field to produce an export.</span></div>}<footer><InlineNotice tone={exportColumns.length ? "info" : "danger"}>{exportColumns.length ? fixture.copy.exportPreviewNotice : "Choose one or more fields before exporting."}</InlineNotice><ActionButton variant="primary" disabled={!exportColumns.length} onClick={() => downloadText(fixture.copy.exportFileName, exportCsv, "text/csv")}>Download CSV</ActionButton></footer></div></div>
    </section>}
  </div>;
}
