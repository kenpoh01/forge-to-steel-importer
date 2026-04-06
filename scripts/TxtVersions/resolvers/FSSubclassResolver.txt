// scripts/resolvers/FSSubclassResolver.js

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
    console.warn(
      "%c[FSSubclassResolver] resolveSubclasses() CALLED",
      "color: #ff1744; font-size: 16px; font-weight: bold"
    );

    console.groupCollapsed(
      "%cFSSubclassResolver.resolveSubclasses",
      "color:#ffab91; font-weight:bold"
    );

    // Support both FS formats:
    // class.subclasses
    // class.class.subclasses
    const subclasses =
      classData.subclasses ??
      classData.class?.subclasses ??
      [];

    console.log(
      "%c[DEBUG] subclasses array:",
      "color:#ff00ff; font-weight:bold",
      subclasses
    );

    const out = [];

    for (const subclass of subclasses) {
      console.log(
        "%c[SUBCLASS] Found:",
        "color:#ff9800; font-weight:bold",
        subclass?.name,
        "selected =", subclass?.selected
      );

      if (!subclass?.selected) continue;

      console.groupCollapsed(`Subclass: ${subclass.name}`);

      // -----------------------------------------------------
      // A) featuresByLevel
      // -----------------------------------------------------
      console.groupCollapsed("featuresByLevel");

      for (const levelBlock of subclass.featuresByLevel ?? []) {
        const lvl = levelBlock.level ?? 0;

        console.groupCollapsed(`Subclass Level ${lvl}`);
        if (lvl > heroLevel) {
          console.log("→ Skipped (above hero level)");
          console.groupEnd();
          continue;
        }

        for (const feature of levelBlock.features ?? []) {
          console.log("Processing subclass feature:", feature.name, feature.type);
          out.push({ ...feature, _level: lvl });
        }

        console.groupEnd();
      }

      console.groupEnd();

      // -----------------------------------------------------
      // B) levels[] (alternate FS format)
      // -----------------------------------------------------
      console.groupCollapsed("levels[]");

      for (const levelBlock of subclass.levels ?? []) {
        const lvl = levelBlock.level ?? 0;

        console.groupCollapsed(`Subclass Level ${lvl}`);
        if (lvl > heroLevel) {
          console.log("→ Skipped (above hero level)");
          console.groupEnd();
          continue;
        }

        for (const feature of levelBlock.features ?? []) {
          console.log("Processing subclass feature:", feature.name, feature.type);
          out.push({ ...feature, _level: lvl });
        }

        console.groupEnd();
      }

      console.groupEnd();

      // -----------------------------------------------------
      // C) subclass.abilities
      // -----------------------------------------------------
      console.groupCollapsed("subclass.abilities");

      for (const ability of subclass.abilities ?? []) {
        const lvl = FSSubclassResolver.normalizeLevel(ability.minLevel);

        if (lvl > heroLevel) {
          console.log(
            "%c[SUBCLASS:SKIP] Skipping subclass ability above hero level",
            "color:#9e9e9e; font-style:italic",
            { ability: ability.name, abilityLevel: lvl, heroLevel }
          );
          continue;
        }

        console.log("Processing subclass ability:", ability.name);

        out.push({
          ...ability,
          _level: lvl
        });
      }

      console.groupEnd();

      console.groupEnd(); // end subclass
    }

    console.groupCollapsed(
      "%c[SUBCLASS] Final emitted subclass features",
      "color:#a5d6a7; font-weight:bold"
    );
    console.table(
      out.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        level: f._level
      }))
    );
    console.groupEnd();

    // Debug overlay: final subclass feature levels and gating
    console.groupCollapsed(
      "%c[SUBCLASS-RESOLVER] Final Subclass Feature Levels",
      "color:#ffab40; font-weight:bold"
    );

    console.table(
      out.map(f => {
        const rawLevel = f._level ?? f.data?.minLevel ?? null;
        const normalized =
          (typeof f._level === "number" && f._level > 0)
            ? f._level
            : 999;

        return {
          name: f.name,
          id: f.id,
          type: f.type,
          rawLevel,
          normalized,
          heroLevel,
          allowed: normalized <= heroLevel ? "YES" : "NO"
        };
      })
    );

    console.groupEnd();

    console.groupEnd(); // end resolveSubclasses

    return out;
  }
}