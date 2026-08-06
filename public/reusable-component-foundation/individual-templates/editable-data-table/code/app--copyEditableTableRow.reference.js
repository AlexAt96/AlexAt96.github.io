/* Reference extract: copyEditableTableRow(...) from app/src/app.js:40080-40099. */

function copyEditableTableRow(button) {
  const row = button.closest("tr");
  if (!row) return;
  const clone = row.cloneNode(true);
  const sourceFields = Array.from(row.querySelectorAll("input, select, textarea"));
  const cloneFields = Array.from(clone.querySelectorAll("input, select, textarea"));
  sourceFields.forEach((field, index) => {
    const copyField = cloneFields[index];
    if (!copyField) return;
    if (field.type === "checkbox" || field.type === "radio") {
      copyField.checked = field.checked;
      return;
    }
    copyField.value = field.value;
  });
  clone.querySelectorAll('input[type="hidden"], input[name="businessUnitId"], input[name="stakeholderId"], input[name="environmentId"]').forEach((input) => {
    input.value = "";
  });
  row.insertAdjacentElement("afterend", clone);
}
