// FTStoDSCareer.js
import { matchOriginItem } from "./helpers/matchOriginItem.js";

export class FTStoDSCareer {
  static extract(fsHero) {
    const fsCareer = fsHero.career;
    if (!fsCareer) return null;

    return {
      id: fsCareer.id,
      name: fsCareer.name,
      description: fsCareer.description,
      features: fsCareer.features || [],
      raw: fsCareer
    };
  }

  static async apply(actor, fsCareer) {
    if (!fsCareer) return;

    // Careers live in the same compendium as ancestries/cultures/upbringings
    const pack = game.packs.get("draw-steel.origins");

    if (!pack) {
      console.error("Career compendium not found: draw-steel.origins");
      return;
    }

    // Ensure compendium index is loaded
    await pack.getIndex();

    // Match the correct Draw Steel career entry
    const entry = await matchOriginItem(
      pack,
      fsCareer.id,
      fsCareer.name,
      "career"
    );


    if (!entry) {
      console.warn(`No matching Draw Steel career found for: ${fsCareer.name}`);
      return;
    }

    // Load the full document
    const dsCareer = await pack.getDocument(entry._id);

    if (!dsCareer) {
      console.error("Failed to load matched career document:", entry);
      return;
    }

    // Apply the career to the actor
    await actor.createEmbeddedDocuments("Item", [dsCareer.toObject()]);

  }
}