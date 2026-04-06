// scripts/module.js (or whatever your entry file is)

import { FTStoDSImporterApp } from "./FTStoDSImporterApp.js";
//main.js file

import { FTStoDSCompendium } from "./FTStoDSCompendium.js";

// ---------------------------------------------------------
// Shared namespace for the importer
// ---------------------------------------------------------
export const FTStoDS = {
  compendium: new FTStoDSCompendium()
};

// ---------------------------------------------------------
// Initialize module + compendium
// ---------------------------------------------------------
Hooks.on("ready", async () => {
  if (game.system.id !== "draw-steel") {
    console.warn("Forge to Steel Importer: Draw Steel system not active.");
    return;
  }

  console.log("Forge to Steel Importer | Initializing compendium…");
  await FTStoDS.compendium.initialize();

  game.settings.registerMenu("forge-to-steel-importer", "openImporter", {
    name: "Forge to Steel Importer",
    label: "Open Importer",
    icon: "fas fa-file-import",
    type: FTStoDSImporterApp,
    restricted: true
  });

  console.log("Forge to Steel Importer ready.");
});