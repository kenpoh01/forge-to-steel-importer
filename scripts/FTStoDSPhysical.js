// FTStoDSPhysical.js

export class FTStoDSPhysical {

  static extract(fsData) {
    console.log("FTStoDSPhysical.extract: fsData.physical =", fsData.physical);

    return {
      movement: fsData.physical?.movement ?? {},
      raw: fsData.physical ?? {}
    };
  }

  static extractSizeFromFeatures(fsData) {
    console.log("FTStoDSPhysical.extractSizeFromFeatures: fsData =", fsData);

    if (!fsData) {
      console.warn("FTStoDSPhysical.extractSizeFromFeatures: fsData is missing!");
      return null;
    }

    const features = [
      ...(fsData.ancestry?.features ?? []),
      ...(fsData.culture?.features ?? []),
      ...(fsData.upbringing?.features ?? []),
      ...(fsData.career?.features ?? []),
      ...(fsData.class?.features ?? [])
    ];

    console.log("FTStoDSPhysical.extractSizeFromFeatures: collected features =", features);

    const sizeFeature = features.find(f => f.type === "Size");
    console.log("FTStoDSPhysical.extractSizeFromFeatures: sizeFeature =", sizeFeature);

    if (!sizeFeature) return null;

    const size = sizeFeature.data?.size;
    console.log("FTStoDSPhysical.extractSizeFromFeatures: size =", size);

    if (!size) return null;

    const result = {
      value: size.value ?? 0,
      mod: size.mod ?? "M"
    };

    console.log("FTStoDSPhysical.extractSizeFromFeatures: returning =", result);
    return result;
  }

  static async apply(actor, fsPhys) {
    console.log("FTStoDSPhysical.apply: fsPhys =", fsPhys);
    console.log("FTStoDSPhysical.apply: actor.flags =", actor.flags);

    // READ THE CORRECT FLAG PATH
    const fsData = actor.flags?.["draw-steel-item-importer"]?.fsData;
    console.log("FTStoDSPhysical.apply: fsData =", fsData);

    const finalSize = this.extractSizeFromFeatures(fsData);
    console.log("FTStoDSPhysical.apply: finalSize =", finalSize);

    const updates = {};

    if (finalSize) {
      updates["system.combat.size.value"] = finalSize.value;
      updates["system.combat.size.letter"] = finalSize.mod;
      console.log("FTStoDSPhysical.apply: applying size =", updates);
    }

    updates["system.movement.value"] = 5;
    console.log("FTStoDSPhysical.apply: setting walk speed = 5");

    const movement = fsPhys?.movement ?? {};
    console.log("FTStoDSPhysical.apply: fsPhys.movement =", movement);

    for (const [mode, value] of Object.entries(movement)) {
      const key = mode.toLowerCase();
      if (key !== "walk") {
        updates[`system.physical.movement.${key}`] = value;
      }
    }

    console.log("FTStoDSPhysical.apply: final updates =", updates);
    await actor.update(updates);
  }
}