// FSAncestryChoiceParser.js
// Handles FS ancestry features of type "Choice".
// These contain nested feature objects inside data.options[].feature.

import { FSAncestryFeatureParser } from "./FSAncestryFeatureParser.js";

export class FSAncestryChoiceParser {

  /**
   * Parse a Choice feature.
   *
   * FS structure:
   * {
   *   id: "...",
   *   name: "...",
   *   type: "Choice",
   *   description: "...",
   *   data: {
   *     options: [
   *       { feature: { id: "...", type: "...", ... } },
   *       { feature: { id: "...", type: "...", ... } }
   *     ],
   *     selected: [
   *       { id: "..." }   // OR sometimes a string
   *     ]
   *   }
   * }
   *
   * Output: DS items for each selected feature.
   */
  static parse(feature) {
    const data = feature.data ?? {};
    const selected = data.selected ?? [];
    const options = data.options ?? [];

    const results = [];

    for (const sel of selected) {

      // Case 1: Selected entry is an object with an ID
      if (sel && typeof sel === "object" && sel.id) {
        const opt = options.find(o => o.feature?.id === sel.id);

        if (!opt) {
          console.warn("FSAncestryChoiceParser: selected feature not found:", sel);
          continue;
        }

        // Recursively parse the nested feature
        const parsed = FSAncestryFeatureParser.parse(opt.feature);
        results.push(...parsed);
        continue;
      }

      // Case 2: Selected entry is a string (rare but valid)
      if (typeof sel === "string") {
        results.push({
          name: sel,
          type: "feature",
          system: {
            description: { value: feature.description ?? "" },
            fsType: "Choice",

            // Preserve raw FS data for debugging
            fsData: data
          }
        });
        continue;
      }

      console.warn("FSAncestryChoiceParser: unexpected selected entry:", sel);
    }

    return results;
  }
}
