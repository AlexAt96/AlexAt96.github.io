/* Reference extract: parseImportTableRowsFromFile(...) from app/src/app.js:40577-40585. */

async function parseImportTableRowsFromFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const lowerName = String(file.name || "").toLowerCase();
  if (lowerName.endsWith(".csv")) return parseCsvRows(decodeBytes(bytes));
  if (looksLikeZip(bytes)) return parseXlsxRows(bytes);
  const text = decodeBytes(bytes);
  return /<table|<html|<tr/i.test(text) ? parseHtmlTableRows(text) : parseCsvRows(text);
}
