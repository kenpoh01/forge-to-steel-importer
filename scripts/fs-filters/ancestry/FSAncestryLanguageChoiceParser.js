// FSAncestryLanguageChoiceParser.js
// Handles FS ancestry features of type "Language Choice".
// These always use string-based selections (e.g., "Vhoric").
// No nested feature objects exist in this schema.

export class FSAncestryLanguageChoiceParser {

  /**
   * Parse a Language Choice feature.
   *
   * FS structure:
   * {
   *   id: "...",
   *   name: "Language",
   *   type: "Language Choice",
   *   data: {
   *     selected: ["Vhoric"],
   *     count: 1
   *   }
   * }
   *
   * Output: one DS feature item per selected language.
   */
  static parse(feature) {
    const data = feature.data ?? {};
    const selected = data.selected ?? [];

    const results = [];

    for (const lang of selected) {
      if (typeof lang === "string") {
        results.push({
          name: lang,
          type: "feature",
          system: {
            description: { value: "Language" },

            // FS metadata for debugging + traceability
            fsType: "Language Choice",

            // Preserve raw FS data for debugging or future schema drift
            fsData: data
          }
        });
      }
      else {
        console.warn("FSAncestryLanguageChoiceParser: unexpected selected entry:", lang);
      }
    }

    return results;
  }
}