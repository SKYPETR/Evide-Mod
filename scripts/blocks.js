let { UndergroundOreBlock } = require("blocks/underground-ore-block")
let { UndergroundDrill } = require("blocks/underground-drill")
let { OreRadar } = require("blocks/ore-radar")
let { EItems } = require("items")

let EBlocks = {
	undergroundOreIridium: new UndergroundOreBlock("underground-ore-iridium", EItems.iridium, 1),
	undergroundOrePhosphorus: new UndergroundOreBlock("underground-ore-phosphorus", EItems.phosphorus, 1),
	oreRadarSmall: new OreRadar("ore-radar-small", 15 * 6, 20, 0.6, Color.valueOf("9aabff"), 1, 1),
	overdriveDrill: new UndergroundDrill("overdrive-drill"),

	init()
	{
		this.undergroundOreIridium.variants = 2
		this.undergroundOrePhosphorus.variants = 2

		this.oreRadarSmall.health = 180
		this.oreRadarSmall.size = 2
		this.oreRadarSmall.category = Category.production
		this.oreRadarSmall.buildVisibility = BuildVisibility.shown
		this.oreRadarSmall.consumePower(2)
		this.oreRadarSmall.requirements = ItemStack.with(EItems.steelPlate, 80)

		Blocks.iceWall.itemDrop = EItems.ice
	}
}

EBlocks.init()

exports.EBlocks = EBlocks