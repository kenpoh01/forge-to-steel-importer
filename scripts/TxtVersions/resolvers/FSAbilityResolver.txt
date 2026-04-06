// scripts/resolvers/FSAbilityResolver.js

export class FSAbilityResolver {

  /**
   * Expand features into final ability list.
   * Uses ONLY feature._level for gating.
   * No minLevel logic. No fallbacks. Deterministic.
   */
  static expand(features, fsData, heroLevel) {

    console.groupCollapsed("%cFSAbilityResolver.expand", "color: #4ea1ff; font-weight: bold");
    console.log("Hero Level:", heroLevel);

    // ---------------------------------------------------------
    // Build ability index (class + selected subclass only)
    // ---------------------------------------------------------
    const abilityIndex = new Map();
    const addAbilities = (arr, label) => {
      if (!Array.isArray(arr)) return;
      for (const ability of arr) {
        if (ability && ability.id) {
          abilityIndex.set(ability.id, ability);
          console.log(`Indexed ability [${label}]:`, ability.id, ability.name);
        }
      }
    };

    // Base FS ability pools
    addAbilities(fsData?.abilities, "fsData.abilities");
    addAbilities(fsData?.class?.abilities, "class.abilities");

    for (const lvl of fsData?.class?.levels ?? []) {
      addAbilities(lvl?.abilities, `class.levels[${lvl?.level}]`);
    }

    // ---------------------------------------------------------
    // Index ONLY the selected subclass abilities
    // ---------------------------------------------------------
    const subclassId =
      fsData.class?.subclassID ??
      fsData.class?.subclassId ??
      fsData.class?.selectedSubclass ??
      null;

    let selectedSubclass = null;

    if (subclassId && Array.isArray(fsData.class?.subclasses)) {
      selectedSubclass = fsData.class.subclasses.find(sc => sc.id === subclassId);
    }

    if (selectedSubclass) {

      // ---------------------------------------------------------
      // DIAGNOSTIC LOGGING — SHOW ALL SUBCLASS ABILITIES
      // ---------------------------------------------------------
      console.groupCollapsed(
        `%c[SUBCLASS ABILITIES DETECTED] ${selectedSubclass.name} (${selectedSubclass.id})`,
        "color:#9c27b0; font-weight:bold"
      );

      // Base abilities
      if (Array.isArray(selectedSubclass.abilities)) {
        console.groupCollapsed("Base Abilities");
        for (const ab of selectedSubclass.abilities) {
          console.log("[abilities]", ab.id, ab.name);
        }
        console.groupEnd();
      }

      // Level-based abilities
      if (Array.isArray(selectedSubclass.levels)) {
        for (const lvl of selectedSubclass.levels) {
          console.groupCollapsed(`Level ${lvl.level}`);
          for (const ab of lvl.abilities ?? []) {
            console.log("[levels]", ab.id, ab.name);
          }
          console.groupEnd();
        }
      }

      // featuresByLevel abilities
      if (Array.isArray(selectedSubclass.featuresByLevel)) {
        for (const lvl of selectedSubclass.featuresByLevel) {
          console.groupCollapsed(`Feature Level ${lvl.level}`);
          for (const ab of lvl.abilities ?? []) {
            console.log("[featuresByLevel]", ab.id, ab.name);
          }
          console.groupEnd();
        }
      }

      console.groupEnd(); // END diagnostic logging

      // Actual indexing
      addAbilities(selectedSubclass.abilities, `subclass(${selectedSubclass.name}).abilities`);

      for (const lvl of selectedSubclass.levels ?? []) {
        addAbilities(
          lvl?.abilities,
          `subclass(${selectedSubclass.name}).levels[${lvl?.level}]`
        );
      }

      for (const lvl of selectedSubclass.featuresByLevel ?? []) {
        addAbilities(
          lvl?.abilities,
          `subclass(${selectedSubclass.name}).featuresByLevel[${lvl?.level}]`
        );
      }
    }

    console.groupEnd(); // end ability indexing group

    // ---------------------------------------------------------
    // Expand features
    // ---------------------------------------------------------
    const out = [];

    for (const feature of features) {

      const fName = `${feature.name} (${feature.id})`;
      const containerLevel = feature._level ?? 1; // ALWAYS use _level

      console.groupCollapsed(`%cProcessing Feature: ${fName}`, "color: #ffd54f; font-weight: bold");
      console.log("Feature Level:", containerLevel);

      // -----------------------------------------------------
      // CHOICE FEATURES
      // -----------------------------------------------------
      if (feature.type === "Choice") {

        console.log("Type: Choice");

        const selected = feature.data?.selected;
        const options = feature.data?.options;

        if (!Array.isArray(selected) || selected.length === 0) {
          console.log("→ Skipped: No selections");
          console.groupEnd();
          continue;
        }

        for (const sel of selected) {

          let selectedFeature = null;

          if (sel?.id && sel?.data?.ability) {
            selectedFeature = sel;
          }

          if (!selectedFeature && options) {
            const opt = options.find(o =>
              o.value === sel ||
              o.feature?.id === sel
            );
            if (opt?.feature) selectedFeature = opt.feature;
          }

          if (!selectedFeature) {
            console.log("→ Skipped: Selected option not found", sel);
            continue;
          }

          const ability = selectedFeature.data?.ability;
          if (!ability) {
            console.log("→ Skipped: Selected option has no ability block");
            continue;
          }

          // Log ability request
          console.warn(
            `[CHOICE REQUEST] Feature "${feature.name}" selected ability: ${ability.id} (${ability.name})`
          );

          // Level gating: ONLY feature._level matters
          if (containerLevel > heroLevel) {
            console.log(`→ Skipped: Feature level ${containerLevel} > heroLevel ${heroLevel}`);
            continue;
          }

          console.log("→ Added selected ability:", ability.id, ability.name);

          out.push({
            id: ability.id,
            name: ability.name,
            description: ability.description,
            type: "Ability",
            data: { ability },
            _level: containerLevel
          });
        }

        console.groupEnd();
        continue;
      }

      // -----------------------------------------------------
      // CLASS ABILITY CONTAINERS
      // -----------------------------------------------------
      if (feature.type === "Class Ability" && Array.isArray(feature.data?.selectedIDs)) {

        console.log("Type: Class Ability Container");

        for (const selId of feature.data.selectedIDs) {

          console.warn(`[ABILITY REQUEST] Feature "${feature.name}" requested ability ID: ${selId}`);

          const ability = abilityIndex.get(selId);

          if (!ability) {
            console.log("→ Missing ability for selectedID:", selId);
            continue;
          }

          // Log resolution
          console.log("→ Resolved ability:", ability.id, ability.name);

          if (containerLevel > heroLevel) {
            console.log(`→ Skipped: Feature level ${containerLevel} > heroLevel ${heroLevel}`);
            continue;
          }

          out.push({
            id: ability.id,
            name: ability.name,
            description: ability.description,
            type: "Ability",
            data: { ability },
            _level: containerLevel
          });
        }

        console.groupEnd();
        continue;
      }

      // -----------------------------------------------------
      // NORMAL FEATURE
      // -----------------------------------------------------
      if (containerLevel > heroLevel) {
        console.log(`→ Skipped: Feature level ${containerLevel} > heroLevel ${heroLevel}`);
        console.groupEnd();
        continue;
      }

      console.log("→ Added normal feature");
      out.push(feature);

      console.groupEnd();
    }

    return out;
  }
}