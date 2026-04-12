// FSAncestryFeatureParser.js
// Central dispatcher for all FS ancestry feature types.
// Routes each feature to the correct specialized parser.

import { FSAncestryBonusParser } from "./FSAncestryBonusParser.js";
import { FSAncestryChoiceParser } from "./FSAncestryChoiceParser.js";
import { FSAncestrySkillChoiceParser } from "./FSAncestrySkillChoiceParser.js";
import { FSAncestryLanguageChoiceParser } from "./FSAncestryLanguageChoiceParser.js";
import { FSAncestryMultiFeatureParser } from "./FSAncestryMultiFeatureParser.js";

export class FSAncestryFeatureParser {

  /**
   * Main dispatcher.
   * Takes a single FS ancestry feature object and returns an array of DS items.
   */
  static parse(feature) {
    if (!feature || typeof feature !== "object") {
      console.warn("FSAncestryFeatureParser.parse: invalid feature:", feature);
      return [];
    }

    switch (feature.type) {

      // Simple 1:1 features
      case "Size":
      case "Text":
      case "Condition Immunity":
        return this.parseSimple(feature);

      // Bonus feature (numeric modifier)
      case "Bonus":
        return FSAncestryBonusParser.parse(feature);

      // Choice features with nested feature objects
      case "Choice":
        return FSAncestryChoiceParser.parse(feature);

      // Skill Choice (selected: ["Blacksmithing"])
      case "Skill Choice":
        return FSAncestrySkillChoiceParser.parse(feature);

      // Language Choice (selected: ["Vhoric"])
      case "Language Choice":
        return FSAncestryLanguageChoiceParser.parse(feature);

      // Multi-feature bundles
      case "Multiple Features":
        return FSAncestryMultiFeatureParser.parse(feature);

      default:
        console.warn("FSAncestryFeatureParser: Unknown feature type:", feature.type, feature);
        return [];
    }
  }

  /**
   * Simple features that map directly to a DS feature item.
   */
  static parseSimple(feature) {
    return [{
      name: feature.name ?? "Unnamed Feature",
      type: "feature",
      system: {
        description: { value: feature.description ?? "" },
        fsType: feature.type,
        fsData: feature.data ?? {},
        _dsid: feature.id ?? null
      }
    }];
  }
}