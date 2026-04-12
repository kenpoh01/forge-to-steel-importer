// FSAbilityResolver.js
// Expands FS features into final ability list using deterministic level gating.

export class FSAbilityResolver {

  /**
   * Expand features into final ability list.
   * Uses ONLY feature._level for gating.
   * No minLevel logic. No fallbacks. Deterministic.
   */
  static expand(features, fsData, heroLevel) {

    // ---------------------------------------------------------
    // Build ability index (class + selected subclass only)
    // ---------------------------------------------------------
    const abilityIndex = new Map();
    const addAbilities = (arr) => {
      if (!Array.isArray(arr)) return;
      for (const ability of arr) {
        if (ability && ability.id) {
          abilityIndex.set(ability.id, ability);
        }
      }
    };

    // Base FS ability pools
    addAbilities(fsData?.abilities);
    addAbilities(fsData?.class?.abilities);

    for (const lvl of fsData?.class?.levels ?? []) {
      addAbilities(lvl?.abilities);
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
      addAbilities(selectedSubclass.abilities);

      for (const lvl of selectedSubclass.levels ?? []) {
        addAbilities(lvl?.abilities);
      }

      for (const lvl of selectedSubclass.featuresByLevel ?? []) {
        addAbilities(lvl?.abilities);
      }
    }

    // ---------------------------------------------------------
    // Expand features
    // ---------------------------------------------------------
    const out = [];

    for (const feature of features) {

      const containerLevel = feature._level ?? 1; // ALWAYS use _level

      // -----------------------------------------------------
      // CHOICE FEATURES
      // -----------------------------------------------------
      if (feature.type === "Choice") {

        const selected = feature.data?.selected;
        const options = feature.data?.options;

        if (!Array.isArray(selected) || selected.length === 0) {
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

          if (!selectedFeature) continue;

          const ability = selectedFeature.data?.ability;
          if (!ability) continue;

          if (containerLevel > heroLevel) continue;

          out.push({
            id: ability.id,
            name: ability.name,
            description: ability.description,
            type: "Ability",
            data: { ability },
            _level: containerLevel
          });
        }

        continue;
      }

      // -----------------------------------------------------
      // CLASS ABILITY CONTAINERS
      // -----------------------------------------------------
      if (feature.type === "Class Ability" && Array.isArray(feature.data?.selectedIDs)) {

        for (const selId of feature.data.selectedIDs) {

          const ability = abilityIndex.get(selId);
          if (!ability) continue;

          if (containerLevel > heroLevel) continue;

          out.push({
            id: ability.id,
            name: ability.name,
            description: ability.description,
            type: "Ability",
            data: { ability },
            _level: containerLevel
          });
        }

        continue;
      }

      // -----------------------------------------------------
      // NORMAL FEATURE
      // -----------------------------------------------------
      if (containerLevel > heroLevel) continue;

      out.push(feature);
    }

    return out;
  }
}
