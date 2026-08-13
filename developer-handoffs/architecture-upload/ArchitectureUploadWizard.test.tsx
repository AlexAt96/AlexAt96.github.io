import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArchitectureUploadWizard } from "./ArchitectureUploadWizard";
import {
  architectureDocumentTypes,
  architectureEnvironments,
  architectureFindings,
  architectureUploadCopy,
  architectureUploadInitialState,
} from "./architecture-upload.fixtures";

function renderWizard(overrides: Partial<React.ComponentProps<typeof ArchitectureUploadWizard>> = {}) {
  return render(
    <ArchitectureUploadWizard
      environments={architectureEnvironments}
      documentTypes={architectureDocumentTypes}
      findings={architectureFindings}
      copy={architectureUploadCopy}
      initialState={architectureUploadInitialState}
      {...overrides}
    />,
  );
}

describe("ArchitectureUploadWizard", () => {
  it("runs the four-step flow and completes only approved scope records", async () => {
    const user = userEvent.setup();
    const onDocumentTypeChange = vi.fn();
    const onFileChange = vi.fn().mockResolvedValue(undefined);
    const onDecisionChange = vi.fn();
    const onEditFinding = vi.fn();
    const onRequestEvidence = vi.fn();
    const onComplete = vi.fn().mockResolvedValue({ id: "scope-1" });

    renderWizard({
      onDocumentTypeChange,
      onFileChange,
      onDecisionChange,
      onEditFinding,
      onRequestEvidence,
      onComplete,
    });

    expect(screen.getByRole("heading", { name: "Select target environments" })).toBeVisible();
    await user.click(screen.getByRole("checkbox", { name: /development/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    const documentType = screen.getByRole("combobox", { name: "Document type" });
    await user.selectOptions(documentType, "Integration catalogue");
    expect(onDocumentTypeChange).toHaveBeenCalledWith(
      "Integration catalogue",
      expect.objectContaining({ documentType: "Integration catalogue" }),
    );

    const evidence = new File(["architecture"], "architecture.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText(/drop a file here|architecture-v4/i), evidence);
    await waitFor(() => expect(onFileChange).toHaveBeenCalled());
    expect(screen.getByText("architecture.pdf")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("tablist", { name: "Review findings" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Edit details" }));
    expect(onEditFinding).toHaveBeenCalledWith(
      expect.objectContaining({ finding: expect.objectContaining({ id: "apim" }) }),
    );
    await user.click(screen.getByRole("button", { name: "Request evidence" }));
    expect(onRequestEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ finding: expect.objectContaining({ id: "apim" }) }),
    );
    await user.click(screen.getByRole("button", { name: "✓ Approve finding" }));
    expect(onDecisionChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ decision: "approved", previousDecision: "pending" }),
    );

    const firstTab = screen.getByRole("tab", { name: /finding 1/i });
    firstTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /finding 2/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "Decline" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText("Azure API Management")).toBeVisible();
    expect(screen.queryByText("Salesforce CRM")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add approved records" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        environmentIds: ["production", "development"],
        documentType: "Integration catalogue",
        decisions: expect.objectContaining({ apim: "approved", salesforce: "declined" }),
      }),
    );
    expect(await screen.findByText("Scope updated")).toBeVisible();
    expect(screen.getByRole("button", { name: "Records added" })).toBeDisabled();
  });

  it("gates environment, evidence, and completion requirements", async () => {
    const user = userEvent.setup();
    renderWizard({
      initialState: {
        ...architectureUploadInitialState,
        environmentIds: [],
        file: null,
      },
    });

    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /documents/i }));
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /confirm scope/i }));
    expect(screen.getByRole("button", { name: "Add approved records" })).toBeDisabled();
    expect(screen.getByText(/approve at least one finding/i)).toBeVisible();
  });

  it("supports undo and keyboard navigation across finding tabs", async () => {
    const user = userEvent.setup();
    renderWizard({
      initialState: { ...architectureUploadInitialState, step: "review" },
    });

    const first = screen.getByRole("tab", { name: /finding 1/i });
    first.focus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /finding 3/i })).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Azure Data Lake" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Decline" }));
    expect(screen.getByText(/retained for audit/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Decline" })).toBeVisible();
  });

  it("keeps inspection available while read-only and blocks mutations", async () => {
    const user = userEvent.setup();
    const onDecisionChange = vi.fn();
    renderWizard({
      readOnly: true,
      initialState: { ...architectureUploadInitialState, step: "review" },
      onDecisionChange,
    });

    expect(screen.getByText(/read-only view/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "✓ Approve finding" })).toBeDisabled();
    await user.click(screen.getByRole("tab", { name: /finding 2/i }));
    expect(screen.getByRole("heading", { name: "Salesforce CRM" })).toBeVisible();
    expect(onDecisionChange).not.toHaveBeenCalled();
  });

  it("announces a host error and exposes loading state", () => {
    renderWizard({ loading: true, error: "The review service is unavailable." });

    expect(screen.getByRole("alert")).toHaveTextContent("The review service is unavailable.");
    expect(screen.getByLabelText("Architecture evidence upload")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });
});
