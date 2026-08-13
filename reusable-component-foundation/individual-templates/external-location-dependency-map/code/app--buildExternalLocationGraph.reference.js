/* Reference extract: buildExternalLocationGraph(...) from app/src/app.js:14722-14775. */

function buildExternalLocationGraph(rows = []) {
  const typeColors = ["#24d18f", "#4fb3ff", "#f0b429", "#e31937", "#9b7cff", "#63d7f6"];
  const groupsByType = new Map();
  const businessUnits = new Map();
  const environments = new Map();
  const externals = new Map();
  rows.forEach((row) => {
    const type = row.connectionType || "External connection";
    const externalKey = `external:${normaliseImportHeader(row.connectionName) || row.id}`;
    const environmentKey = getExternalEnvironmentKey(row);
    if (!groupsByType.has(type)) {
      groupsByType.set(type, {
        type,
        color: typeColors[groupsByType.size % typeColors.length],
        edges: [],
      });
    }
    businessUnits.set(row.businessUnitId || row.businessUnitName, row.businessUnitName);
    if (!externals.has(externalKey)) {
      externals.set(externalKey, {
        key: externalKey,
        label: row.connectionName,
        sublabel: row.connectionType,
      });
    }
    if (!environments.has(environmentKey)) {
      environments.set(environmentKey, {
        key: environmentKey,
        label: row.environmentLabel,
        sublabel: row.businessUnitName,
      });
    }
    groupsByType.get(type).edges.push({
      id: row.id,
      type,
      direction: normaliseExternalConnectionDirection(row.direction),
      rawDirection: row.direction || "",
      externalKey,
      environmentKey,
      external: externals.get(externalKey),
      environment: environments.get(environmentKey),
      sourceDocumentType: row.sourceDocumentType,
      validationStatus: row.validationStatus,
      evidenceText: row.evidenceText,
    });
  });
  return {
    businessUnits,
    environments,
    externals,
    edges: Array.from(groupsByType.values()).flatMap((group) => group.edges),
    groups: Array.from(groupsByType.values()).sort((a, b) => a.type.localeCompare(b.type)),
  };
}
