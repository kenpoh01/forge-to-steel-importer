// FSAncestryMultiFeatureParser.js
// Handles FS ancestry features of type "Multiple Features".
// These contain an array of nested feature objects that must each be parsed.

import { FSAncestryFeatureParser } from "./FSAncestryFeatureParser.js";

export class FSAncestryMultiFeatureParser {

  /**
   * Parse a Multiple Features block.
   *
   * FS structure:
   * {
   *   id: "...",
   *   name: "...",
   *   type: "Multiple Features",
   *   data: {
   *     features: [
   *       { id: "...", type: "Bonus", ... },
   *       { id: "...", type: "Text", ... },
   *       ...
   *     ]
   *   }
   * }
   *
   * Output: DS items for each nested feature.
   */
  static parse(feature) {
    const data = feature.data ?? {};
    const subFeatures = data.features ?? [];

    const results = [];

    for (const sub of subFeatures) {
      // Recursively parse each nested feature
      const parsed = FSAncestryFeatureParser.parse(sub);
      results.push(...parsed);
    }

    return results;
  }
}
