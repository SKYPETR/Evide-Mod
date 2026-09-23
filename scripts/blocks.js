let { UndergroundOreBlock } = require("blocks/underground-ore-block")
let { UndergroundDrill } = require("blocks/underground-drill")
let { PowerCoreBlock } = require("blocks/power-core-block")
let { OreRadar } = require("blocks/ore-radar")
let { EItems } = require("items")
let { customDrillables } = require("stats")

let EBlocks = {
	undergroundOreIridium: new UndergroundOreBlock("underground-ore-iridium", EItems.iridium, 1),
	undergroundOrePhosphorus: new UndergroundOreBlock("underground-ore-phosphorus", EItems.phosphorus, 1),
	oreRadarSmall: new OreRadar("ore-radar-small", 96, 20, 0.6, Color.valueOf("9aabff"), 1, 1),
	overdriveDrill: new UndergroundDrill("overdrive-drill"),
	coreBreeze: new PowerCoreBlock("core-breeze"),
	steelPlasmaBore: extend(BeamDrill, "steel-plasma-bore", {
		setStats()
		{
			this.super$setStats();

			this.stats.replace(
				Stat.drillTier,
				customDrillables(
					this.drillTime, 
					0, 
					this.size, 
					this.drillMultipliers, 
					boolf(b =>
						(b instanceof Floor && b.wallOre && b.itemDrop != null && b.itemDrop.hardness <= this.tier && (this.blockedItems == null || !this.blockedItems.contains(b.itemDrop))) ||
						(b instanceof StaticWall && b.itemDrop != null && b.itemDrop.hardness <= this.tier && (this.blockedItems == null || !this.blockedItems.contains(b.itemDrop)))
					),
					false
				)
			);
		}
	}),

	init()
	{
		this.undergroundOreIridium.variants = 2
		this.undergroundOrePhosphorus.variants = 2;

		this.oreRadarSmall.health = 180;
		this.oreRadarSmall.size = 2;
		this.oreRadarSmall.category = Category.production;
		this.oreRadarSmall.buildVisibility = BuildVisibility.shown;
		this.oreRadarSmall.consumePower(2);
		this.oreRadarSmall.requirements = ItemStack.with(EItems.steelPlate, 80);

		this.coreBreeze.powerProduction = 6;

		Blocks.iceWall.itemDrop = EItems.ice;
	}
}

EBlocks.init();

exports.EBlocks = EBlocks