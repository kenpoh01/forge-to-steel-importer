// FTStoDSProgression.js
// Handles importing level and XP from a .ds-hero file into a Draw Steel actor.

// FTStoDSProgression.js
// Handles importing level and XP from a .ds-hero file into a Draw Steel actor.

export class FTStoDSProgression {

  static extract(fsData) {
    return {
      level: fsData.level ?? 1,
      xp: fsData.state?.xp ?? 0   // ← correct XP source
    };
  }

  static async apply(actor, prog) {
    const updates = {};

    // LEVEL
    updates["system.hero.primary.value"] = prog.level;

    // XP (session/real XP)
    updates["system.hero.xp"] = prog.xp;

    await actor.update(updates);
  }
}