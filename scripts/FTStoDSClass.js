// FTStoDSClass.js

export class FTStoDSClass {

  // ---------------------------------------------------------
  // Extract class metadata only
  // ---------------------------------------------------------
  static extract(fsData) {
    console.log("FTStoDSClass.extract: fsData.class =", fsData.class);

    return {
      classData: fsData.class ?? null
    };
  }

  // ---------------------------------------------------------
  // Apply class item + class-level updates
  // ---------------------------------------------------------
  static async apply(actor, { classData }) {
    console.log("FTStoDSClass.apply: classData =", classData);

    // Remove existing class items
    const existingClassItems = actor.items.filter(i => i.type === "class");
    if (existingClassItems.length > 0) {
      await actor.deleteEmbeddedDocuments("Item", existingClassItems.map(i => i.id));
    }

    if (!classData) return;

    // Build class item
    const classItem = {
      name: classData.name,
      type: "class",
      img: classData.img ?? "icons/skills/movement/ball-spinning-blue.webp",
      system: {
        description: {
          value: classData.description ?? "",
          director: ""
        },
        source: classData.source ?? {},
        _dsid: classData.id,
        advancements: classData.advancements ?? {}
      }
    };

    // Set class level based on actor progression
    // const actorLevel =
    //  actor.system.progression?.level ??
    //  actor.system.progression?.character?.level ??
    //  1;

    // classItem.system.level = actorLevel;

    // Create the class item
    await actor.createEmbeddedDocuments("Item", [classItem]);
  }
}