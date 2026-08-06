/* Reference extract: getKnowledgeAccessPayload(...) from app/src/app.js:40204-40215. */

async function getKnowledgeAccessPayload(form, status) {
  return {
    status,
    knowledgeLink: form.querySelector('input[name="knowledgeLink"]')?.value.trim() || "",
    repositoryLink: form.querySelector('input[name="repositoryLink"]')?.value.trim() || "",
    notes: form.querySelector('textarea[name="notes"]')?.value.trim() || "",
    shareConfirmed: form.querySelector('input[name="shareConfirmed"]')?.checked === true,
    currentConfirmed: form.querySelector('input[name="currentConfirmed"]')?.checked === true,
    teamAccessConfirmed: form.querySelector('input[name="teamAccessConfirmed"]')?.checked === true,
    attachments: await readFilesAsAttachments(form.querySelector('input[name="knowledgeDocument"]')?.files || []),
  };
}
