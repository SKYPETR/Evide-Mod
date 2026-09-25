const evide = Vars.mods.locateMod("evide").meta;
evide.displayName = Core.bundle.get("mod.evide.name");
evide.description = Core.bundle.get("mod.evide.description");

require("items")
require("blocks")
require("tech-tree")
require("snow-storm")
require("planets")