let {UndergroundOreBlock} = require("blocks/underground-ore-block")
let {UndergroundDrill} = require("blocks/underground-drill")
let {OreRadar} = require("blocks/ore-radar")
let {EItems} = require("items")

let UndergroundOreIridium = new UndergroundOreBlock("underground-ore-iridium", EItems.iridium, 1)
UndergroundOreIridium.variants = 2
let UndergroundOrePhosphorus = new UndergroundOreBlock("underground-ore-phosphorus", EItems.phosphorus, 1)

let OverdriveDrill = new UndergroundDrill("overdrive-drill")

let OreRadarSmall = new OreRadar("ore-radar-small", 15 * 6, 20, 0.6, Color.valueOf("9aabff"), 1, 1)
OreRadarSmall.health = 180
OreRadarSmall.size = 2
OreRadarSmall.category = Category.production
OreRadarSmall.buildVisibility = BuildVisibility.shown
OreRadarSmall.consumePower(2)
OreRadarSmall.requirements = ItemStack.with(EItems.steelPlate, 80)