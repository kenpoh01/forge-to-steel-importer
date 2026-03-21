// helpers/matchOriginItem.js
// Shared fuzzy-matching helper for ancestry, culture, upbringing, career, etc.

function normalizeName(name) {
  return name
    ?.toLowerCase()
    .replace(/\(.*?\)/g, "")        // remove parentheses like "(wode)"
    .replace(/culture/g, "")        // remove "culture"
    .replace(/ancestry/g, "")       // remove "ancestry"
    .replace(/upbringing/g, "")     // remove "upbringing"
    .replace(/career/g, "")         // remove "career"
    .replace(/class/g, "")          // remove "class"
    .replace(/-/g, " ")             // hyphens → spaces
    .trim()
    .replace(/\s+/g, " ");          // collapse multiple spaces
}

export async function matchOriginItem(pack, fsId, fsName, expectedType) {
  if (!pack) return null;

  // Ensure index is loaded
  await pack.getIndex();
  const index = [...pack.index.values()];

  // Filter by expected type first
  const filtered = index.filter(e => e.type === expectedType);

  // Normalize FS name once
  const normFS = normalizeName(fsName);

  // 1. Match by ID
  if (fsId) {
    const byId = filtered.find(e => e._id === fsId);
    if (byId) return byId;
  }

  // 2. Exact normalized match
  const exact = filtered.find(e => normalizeName(e.name) === normFS);
  if (exact) return exact;

  // 3. Starts-with normalized
  const starts = filtered.find(e => normalizeName(e.name).startsWith(normFS));
  if (starts) return starts;

  // 4. Contains normalized
  const contains = filtered.find(e => normalizeName(e.name).includes(normFS));
  if (contains) return contains;

  return null;
}