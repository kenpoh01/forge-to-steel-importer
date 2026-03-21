// FTStoDSUpbringing.js
// Imports the hero's upbringing from a .ds-hero file into a Draw Steel actor.

import { matchOriginItem } from "./helpers/matchOriginItem.js";

export class FTStoDSUpbringing {

  static extract(fsData) {
    if (!fsData.upbringing) return null;

    return {
      id: fsData.upbringing.id ?? null,
      name: fsData.upbringing.name ?? null,
      raw: fsData.upbringing
    };
  }

  static async apply(actor, fsUpbringing) {
    if (!fsUpbringing) return;

    const pack = game.packs.get("draw-steel.origins");
    if (!pack) {
      console.error("Could not find compendium: draw-steel.origins");
      return;
    }

    // Ensure compendium index is loaded
    await pack.getIndex();

    // Match the correct Draw Steel upbringing entry
    const entry = await matchOriginItem(
      pack,
      fsUpbringing.id,
      fsUpbringing.name,
      "upbringing"
    );

    if (!entry) {
      console.warn(`Could not find upbringing: ${fsUpbringing.id} / ${fsUpbringing.name}`);
      return;
    }

    const item = await pack.getDocument(entry._id);
    if (!item) {
      console.error("Failed to load matched upbringing document:", entry);
      return;
    }

    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}