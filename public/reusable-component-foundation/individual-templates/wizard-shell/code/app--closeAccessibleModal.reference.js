/* Reference extract: closeAccessibleModal(...) from app/src/app.js:38721-38729. */

function closeAccessibleModal(modal, { restoreFocus = true } = {}) {
  if (!modal) return;
  const state = accessibleModalState.get(modal);
  modal.hidden = true;
  if (state?.closeHandler) document.removeEventListener("keydown", state.closeHandler, true);
  accessibleModalState.delete(modal);
  if (!hasOpenBlockingModal()) document.body.classList.remove("modal-open");
  if (restoreFocus && state?.previousFocus?.focus) state.previousFocus.focus({ preventScroll: true });
}
