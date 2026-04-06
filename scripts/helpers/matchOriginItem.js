// resolvers/matchOriginItem.js
// STRICT matcher — prevents cross‑subclass contamination

function normalizeName(name) {
  return name
    ?.toLowerCase()
    .replace(/\(.*?\)/g, "")   // remove parentheses
    .replace(/-/g, " ")        // hyphens → spaces
    .trim()
    .replace(/\s+/g, " ");     // collapse spaces
}

export async function matchOriginItem(pack, fsId, fsName, expectedType) {
  if (!pack) return null;

  // Ensure index is loaded
  await pack.getIndex();
  const index = [...pack.index.values()];

  // Filter by expected type
  const filtered = index.filter(e => e.type === expectedType);

  // Normalize FS name once
  const normFS = normalizeName(fsName);

  // ---------------------------------------------------------
  // 1. Match by ID (always safe)
  // ---------------------------------------------------------
  if (fsId) {
    const byId = filtered.find(e => e._id === fsId);
    if (byId) return byId;
  }

  // ---------------------------------------------------------
  // 2. Exact name match (case‑insensitive)
  // ---------------------------------------------------------
  const exact = filtered.find(e => e.name.toLowerCase() === fsName.toLowerCase());
  if (exact) return exact;

  // ---------------------------------------------------------
  // 3. Exact normalized match (still strict)
  // ---------------------------------------------------------
  const exactNorm = filtered.find(e => normalizeName(e.name) === normFS);
  if (exactNorm) return exactNorm;

  // ---------------------------------------------------------
  // NO starts‑with
  // NO contains
  // NO fuzzy matching
  // ---------------------------------------------------------

  return null;
}