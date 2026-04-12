// FSAncestryCultureParser.js
// Handles the ancestry.culture block, which contains:
// - Language Choice
// - Flat languages[]
// - Environment (Skill Choice)
// - Organization (Skill Choice)
// - Upbringing (Skill Choice)

import { FSAncestryFeatureParser } from "./FSAncestryFeatureParser.js";

export class FSAncestryCultureParser {

  /**
   * Parse the culture block of FS ancestry data.
   *
   * FS structure:
   * {
   *   id: "culture-hakaan",
   *   name: "Hakaan",
   *   description: "Rural, communal, labor.",
   *   type: "Ancestral",
   *   language: { ... Language Choice ... },
   *   languages: [],
   *   environment: { ... Skill Choice ... },
   *   organization: { ... Skill Choice ... },
   *   upbringing: { ... Skill Choice ... }
   * }
   *
   * Output: DS items for all culture-derived features.
   */
  static parse(culture) {
    if (!culture || typeof culture !== "object") {
      console.warn("FSAncestryCultureParser: invalid culture block:", culture);
      return [];
    }

    const items = [];

    // 1. Language Choice (selected: ["Vhoric"])
    if (culture.language) {
      items.push(...FSAncestryFeatureParser.parse(culture.language));
    }

    // 2. Flat languages[] (rare but supported)
    if (Array.isArray(culture.languages)) {
      for (const lang of culture.languages) {
        if (typeof lang === "string") {
          items.push({
            name: lang,
            type: "feature",
            system: {
              description: { value: "Language" },
              fsType: "Language",
              _dsid: `lang-${lang}`
            }
          });
        }
      }
    }

    // 3. Environment (Skill Choice)
    if (culture.environment) {
      items.push(...FSAncestryFeatureParser.parse(culture.environment));
    }

    // 4. Organization (Skill Choice)
    if (culture.organization) {
      items.push(...FSAncestryFeatureParser.parse(culture.organization));
    }

    // 5. Upbringing (Skill Choice)
    if (culture.upbringing) {
      items.push(...FSAncestryFeatureParser.parse(culture.upbringing));
    }

    return items;
  }
}
