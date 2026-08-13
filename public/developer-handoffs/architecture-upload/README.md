# Architecture upload wizard — developer handoff

This folder is the complete React + TypeScript handoff for the live four-step Architecture upload pattern. It includes the component, visual styles, domain types, realistic fixtures, transport contracts, adapter functions, a host integration example, and behaviour tests.

The wizard owns temporary interaction state. Your application owns persistence, evidence upload, finding edits, requests for more evidence, analytics, routing, and the final scope mutation.

## What is implemented

1. **Environments** — multi-select environment state with a required-selection gate.
2. **Documents** — document-purpose state, native file selection, accepted formats, file-size validation, removal, and an async upload callback.
3. **AI review** — keyboard-accessible finding tabs, evidence excerpts, confidence and source metadata, approve, decline, undo, edit, and request-evidence callbacks.
4. **Confirm scope** — approved/declined summary, approved-record preview, an explicit approved-finding gate, async completion, success, error, loading, and read-only states.

## Files

| File | Purpose |
| --- | --- |
| `ArchitectureUploadWizard.tsx` | Complete interactive component and state transitions |
| `ArchitectureUploadWizard.module.css` | Responsive, themeable CSS module matching the live specimen |
| `architecture-upload.types.ts` | UI/domain types and complete prop contract |
| `architecture-upload.fixtures.ts` | Live Architecture example data and copy |
| `architecture-upload.contract.ts` | Serialisable API DTOs and adapter port |
| `architecture-upload.adapter.ts` | API-to-view-model mapping and request serializers |
| `StatusDot.tsx` | Accessible status primitive used by the wizard |
| `ArchitectureUploadWizard.example.tsx` | Host-owned loading, error, callbacks, and completion example |
| `ArchitectureUploadWizard.test.tsx` | Full-flow, gate, keyboard, undo, read-only, loading, and error tests |
| `index.ts` | Public exports |

## Run this handoff

This directory has an isolated `package.json`:

```bash
cd public/developer-handoffs/architecture-upload
npm install
npm run check
npm test
```

For an existing React application, copy the source files into one component folder and install no runtime dependency beyond React. CSS Modules must be supported by the host build (Next.js, Vite, Remix, and most modern React toolchains support them).

## Minimal use

```tsx
import {
  ArchitectureUploadWizard,
  architectureDocumentTypes,
  architectureEnvironments,
  architectureFindings,
  architectureUploadCopy,
  architectureUploadInitialState,
} from "./architecture-upload";

export function ArchitectureRoute() {
  return (
    <ArchitectureUploadWizard
      environments={architectureEnvironments}
      documentTypes={architectureDocumentTypes}
      findings={architectureFindings}
      copy={architectureUploadCopy}
      initialState={architectureUploadInitialState}
      onFileChange={async (_metadata, nativeFile) => {
        if (nativeFile) await uploadEvidence(nativeFile);
      }}
      onDecisionChange={({ finding, decision }) => {
        saveDecision(finding.id, decision);
      }}
      onEditFinding={({ finding }) => openFindingEditor(finding.id)}
      onRequestEvidence={({ finding }) => requestEvidence(finding.id)}
      onComplete={async (snapshot) => createScope(snapshot)}
    />
  );
}
```

`initialState` is read once, like `defaultValue` on a native input. To replace the entire run, give the component a React `key` based on the run ID:

```tsx
<ArchitectureUploadWizard key={run.id} initialState={run.initialState} {...props} />
```

## Host callback contract

| Callback | When it runs | Host responsibility |
| --- | --- | --- |
| `onStateChange(snapshot)` | After any user-driven state change | Optional autosave, analytics, or parent mirroring |
| `onStepChange(step, snapshot)` | On rail, Back, or Continue navigation | Optional route/analytics update |
| `onEnvironmentChange(ids, snapshot)` | Environment toggled | Persist the selected environment IDs |
| `onDocumentTypeChange(type, snapshot)` | Document type changed | Persist or map the display label to an API ID |
| `onFileChange(file, nativeFile, snapshot)` | File selected or removed | Upload/delete evidence; return server-backed `EvidenceFile` metadata to replace the temporary local ID |
| `onDecisionChange(context)` | Approve, decline, or undo | Persist the human decision and audit metadata |
| `onEditFinding(context)` | Edit details selected | Open a host-owned form or route |
| `onRequestEvidence(context)` | Request evidence selected | Open the host workflow/message composer |
| `onComplete(snapshot)` | Enabled completion selected | Perform the final scope mutation; reject/throw to expose an error |

The component awaits `onFileChange` and `onComplete`. While either promise is pending it sets `aria-busy`, announces progress, and prevents duplicate mutations. If file upload fails, it restores the previous evidence metadata and exposes the thrown message. Pass external `loading` and `error` for request state owned above the component.

## API integration

`architecture-upload.contract.ts` defines a framework-neutral `ArchitectureUploadAdapter`. Implement it with the data layer used by your application:

```ts
const adapter: ArchitectureUploadAdapter = {
  load: (signal) => fetch("/api/architecture/run/ARC-2026-018", { signal }).then(readJson),
  uploadEvidence: (file, context, signal) => uploadMultipart(file, context, signal),
  saveDraft: (request, signal) => postJson("/api/architecture/draft", request, signal),
  complete: (request, signal) => postJson("/api/architecture/complete", request, signal),
};
```

Use `toArchitectureUploadViewModel(response)` after `load()`, `toDraftRequest(...)` for autosave, and `toCompletionRequest(...)` for the final call. The runtime assertion rejects missing run metadata, environment options, document types, or findings before they reach the UI.

The API response should return a stable evidence ID after upload. Map it with `apiEvidenceToEvidenceFile(...)` and return that value from `onFileChange`; the wizard then replaces its temporary browser-derived ID before completion.

## State and gates

- Step 1 Continue requires at least one environment.
- Step 2 Continue requires evidence metadata.
- Step 3 can contain pending decisions; pending records remain excluded from scope.
- Step 4 completion requires at least one approved finding.
- Changing environments, document metadata, evidence, or a decision clears the completed state.
- Direct rail navigation remains available to inspect the whole flow, matching the live pattern. Mutation controls are independently gated.
- `readOnly` preserves navigation and finding inspection while disabling selection, decision, upload, removal, and completion mutations.

## Accessibility

- The rail is an ordered, labelled progress navigation and the current item uses `aria-current="step"`.
- Mobile progress is always expressed as visible text, not colour alone.
- Finding navigation uses `tablist`, `tab`, and `tabpanel` semantics with roving `tabIndex`.
- Arrow keys move between findings; Home and End select the first and last finding.
- Decisions include written status, and status colour is always paired with text.
- Loading, errors, selection progress, and completion are announced through status/alert semantics.
- Environment and file controls retain native input behaviour and visible `:focus-visible` treatment.
- Reduced-motion preferences disable progress animation and the loading spinner animation.

## Styling and theming

Pass a host class through the `className` prop and override CSS custom properties on that class (load the host override after the CSS module):

```css
.architectureHost {
  --au-primary: #005eb8;
  --au-primary-soft: #eef6ff;
  --au-success: #177245;
  --au-canvas: #f5f7fa;
  --au-surface: #ffffff;
  --au-text: #18212f;
  --au-border: #d6dde6;
}
```

The layout collapses from a rail-and-content presentation to a labelled mobile progress header below 700px. No JavaScript viewport check is required.

## Production notes

- Do not send a browser `File` in JSON. Upload it using multipart/form-data or signed object storage, then persist the returned evidence ID.
- Enforce accepted MIME types and file size on the server; client validation is only early feedback.
- Store decision actor, timestamp, prior value, and source version in the host audit model.
- Treat extracted findings as untrusted content and escape/sanitise any rich text before rendering. This component renders excerpts as plain React text.
- Abort stale load/upload calls when a user changes run or leaves the route.
- Supply translated `copy`, option labels, and number formatting from the host localisation layer if required.
