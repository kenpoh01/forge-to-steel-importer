// FSAncestrySkillChoiceParser.js
// Handles FS ancestry features of type "Skill Choice".
// These always use string-based selections (e.g., "Blacksmithing").
// No nested feature objects exist in this schema.

export class FSAncestrySkillChoiceParser {

  /**
   * Parse a Skill Choice feature.
   *
   * FS structure:
   * {
   *   id: "...",
   *   name: "...",
   *   type: "Skill Choice",
   *   description: "...",
   *   data: {
   *     listOptions: ["Crafting", "Lore"],
   *     options: [],                // sometimes present, often empty
   *     selected: ["Blacksmithing"],
   *     count: 1
   *   }
   * }
   *
   * Output: one DS feature item per selected skill.
   */
  static parse(feature) {
    const data = feature.data ?? {};
    const selected = data.selected ?? [];

    const results = [];

    for (const sel of selected) {
      // Selected entries are always strings for Skill Choice
      if (typeof sel === "string") {
        results.push({
          name: sel,
          type: "feature",
          system: {
            description: { value: feature.description ?? "" },

            // FS metadata for debugging + traceability
            fsType: "Skill Choice",

            // Preserve raw FS data for debugging or future schema drift
            fsData: data
          }
        });
      }
      else {
        console.warn("FSAncestrySkillChoiceParser: unexpected selected entry:", sel);
      }
    }

    return results;
  }
}