// FTStoDSCharacteristics.js
// Handles importing primary characteristics from a .ds-hero file into a Draw Steel actor.

export class FTStoDSCharacteristics {

  static extract(fsData) {
    let list = [];

    // 1. Root-level (some exporters use this)
    if (Array.isArray(fsData.characteristics)) {
      list = fsData.characteristics;
    }

    // 2. Inside a single class block
    else if (fsData.class && Array.isArray(fsData.class.characteristics)) {
      list = fsData.class.characteristics;
    }

    // 3. Inside a class array (some versions export this way)
    else if (Array.isArray(fsData.classes)) {
      for (const cls of fsData.classes) {
        if (Array.isArray(cls.characteristics)) {
          list = cls.characteristics;
          break;
        }
      }
    }

    // Normalize into { might: 1, agility: 2, ... }
    const result = {};
    for (const entry of list) {
      if (!entry.characteristic) continue;
      const key = entry.characteristic.toLowerCase();
      result[key] = entry.value ?? 0;
    }

    return result;
  }

  static async apply(actor, fsChars) {
    const updates = {};

    for (const [key, value] of Object.entries(fsChars)) {
      updates[`system.characteristics.${key}.value`] = value;
    }

    if (Object.keys(updates).length > 0) {
      await actor.update(updates);
    }
  }
}