"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  AccessibleModal,
  ActionButton,
  Badge,
  EmptyState,
  InlineNotice,
  Metric,
  Panel,
  ProgressBar,
  downloadJson,
} from "./shared";
import type { TemplateProps } from "./types";
import styles from "./CollectionTemplates.module.css";

type SaveState = "Editing" | "Saving" | "Saved" | "Invalid";
type ConfirmationStage = "Awaiting confirmation" | "Ready to verify" | "Issue returned" | "Verified";
type FeedbackStatus = "Changes requested" | "Author responded" | "Resolved";
type FeedbackView = "give" | "overview";
type AnswerValue = string | boolean;

interface ConfigurationRow {
  id: string;
  label: string;
  group: string;
  description: string;
  format: string;
  defaultValue: string;
  locked?: boolean;
}

interface HandoffHistoryItem {
  id: string;
  actor: "Confirmation owner" | "Verifier";
  action: string;
  detail: string;
  time: string;
}

interface FeedbackMessage {
  id: string;
  actor: "Reviewer" | "Report author";
  name: string;
  body: string;
  time: string;
}

interface FeedbackThread {
  id: string;
  section: string;
  status: FeedbackStatus;
  messages: FeedbackMessage[];
}

interface Question {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "boolean";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface ResultRow {
  id: string;
  item: string;
  category: string;
  segment: string;
  channel: string;
  status: "Complete" | "Needs review" | "Flagged";
  source: string;
  attributes: Record<string, string>;
}

const configurationRows: ConfigurationRow[] = [
  { id: "title", label: "Display title", group: "General", description: "The human-readable title shown wherever this configuration is used.", format: "Text", defaultValue: "Example title" },
  { id: "category", label: "Category", group: "General", description: "A neutral grouping value used for filtering and organisation.", format: "Single select", defaultValue: "Category A" },
  { id: "threshold", label: "Threshold", group: "Rules", description: "The point at which the configured state changes.", format: "Number", defaultValue: "75" },
  { id: "reference", label: "Reference key", group: "System", description: "Stable identifier generated for adapter integrations.", format: "Identifier", defaultValue: "example-key", locked: true },
];

const initialHandoffHistory: HandoffHistoryItem[] = [
  { id: "history-1", actor: "Confirmation owner", action: "Confirmation sent", detail: "The checklist and supporting reference were sent for independent verification.", time: "Today · 09:15" },
  { id: "history-2", actor: "Verifier", action: "Issue returned", detail: "The second checklist item needs clarification before verification can complete.", time: "Today · 09:44" },
];

const completedHandoffHistory: HandoffHistoryItem[] = [
  ...initialHandoffHistory,
  { id: "history-3", actor: "Confirmation owner", action: "Confirmation resubmitted", detail: "The checklist answer was clarified and sent back.", time: "Today · 10:02" },
  { id: "history-4", actor: "Verifier", action: "Verified", detail: "All confirmation checks completed successfully.", time: "Today · 10:21" },
];

const initialFeedback: FeedbackThread[] = [
  {
    id: "feedback-1",
    section: "Summary",
    status: "Author responded",
    messages: [
      { id: "message-1", actor: "Reviewer", name: "Review lead", body: "Please make the main assumption explicit in the opening summary.", time: "Today · 09:42" },
      { id: "message-2", actor: "Report author", name: "Report author", body: "The assumption is now stated in the summary and linked to the supporting detail.", time: "Today · 10:18" },
    ],
  },
  {
    id: "feedback-2",
    section: "Findings",
    status: "Changes requested",
    messages: [
      { id: "message-3", actor: "Reviewer", name: "Review lead", body: "Add a source reference beside the highlighted finding.", time: "Yesterday · 15:20" },
    ],
  },
];

const wizardSteps: WizardStep[] = [
  {
    id: "context",
    title: "Basic details",
    description: "Capture the subject and its category.",
    questions: [
      { id: "subject", label: "Subject", type: "text", required: true, placeholder: "Enter a short name" },
      { id: "category", label: "Category", type: "select", required: true, options: ["Category A", "Category B", "Category C", "Other"] },
    ],
  },
  {
    id: "details",
    title: "Additional details",
    description: "Capture the context needed to interpret the response.",
    questions: [
      { id: "details", label: "Supporting detail", type: "textarea", required: true, placeholder: "Add relevant context, constraints or notes" },
      { id: "acknowledged", label: "I confirm this response is ready to review", type: "boolean", required: false },
    ],
  },
  { id: "review", title: "Review and submit", description: "Check the response before it is submitted.", questions: [] },
];

const resultRows: ResultRow[] = [
  { id: "result-1", item: "Example record 01", category: "Category A", segment: "Group one", channel: "Primary", status: "Complete", source: "results-a.csv", attributes: { Score: "92", Owner: "Team one", Updated: "Today" } },
  { id: "result-2", item: "Example record 02", category: "Category B", segment: "Group one", channel: "Primary", status: "Complete", source: "results-a.csv", attributes: { Score: "84", Owner: "Team two", Updated: "Today" } },
  { id: "result-3", item: "Example record 03", category: "Category A", segment: "Group two", channel: "Secondary", status: "Flagged", source: "results-b.csv", attributes: { Score: "48", Owner: "Unassigned", Updated: "Yesterday" } },
  { id: "result-4", item: "Example record 04", category: "Category C", segment: "Group two", channel: "Primary", status: "Complete", source: "results-b.csv", attributes: { Score: "76", Owner: "Team one", Updated: "Yesterday" } },
  { id: "result-5", item: "Example record 05", category: "Category B", segment: "Group three", channel: "Secondary", status: "Needs review", source: "results-c.csv", attributes: { Score: "63", Owner: "Team three", Updated: "Monday" } },
  { id: "result-6", item: "Example record 06", category: "Category A", segment: "Group one", channel: "Primary", status: "Complete", source: "results-c.csv", attributes: { Score: "88", Owner: "Team two", Updated: "Monday" } },
  { id: "result-7", item: "Example record 07", category: "Category C", segment: "Group two", channel: "Secondary", status: "Complete", source: "results-d.csv", attributes: { Score: "79", Owner: "Team three", Updated: "Friday" } },
  { id: "result-8", item: "Example record 08", category: "Category B", segment: "Group three", channel: "Primary", status: "Complete", source: "results-d.csv", attributes: { Score: "81", Owner: "Team one", Updated: "Friday" } },
];

const dccConfigurationRows: ConfigurationRow[] = [
  { id: "title", label: "Standard title", group: "Identity", description: "The published name shown when an assessor selects this standard.", format: "Text", defaultValue: "ISO/IEC 27001:2022" },
  { id: "category", label: "Assurance domain", group: "Identity", description: "The domain used to organise and filter the standards library.", format: "Single select", defaultValue: "Information security" },
  { id: "threshold", label: "Evidence threshold", group: "Assessment rules", description: "The minimum evidence coverage required before an assessment can pass.", format: "Percentage", defaultValue: "80" },
  { id: "reference", label: "Standard reference key", group: "System", description: "Stable identifier used to link findings, evidence and reports to this standard.", format: "Identifier", defaultValue: "iso-27001-2022", locked: true },
];

const dccInitialHandoffHistory: HandoffHistoryItem[] = [
  { id: "history-1", actor: "Confirmation owner", action: "Document submitted", detail: "The solution design and its evidence index were sent for independent verification.", time: "Today · 09:15" },
  { id: "history-2", actor: "Verifier", action: "Evidence issue returned", detail: "The threat-model reference required by the selected standard is missing.", time: "Today · 09:44" },
];

const dccCompletedHandoffHistory: HandoffHistoryItem[] = [
  ...dccInitialHandoffHistory,
  { id: "history-3", actor: "Confirmation owner", action: "Document resubmitted", detail: "The evidence index now links the current threat model and named document owner.", time: "Today · 10:02" },
  { id: "history-4", actor: "Verifier", action: "Submission verified", detail: "File integrity, ownership and supporting evidence checks completed successfully.", time: "Today · 10:21" },
];

const dccInitialFeedback: FeedbackThread[] = [
  {
    id: "feedback-1",
    section: "Decision summary",
    status: "Author responded",
    messages: [
      { id: "message-1", actor: "Reviewer", name: "Assurance lead", body: "State that the result is conditional on closing the two missing evidence links.", time: "Today · 09:42" },
      { id: "message-2", actor: "Report author", name: "Report author", body: "The conditional decision and both outstanding evidence actions are now explicit in the summary.", time: "Today · 10:18" },
    ],
  },
  {
    id: "feedback-2",
    section: "AI findings",
    status: "Changes requested",
    messages: [
      { id: "message-3", actor: "Reviewer", name: "Assurance lead", body: "Link the ownership finding to ISO/IEC 27001 clause 5.3 and the source paragraph on page 9.", time: "Yesterday · 15:20" },
    ],
  },
];

const dccWizardSteps: WizardStep[] = [
  {
    id: "context",
    title: "Assessment scope",
    description: "Identify the document and the type of assurance being requested.",
    questions: [
      { id: "subject", label: "Document under assessment", type: "text", required: true, placeholder: "Enter the document title and version" },
      { id: "category", label: "Assessment type", type: "select", required: true, options: ["Solution design", "Threat model", "Accessibility evidence", "Policy", "Other"] },
    ],
  },
  {
    id: "details",
    title: "Evidence context",
    description: "Capture constraints and evidence that will help reviewers interpret the assessment.",
    questions: [
      { id: "details", label: "Known constraints or evidence gaps", type: "textarea", required: true, placeholder: "Describe relevant scope, exclusions and supporting evidence" },
      { id: "acknowledged", label: "I confirm this assessment response is ready for review", type: "boolean", required: false },
    ],
  },
  { id: "review", title: "Review and submit", description: "Check the assessment response before it is submitted.", questions: [] },
];

const dccResultRows: ResultRow[] = [
  { id: "result-1", item: "Security ownership is not assigned", category: "ISO/IEC 27001", segment: "Solution design", channel: "AI scan", status: "Flagged", source: "solution-design-v0.8.docx", attributes: { Requirement: "Clause 5.3", Confidence: "96%", Decision: "Awaiting human review" } },
  { id: "result-2", item: "Human assurance decision is defined", category: "NIST AI RMF", segment: "Solution design", channel: "AI scan", status: "Complete", source: "solution-design-v0.8.docx", attributes: { Requirement: "GOVERN 1.2", Confidence: "94%", Decision: "Approved" } },
  { id: "result-3", item: "Contrast evidence is missing", category: "WCAG 2.2 AA", segment: "Accessibility statement", channel: "AI scan", status: "Flagged", source: "accessibility-statement.docx", attributes: { Requirement: "1.4.3 Contrast", Confidence: "91%", Decision: "Awaiting human review" } },
  { id: "result-4", item: "Keyboard testing evidence supplied", category: "WCAG 2.2 AA", segment: "Accessibility statement", channel: "Evidence check", status: "Complete", source: "accessibility-statement.docx", attributes: { Requirement: "2.1.1 Keyboard", Confidence: "89%", Decision: "Approved" } },
  { id: "result-5", item: "Two controls have no evidence link", category: "DCC HACK-01", segment: "Threat model", channel: "AI scan", status: "Needs review", source: "threat-model-v0.4.pdf", attributes: { Requirement: "Evidence H1", Confidence: "88%", Decision: "Follow-up requested" } },
  { id: "result-6", item: "Threat ownership is documented", category: "ISO/IEC 27001", segment: "Threat model", channel: "Evidence check", status: "Complete", source: "threat-model-v0.4.pdf", attributes: { Requirement: "Clause 5.2", Confidence: "93%", Decision: "Approved" } },
  { id: "result-7", item: "Service outcomes are measurable", category: "GDS Service Standard", segment: "Solution design", channel: "AI scan", status: "Complete", source: "solution-design-v0.8.docx", attributes: { Requirement: "Point 10", Confidence: "86%", Decision: "Approved" } },
  { id: "result-8", item: "Recovery evidence needs a named owner", category: "DCC HACK-01", segment: "Threat model", channel: "AI scan", status: "Needs review", source: "threat-model-v0.4.pdf", attributes: { Requirement: "Recovery R2", Confidence: "84%", Decision: "Follow-up requested" } },
];

const configurationFixtures = {
  base: {
    rows: configurationRows,
    readOnlyNotice: "This configuration is published and read only.", editNotice: "Edit the fields, then save through your configuration adapter.", changedNotice: "You have unsaved configuration changes.", newNotice: "New field added. Complete its required values before saving.", removedNotice: "Field removed. Save to confirm the change.", invalidNotice: "Add at least one field and complete every required value.", savingNotice: "Saving configuration…", savedNotice: "Configuration saved.",
    eyebrow: "Reusable setup pattern", title: "Configuration form", intro: "One focused form for editing neutral labels, formats, defaults and integration keys.", icon: "C", focusEyebrow: "Configuration", focusTitle: "Example setup", focusCopy: "Define the fields that a host screen can populate and save.", itemMetric: "fields", lockedMetric: "generated", columnLabel: "Field label", columnGroup: "Group", columnDescription: "Description", columnFormat: "Format", columnDefault: "Default value", lockNote: "Generated field", emptyTitle: "No configuration fields", emptyCopy: "Add the first field to initialise this reusable setup pattern.", addAction: "Add field", saveAction: "Save configuration",
  },
  dcc: {
    rows: dccConfigurationRows,
    readOnlyNotice: "This standards profile is published and read-only.", editNotice: "Edit the standard metadata and assessment rules, then save the profile.", changedNotice: "You have unsaved standards profile changes.", newNotice: "New standard field added. Complete its required values before saving.", removedNotice: "Standard field removed. Save to confirm the change.", invalidNotice: "Add at least one standards field and complete every required value.", savingNotice: "Saving standards profile…", savedNotice: "Standards profile saved.",
    eyebrow: "Standards library setup", title: "Standards configuration", intro: "Configure the metadata and assessment rules used when documents are assured against a standard.", icon: "S", focusEyebrow: "Selected standard", focusTitle: "ISO/IEC 27001 assessment profile", focusCopy: "Define how this standard appears in the library and how evidence coverage is evaluated.", itemMetric: "settings", lockedMetric: "locked", columnLabel: "Standard field", columnGroup: "Group", columnDescription: "Assessment purpose", columnFormat: "Format", columnDefault: "Configured value", lockNote: "Stable system key", emptyTitle: "No standard fields", emptyCopy: "Add the first field to configure this standards profile.", addAction: "Add standard field", saveAction: "Save standards profile",
  },
} as const;

const handoffFixtures = {
  base: {
    initialHistory: initialHandoffHistory, completedHistory: completedHandoffHistory, subject: "Example submission", reference: "https://example.com/reference", verifiedNotes: "All checks completed and the supplied reference was verified.", returnedNotes: "The second checklist item needs clarification before verification can complete.", evidence: "verification-log.txt", initialNotice: "The current owner can act; each hand-off is recorded below.",
    ownerActorLabel: "Confirmation owner", verifierActorLabel: "Verifier",
    eyebrow: "Reusable two-actor workflow", title: "Confirmation hand-off", intro: "One actor completes a checklist; another verifies it and can return issues for resubmission.", ownerEyebrow: "Actor one · Confirmation owner", ownerTitle: "Complete confirmation", ownerCopy: "Provide a subject, reference and the required acknowledgements.", typeLabel: "Confirmation type", typeValue: "Standard checklist", subjectLabel: "Subject", referenceLabel: "Supporting reference", primaryTitle: "Primary details confirmed", primaryCopy: "The required information is complete and current.", supportingTitle: "Supporting material confirmed", supportingCopy: "The reference can be opened by the verifier.", sendLabel: "Send to verifier", resendLabel: "Resubmit confirmation", verifierEyebrow: "Actor two · Verifier", verifierTitle: "Verify confirmation", verifierCopy: "Check completeness, supporting evidence and internal consistency.", checks: ["Completeness", "Reference", "Consistency"], notesLabel: "Verification notes", notesPlaceholder: "Record success or explain what needs attention", evidenceLabel: "Verification record", evidencePlaceholder: "e.g. verification-log.txt", returnLabel: "Return with issue", verifyLabel: "Verify confirmation", historyTitle: "Hand-off history", historyEyebrow: "Shared history", emptyTitle: "No hand-offs yet", emptyCopy: "The first confirmation submission will start the shared history.",
    incompleteNotice: "Complete the subject, reference and both confirmations before sending.", sentNotice: "Sent to the verifier. They can now check the submitted confirmation.", missingIssueNotice: "Describe the issue before returning the confirmation to its owner.", returnedNotice: "Returned to the confirmation owner with verification notes.", verifiedNotice: "The confirmation is verified and the hand-off is complete.", sentAction: "Confirmation sent", resentAction: "Confirmation resubmitted", sentDetail: "is ready for independent verification.", issueAction: "Issue returned", verifiedAction: "Verified", verifiedDetail: "All confirmation checks completed successfully.",
  },
  dcc: {
    initialHistory: dccInitialHandoffHistory, completedHistory: dccCompletedHandoffHistory, subject: "Customer portal solution design v0.8", reference: "https://documents.dcc.test/solution-design-v0.8", verifiedNotes: "Document integrity, ownership and evidence links were independently verified.", returnedNotes: "The evidence index does not include the threat-model reference required by the selected standard.", evidence: "document-verification-log.json", initialNotice: "The document owner and assurance verifier act in turn; every submission event is retained.",
    ownerActorLabel: "Document owner", verifierActorLabel: "Assurance verifier",
    eyebrow: "Document assurance workflow", title: "Document submission & verification", intro: "A document owner submits assurance evidence; an independent verifier can accept it or return a precise issue.", ownerEyebrow: "Actor one · Document owner", ownerTitle: "Submit assurance document", ownerCopy: "Provide the document, evidence reference and required declarations.", typeLabel: "Submission type", typeValue: "Solution design assurance", subjectLabel: "Document and version", referenceLabel: "Document library reference", primaryTitle: "Document details confirmed", primaryCopy: "The title, version and accountable owner are current.", supportingTitle: "Evidence links confirmed", supportingCopy: "The verifier can open every cited supporting document.", sendLabel: "Send for verification", resendLabel: "Resubmit document", verifierEyebrow: "Actor two · Assurance verifier", verifierTitle: "Verify document submission", verifierCopy: "Check file integrity, evidence links and alignment with the selected standards.", checks: ["File integrity", "Evidence links", "Standards scope"], notesLabel: "Assurance verification notes", notesPlaceholder: "Record successful checks or explain the missing evidence", evidenceLabel: "Verification evidence", evidencePlaceholder: "e.g. document-verification-log.json", returnLabel: "Return evidence issue", verifyLabel: "Verify submission", historyTitle: "Submission history", historyEyebrow: "Assurance audit trail", emptyTitle: "No submissions yet", emptyCopy: "The first document submission will start the assurance history.",
    incompleteNotice: "Complete the document, library reference and both declarations before sending.", sentNotice: "Sent to the assurance verifier. They can now check the document and linked evidence.", missingIssueNotice: "Describe the evidence issue before returning the document to its owner.", returnedNotice: "Returned to the document owner with assurance verification notes.", verifiedNotice: "The document submission is verified and ready for AI assessment.", sentAction: "Document submitted", resentAction: "Document resubmitted", sentDetail: "is ready for independent assurance verification.", issueAction: "Evidence issue returned", verifiedAction: "Submission verified", verifiedDetail: "All document and evidence checks completed successfully.",
  },
} as const;

const feedbackFixtures = {
  base: {
    initialFeedback, defaultSection: "Summary", sections: ["Summary", "Scope", "Findings", "Recommendations"], initialNotice: "Use the two actor views to pass report feedback backwards and forwards.", documentMeta: "Two-actor review pattern · RPT-001 · Version 3", title: "Report review feedback", authorMeta: "Report author · Updated today", previewEyebrow: "Editable source preview", previewTitle: "Example report", previewVersion: "Version 3", previewHeadingOne: "Summary", previewCopyOne: "This reusable preview represents the report being reviewed. The reviewer selects a section and records a precise requested change without editing the source directly.", previewHeadingTwo: "Findings", previewCopyTwo: "The report combines narrative, results and supporting evidence supplied through a host application.", composerCopy: "The message will appear immediately in the shared overview.", sectionLabel: "Report section", feedbackPlaceholder: "Explain what should change and why…", emptyCopy: "Use Give feedback to send the first requested change to the report author.", replyPlaceholder: "Describe the document update and where it can be reviewed…", reviewerName: "Review lead",
  },
  dcc: {
    initialFeedback: dccInitialFeedback, defaultSection: "Decision summary", sections: ["Decision summary", "Standards assessed", "AI findings", "Evidence gaps"], initialNotice: "Use the two actor views to review the assurance report without overwriting its evidence trail.", documentMeta: "Assurance report · DCC-2026-018 · Version 3", title: "Assurance report feedback", authorMeta: "Assurance report author · Updated today", previewEyebrow: "Generated assurance preview", previewTitle: "Customer portal assurance report", previewVersion: "Run 018", previewHeadingOne: "Decision summary", previewCopyOne: "The document conditionally meets the selected standards, subject to two outstanding evidence actions.", previewHeadingTwo: "AI findings", previewCopyTwo: "Every generated finding links to a requirement, source excerpt and recorded human decision.", composerCopy: "The requested assurance change will appear immediately in the shared review overview.", sectionLabel: "Assurance report section", feedbackPlaceholder: "Explain which finding, evidence link or decision should change and why…", emptyCopy: "Use Give feedback to send the first assurance report change to the author.", replyPlaceholder: "Describe the assurance report update and its evidence reference…", reviewerName: "Assurance lead",
  },
} as const;

const questionnaireFixtures = {
  base: {
    steps: wizardSteps, answers: { subject: "Example subject", category: "Category A", details: "This neutral example shows how a host can supply its own questions and response data.", acknowledged: true } as Record<string, AnswerValue>, initialNotice: "One coherent wizard captures a reusable response and review acknowledgement.", eyebrow: "Reusable collection pattern", title: "Questionnaire", intro: "A single accessible wizard with progress, validation, draft and submission states.", workflowLabel: "Three-step workflow", cardTitle: "Questionnaire", cardCopy: "Collect basic details, supporting context and a final acknowledgement in one reusable flow.", progressLabel: "Response progress", viewAction: "View response", continueAction: "Continue questionnaire", startAction: "Start questionnaire", panelTitle: "Captured response", panelEyebrow: "Adapter-ready state", emptyTitle: "No answers captured", emptyCopy: "Start the questionnaire to create a draft response.", modalTitle: "Questionnaire", stepEyebrow: "Questionnaire", completeNotice: "Required questions are complete. Review the values before submitting.", draftNotice: "Questionnaire saved as a draft.", submittedNotice: "Questionnaire submitted successfully.", readOnlyDescription: "Submitted response · fields are read only",
  },
  dcc: {
    steps: dccWizardSteps, answers: { subject: "Customer portal solution design v0.8", category: "Solution design", details: "Assessment covers ISO/IEC 27001, WCAG 2.2 AA and DCC HACK-01. Recovery evidence is still being collected.", acknowledged: true } as Record<string, AnswerValue>, initialNotice: "This guided assessment captures document context, evidence gaps and the final declaration.", eyebrow: "Assurance intake", title: "Assessment questionnaire", intro: "Capture the context AI and human reviewers need before running a document against selected standards.", workflowLabel: "Three-step assessment", cardTitle: "Document assessment questionnaire", cardCopy: "Collect the document scope, evidence context and final declaration in one guided flow.", progressLabel: "Assessment response progress", viewAction: "View assessment", continueAction: "Continue assessment", startAction: "Start assessment", panelTitle: "Captured assessment response", panelEyebrow: "Assessment status", emptyTitle: "No assessment answers", emptyCopy: "Start the assessment questionnaire to create a draft response.", modalTitle: "Assessment questionnaire", stepEyebrow: "Document assessment", completeNotice: "Required assessment questions are complete. Review the values before submitting.", draftNotice: "Assessment questionnaire saved as a draft.", submittedNotice: "Assessment questionnaire submitted successfully.", readOnlyDescription: "Submitted assessment · fields are read only",
  },
} as const;

const resultsFixtures = {
  base: {
    rows: resultRows, allSegments: "All groups", segmentOptions: ["All groups", "Group one", "Group two", "Group three"], initialNotice: "The charts and primary table respond to the same result filters.", exportFile: "results-statistics.json", exportNoun: "result row", eyebrow: "Reusable analysis pattern", title: "Results & statistics", intro: "One primary results table supported by always-visible status and distribution charts.", completeStatus: "Results complete", emptyStatus: "No results", segmentLabel: "Segment", exportAction: "Export visible", searchLabel: "Filter results", searchPlaceholder: "Item, category, status or source…", metricResults: "Results", metricSegments: "Segments", metricComplete: "Complete", metricCompleteDetail: "Ready to use", metricReview: "Review", metricReviewDetail: "Needs review or flagged", chartsLabel: "Results summary charts", completionEyebrow: "Completion", completionTitle: "Results by status", donutUnit: "rows", distributionEyebrow: "Distribution", distributionTitle: "Visible results by category", distributionUnit: "categories", chartEmptyTitle: "No chart data", chartEmptyCopy: "Adjust the filter or connect a results source.", panelTitle: "Results table", panelEyebrow: "Primary result table", tableUnit: "rows", itemColumn: "Item", categoryColumn: "Category", segmentColumn: "Segment", channelColumn: "Channel", sourceColumn: "Source", emptyTitle: "No results in this view", filteredEmptyCopy: "Clear or change the active filters to reveal more results.", sourceEmptyCopy: "Connect a results source to populate the table; the chart frames remain available above.",
  },
  dcc: {
    rows: dccResultRows, allSegments: "All documents", segmentOptions: ["All documents", "Solution design", "Threat model", "Accessibility statement"], initialNotice: "The charts and findings table respond to the same document and assurance filters.", exportFile: "dcc-ai-assurance-findings.json", exportNoun: "assurance finding", eyebrow: "AI assurance workspace", title: "AI findings & results", intro: "Review requirement-level findings produced from uploaded documents, with evidence and human decisions kept visible.", completeStatus: "Findings reviewed", emptyStatus: "No findings", segmentLabel: "Document", exportAction: "Export findings", searchLabel: "Filter findings", searchPlaceholder: "Finding, standard, document, status or source…", metricResults: "Findings", metricSegments: "Documents", metricComplete: "Confirmed", metricCompleteDetail: "Human decision recorded", metricReview: "Review", metricReviewDetail: "Needs review or flagged", chartsLabel: "Assurance findings summary charts", completionEyebrow: "Human review", completionTitle: "Findings by status", donutUnit: "findings", distributionEyebrow: "Standards coverage", distributionTitle: "Visible findings by standard", distributionUnit: "standards", chartEmptyTitle: "No findings data", chartEmptyCopy: "Adjust the filters or run an assessment against a standard.", panelTitle: "AI findings table", panelEyebrow: "Requirement-level results", tableUnit: "findings", itemColumn: "Finding", categoryColumn: "Standard", segmentColumn: "Document", channelColumn: "Assessment", sourceColumn: "Evidence source", emptyTitle: "No findings in this view", filteredEmptyCopy: "Clear or change the active filters to reveal more findings.", sourceEmptyCopy: "Run a document assessment to populate findings; the chart frames remain available above.",
  },
} as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function initials(actor: string) {
  return actor.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export function ConfigurationFormTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = scenarioId === "dcc-hackathon" ? configurationFixtures.dcc : configurationFixtures.base;
  const initialRows = mode === "empty" ? [] : fixture.rows;
  const [rows, setRows] = useState<ConfigurationRow[]>(() => clone(initialRows));
  const [saveState, setSaveState] = useState<SaveState>(readOnly ? "Saved" : "Editing");
  const [notice, setNotice] = useState<string>(readOnly ? fixture.readOnlyNotice : fixture.editNotice);

  useEffect(() => {
    // resetToken is the parent gallery's explicit reset signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(clone(mode === "empty" ? [] : fixture.rows));
    setSaveState(readOnly ? "Saved" : "Editing");
    setNotice(readOnly ? fixture.readOnlyNotice : fixture.editNotice);
  }, [fixture, mode, readOnly, resetToken]);

  const changeRow = (id: string, field: keyof ConfigurationRow, value: string) => {
    if (readOnly) return;
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
    setSaveState("Editing");
    setNotice(fixture.changedNotice);
  };

  const addRow = () => {
    const id = `field-${Date.now()}`;
    setRows((current) => [...current, { id, label: "", group: "", description: "", format: "", defaultValue: "" }]);
    setSaveState("Editing");
    setNotice(fixture.newNotice);
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
    setSaveState("Editing");
    setNotice(fixture.removedNotice);
  };

  const save = () => {
    const valid = rows.length > 0 && rows.every((row) => row.label.trim() && row.group.trim() && row.description.trim() && row.format.trim());
    if (!valid) {
      setSaveState("Invalid");
      setNotice(fixture.invalidNotice);
      return;
    }
    setSaveState("Saving");
    setNotice(fixture.savingNotice);
    window.setTimeout(() => {
      setSaveState("Saved");
      setNotice(fixture.savedNotice);
    }, 350);
  };

  return <div className={styles.templateStack}>
    <header className={styles.templateHeading}>
      <div><small>{fixture.eyebrow}</small><h2>{fixture.title}</h2><p>{fixture.intro}</p></div>
      <Badge tone={saveState === "Invalid" ? "risk" : saveState === "Saved" ? "good" : "watch"}>{readOnly ? "Published" : saveState}</Badge>
    </header>
    <section className={styles.focusCard}>
      <div className={styles.focusCardHeader}>
        <div className={styles.iconTitle}><i aria-hidden="true">{fixture.icon}</i><span><small>{fixture.focusEyebrow}</small><strong>{fixture.focusTitle}</strong><p>{fixture.focusCopy}</p></span></div>
        <div className={styles.headerMetrics}><span><strong>{rows.length}</strong><small>{fixture.itemMetric}</small></span><span><strong>{rows.filter((row) => row.locked).length}</strong><small>{fixture.lockedMetric}</small></span></div>
      </div>
      {rows.length ? <div className={styles.tableScroll}><table className={styles.editTable}>
        <thead><tr><th>{fixture.columnLabel}</th><th>{fixture.columnGroup}</th><th>{fixture.columnDescription}</th><th>{fixture.columnFormat}</th><th>{fixture.columnDefault}</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id} data-locked={row.locked}>
          <td><input aria-label={`${row.label || "New field"} label`} value={row.label} disabled={readOnly || row.locked} aria-invalid={!row.label.trim()} onChange={(event) => changeRow(row.id, "label", event.target.value)} />{row.locked && <small className={styles.lockNote}>{fixture.lockNote}</small>}</td>
          <td><input aria-label={`${row.label || "New field"} group`} value={row.group} disabled={readOnly} aria-invalid={!row.group.trim()} onChange={(event) => changeRow(row.id, "group", event.target.value)} /></td>
          <td><textarea aria-label={`${row.label || "New field"} description`} rows={2} value={row.description} disabled={readOnly} aria-invalid={!row.description.trim()} onChange={(event) => changeRow(row.id, "description", event.target.value)} /></td>
          <td><input aria-label={`${row.label || "New field"} format`} value={row.format} disabled={readOnly} aria-invalid={!row.format.trim()} onChange={(event) => changeRow(row.id, "format", event.target.value)} /></td>
          <td><input aria-label={`${row.label || "New field"} default value`} value={row.defaultValue} disabled={readOnly} onChange={(event) => changeRow(row.id, "defaultValue", event.target.value)} /></td>
          <td>{!readOnly && !row.locked && <ActionButton variant="ghost" onClick={() => removeRow(row.id)}>Remove</ActionButton>}</td>
        </tr>)}</tbody>
      </table></div> : <EmptyState title={fixture.emptyTitle} copy={fixture.emptyCopy} action={!readOnly && <ActionButton variant="primary" onClick={addRow}>{fixture.addAction}</ActionButton>} />}
      <footer className={styles.focusCardFooter}>
        <InlineNotice tone={saveState === "Invalid" ? "danger" : saveState === "Saved" ? "success" : "info"}>{notice}</InlineNotice>
        {!readOnly && <div><ActionButton onClick={addRow}>{fixture.addAction}</ActionButton><ActionButton variant="primary" onClick={save}>{fixture.saveAction}</ActionButton></div>}
      </footer>
    </section>
  </div>;
}

export function ConfirmationHandoffTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = scenarioId === "dcc-hackathon" ? handoffFixtures.dcc : handoffFixtures.base;
  const [stage, setStage] = useState<ConfirmationStage>(mode === "readonly" ? "Verified" : mode === "empty" ? "Awaiting confirmation" : "Issue returned");
  const [subject, setSubject] = useState(mode === "empty" ? "" : fixture.subject);
  const [reference, setReference] = useState(mode === "empty" ? "" : fixture.reference);
  const [primaryConfirmed, setPrimaryConfirmed] = useState(mode !== "empty");
  const [supportingConfirmed, setSupportingConfirmed] = useState(mode !== "empty");
  const [verificationNotes, setVerificationNotes] = useState(mode === "readonly" ? fixture.verifiedNotes : mode === "empty" ? "" : fixture.returnedNotes);
  const [evidence, setEvidence] = useState(mode === "readonly" ? fixture.evidence : "");
  const [history, setHistory] = useState<HandoffHistoryItem[]>(() => mode === "readonly" ? clone(fixture.completedHistory) : mode === "empty" ? [] : clone(fixture.initialHistory));
  const [notice, setNotice] = useState<string>(fixture.initialNotice);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStage(mode === "readonly" ? "Verified" : mode === "empty" ? "Awaiting confirmation" : "Issue returned");
    setSubject(mode === "empty" ? "" : fixture.subject);
    setReference(mode === "empty" ? "" : fixture.reference);
    setPrimaryConfirmed(mode !== "empty");
    setSupportingConfirmed(mode !== "empty");
    setVerificationNotes(mode === "readonly" ? fixture.verifiedNotes : mode === "empty" ? "" : fixture.returnedNotes);
    setEvidence(mode === "readonly" ? fixture.evidence : "");
    setHistory(mode === "readonly" ? clone(fixture.completedHistory) : mode === "empty" ? [] : clone(fixture.initialHistory));
    setNotice(fixture.initialNotice);
  }, [fixture, mode, resetToken]);

  const record = (actor: HandoffHistoryItem["actor"], action: string, detail: string) => setHistory((current) => [...current, { id: `history-${Date.now()}`, actor, action, detail, time: "Just now" }]);

  const sendConfirmation = () => {
    if (!subject.trim() || !reference.trim() || !primaryConfirmed || !supportingConfirmed) {
      setNotice(fixture.incompleteNotice);
      return;
    }
    setStage("Ready to verify");
    record("Confirmation owner", stage === "Issue returned" ? fixture.resentAction : fixture.sentAction, `${subject} ${fixture.sentDetail}`);
    setNotice(fixture.sentNotice);
  };

  const markIssue = () => {
    if (!verificationNotes.trim()) {
      setNotice(fixture.missingIssueNotice);
      return;
    }
    setStage("Issue returned");
    record("Verifier", fixture.issueAction, verificationNotes);
    setNotice(fixture.returnedNotice);
  };

  const verify = () => {
    setStage("Verified");
    record("Verifier", fixture.verifiedAction, verificationNotes.trim() || fixture.verifiedDetail);
    setNotice(fixture.verifiedNotice);
  };

  const ownerActive = stage === "Awaiting confirmation" || stage === "Issue returned";
  const verifierActive = stage === "Ready to verify";
  const displayActor = (actor: HandoffHistoryItem["actor"]) => actor === "Confirmation owner" ? fixture.ownerActorLabel : fixture.verifierActorLabel;

  return <div className={styles.templateStack}>
    <header className={styles.templateHeading}>
      <div><small>{fixture.eyebrow}</small><h2>{fixture.title}</h2><p>{fixture.intro}</p></div>
      <Badge tone={stage === "Verified" ? "good" : stage === "Issue returned" ? "risk" : "watch"}>{stage}</Badge>
    </header>
    <InlineNotice tone={stage === "Verified" ? "success" : stage === "Issue returned" ? "warning" : "info"}>{notice}</InlineNotice>
    <div className={styles.handoffFlow} data-stage={stage}>
      <section className={styles.actorCard} data-active={ownerActive}>
        <header><span className={styles.stepNumber}>1</span><div><small>{fixture.ownerEyebrow}</small><h3>{fixture.ownerTitle}</h3><p>{fixture.ownerCopy}</p></div><Badge tone={ownerActive ? "watch" : "good"}>{stage === "Awaiting confirmation" ? "In progress" : stage === "Issue returned" ? "Returned" : "Sent"}</Badge></header>
        <div className={styles.actorBody}>
          <label className={styles.field}><span>{fixture.typeLabel}</span><input value={fixture.typeValue} disabled /></label>
          <label className={styles.field}><span>{fixture.subjectLabel}</span><input value={subject} disabled={readOnly || !ownerActive} aria-invalid={!subject.trim()} onChange={(event) => setSubject(event.target.value)} /></label>
          <label className={`${styles.field} ${styles.fullField}`}><span>{fixture.referenceLabel}</span><input type="url" value={reference} disabled={readOnly || !ownerActive} aria-invalid={!reference.trim()} placeholder="https://…" onChange={(event) => setReference(event.target.value)} /></label>
          <div className={`${styles.confirmationChecks} ${styles.fullField}`}>
            <label><input type="checkbox" checked={primaryConfirmed} disabled={readOnly || !ownerActive} onChange={(event) => setPrimaryConfirmed(event.target.checked)} /><span><strong>{fixture.primaryTitle}</strong><small>{fixture.primaryCopy}</small></span></label>
            <label><input type="checkbox" checked={supportingConfirmed} disabled={readOnly || !ownerActive} onChange={(event) => setSupportingConfirmed(event.target.checked)} /><span><strong>{fixture.supportingTitle}</strong><small>{fixture.supportingCopy}</small></span></label>
          </div>
        </div>
        <footer>{!readOnly && <ActionButton variant="primary" disabled={!ownerActive} onClick={sendConfirmation}>{stage === "Issue returned" ? fixture.resendLabel : fixture.sendLabel}</ActionButton>}</footer>
      </section>
      <div className={styles.handoffArrow} aria-hidden="true"><span>send</span><i>→</i><span>return</span></div>
      <section className={styles.actorCard} data-active={verifierActive}>
        <header><span className={styles.stepNumber}>2</span><div><small>{fixture.verifierEyebrow}</small><h3>{fixture.verifierTitle}</h3><p>{fixture.verifierCopy}</p></div><Badge tone={stage === "Verified" ? "good" : verifierActive ? "watch" : "neutral"}>{stage === "Verified" ? "Verified" : verifierActive ? "Your turn" : "Waiting"}</Badge></header>
        <div className={styles.actorBody}>
          <div className={`${styles.verificationChecklist} ${styles.fullField}`}>
            <span data-done={stage === "Verified"}>{fixture.checks[0]}</span><span data-done={stage === "Verified"}>{fixture.checks[1]}</span><span data-done={stage === "Verified"}>{fixture.checks[2]}</span>
          </div>
          <label className={`${styles.field} ${styles.fullField}`}><span>{fixture.notesLabel}</span><textarea rows={4} value={verificationNotes} disabled={readOnly || !verifierActive} placeholder={fixture.notesPlaceholder} onChange={(event) => setVerificationNotes(event.target.value)} /></label>
          <label className={`${styles.field} ${styles.fullField}`}><span>{fixture.evidenceLabel}</span><input value={evidence} disabled={readOnly || !verifierActive} placeholder={fixture.evidencePlaceholder} onChange={(event) => setEvidence(event.target.value)} /></label>
        </div>
        <footer>{!readOnly && <><ActionButton disabled={!verifierActive} onClick={markIssue}>{fixture.returnLabel}</ActionButton><ActionButton variant="primary" disabled={!verifierActive} onClick={verify}>{fixture.verifyLabel}</ActionButton></>}</footer>
      </section>
    </div>
    <Panel title={fixture.historyTitle} eyebrow={fixture.historyEyebrow} action={<Badge>{history.length} events</Badge>}>
      {history.length ? <ol className={styles.historyList}>{history.slice().reverse().map((item) => { const actor = displayActor(item.actor); return <li key={item.id} data-actor={item.actor}><i>{initials(actor)}</i><span><small>{actor}</small><strong>{item.action}</strong><p>{item.detail}</p></span><time>{item.time}</time></li>; })}</ol> : <EmptyState title={fixture.emptyTitle} copy={fixture.emptyCopy} />}
    </Panel>
  </div>;
}

export function ReportReviewFeedbackTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = scenarioId === "dcc-hackathon" ? feedbackFixtures.dcc : feedbackFixtures.base;
  const [view, setView] = useState<FeedbackView>(readOnly ? "overview" : "give");
  const [threads, setThreads] = useState<FeedbackThread[]>(() => mode === "empty" ? [] : mode === "readonly" ? fixture.initialFeedback.map((thread) => ({ ...clone(thread), status: "Resolved" })) : clone(fixture.initialFeedback));
  const [section, setSection] = useState<string>(fixture.defaultSection);
  const [feedback, setFeedback] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState<string>(fixture.initialNotice);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(mode === "readonly" ? "overview" : "give");
    setThreads(mode === "empty" ? [] : mode === "readonly" ? fixture.initialFeedback.map((thread) => ({ ...clone(thread), status: "Resolved" })) : clone(fixture.initialFeedback));
    setSection(fixture.defaultSection);
    setFeedback("");
    setReplyingTo(null);
    setReply("");
    setNotice(fixture.initialNotice);
  }, [fixture, mode, resetToken]);

  const createFeedback = () => {
    if (!feedback.trim()) {
      setNotice("Write the requested change before sending it to the report author.");
      return;
    }
    const thread: FeedbackThread = { id: `feedback-${Date.now()}`, section, status: "Changes requested", messages: [{ id: `message-${Date.now()}`, actor: "Reviewer", name: fixture.reviewerName, body: feedback.trim(), time: "Just now" }] };
    setThreads((current) => [thread, ...current]);
    setFeedback("");
    setView("overview");
    setNotice("Feedback sent to the report author and added to the review overview.");
  };

  const sendReply = (threadId: string) => {
    if (!reply.trim()) {
      setNotice("Add the author's response before returning the change to the reviewer.");
      return;
    }
    setThreads((current) => current.map((thread) => thread.id === threadId ? { ...thread, status: "Author responded", messages: [...thread.messages, { id: `message-${Date.now()}`, actor: "Report author", name: "Report author", body: reply.trim(), time: "Just now" }] } : thread));
    setReply("");
    setReplyingTo(null);
    setNotice("Author response sent back to the reviewer.");
  };

  const updateStatus = (threadId: string, status: FeedbackStatus) => {
    setThreads((current) => current.map((thread) => thread.id === threadId ? { ...thread, status } : thread));
    setNotice(status === "Resolved" ? "The reviewer resolved this change." : "The reviewer reopened this change and returned it to the author.");
  };

  const openCount = threads.filter((thread) => thread.status !== "Resolved").length;

  return <div className={styles.templateStack}>
    <header className={styles.documentHeader}>
      <div><small>{fixture.documentMeta}</small><h2>{fixture.title}</h2><p>{fixture.authorMeta}</p></div>
      <div><Badge tone={openCount ? "watch" : "good"}>{openCount ? `${openCount} open change${openCount === 1 ? "" : "s"}` : "Ready to approve"}</Badge><span>Reviewer ↔ Report author</span></div>
    </header>
    <nav className={styles.actorTabs} role="tablist" aria-label="Report review views">
      <button id="feedback-tab-give" type="button" role="tab" aria-selected={view === "give"} aria-controls="feedback-panel-give" onClick={() => setView("give")}><i>1</i><span><small>Reviewer</small><strong>Give feedback</strong></span></button>
      <button id="feedback-tab-overview" type="button" role="tab" aria-selected={view === "overview"} aria-controls="feedback-panel-overview" onClick={() => setView("overview")}><i>2</i><span><small>Shared with report author</small><strong>Review &amp; overview</strong></span><Badge>{threads.length}</Badge></button>
    </nav>
    <InlineNotice tone={notice.includes("resolved") || notice.includes("added") ? "success" : "info"}>{notice}</InlineNotice>
    {view === "give" ? <div id="feedback-panel-give" className={styles.reviewSplit} role="tabpanel" aria-labelledby="feedback-tab-give">
      <article className={styles.documentPreview}>
        <header><small>{fixture.previewEyebrow}</small><strong>{fixture.previewTitle}</strong><Badge>{fixture.previewVersion}</Badge></header>
        <div><h3>{fixture.previewHeadingOne}</h3><p>{fixture.previewCopyOne}</p><h3>{fixture.previewHeadingTwo}</h3><p>{fixture.previewCopyTwo}</p><div className={styles.previewChart}><span style={{ height: "48%" }} /><span style={{ height: "72%" }} /><span style={{ height: "58%" }} /><span style={{ height: "86%" }} /><span style={{ height: "68%" }} /></div></div>
      </article>
      <aside className={styles.feedbackComposer}>
        <div><small>Actor one · Reviewer</small><h3>Request a change</h3><p>{fixture.composerCopy}</p></div>
        <label className={styles.field}><span>{fixture.sectionLabel}</span><select value={section} disabled={readOnly} onChange={(event) => setSection(event.target.value)}>{fixture.sections.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className={styles.field}><span>Requested change</span><textarea rows={7} value={feedback} disabled={readOnly} placeholder={fixture.feedbackPlaceholder} onChange={(event) => setFeedback(event.target.value)} /></label>
        {!readOnly && <ActionButton variant="primary" onClick={createFeedback}>Send to report author</ActionButton>}
      </aside>
    </div> : <div id="feedback-panel-overview" className={styles.reviewOverview} role="tabpanel" aria-labelledby="feedback-tab-overview">
      <div className={styles.reviewSummary}>
        <Metric label="Open changes" value={openCount} detail="Awaiting author or reviewer" tone={openCount ? "risk" : "good"} />
        <Metric label="Resolved" value={threads.length - openCount} detail="Accepted by reviewer" tone="good" />
        <Metric label="Review rounds" value={Math.max(1, ...threads.map((thread) => thread.messages.length))} detail="Latest exchange" />
      </div>
      {threads.length ? <div className={styles.threadList}>{threads.map((thread) => <article className={styles.thread} key={thread.id} data-resolved={thread.status === "Resolved"}>
        <header><div><small>{thread.section}</small><strong>Reviewer ↔ Report author</strong></div><Badge>{thread.status}</Badge></header>
        <div className={styles.messageList}>{thread.messages.map((message, index) => <div className={styles.message} key={message.id} data-actor={message.actor}>
          <i>{initials(message.name)}</i><div><p><strong>{message.name}</strong><em>{message.actor}</em><span>{message.time}</span></p><blockquote>{message.body}</blockquote>{index < thread.messages.length - 1 && <small className={styles.returnLabel}>Returned to {message.actor === "Reviewer" ? "report author" : "reviewer"} ↓</small>}</div>
        </div>)}</div>
        {!readOnly && <footer>
          {thread.status === "Changes requested" && <ActionButton variant="primary" onClick={() => { setReplyingTo(thread.id); setReply(""); }}>Respond as author</ActionButton>}
          {thread.status === "Author responded" && <><ActionButton onClick={() => updateStatus(thread.id, "Changes requested")}>Request more changes</ActionButton><ActionButton variant="primary" onClick={() => updateStatus(thread.id, "Resolved")}>Resolve change</ActionButton></>}
          {thread.status === "Resolved" && <ActionButton onClick={() => updateStatus(thread.id, "Changes requested")}>Reopen</ActionButton>}
        </footer>}
      </article>)}</div> : <EmptyState title="No feedback yet" copy={fixture.emptyCopy} action={!readOnly && <ActionButton variant="primary" onClick={() => setView("give")}>Give feedback</ActionButton>} />}
    </div>}
    {replyingTo && <AccessibleModal title="Respond to requested change" description="Actor two · Report author" onClose={() => setReplyingTo(null)} footer={<><ActionButton variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</ActionButton><ActionButton variant="primary" onClick={() => sendReply(replyingTo)}>Return to reviewer</ActionButton></>}>
      <label className={styles.field}><span>What changed?</span><textarea rows={7} value={reply} placeholder={fixture.replyPlaceholder} onChange={(event) => setReply(event.target.value)} /></label>
    </AccessibleModal>}
  </div>;
}

export function QuestionnaireTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const readOnly = mode === "readonly";
  const fixture = scenarioId === "dcc-hackathon" ? questionnaireFixtures.dcc : questionnaireFixtures.base;
  const steps: WizardStep[] = fixture.steps;
  const defaultAnswers: Record<string, AnswerValue> = mode === "empty" ? {} : fixture.answers;
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() => clone(defaultAnswers));
  const [savedAnswers, setSavedAnswers] = useState<Record<string, AnswerValue>>(() => clone(defaultAnswers));
  const [status, setStatus] = useState<"Not started" | "Draft" | "Submitted">(readOnly ? "Submitted" : mode === "empty" ? "Not started" : "Draft");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string>(fixture.initialNotice);

  useEffect(() => {
    const resetAnswers: Record<string, AnswerValue> = mode === "empty" ? {} : fixture.answers;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
    setStepIndex(0);
    setAnswers(clone(resetAnswers));
    setSavedAnswers(clone(resetAnswers));
    setStatus(readOnly ? "Submitted" : mode === "empty" ? "Not started" : "Draft");
    setErrors({});
    setNotice(fixture.initialNotice);
  }, [fixture, mode, readOnly, resetToken]);

  const close = useCallback(() => { setOpen(false); setErrors({}); }, []);
  const answerPresent = (value: AnswerValue | undefined) => typeof value === "boolean" ? true : Boolean(String(value ?? "").trim());
  const validate = (step: WizardStep) => {
    const nextErrors: Record<string, string> = {};
    step.questions.forEach((question) => { if (question.required && !answerPresent(answers[question.id])) nextErrors[question.id] = `${question.label} is required.`; });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const next = () => { if (validate(steps[stepIndex])) { setStepIndex((current) => Math.min(steps.length - 1, current + 1)); setErrors({}); } };
  const saveDraft = () => { setSavedAnswers(clone(answers)); setStatus("Draft"); setNotice(fixture.draftNotice); };
  const submit = () => {
    const invalidStep = steps.findIndex((step) => step.questions.some((question) => question.required && !answerPresent(answers[question.id])));
    if (invalidStep >= 0) { setStepIndex(invalidStep); validate(steps[invalidStep]); return; }
    setSavedAnswers(clone(answers)); setStatus("Submitted"); setNotice(fixture.submittedNotice); close();
  };
  const openWizard = () => { setAnswers(clone(savedAnswers)); setStepIndex(0); setErrors({}); setOpen(true); };
  const activeStep = steps[stepIndex];
  const answeredCount = Object.keys(savedAnswers).filter((key) => answerPresent(savedAnswers[key])).length;

  return <div className={styles.templateStack}>
    <header className={styles.templateHeading}>
      <div><small>{fixture.eyebrow}</small><h2>{fixture.title}</h2><p>{fixture.intro}</p></div>
      <Badge tone={status === "Submitted" ? "good" : "watch"}>{status}</Badge>
    </header>
    <section className={styles.wizardCard}>
      <div className={styles.wizardIllustration} aria-hidden="true"><i>1</i><span /><i>2</i><span /><i>3</i></div>
      <div className={styles.wizardIntro}><small>{fixture.workflowLabel}</small><h3>{fixture.cardTitle}</h3><p>{fixture.cardCopy}</p><div><Badge>{steps.length} steps</Badge><Badge>{answeredCount} answers</Badge><Badge tone={status === "Submitted" ? "good" : "neutral"}>{status}</Badge></div></div>
      <div className={styles.wizardAction}><ProgressBar value={status === "Submitted" ? 100 : status === "Draft" ? 55 : 0} label={fixture.progressLabel} /><ActionButton variant="primary" onClick={openWizard}>{readOnly || status === "Submitted" ? fixture.viewAction : status === "Draft" ? fixture.continueAction : fixture.startAction}</ActionButton></div>
    </section>
    <InlineNotice tone={status === "Submitted" ? "success" : "info"}>{notice}</InlineNotice>
    <Panel title={fixture.panelTitle} eyebrow={fixture.panelEyebrow} action={<Badge>{status}</Badge>}>
      {answeredCount ? <dl className={styles.responseGrid}>{steps.flatMap((step) => step.questions).map((question) => <div key={question.id}><dt>{question.label}</dt><dd>{typeof savedAnswers[question.id] === "boolean" ? savedAnswers[question.id] ? "Yes" : "No" : String(savedAnswers[question.id] || "Not provided")}</dd></div>)}</dl> : <EmptyState title={fixture.emptyTitle} copy={fixture.emptyCopy} />}
    </Panel>
    {open && <AccessibleModal title={fixture.modalTitle} description={readOnly ? fixture.readOnlyDescription : activeStep.description} onClose={close} footer={<>
      <ActionButton variant="ghost" onClick={close}>Close</ActionButton>
      {!readOnly && <ActionButton onClick={saveDraft}>Save draft</ActionButton>}
      <ActionButton disabled={stepIndex === 0} onClick={() => { setStepIndex((current) => Math.max(0, current - 1)); setErrors({}); }}>Back</ActionButton>
      {stepIndex < steps.length - 1 ? <ActionButton variant="primary" onClick={next}>Next</ActionButton> : readOnly ? <ActionButton variant="primary" onClick={close}>Done</ActionButton> : <ActionButton variant="primary" onClick={submit}>Submit response</ActionButton>}
    </>}>
      <div className={styles.wizardProgress}><ProgressBar value={Math.round(((stepIndex + 1) / steps.length) * 100)} label={`Step ${stepIndex + 1} of ${steps.length}`} /><ol>{steps.map((step, index) => <li key={step.id} data-current={index === stepIndex} data-complete={index < stepIndex}><i>{index < stepIndex ? "✓" : index + 1}</i><span>{step.title}</span></li>)}</ol></div>
      <section className={styles.wizardStep}><header><small>{fixture.stepEyebrow}</small><h4>{activeStep.title}</h4><p>{activeStep.description}</p></header>
        {activeStep.questions.length ? <div className={styles.questionList}>{activeStep.questions.map((question) => <div className={styles.questionField} key={question.id}>
          <label htmlFor={`question-${question.id}`}>{question.label}{question.required && <em>Required</em>}</label>
          {question.type === "text" && <input id={`question-${question.id}`} value={String(answers[question.id] ?? "")} disabled={readOnly} placeholder={question.placeholder} aria-invalid={Boolean(errors[question.id])} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} />}
          {question.type === "textarea" && <textarea id={`question-${question.id}`} rows={5} value={String(answers[question.id] ?? "")} disabled={readOnly} placeholder={question.placeholder} aria-invalid={Boolean(errors[question.id])} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} />}
          {question.type === "select" && <select id={`question-${question.id}`} value={String(answers[question.id] ?? "")} disabled={readOnly} aria-invalid={Boolean(errors[question.id])} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}><option value="">Select an option</option>{question.options?.map((option) => <option key={option}>{option}</option>)}</select>}
          {question.type === "boolean" && <label className={styles.booleanField}><input id={`question-${question.id}`} type="checkbox" checked={Boolean(answers[question.id])} disabled={readOnly} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.checked }))} /><span>{answers[question.id] ? "Yes" : "No"}</span></label>}
          {errors[question.id] && <p role="alert">{errors[question.id]}</p>}
        </div>)}</div> : <div className={styles.answerReview}><InlineNotice tone="success">{fixture.completeNotice}</InlineNotice>{steps.flatMap((step) => step.questions).map((question) => <div key={question.id}><span>{question.label}</span><strong>{typeof answers[question.id] === "boolean" ? answers[question.id] ? "Yes" : "No" : String(answers[question.id] || "Not provided")}</strong></div>)}</div>}
      </section>
    </AccessibleModal>}
  </div>;
}

export function ResultsStatisticsTemplate({ mode, resetToken, scenarioId }: TemplateProps) {
  const fixture = scenarioId === "dcc-hackathon" ? resultsFixtures.dcc : resultsFixtures.base;
  const [rows, setRows] = useState<ResultRow[]>(() => mode === "empty" ? [] : clone(fixture.rows));
  const [segment, setSegment] = useState<string>(fixture.allSegments);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>(fixture.initialNotice);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRows(mode === "empty" ? [] : clone(fixture.rows));
    setSegment(fixture.allSegments); setQuery(""); setExpanded(null);
    setNotice(fixture.initialNotice);
  }, [fixture, mode, resetToken]);

  const visible = useMemo(() => rows.filter((row) => {
    const segmentMatch = segment === fixture.allSegments || row.segment === segment;
    const haystack = `${row.item} ${row.category} ${row.channel} ${row.status} ${row.source}`.toLowerCase();
    return segmentMatch && haystack.includes(query.trim().toLowerCase());
  }), [fixture.allSegments, query, rows, segment]);
  const warnings = visible.filter((row) => row.status !== "Complete").length;
  const segments = new Set(visible.map((row) => row.segment)).size;
  const sources = new Set(visible.map((row) => row.source)).size;
  const categoryCounts = Array.from(new Set(rows.map((row) => row.category))).map((category) => ({ category, count: visible.filter((row) => row.category === category).length })).filter((item) => item.count);
  const statusData = [
    { label: "Complete", value: visible.filter((row) => row.status === "Complete").length, colour: "#3a986f" },
    { label: "Needs review", value: visible.filter((row) => row.status === "Needs review").length, colour: "#e0a328" },
    { label: "Flagged", value: visible.filter((row) => row.status === "Flagged").length, colour: "#c9576d" },
  ];
  const total = Math.max(1, visible.length);
  let offset = 0;
  const donut = statusData.map((item) => { const start = offset; offset += (item.value / total) * 100; return `${item.colour} ${start}% ${offset}%`; }).join(", ");

  const exportVisible = () => {
    downloadJson(fixture.exportFile, { segment, query, rows: visible });
    setNotice(`${visible.length} visible ${fixture.exportNoun}${visible.length === 1 ? "" : "s"} exported.`);
  };

  return <div className={styles.templateStack}>
    <header className={styles.templateHeading}>
      <div><small>{fixture.eyebrow}</small><h2>{fixture.title}</h2><p>{fixture.intro}</p></div>
      <Badge tone={warnings ? "watch" : visible.length ? "good" : "neutral"}>{visible.length ? warnings ? "Review required" : fixture.completeStatus : fixture.emptyStatus}</Badge>
    </header>
    <div className={styles.resultsToolbar}>
      <label><span>{fixture.segmentLabel}</span><select value={segment} onChange={(event) => setSegment(event.target.value)}>{fixture.segmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className={styles.searchField}><span>{fixture.searchLabel}</span><input type="search" value={query} placeholder={fixture.searchPlaceholder} onChange={(event) => setQuery(event.target.value)} /></label>
      <ActionButton disabled={!visible.length} onClick={exportVisible}>{fixture.exportAction}</ActionButton>
    </div>
    <div className={styles.metricGrid}><Metric label={fixture.metricResults} value={visible.length} detail={`${sources} source file${sources === 1 ? "" : "s"}`} /><Metric label={fixture.metricSegments} value={segments} detail={segment} /><Metric label={fixture.metricComplete} value={visible.length - warnings} detail={fixture.metricCompleteDetail} tone="good" /><Metric label={fixture.metricReview} value={warnings} detail={fixture.metricReviewDetail} tone={warnings ? "risk" : "good"} /></div>
    <section className={styles.resultsCharts} aria-label={fixture.chartsLabel}>
      <article className={styles.chartCard}><header><div><small>{fixture.completionEyebrow}</small><strong>{fixture.completionTitle}</strong></div><span>{visible.length ? Math.round(((visible.length - warnings) / visible.length) * 100) : 0}%</span></header><div className={styles.donutChart} style={{ background: visible.length ? `conic-gradient(${donut})` : "#eef0f4" }}><i><strong>{visible.length}</strong><small>{fixture.donutUnit}</small></i></div><div className={styles.chartLegend}>{statusData.map((item) => <span key={item.label}><i style={{ background: item.colour }} /><em>{item.label}</em><strong>{item.value}</strong></span>)}</div></article>
      <article className={styles.chartCard}><header><div><small>{fixture.distributionEyebrow}</small><strong>{fixture.distributionTitle}</strong></div><span>{categoryCounts.length} {fixture.distributionUnit}</span></header>{categoryCounts.length ? <div className={styles.barChart}>{categoryCounts.map((item) => <div key={item.category}><span>{item.category}</span><i><b style={{ width: `${Math.max(8, (item.count / Math.max(...categoryCounts.map((entry) => entry.count))) * 100)}%` }} /></i><strong>{item.count}</strong></div>)}</div> : <div className={styles.chartEmpty}><i>◇</i><strong>{fixture.chartEmptyTitle}</strong><span>{fixture.chartEmptyCopy}</span></div>}</article>
    </section>
    <InlineNotice tone={notice.includes("exported") ? "success" : "info"}>{notice}</InlineNotice>
    <Panel title={fixture.panelTitle} eyebrow={fixture.panelEyebrow} action={<Badge>{visible.length} {fixture.tableUnit}</Badge>}>
      {visible.length ? <div className={styles.tableScroll}><table className={styles.resultTable}>
        <thead><tr><th>{fixture.itemColumn}</th><th>{fixture.categoryColumn}</th><th>{fixture.segmentColumn}</th><th>{fixture.channelColumn}</th><th>Status</th><th>{fixture.sourceColumn}</th><th><span className={styles.srOnly}>Details</span></th></tr></thead>
        <tbody>{visible.map((row) => <Fragment key={row.id}><tr><td><strong>{row.item}</strong></td><td>{row.category}</td><td>{row.segment}</td><td>{row.channel}</td><td><Badge>{row.status}</Badge></td><td><code>{row.source}</code></td><td><ActionButton variant="ghost" aria-expanded={expanded === row.id} onClick={() => setExpanded((current) => current === row.id ? null : row.id)}>{expanded === row.id ? "Hide" : "Inspect"}</ActionButton></td></tr>{expanded === row.id && <tr className={styles.attributeRow}><td colSpan={7}><div>{Object.entries(row.attributes).map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div></td></tr>}</Fragment>)}</tbody>
      </table></div> : <EmptyState title={fixture.emptyTitle} copy={rows.length ? fixture.filteredEmptyCopy : fixture.sourceEmptyCopy} />}
    </Panel>
  </div>;
}
