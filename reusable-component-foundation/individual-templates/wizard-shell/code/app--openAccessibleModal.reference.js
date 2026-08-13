/* Reference extract: openAccessibleModal(...) from app/src/app.js:38676-38719. */

function openAccessibleModal(modal, { initialFocusSelector = "", onRequestClose = null } = {}) {
  if (!modal) return;
  const previousFocus = document.activeElement;
  const dialog = modal.matches?.("[role='dialog'], [role='alertdialog']")
    ? modal
    : modal.querySelector?.("[role='dialog'], [role='alertdialog']");
  if (dialog) {
    if (!dialog.hasAttribute("aria-modal")) dialog.setAttribute("aria-modal", "true");
    if (!dialog.hasAttribute("tabindex")) dialog.setAttribute("tabindex", "-1");
  }
  const closeHandler = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      const state = accessibleModalState.get(modal);
      if (typeof state?.onRequestClose === "function") state.onRequestClose();
      else closeAccessibleModal(modal);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(modal);
    if (!focusable.length) {
      event.preventDefault();
      modal.focus?.();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  accessibleModalState.set(modal, { previousFocus, closeHandler, onRequestClose });
  modal.hidden = false;
  if (!modal.hasAttribute("tabindex")) modal.setAttribute("tabindex", "-1");
  document.body.classList.add("modal-open");
  document.addEventListener("keydown", closeHandler, true);
  const focusTarget = initialFocusSelector ? modal.querySelector(initialFocusSelector) : null;
  const fallbackTarget = focusTarget || getFocusableElements(modal)[0] || dialog || modal;
  window.setTimeout(() => fallbackTarget?.focus?.({ preventScroll: true }), 0);
}
