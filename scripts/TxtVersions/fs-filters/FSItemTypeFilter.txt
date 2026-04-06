export class FSItemTypeFilter {

  // ---------------------------------------------------------
  // IGNORE FS WRAPPER TYPES + NON-ITEM TYPES + STATS
  // ---------------------------------------------------------
  static ignore(fsFeature) {
    const t = fsFeature.type;
    const name = fsFeature.name;

    // Wrapper types that should NEVER become DS items
    const WRAPPERS = [
      "Perk",
      "Skill Choice",
      "Choice",
      "Multiple Features",
      "Package Content",
      "Text"
    ];

    // FS bookkeeping types handled elsewhere
    const NON_ITEMS = [
      "Bonus",
      "Heroic Resource",
      "Stamina",
      "Recoveries",
      "Ability Damage",
      "Damage Modifier"
    ];

    // FS stat names that should never become DS items
    const STAT_NAMES = [
      "Might",
      "Intuition",
      "Agility",
      "Reason",
      "Presence"
    ];

    if (WRAPPERS.includes(t)) return true;
    if (NON_ITEMS.includes(t)) return true;
    if (STAT_NAMES.includes(name)) return true;

    // Everything else should pass through to the compendium matcher
    return false;
  }
}