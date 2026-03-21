// FTStoDSCompendium.js
// Loads Draw Steel compendiums and resolves names to canonical Items.

const PACK_IDS = [
  "draw-steel.abilities",
  "draw-steel.classes",
  "draw-steel.origins",
  "draw-steel.character-options",
  "draw-steel.rewards"
  // "draw-steel.monster-features" // optional, usually not needed for heroes
];

export class FTStoDSCompendium {
  constructor() {
    this.index = {};
    this.packs = [];
  }

  /**
   * Load all compendium indexes and build a lookup table.
   */
  async initialize() {
    console.log("Forge to Steel Importer | Initializing compendium index…");

    for (const id of PACK_IDS) {
      const pack = game.packs.get(id);

      if (!pack) {
        console.warn(`Forge to Steel Importer | Missing compendium: ${id}`);
        continue;
      }

      this.packs.push(pack);

      // Ensure index is loaded
      await pack.getIndex();

      for (const entry of pack.index) {
        const key = entry.name.toLowerCase();

        if (!this.index[key]) {
          this.index[key] = [];
        }

        this.index[key].push({ pack, entry });
      }
    }

    console.log("Forge to Steel Importer | Compendium index built:", this.index);
  }

  /**
   * Resolve a list of names to actual compendium documents.
   * Returns an array of Item data objects.
   */
  async resolveNames(names) {
    const results = [];

    for (const name of names) {
      const key = name.toLowerCase();
      const matches = this.index[key];

      if (!matches || matches.length === 0) {
        console.warn(`Forge to Steel Importer | No match for: ${name}`);
        continue;
      }

      // For now: take the first match
      const { pack, entry } = matches[0];
      const doc = await pack.getDocument(entry._id);
      const obj = doc.toObject();

      // Keep original name for debugging
      obj._sourceName = name;

      results.push(obj);
    }

    return results;
  }
}