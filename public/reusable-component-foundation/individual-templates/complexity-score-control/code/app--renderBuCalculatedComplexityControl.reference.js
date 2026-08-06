/* Reference extract: renderBuCalculatedComplexityControl(...) from app/src/app.js:11059-11071. */

function renderBuCalculatedComplexityControl(key, label, fieldName, value, score, note) {
  return `
    <section class="bu-complexity-factor-card">
      <div>
        <span class="field-label">${escapeHtml(label)}</span>
        <strong data-complexity-calculated-value="${escapeHtml(key)}">${escapeHtml(value)}</strong>
        <input name="${escapeHtml(fieldName)}" data-complexity-factor="${escapeHtml(key)}" type="hidden" value="${escapeHtml(value)}" />
        <small>${escapeHtml(note)}</small>
      </div>
      <span class="pill" data-complexity-factor-score="${escapeHtml(key)}">${score} pts</span>
    </section>
  `;
}
