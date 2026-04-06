// scripts/fs-filters/FSPerkFilter.js

export class FSPerkFilter {

  static isPerk(fsFeature) {
    return fsFeature.type === "Perk";
  }

  static normalizeSkillName(name) {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1))
      .join("");
  }

  /**
   * Apply perk effects.
   * Returns FS-style feature objects for feature perks,
   * or updates actor skills for skill perks.
   */
  static async apply(actor, fsFeature) {
    if (!this.isPerk(fsFeature)) return [];

    console.log(
      "%c[FSPerkFilter] Processing Perk:",
      "color:#ff9800; font-weight:bold",
      fsFeature
    );

    const selected = fsFeature.data?.selected ?? [];
    if (!selected.length) {
      console.log("%c[FSPerkFilter] No selected perk → ignoring.", "color:#ffb74d");
      return [];
    }

    const perk = selected[0];

    if (!perk.name) {
      console.warn("%c[FSPerkFilter] Selected perk has no name → ignoring.", "color:#f44336");
      return [];
    }

    console.log(
      "%c[FSPerkFilter] Selected perk:",
      "color:#ff9800; font-weight:bold",
      perk
    );

    // ---------------------------------------------------------
    // CASE 1 — Feature Perk (has description)
    // Emit FS-style feature so the compendium matcher handles it.
    // ---------------------------------------------------------
    if (perk.description) {
      console.log(
        `%c[FSPerkFilter] Feature perk detected → emitting FS-style feature: ${perk.name}`,
        "color:#42a5f5; font-weight:bold"
      );

      return [
        {
          id: perk.id,
          name: perk.name,
          type: "Feature",
          description: perk.description ?? "",
          data: perk.data ?? {},
          _parentId: fsFeature.id
        }
      ];
    }

    // ---------------------------------------------------------
    // CASE 2 — Skill Perk (no description)
    // Directly updates actor.system.skills.value
    // ---------------------------------------------------------
    if (perk.list) {
      const key = this.normalizeSkillName(perk.list);

      console.log(
        `%c[FSPerkFilter] Skill perk detected → granting skill: ${key}`,
        "color:#4caf50; font-weight:bold"
      );

      const current =
        foundry.utils.getProperty(actor.system, "skills.value") ?? [];

      const merged = Array.from(new Set([...current, key]));

      await actor.update({
        "system.skills.value": merged
      });

      return [];
    }

    console.warn("%c[FSPerkFilter] Unknown perk type → ignoring.", "color:#f44336");
    return [];
  }
}