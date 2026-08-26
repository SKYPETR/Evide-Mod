/*
 * Copyright (C) 2026 FoksT4on
 * This script is based on code from the project: https://github.com/TeamOct/FOS.
 * The source code is available at: https://github.com/TeamOct/FOS/blob/master/src/fos/world/blocks/production/UndergroundDrill.java.
 * The license of the original code: GPL-3.0.
 * This script is distributed under the same license: GPL-3.0.
 */

function UndergroundDrill(name)
{
	let block = extend(Drill, name, {
		drillTime: 360,
		schematicPriority: -5,
		drawMineItem: false,
		
		UD(){},

		canPlaceOn(tile, team, rotation)
		{
			if(this.isMultiblock())
			{
				let tiles = tile.getLinkedTilesAs(this, this.tempTiles);

				for(let i = 0; i < tiles.size; i++)
				{
					let other = tiles.get(i);
					let block = other.build;
					if(block != null && (block.block instanceof Drill) && (typeof block.block.UD === "function") && block.team == team)return true;
				}
				return this.nearestDetector(team, tile.worldx(), tile.worldy()) != null;
			}
			else
			{
				let block = tile.build;
			
				return (block != null && (block.block instanceof Drill) && (typeof block.block.UD === "function") && block.team == team) ||
					this.nearestDetector(team, tile.worldx(), tile.worldy()) != null;
			}
		},

		drawPlace(x, y, rotation, valid)
		{
			let tile = Vars.world.tile(x, y);
			let detector = this.nearestDetector(Vars.player.team(), x * 8, y * 8);
			if(tile == null)return;

			if(detector == null)
			{
				this.drawPlaceText(Core.bundle.get("bar.detectorreq"), x, y, valid);
				return;
			}

			this.countOre(tile);

			if(this.returnItem != null)
			{
				let width = this.drawPlaceText(Core.bundle.formatFloat("bar.drillspeed", 60 / this.getDrillTime(this.returnItem) * this.returnCount, 2), x, y, valid);
				let dx = x * Vars.tilesize + this.offset - width / 2 - 4
				let dy = y * Vars.tilesize + this.offset + this.size * Vars.tilesize / 2 + 5
				let s = Vars.iconSmall / 4;
				Draw.mixcol(Color.darkGray, 1);
				Draw.rect(this.returnItem.fullIcon, dx, dy - 1, s, s);
				Draw.reset();
				Draw.rect(this.returnItem.fullIcon, dx, dy, s, s);
			}
			else
			{
				let to = tile.getLinkedTilesAs(this, this.tempTiles).find(t => this.getUnderDrop(t.overlay()) != null && (this.getUnderDrop(t.overlay()).hardness > this.tier || this.getUnderDrop(t.overlay()) == this.blockedItem));
				let item = to == null ? null : to.overlay().getD();
				if(item != null)
				{
					this.drawPlaceText(Core.bundle.get("bar.drilltierreq"), x, y, valid);
				}
			}
		},

		setStats()
		{
			this.super$setStats();
			this.stats.remove(Stat.drillTier);
			var th = this;

            this.stats.add(
                Stat.drillTier,
                th.drillables(
                    th.drillTime,
                    th.hardnessDrillMultiplier,
                    th.size * th.size,
                    th.drillMultipliers,
                    new JavaAdapter(Boolf, {
                        get(b)
                        {
                            var drop = th.getUnderDrop(b);

                            return b instanceof OverlayFloor &&
                                typeof b.UOB === "function" &&
                                drop != null &&
                                drop.hardness <= th.tier &&
                                drop != th.blockedItem &&
                                (Vars.indexer.isBlockPresent(b) || Vars.state.isMenu());
                        }
                    })
                )
            );
		},

		canMine(tile)
		{
			if(tile == null || tile.block().isStatic())return false;
			let drops = this.getUnderDrop(tile.overlay());
			return drops != null && drops.hardness <= this.tier && drops != this.blockedItem;
		},

		countOre(tile)
		{
			this.returnItem = null;
			this.returnCount = 0;

			this.oreCount.clear();
			this.itemArray.clear();

			let tiles = tile.getLinkedTilesAs(this, this.tempTiles);
			for(let i = 0; i < tiles.size; i++)
			{
				let other = tiles.get(i);
				if(this.canMine(other) && (other.overlay() instanceof OverlayFloor) && (typeof other.overlay().UOB === "function"))
				{
					this.oreCount.increment(this.getUnderDrop(other.overlay()), 0, 1);
				}
			}

            let keys = this.oreCount.keys().toSeq();
            for (let i = 0; i < keys.size; i++) {
                let item = keys.get(i);
                this.itemArray.add(item);
            }

            let th = this
			
			let comparator = new Packages.java.util.Comparator({
				compare(item1, item2)
				{
					let type = java.lang.Boolean.compare(!item1.lowPriority, !item2.lowPriority);
				    if(type != 0)return type;
				    let amounts = java.lang.Integer.compare(th.oreCount.get(item1, 0), th.oreCount.get(item2, 0));
				    if(amounts != 0)return amounts;
				    return java.lang.Integer.compare(item1.id, item2.id);
				}
			});

            if(this.itemArray.size == 0)return;

			this.itemArray.sort(comparator);

			this.returnItem = this.itemArray.peek();
			this.returnCount = this.oreCount.get(this.itemArray.peek(), 0);
		},

		getOutput(tile) 
		{
			this.countOre(tile);

			return this.returnItem != null ? this.returnItem : Items.sand
		},

		getUnderDrop(b)
		{
            return (b instanceof OverlayFloor) && (typeof b.UOB === "function") ? b.getD() : null
		},

		nearestDetector(team, wx, wy)
		{
            return Vars.indexer.findTile(
                team,
                wx,
                wy,
                999,
                new JavaAdapter(Boolf, {
                    get(b)
                    {
                        return (typeof b.block.OR === "function") && Mathf.within(wx, wy, b.x, b.y, b.range())
                    }
                })
            );
		},

		drillables(drillTime, drillMultiplier, size, multipliers, filter)
		{
			return extend(StatValue, {
                display(table)
                {
                    table.row();

                    table.table(new JavaAdapter(Cons, {
                        get(c)
                        {
                            let count = 0;
                            let blocks = Vars.content.blocks();

                            for(let i = 0; i < blocks.size; i++)
                            {
                                let block = blocks.get(i);

                                if(!(block instanceof OverlayFloor) || !filter.get(block))continue;

                                let uo = block;

                                c.table(Styles.grayPanel, new JavaAdapter(Cons, {
                                    get(b)
                                    {
                                        b.image(uo.uiIcon)
                                        .size(40)
                                        .pad(10)
                                        .left()
                                        .scaling(Scaling.fit);

                                        b.image(uo.getD().uiIcon)
                                        .size(40)
                                        .pad(10)
                                        .left()
                                        .scaling(Scaling.fit);

                                        b.table(new JavaAdapter(Cons, {
                                            get(info)
                                            {
                                                info.left();

                                                info.add(uo.localizedName)
                                                .left()
                                                .row();
                                            }
                                        })).grow();

                                        if(multipliers != null)
                                        {
                                            let value = 60 / (Math.max(
                                                drillTime + drillMultiplier * uo.getD().hardness,
                                                drillTime
                                            ) / multipliers.get(uo.itemDrop, 1)) * size;

                                            b.add(
                                                Strings.autoFixed(value, 2) +
                                                StatUnit.perSecond.localized()
                                            )
                                            .right()
                                            .pad(10)
                                            .padRight(15)
                                            .color(Color.lightGray);
                                        }
                                    }
                                }))
                                .growX()
                                .pad(5);

                                count++;

                                if(count % 2 === 0) {
                                    c.row();
                                }
                            }
                        }
                    }))
                    .growX()
                    .colspan(table.getColumns());
                }
            });
		}
	})
	
	let build = () => extend(Drill.DrillBuild, block, {
		updateTile()
		{
			let x = this.tile.x
			let y = this.tile.y
	
            if(this.timer.get(block.timerDump, block.dumpTime))
			{
                this.dump(this.dominantItem != null && this.items.has(this.dominantItem) ? this.dominantItem : null);
            }

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
                    block.updateEffect.at(x * 8 + 4 + Mathf.range(block.size * 2), y * 8 + 4 + Mathf.range(block.size * 2));
            }
			else
			{
                this.lastDrillSpeed = 0;
                this.warmup = Mathf.approachDelta(this.warmup, 0, block.warmupSpeed);
                return;
            }

            if(this.dominantItems > 0 && this.progress >= delay && this.items.total() < block.itemCapacity)
			{
                this.offload(this.dominantItem);

                this.progress %= delay;

                if(this.wasVisible && Mathf.chanceDelta(block.drillEffectChance * this.warmup))
                    block.drillEffect.at(x * 8 + 4 + Mathf.range(block.drillEffectRnd), y * 8 + 4 + Mathf.range(block.drillEffectRnd), this.tileOn().floor().mapColor);
            }
        },

        onProximityUpdate()
		{
            this.super$onProximityUpdate();

            this.dominantItem = block.getOutput(this.tile);
			this.dominantItems = block.returnCount;
			if(block.returnCount == 0)this.dominantItems = 2
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
			let x = this.tile.worldx()
			let y = this.tile.worldy()
            let other = block.nearestDetector(this.team, x, y);
            return other != null && other.range() >= Mathf.dst(x, y, other.x, other.y) ? 1 : 0;
        },

        drawSelect()
		{
			let x = this.tile.worldx()
			let y = this.tile.worldy()
            this.super$drawSelect();
            let d = block.nearestDetector(Vars.player.team(), x, y);
            if(d != null)Drawf.dashLine(this.team.color, x + 4, y + 4, d.x, d.y);
        }
    })
	block.buildType = build
	return block
}

exports.UndergroundDrill = UndergroundDrill