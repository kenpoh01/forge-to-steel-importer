// FTStoDSClass.js
// Imports the hero's class from a .ds-hero file into a Draw Steel actor.

export class FTStoDSClass {

  static extract(fsData) {
    if (!fsData.class) return null;

    return {
      id: fsData.class.id ?? null,
      name: fsData.class.name ?? null
    };
  }

  static async apply(actor, fsClass) {
    if (!fsClass) return;

    // Load the Draw Steel class compendium
    const pack = game.packs.get("draw-steel.classes");
    if (!pack) {
      console.error("Forge to Steel Importer | Could not find compendium: draw-steel.classes");
      return;
    }

    const index = await pack.getIndex();

    // Try to match by ID first
    let entry = index.find(e => e._id === fsClass.id);

    // Fallback: match by name
    if (!entry && fsClass.name) {
      entry = index.find(e => e.name === fsClass.name);
    }

    if (!entry) {
      console.warn(`Forge to Steel Importer | Could not find class: ${fsClass.id} / ${fsClass.name}`);
      return;
    }

    // Load the full item
    const item = await pack.getDocument(entry._id);

    // Add class to actor
    await actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }
}