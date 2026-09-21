/*
 * Copyright (C) 2026 FoksT4on
 * This script is based on code from the project: https://github.com/TeamOct/FOS.
 * The source code is available at: https://github.com/TeamOct/FOS/blob/master/src/fos/world/blocks/production/UndergroundDrill.java.
 * The license of the original code: GPL-3.0.
 * This script is distributed under the same license: GPL-3.0.
 */

let { customDrillables } = require("stats")

const comp = method => new java.util.Comparator(){compare: method};
const intComp = (int1, int2) => java.lang.Integer.compare(int1, int2);
const boolComp = (bool1, bool2) => java.lang.Boolean.compare(bool1, bool2);

function UndergroundDrill(name)
{
	let block = extend(Drill, name, {
		drillTime: 360,
		schematicPriority: -5,

		UD(){},

		isValidTarget(tile)
		{
			return this.canMine(tile) || tile.overlay() == Blocks.air || tile.overlay().itemDrop != null;
		},

		radarFor(tile, team)
		{
			return this.isValidTarget(tile) ? this.nearestRadar(team, tile.worldx(), tile.worldy()) : null;
		},

		canPlaceOn(tile, team, rotation)
		{
			let tiles = tile.getLinkedTilesAs(this, this.tempTiles);
			for(let t of tiles.toArray())
			{
				if(this.radarFor(t, team) != null)return true;
			}
			return false;
		},

		drawPlace(x, y, rotation, valid)
		{
			let _x = x * Vars.tilesize + this.offset;
			let _y = y * Vars.tilesize + this.offset;
			let tile = Vars.world.tile(x, y);
			if(tile == null)return;

			let count = 0;
			let tiles = tile.getLinkedTilesAs(this, this.tempTiles);
			for(let t of tiles.toArray())
			{
				let radar = this.nearestRadar(Vars.player.team(), t.worldx(), t.worldy());
				if(radar != null)
				{
					count++;
					Drawf.dashLine(Vars.player.team().color, _x, _y, radar.x, radar.y);
				}
			}

			if(count == 0)
			{
				this.drawPlaceText(Core.bundle.get("bar.radarreq"), x, y, valid);
				return;
			}

			this.getOutput(tile);

			if(this.returnItem != null)
			{
				let width = this.drawPlaceText(Core.bundle.formatFloat("bar.drillspeed", 60 / this.getDrillTime(this.returnItem) * this.returnCount, 2), x, y, valid);
				let dx = _x - width / 2 - 4;
				let dy = _y + this.size * Vars.tilesize / 2 + 5;
				let s = Vars.iconSmall / 4;
				Draw.mixcol(Color.darkGray, 1);
				Draw.rect(this.returnItem.fullIcon, dx, dy - 1, s, s);
				Draw.reset();
				Draw.rect(this.returnItem.fullIcon, dx, dy, s, s);
			}
			else
			{
				let blocked = tiles.find(t => {
					let drop = this.getUnderDrop(t.overlay());
					return drop != null && (drop.hardness > this.tier || drop == this.blockedItem || this.blockedItems.contains(drop))
				})
				if(blocked != null)
					this.drawPlaceText(Core.bundle.get("bar.drilltierreq"), x, y, valid);
			}
		},

		setStats()
		{
			this.super$setStats();
			this.stats.remove(Stat.drillTier);

			this.stats.add(
				Stat.drillTier,
				customDrillables(
					block.drillTime,
					block.hardnessDrillMultiplier,
					block.size * block.size,
					block.drillMultipliers,
					boolf(ov => {
						var drop = block.getUnderDrop(ov);
						return ov.UOB != null &&
							drop != null &&
							drop.hardness <= block.tier &&
							(drop != block.blockedItem || !this.blockedItems.contains(drop)) &&
							(Vars.indexer.isBlockPresent(ov) || Vars.state.isMenu());
					}),
					true
				)
			);
		},

		canMine(tile)
		{
			if(tile == null || tile.block().isStatic())return false;
			let drop = this.getUnderDrop(tile.overlay());
			return drop != null && 
				drop.hardness <= this.tier &&
				(drop != this.blockedItem || !this.blockedItems.contains(drop));
		},

		countOre(tile)
		{
			this.returnItem = null;
			this.returnCount = 0;

			this.oreCount.clear();
			this.itemArray.clear();

			let tiles = tile.getLinkedTilesAs(this, this.tempTiles);
			for(let t of tiles.toArray())
			{
				if(this.canMine(t))
					this.oreCount.increment(this.getUnderDrop(t.overlay()), 0, 1);
			}

			let keys = this.oreCount.keys().toSeq();
			for(let item of keys.toArray())this.itemArray.add(item);

			let comparator = comp((item1, item2) => {
				let type = boolComp(!item1.lowPriority, !item2.lowPriority);
				if(type != 0)return type;
				let amounts = intComp(block.oreCount.get(item1, 0), block.oreCount.get(item2, 0));
				if(amounts != 0)return amounts;
				return intComp(item1.id, item2.id);
			});

			if(this.itemArray.size == 0)return;

			this.itemArray.sort(comparator);

			this.returnItem = this.itemArray.peek();
			this.returnCount = this.oreCount.get(this.itemArray.peek(), 0);
		},

		getOutput(tile) 
		{
			this.countOre(tile);

			let tiles = tile.getLinkedTilesAs(this, this.tempTiles);
			for(let t of tiles.toArray())
			{
				if(this.isValidTarget(t))this.returnItem = this.returnItem != null ? this.returnItem : Items.sand;
				if(this.returnItem == Items.sand)this.returnCount = 2
			}
		},

		getUnderDrop(ov)
		{
			return ov.UOB != null ? ov.getD() : null;
		},

		nearestRadar(team, wx, wy)
		{
			return Vars.indexer.findTile(
				team,
				wx,
				wy,
				999,
				boolf(b =>
					b.block.OR != null && 
					Mathf.within(wx, wy, b.x, b.y, b.range())
				)
			);
		}
	})

	let build = () => extend(Drill.DrillBuild, block, {
		updateTile()
		{
			if(this.timer.get(block.timerDump, block.dumpTime / this.timeScale))
				this.dump(this.dominantItem != null && this.items.has(this.dominantItem) ? this.dominantItem : null);

			if(this.dominantItem == null)return;

			this.timeDrilled += this.warmup * this.delta();
			let delay = block.getDrillTime(this.dominantItem);

			if(this.items.total() < block.itemCapacity && this.dominantItems > 0 && this.efficiency > 0)
			{
				let speed = Mathf.lerp(1, block.liquidBoostIntensity, this.optionalEfficiency) * this.efficiency;

				this.lastDrillSpeed = (speed * this.dominantItems * this.warmup) / delay;
				this.warmup = Mathf.approachDelta(this.warmup, speed, block.warmupSpeed);
				this.progress += this.delta() * this.dominantItems * speed * this.warmup;

				if(Mathf.chanceDelta(block.updateEffectChance * this.warmup))
					block.updateEffect.at(this.x + Mathf.range(block.size * 2), this.y + Mathf.range(block.size * 2));
			}
			else
			{
				this.lastDrillSpeed = 0;
				this.warmup = Mathf.approachDelta(this.warmup, 0, block.warmupSpeed);
				return;
			}

			if(this.dominantItems > 0 && this.progress >= delay && this.items.total() < block.itemCapacity)
			{
				let amount = Math.floor(this.progress / delay);
				for(let i = 0; i < amount; i++)this.offload(this.dominantItem);
				this.progress %= delay;

				if(this.wasVisible && Mathf.chanceDelta(block.drillEffectChance * this.warmup))
					block.drillEffect.at(this.x + Mathf.range(block.drillEffectRnd), this.y + Mathf.range(block.drillEffectRnd), this.tileOn().floor().mapColor);
			}
		},

		onProximityUpdate()
		{
			this.super$onProximityUpdate();

			block.getOutput(this.tile);

			this.dominantItem = block.returnItem;
			this.dominantItems = block.returnCount;
		},

		draw()
		{
			this.super$draw();

			Draw.color(this.dominantItem.color);
			Draw.rect(block.itemRegion, this.x, this.y);
			Draw.color();
		},

		efficiencyScale()
		{
			let tiles = this.tile.getLinkedTilesAs(this.block, this.block.tempTiles);
			for(let t of tiles.toArray())
			{
				let radar = block.nearestRadar(this.team, t.worldx(), t.worldy());
				if(radar != null)return 1
			}
			return 0
		},

		drawSelect()
		{
			this.super$drawSelect();

			let tiles = this.tile.getLinkedTilesAs(this.block, this.block.tempTiles);
			for(let t of tiles.toArray())
			{
				let radar = block.nearestRadar(this.team, t.worldx(), t.worldy());
				if(radar != null)Drawf.dashLine(this.team.color, this.x, this.y, radar.x, radar.y);
			}
		}
	});
	block.buildType = build;
	return block;
}

exports.UndergroundDrill = UndergroundDrill