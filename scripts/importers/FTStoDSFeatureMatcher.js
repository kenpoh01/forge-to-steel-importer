// importers/FTStoDSFeatureMatcher.js
// Uses FTStoDSCompendium to resolve FS features/abilities to canonical DS items.

export class FTStoDSFeatureMatcher {
  /**
   * @param {FTStoDSCompendium} compendium
   */
  constructor(compendium) {
    this.compendium = compendium; // { index: { normalizedName: [ { pack, entry } ] }, packs: [...] }
  }

  // ---------------------------------------------------------
  // Normalize names for matching
  // ---------------------------------------------------------
  static normalize(name) {
    return name
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[^a-z0-9']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ---------------------------------------------------------
  // Exact match using FTStoDSCompendium.index
  // ---------------------------------------------------------
  findExact(name) {
    const key = FTStoDSFeatureMatcher.normalize(name);
    return this.compendium.index[key] ?? null;
  }

  // ---------------------------------------------------------
  // Fuzzy match (fallback) using FTStoDSCompendium.index
  // ---------------------------------------------------------
  findFuzzy(name) {
    const key = FTStoDSFeatureMatcher.normalize(name);

    for (const k of Object.keys(this.compendium.index)) {
      if (k.includes(key)) return this.compendium.index[k];
    }

    return null;
  }

  // ---------------------------------------------------------
  // Load DS item from compendium
  // ---------------------------------------------------------
  async loadEntry(entry) {
    const { pack, entry: e } = entry;
    const doc = await pack.getDocument(e._id);
    return doc.toObject();
  }

  // ---------------------------------------------------------
  // Main lookup + merge
  // ---------------------------------------------------------
  async resolve(fsFeature) {
    const name = fsFeature.name;
    if (!name) return null;

    // 1. Exact match
    let matches = this.findExact(name);

    // 2. Fuzzy match
    if (!matches) matches = this.findFuzzy(name);

    if (!matches || matches.length === 0) {
      console.warn(`Forge to Steel Importer | No compendium match for FS feature: ${name}`);
      return null;
    }

    // 3. Load first match
    const dsItem = await this.loadEntry(matches[0]);

    // 4. Merge FS data into DS template
    dsItem.system = {
      ...dsItem.system,
      ...(fsFeature.data ?? {}),
      description: {
        value: fsFeature.description ?? dsItem.system?.description?.value ?? ""
      },
      _fsid: fsFeature.id,
      _source: "FS Importer"
    };

    return dsItem;
  }
}