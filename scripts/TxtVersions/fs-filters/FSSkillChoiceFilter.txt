// scripts/fs-filters/FSSkillChoiceFilter.js

export class FSSkillChoiceFilter {

  static isSkillChoice(fsFeature) {
    return fsFeature.type === "Skill Choice";
  }

  /**
   * Convert FS skill names into DS camelCase keys.
   * Examples:
   *   "Read Person" → "readPerson"
   *   "Handle Animals" → "handleAnimals"
   *   "Psionics" → "psionics"
   */
  static normalizeSkillName(name) {
    if (!name) return "";

    return name
      .toLowerCase()
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) return word; // first word stays lowercase
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join("");
  }

  /**
   * Apply Skill Choice to actor.system.skills.value
   */
  static async apply(actor, fsFeature) {
    if (!this.isSkillChoice(fsFeature)) return;

    const selected = fsFeature.data?.selected ?? [];
    if (!selected.length) return;

    // Current DS skill list
    const current = foundry.utils.getProperty(actor.system, "skills.value") ?? [];

    // Normalize and merge
    const additions = selected.map(s => this.normalizeSkillName(s));
    const merged = Array.from(new Set([...current, ...additions]));

    console.log("[FSSkillChoiceFilter] Setting skills.value:", merged);

    await actor.update({
      "system.skills.value": merged
    });
  }
}