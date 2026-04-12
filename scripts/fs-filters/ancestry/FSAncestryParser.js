// FSAncestryParser.js
// Extracts ancestry features as FS-style feature objects.
// Does NOT create DS items directly. The ActorBuilder handles matching + creation.

import { FSAncestryFeatureParser } from "./FSAncestryFeatureParser.js";
import { FSAncestryCultureParser } from "./FSAncestryCultureParser.js";

export class FSAncestryParser {

  /**
   * Extract ancestry data from the FS hero file.
   * Returns a flat array of FS-style feature objects that the builder
   * will merge into the compendium-matching pipeline.
   */
  static extract(fsData) {
    const ancestry = fsData?.ancestry;
    if (!ancestry) return [];

    const results = [];

    // Core ancestry features (Size, Bonus, Choice, MultiFeature, etc.)
    const features = Array.isArray(ancestry.features) ? ancestry.features : [];
    for (const f of features) {
      const parsed = FSAncestryFeatureParser.parse(f);
      results.push(...parsed);
    }

    // Culture block (languages, environment, organization, upbringing, etc.)
    if (ancestry.culture) {
      const parsedCulture = FSAncestryCultureParser.parse(ancestry.culture);
      results.push(...parsedCulture);
    }

    return results; // FS-style objects, NOT DS items
  }

  /**
   * No-op. Ancestry items are no longer created here.
   * The ActorBuilder handles compendium matching + DS item creation.
   */
  static async apply(actor, ancestryFeatures) {
    return;
  }
}
