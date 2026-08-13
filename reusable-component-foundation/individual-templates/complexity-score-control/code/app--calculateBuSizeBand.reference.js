/* Reference extract: calculateBuSizeBand(...) from app/src/app.js:11073-11079. */

function calculateBuSizeBand(dataSizeTb, tableCount) {
  if (dataSizeTb > 15 || tableCount > 2500) return BU_SIZE_BANDS[4];
  if (dataSizeTb > 10 || tableCount > 2000) return BU_SIZE_BANDS[3];
  if (dataSizeTb > 0.5 || tableCount > 500) return BU_SIZE_BANDS[2];
  if (dataSizeTb > 0.25 || tableCount > 100) return BU_SIZE_BANDS[1];
  return BU_SIZE_BANDS[0];
}
