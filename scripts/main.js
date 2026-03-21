import { FTStoDSImporterApp } from "./FTStoDSImporterApp.js";

Hooks.on("ready", () => {
  if (game.system.id !== "draw-steel") {
    console.warn("Forge to Steel Importer: Draw Steel system not active.");
    return;
  }

  game.settings.registerMenu("forge-to-steel-importer", "openImporter", {
    name: "Forge to Steel Importer",
    label: "Open Importer",
    icon: "fas fa-file-import",
    type: FTStoDSImporterApp,
    restricted: true
  });

  console.log("Forge to Steel Importer ready.");
});