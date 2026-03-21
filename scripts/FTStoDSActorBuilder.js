//FTS to DS Actor Builder file

import { FSFeatureResolver } from "./resolvers/index.js";

import { FTStoDSAncestry } from "./FTStoDSAncestry.js";
import { FTStoDSCulture } from "./FTStoDSCulture.js";
import { FTStoDSUpbringing } from "./FTStoDSUpbringing.js";

import { FTStoDSClass } from "./FTStoDSClass.js";
import { FSClassResolver } from "./resolvers/FSClassResolver.js";

import { FTStoDSCareer } from "./FTStoDSCareer.js";
import { FTStoDSProgression } from "./FTStoDSProgression.js";
import { FTStoDSCharacteristics } from "./FTStoDSCharacteristics.js";
import { FTStoDSPhysical } from "./FTStoDSPhysical.js";

export class FTStoDSActorBuilder {

  static async buildHero(fsData, items) {
    const name = fsData.name ?? "Imported Hero";

    const actor = await Actor.create({
      name,
      type: "hero",
      system: {}
    });

    // ⭐ STORE FS DATA ON THE ACTOR (CRITICAL)
    console.log("Builder: storing fsData on actor:", fsData);

    await actor.update({
      "flags.draw-steel-item-importer.fsData": fsData
    });

    console.log("Builder: actor.flags after update:", actor.flags);
	
// ⭐ TEST CLASS RESOLVER HERE


const heroLevel = fsData?.class?.level ?? 1;  // or fsProg.level later
const resolvedFeatures = FSFeatureResolver.resolve(fsData, heroLevel);

console.log("Resolved class features:", resolvedFeatures);

	
	

    // 1. Import ancestry
    const fsAncestry = FTStoDSAncestry.extract(fsData);
    await FTStoDSAncestry.apply(actor, fsAncestry);

    // 2. Import culture
    const fsCulture = FTStoDSCulture.extract(fsData);
    await FTStoDSCulture.apply(actor, fsCulture);

    // 3. Import upbringing
    const fsUpbringing = FTStoDSUpbringing.extract(fsData);
    await FTStoDSUpbringing.apply(actor, fsUpbringing);

    // 3.1 Import career
    const career = FTStoDSCareer.extract(fsData);
    await FTStoDSCareer.apply(actor, career);

    // 4. Import class
    const fsClass = FTStoDSClass.extract(fsData);
    await FTStoDSClass.apply(actor, fsClass);

    // 5. Apply level + XP
    const fsProg = FTStoDSProgression.extract(fsData);
    await FTStoDSProgression.apply(actor, fsProg);

    // 6. Apply characteristics
    const fsChars = FTStoDSCharacteristics.extract(fsData);
    await FTStoDSCharacteristics.apply(actor, fsChars);

    // 7. Apply stamina, recoveries, movement, size
    const fsPhys = FTStoDSPhysical.extract(fsData);
    await FTStoDSPhysical.apply(actor, fsPhys);

    // 8. Add items (abilities, features, equipment)
    if (items?.length) {
      await actor.createEmbeddedDocuments("Item", items);
    }

    return actor;
  }
}