// FSClassResolver.js
// Resolves FS class data into a flat list of features with deterministic level gating.

export class FSClassResolver {

  /**
   * Extract hero level from FS hero JSON.
   * Backwards-compatible with multiple FS schema variants.
   */
  static extractHeroLevel(fsHero) {
    return Number(fsHero?.class?.level) || 1;
  }

  /**
   * Resolve FS class data into a flat list of features.
   * @param {object} fsClass - The FS class JSON (with featuresByLevel)
   * @param {number} heroLevel - The hero's current level
   * @returns {Array<object>} resolved feature list
   */
  static resolve(fsClass, heroLevel) {
    const out = [];

    if (!fsClass?.featuresByLevel || !Array.isArray(fsClass.featuresByLevel)) {
      return out;
    }

    for (const levelBlock of fsClass.featuresByLevel) {
      const level = levelBlock.level ?? 0;

      // Hard level gating
      if (level > heroLevel) continue;

      for (const feature of levelBlock.features ?? []) {
        this._processFeature(feature, out, { level });
      }
    }

    return out;
  }

  // ---------------------------------------------------------
  // Core feature dispatcher
  // ---------------------------------------------------------
  static _processFeature(feature, out, context) {
    if (!feature) return;

    const type = feature.type;

    switch (type) {
      case "Choice":
        this._processChoiceFeature(feature, out, context);
        break;

      case "Multiple Features":
        this._processMultipleFeatures(feature, out, context);
        break;

      case "Class Ability":
        this._processClassAbility(feature, out, context);
        break;

      default:
        // Base feature: attach level and push through
        out.push({
          ...feature,
          _level: context.level
        });
        break;
    }
  }

  // ---------------------------------------------------------
  // Choice handling (simple passthrough)
  // ---------------------------------------------------------
  static _processChoiceFeature(feature, out, context) {
    out.push({
      ...feature,
      _level: context.level
    });
  }

  // ---------------------------------------------------------
  // Multiple Features → collapse into ONE ability
  // ---------------------------------------------------------
  static _processMultipleFeatures(feature, out, context) {
    const list = feature.data?.features ?? [];

    if (!Array.isArray(list) || list.length === 0) {
      return;
    }

    const realName = list[0]?.name ?? feature.name;

    const description = list
      .map(f => f.description ?? "")
      .filter(Boolean)
      .join("\n\n");

    const tags = list
      .filter(f => f.type === "Package Content")
      .map(f => f.data?.tag)
      .filter(Boolean);

    out.push({
      id: feature.id,
      name: realName,
      type: "Ability",
      description,
      data: { tags },
      _level: context.level
    });
  }

  // ---------------------------------------------------------
  // Class Ability container (simple passthrough)
  // ---------------------------------------------------------
  static _processClassAbility(feature, out, context) {
    out.push({
      ...feature,
      _level: context.level
    });
  }
}
