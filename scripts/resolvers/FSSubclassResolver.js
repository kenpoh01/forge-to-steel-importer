// FSSubclassResolver.js
// Resolves subclass features for the selected subclass.

export class FSSubclassResolver {

  /**
   * Normalize FS minLevel values.
   * Missing, null, 0, or invalid → treat as 999 (never allowed for low-level heroes).
   */
  static normalizeLevel(lvl) {
    if (typeof lvl !== "number" || isNaN(lvl) || lvl <= 0) return 999;
    return lvl;
  }

  /**
   * Resolve all subclass features for the selected subclass.
   * Returns a flat array of features with _level applied.
   */
  static resolveSubclasses(classData, heroLevel) {

    // Support both FS formats:
    // class.subclasses
    // class.class.subclasses
    const subclasses =
      classData.subclasses ??
      classData.class?.subclasses ??
      [];

    const out = [];

    for (const subclass of subclasses) {
      if (!subclass?.selected) continue;

      // -----------------------------------------------------
      // A) featuresByLevel
      // -----------------------------------------------------
      for (const levelBlock of subclass.featuresByLevel ?? []) {
        const lvl = levelBlock.level ?? 0;
        if (lvl > heroLevel) continue;

        for (const feature of levelBlock.features ?? []) {
          out.push({ ...feature, _level: lvl });
        }
      }

      // -----------------------------------------------------
      // B) levels[] (alternate FS format)
      // -----------------------------------------------------
      for (const levelBlock of subclass.levels ?? []) {
        const lvl = levelBlock.level ?? 0;
        if (lvl > heroLevel) continue;

        for (const feature of levelBlock.features ?? []) {
          out.push({ ...feature, _level: lvl });
        }
      }

      // -----------------------------------------------------
      // C) subclass.abilities
      // -----------------------------------------------------
      for (const ability of subclass.abilities ?? []) {
        const lvl = FSSubclassResolver.normalizeLevel(ability.minLevel);
        if (lvl > heroLevel) continue;

        out.push({
          ...ability,
          _level: lvl
        });
      }
    }

    return out;
  }
}
