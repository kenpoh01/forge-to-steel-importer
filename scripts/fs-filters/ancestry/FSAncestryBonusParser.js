// FSAncestryBonusParser.js
// Handles FS ancestry features of type "Bonus".
// These map cleanly to DS bonus-style feature items.

export class FSAncestryBonusParser {

  /**
   * Parse a Bonus feature into a DS item.
   * FS structure:
   * {
   *   id: "...",
   *   name: "...",
   *   type: "Bonus",
   *   description: "...",
   *   data: {
   *     field: "Forced Movement: Push",
   *     value: 1
   *   }
   * }
   */
  static parse(feature) {
    const data = feature.data ?? {};

    return [{
      name: feature.name ?? "Bonus",
      type: "feature",
      system: {
        description: { value: feature.description ?? "" },

        // FS metadata for debugging + traceability
        fsType: "Bonus",

        // DS bonus fields (you may adjust these if DS schema differs)
        bonus: {
          field: data.field ?? "",
          value: data.value ?? 0
        },

        // Preserve raw FS data for debugging or future schema drift
        fsData: data
      }
    }];
  }
}