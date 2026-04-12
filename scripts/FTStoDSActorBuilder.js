// FTStoDSActorBuilder.js
// Builds a Draw Steel hero actor using FS data + compendium-sourced DS items.

import { FSFeatureResolver } from "./resolvers/index.js";
import { FSAbilityResolver } from "./resolvers/FSAbilityResolver.js";

import { FTStoDSAncestry } from "./FTStoDSAncestry.js";
import { FTStoDSCulture } from "./FTStoDSCulture.js";
import { FTStoDSUpbringing } from "./FTStoDSUpbringing.js";
import { FTStoDSClass } from "./FTStoDSClass.js";
import { FTStoDSCareer } from "./FTStoDSCareer.js";
import { FTStoDSProgression } from "./FTStoDSProgression.js";
import { FTStoDSCharacteristics } from "./FTStoDSCharacteristics.js";
import { FTStoDSPhysical } from "./FTStoDSPhysical.js";

import { FSItemTypeFilter } from "./fs-filters/FSItemTypeFilter.js";
import { FSSkillChoiceFilter } from "./fs-filters/FSSkillChoiceFilter.js";
import { FSPerkFilter } from "./fs-filters/FSPerkFilter.js";

import { FTStoDSFeatureMatcher } from "./importers/FTStoDSFeatureMatcher.js";

// NEW ancestry feature suite
import { FSAncestryParser } from "./fs-filters/ancestry/FSAncestryParser.js";

export class FTStoDSActorBuilder {

  static async buildHero(fsData, items, compendium) {

    const name = fsData.name ?? "Imported Hero";

    // ---------------------------------------------------------
    // 0. Create the actor shell
    // ---------------------------------------------------------
    const actor = await Actor.create({
      name,
      type: "hero",
      system: {}
    });

    await actor.update({
      "flags.draw-steel-item-importer.fsData": fsData
    });

    const heroLevel = fsData?.class?.level ?? 1;

    // ---------------------------------------------------------
    // 1. Resolve all FS features (class + subclass + expanded)
    // ---------------------------------------------------------
    const resolvedFeatures = FSFeatureResolver.resolve(fsData, heroLevel);

    // ---------------------------------------------------------
    // 2. Expand abilities
    // ---------------------------------------------------------
    const resolvedAbilities = FSAbilityResolver.expand(
      resolvedFeatures,
      fsData,
      heroLevel
    );

    // ---------------------------------------------------------
    // 3. Apply Skill Choices
    // ---------------------------------------------------------
    for (const f of resolvedFeatures) {
      await FSSkillChoiceFilter.apply(actor, f);
    }

    // ---------------------------------------------------------
    // 4. Apply Perks
    // ---------------------------------------------------------
    let perkItems = [];
    for (const f of resolvedFeatures) {
      const items = await FSPerkFilter.apply(actor, f);
      perkItems.push(...items);
    }

    // ---------------------------------------------------------
    // 5. Combine all FS-derived items BEFORE filtering
    // ---------------------------------------------------------
    const combined = [
      ...resolvedAbilities,
      ...resolvedFeatures,
      ...perkItems
    ];

    // ---------------------------------------------------------
    // 5.5 Deduplicate by normalized name + type
    // ---------------------------------------------------------
    const deduped = [];
    const seen = new Set();

    for (const f of combined) {
      const norm = FTStoDSFeatureMatcher.normalize(f.name ?? "");
      const key = `${f.type}::${norm}`;

      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(f);
    }

// 6. Add ancestry features BEFORE filtering + matching
const ancestryFeatures = FSAncestryParser.extract(fsData);
const combinedAll = [...deduped, ...ancestryFeatures];

// 6.1 Apply Skill Choices to ALL features (class + ancestry)
for (const f of combinedAll) {
  await FSSkillChoiceFilter.apply(actor, f);
}


// 6.5 Filter out wrapper + non-item FS types
const filtered = combinedAll.filter(f => !FSItemTypeFilter.ignore(f));


// ---------------------------------------------------------
// 7. Compendium lookup for each feature/ability
// ---------------------------------------------------------
const matcher = new FTStoDSFeatureMatcher(compendium);

const finalItems = [];
for (const f of filtered) {
  const dsItem = await matcher.resolve(f);
  if (dsItem) finalItems.push(dsItem);
}


    // ---------------------------------------------------------
    // 8. Create DS items on actor
    // ---------------------------------------------------------
    if (finalItems.length) {
      await actor.createEmbeddedDocuments("Item", finalItems);
    }

    // ---------------------------------------------------------
    // 9. Import DS ancestry origin item
    // ---------------------------------------------------------
    await FTStoDSAncestry.apply(actor, FTStoDSAncestry.extract(fsData));

    // ---------------------------------------------------------
    // 10. NEW: Import FS ancestry features (Size, Choice, Bonus, etc.)
    // ---------------------------------------------------------
    const ancestry = FSAncestryParser.extract(fsData);
    await FSAncestryParser.apply(actor, ancestry);

    // ---------------------------------------------------------
    // 11. Import culture, upbringing, class, career, etc.
    // ---------------------------------------------------------
    await FTStoDSCulture.apply(actor, FTStoDSCulture.extract(fsData));
    await FTStoDSUpbringing.apply(actor, FTStoDSUpbringing.extract(fsData));
    await FTStoDSCareer.apply(actor, FTStoDSCareer.extract(fsData));
    await FTStoDSClass.apply(actor, FTStoDSClass.extract(fsData));
    await FTStoDSProgression.apply(actor, FTStoDSProgression.extract(fsData));
    await FTStoDSCharacteristics.apply(actor, FTStoDSCharacteristics.extract(fsData));
    await FTStoDSPhysical.apply(actor, FTStoDSPhysical.extract(fsData));

    return actor;
  }
}
