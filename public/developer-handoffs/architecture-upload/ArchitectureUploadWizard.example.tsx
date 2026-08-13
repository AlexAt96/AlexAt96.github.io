"use client";

import { useState } from "react";
import { ArchitectureUploadWizard } from "./ArchitectureUploadWizard";
import {
  architectureDocumentTypes,
  architectureEnvironments,
  architectureFindings,
  architectureUploadCopy,
  architectureUploadInitialState,
} from "./architecture-upload.fixtures";
import type {
  ArchitectureUploadSnapshot,
  FindingActionContext,
} from "./architecture-upload.types";

/**
 * Copy this example into a client-rendered React route. Replace the simulated
 * promises with your upload/save/complete adapter calls.
 */
export function ArchitectureUploadWizardExample() {
  const [message, setMessage] = useState("Architecture run ready.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function describeFinding(prefix: string, context: FindingActionContext) {
    setMessage(`${prefix}: ${context.finding.title}`);
  }

  async function complete(snapshot: ArchitectureUploadSnapshot) {
    setLoading(true);
    setError(null);
    try {
      // await architectureUploadAdapter.complete(toCompletionRequest(...));
      await Promise.resolve();
      const approved = Object.values(snapshot.decisions).filter(
        (decision) => decision === "approved",
      ).length;
      setMessage(`${approved} approved finding${approved === 1 ? "" : "s"} added to scope.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update scope.");
      throw reason;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ArchitectureUploadWizard
        environments={architectureEnvironments}
        documentTypes={architectureDocumentTypes}
        findings={architectureFindings}
        copy={architectureUploadCopy}
        initialState={architectureUploadInitialState}
        loading={loading}
        error={error}
        onFileChange={async (file, nativeFile) => {
          // Upload nativeFile here and keep the returned evidence ID in host state.
          await Promise.resolve();
          setMessage(file && nativeFile ? `${file.name} selected for upload.` : "Evidence removed.");
          return file ?? undefined;
        }}
        onDecisionChange={({ finding, decision }) => {
          setMessage(`${finding.title}: ${decision}`);
        }}
        onEditFinding={(context) => describeFinding("Open edit form", context)}
        onRequestEvidence={(context) => describeFinding("Evidence requested", context)}
        onComplete={complete}
      />
      <p role="status" aria-live="polite">{message}</p>
    </div>
  );
}

export default ArchitectureUploadWizardExample;
