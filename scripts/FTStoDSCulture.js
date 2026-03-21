// FTStoDSCulture.js
// Imports the hero's culture from a .ds-hero file into a Draw Steel actor.

import { matchOriginItem } from "./helpers/matchOriginItem.js";

export class FTStoDSCulture {

  static extract(fsData) {
    if (!fsData.culture) return null;

    return {
      id: fsData.culture.id ?? null,
      name: fsData.culture.name ?? null,
      raw: fsData.culture
    };
  }

  static async apply(actor, fsCulture) {
    if (!fsCulture) return;

    const pack = game.packs.get("draw-steel.origins");
    if (!pack) {
      console.error("Could not find compendium: draw-steel.origins");
      return;
    }

    // Ensure compendium index is loaded
await pack.getIndex();
let index = pack.index;

if (!index || index.size === 0) {
  console.warn("Origin pack index not loaded yet, forcing load again...");
  await pack.getIndex();
  index = pack.index;
}


    const entry = await matchOriginItem(pack, fsCulture.id, fsCulture.name, "culture");

    if (!entry) {
      console.warn(`Could not find culture: ${fsCulture.id} / ${fsCulture.name}`);
      return;
    }

    const item = await pack.getDocument(entry._id);
    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}