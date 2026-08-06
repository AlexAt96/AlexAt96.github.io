/* Reference extract: renderKnowledgeAccessTask(...) from app/src/app.js:9035-9075. */

function renderKnowledgeAccessTask(phase, item, bu = getSelectedBu()) {
  const access = getKnowledgeRepoAccessForBu(bu.id);
  return `
    ${detailHeader("Knowledge base and repo access", "BU Leads provide links or supporting documents for their knowledge base and source repositories.")}
    ${renderDiscoveryTeamAccessList()}
    <form class="collection-access-form" data-business-unit-id="${escapeHtml(bu.id)}" data-section-key="${escapeHtml(item.key)}">
      <label class="form-wide">
        <span>Knowledge base or repository link</span>
        <input name="knowledgeLink" type="url" placeholder="https://..." value="${escapeHtml(access.knowledge_link || access.repository_link || "")}" />
      </label>
      <label class="form-wide">
        <span>Additional repository link</span>
        <input name="repositoryLink" type="url" placeholder="https://..." value="${escapeHtml(access.repository_link && access.repository_link !== access.knowledge_link ? access.repository_link : "")}" />
      </label>
      <label class="form-wide">
        <span>Supporting document</span>
        <input name="knowledgeDocument" type="file" accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.json,.png,.jpg,.jpeg" />
      </label>
      <label class="form-wide">
        <span>Notes</span>
        <textarea name="notes" rows="4" placeholder="Any context, access caveats, or folder/repo instructions.">${escapeHtml(access.notes || "")}</textarea>
      </label>
      <label class="checkbox-field form-wide">
        <input name="shareConfirmed" type="checkbox"${access.share_confirmed ? " checked" : ""} />
        <span>I confirm this knowledge base/repository information can be shared with the discovery team.</span>
      </label>
      <label class="checkbox-field form-wide">
        <input name="currentConfirmed" type="checkbox"${access.current_confirmed ? " checked" : ""} />
        <span>I confirm this information is up to date.</span>
      </label>
      <label class="checkbox-field form-wide">
        <input name="teamAccessConfirmed" type="checkbox"${access.team_access_confirmed ? " checked" : ""} />
        <span>I confirm relevant team members have been given access.</span>
      </label>
      <div class="button-row form-wide">
        <button class="icon-button ghost collection-task-status-action" type="button" data-status="In progress"><svg><use href="#icon-save"></use></svg><span>Save progress</span></button>
        <button class="icon-button primary collection-task-status-action" type="button" data-status="Completed"><svg><use href="#icon-check"></use></svg><span>Confirm complete</span></button>
      </div>
    </form>
  `;
}
