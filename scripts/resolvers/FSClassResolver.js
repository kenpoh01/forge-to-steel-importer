// FSClassResolver.js
//
// Resolves class features from FS data, respecting:
// - Level gating (only include features up to heroLevel)
// - Choice selections (data.selected)
// - Class Ability selections (data.selectedIDs)
// - Multiple Features expansion
//
// Output: a flat array of normalized feature objects.

export class FSClassResolver {

  /**
   * Resolve all class features up to the hero's level.
   * @param {object} classData - fsData.class
   * @param {number} heroLevel - e.g. 3
   * @returns {Array<object>} resolved features
   */
  static resolve(classData, heroLevel = 1) {
    if (!classData) return [];

    const out = [];
    const levels = classData.featuresByLevel ?? [];

    for (const levelBlock of levels) {
      const lvl = levelBlock.level ?? 0;
      if (lvl > heroLevel) continue; // ignore future levels

      const features = levelBlock.features ?? [];
      for (const feature of features) {
        this._processFeature(feature, out, { level: lvl });
      }
    }

    return out;
  }

  // ---------------------------------------------------------------------------
  // Core feature processing
  // ---------------------------------------------------------------------------

  static _processFeature(feature, out, context) {
    if (!feature || typeof feature !== "object") return;

    const type = feature.type;

    switch (type) {
      case "Choice":
        this._processChoiceFeature(feature, out, context);
        break;

      case "Multiple Features":
        this._processMultipleFeatures(feature, out, context);
        break;

      case "Class Ability":
        this._processClassAbilityFeature(feature, out, context);
        break;

      default:
        // Base case: a concrete feature (Bonus, Ability, Text, etc.)
        out.push({
          ...feature,
          _level: context.level
        });
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Choice feature: uses data.selected
  // ---------------------------------------------------------------------------

  static _processChoiceFeature(feature, out, context) {
    const data = feature.data ?? {};
    const selected = data.selected ?? [];

    for (const sel of selected) {
      if (sel && typeof sel === "object" && sel.type) {
        // Full feature object
        this._processFeature(sel, out, context);
      } else {
        // Primitive selection (e.g. skill names)
        out.push({
          id: sel.id ?? null,
          name: sel.name ?? String(sel),
          type: feature.type,
          data: { value: sel },
          _level: context.level
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Multiple Features: expand data.features[]
  // ---------------------------------------------------------------------------

  static _processMultipleFeatures(feature, out, context) {
    const data = feature.data ?? {};
    const features = data.features ?? [];

    for (const sub of features) {
      this._processFeature(sub, out, context);
    }
  }

  // ---------------------------------------------------------------------------
  // Class Ability: uses data.selectedIDs
  // ---------------------------------------------------------------------------

  static _processClassAbilityFeature(feature, out, context) {
    const data = feature.data ?? {};
    const selectedIDs = data.selectedIDs ?? [];

    // We preserve the selection info; another resolver will map IDs to actual abilities.
    out.push({
      ...feature,
      _level: context.level,
      _selectedIDs: selectedIDs
    });
  }
}