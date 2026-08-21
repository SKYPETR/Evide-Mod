let {UndergroundOreBlock} = require("blocks/underground-ore-block")
let {UndergroundDrill} = require("blocks/underground-drill")
let {OreRadar} = require("blocks/ore-radar")

let UndergroundOreLead = new UndergroundOreBlock("underground-ore-lead", Items.lead, 1)
UndergroundOreLead.variants = 2

let OverdriveDrill = new UndergroundDrill("overdrive-drill")

let OreRadarSmall = new OreRadar("ore-radar-small", 15 * 6, 20, 0.6, Color.valueOf("9aabff"), 1, 1)
OreRadarSmall.size = 2