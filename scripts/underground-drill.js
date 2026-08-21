function conss(callback) {
    return new JavaAdapter(Cons, {
        get: callback
    });
}

function UndergroundDrill(name)
{
	let block = extend(Drill, name, {
		drillTime: 360,
		schematicPriority: -5,
		drawMineItem: false,
		canOverdrive: true,
		
		drill()
		{
			return 1
		},

		canPlaceOn(tile, team, rotation)
		{
			if(this.isMultiblock())
			{
				let tiles = tile.getLinkedTilesAs(this, this.tempTiles);

				for(let i = 0; i < tiles.size; i++)
				{
					let other = tiles.get(i);
					let block = other.build;
					if(block != null && (block.block instanceof Drill) && (typeof block.block.drill === "function") && block.team == team)return true;
				}
				return this.nearestDetector(team, tile.worldx(), tile.worldy()) != null;
			}
			else
			{
				let block = tile.build;
			
				return (block != null && (block.block() instanceof Drill) && (typeof block.block().drill === "function") && block.team == team) ||
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
				let s = this.iconSmall / 4;
				Draw.mixcol(Color.darkGray, 1);
				Draw.rect(this.returnItem.fullIcon, dx, dy - 1, s, s);
				Draw.reset();
				Draw.rect(this.returnItem.fullIcon, dx, dy, s, s);
			}
			else
			{
				let to = tile.getLinkedTilesAs(this, this.tempTiles).find(t => this.getUnderDrop(t.overlay()) != null && (this.getUnderDrop(t.overlay()).hardness > this.tier || this.getUnderDrop(t.overlay()) == this.blockedItem));
				let item = to == null ? null : to.drop();
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
			var thisBlock = this;

this.stats.add(
    Stat.drillTier,
    thisBlock.drillables(
        thisBlock.drillTime,
        thisBlock.hardnessDrillMultiplier,
        thisBlock.size * thisBlock.size,
        thisBlock.drillMultipliers,
        new JavaAdapter(Packages.arc.func.Boolf, {
            get: function(b) {
                var drop = thisBlock.getUnderDrop(b);

                return b instanceof OverlayFloor &&
                    drop != null &&
                    //drop.hardness <= thisBlock.tier &&
                    drop != thisBlock.blockedItem &&
                    (
                        Vars.indexer.isBlockPresent(b) ||
                        Vars.state.isMenu()
                    );
            }
        })
    )
);
			//this.stats.add(Stat.drillTier, this.drillables(this.drillTime, this.hardnessDrillMultiplier, this.size * this.size, this.drillMultipliers, b => b instanceof OverlayFloor &&
			//	this.getUnderDrop(b) != null && this.getUnderDrop(b).hardness <= this.tier && this.getUnderDrop(b) != this.blockedItem && (Vars.indexer.isBlockPresent(b) || Vars.state.isMenu())));
		},

		canMine(tile)
		{
			if(tile == null || tile.block().isStatic())return false;
			let drops = this.getUnderDrop(tile.overlay());
			return drops != null && drops.hardness <= this.tier && drops != this.blockedItem;
		},

		/*countOre(tile)
		{
			this.returnItem = null;
			this.returnCount = 0;

			this.oreCount.clear();
			this.itemArray.clear();

			let tiles = tile.getLinkedTilesAs(this, this.tempTiles);
			for(let i = 0; i < tiles.size; i++)
			{
				let other = tiles.get(i);
				if((other.overlay() instanceof OverlayFloor) && (typeof other.overlay().getCustomDrop === "function"))
				{
					this.oreCount.increment(this.getUnderDrop(other.overlay()), 0, 1);
				}
			}

			let keys = this.oreCount.keys()
			for(let i = 0; i < keys.size; i++)
			{
				let item = keys.get(i)
				this.itemArray.add(item);
			}
			
			let test = (item1, item2) => {
				let type = java.lang.Boolean.compare(!item1.lowPriority, !item2.lowPriority);
				if(type != 0)return type;
				let amounts = java.lang.Integer.compare(this.oreCount.get(item1, 0), this.oreCount.get(item2, 0));
				if(amounts != 0)return amounts;
				return java.lang.Integer.compare(item1.id, item2.id);
			}
			
			let th = this
			
			let test2 = new Packages.java.util.Comparator({
				compare: function(item1, item2)
				{
					let type = java.lang.Boolean.compare(!item1.lowPriority, !item2.lowPriority);
				if(type != 0)return type;
				let amounts = java.lang.Integer.compare(th.oreCount.get(item1, 0), th.oreCount.get(item2, 0));
				if(amounts != 0)return amounts;
				return java.lang.Integer.compare(item1.id, item2.id);
					let type =
						(item1.lowPriority ? 0 : 1) -
						(item2.lowPriority ? 0 : 1);

					if(type !== 0)return type;

					let amounts =
						th.oreCount.get(item1, 0) -
						th.oreCount.get(item2, 0);

					if(amounts !== 0)return amounts;

					return item1.id - item2.id;
				}
			});

			this.itemArray.sort(test2);

			if(this.itemArray.size == 0)return;

			this.returnItem = this.itemArray.peek();
			this.returnCount = this.oreCount.get(this.itemArray.peek(), 0);
		},*/
		countOre(tile) {
    this.returnItem = null;
    this.returnCount = 0;

    this.oreCount.clear();
    this.itemArray.clear();

    let tiles = tile.getLinkedTilesAs(this, this.tempTiles);

    for (let i = 0; i < tiles.size; i++) {
        let other = tiles.get(i);
        let overlay = other.overlay();

        if (!(overlay instanceof OverlayFloor)) {
            print("skip: overlay is not OverlayFloor");
            continue;
        }

        let drop = this.getUnderDrop(overlay);

        print(
            "tile=" + other.x + "," + other.y +
            " overlay=" + overlay.name +
            " drop=" + drop
        );

        if (drop == null) {
            print("skip: drop is null");
            continue;
        }

        if (drop.hardness > this.tier) {
            print(
                "skip: hardness " +
                drop.hardness +
                " > tier " +
                this.tier
            );
            continue;
        }

        if (drop == this.blockedItem) {
            print("skip: blocked item");
            continue;
        }

        //this.oreCount.increment(drop, 0, 1);
		let count = this.oreCount.get(drop, 0);
print("before put: " + count);

this.oreCount.put(drop, count + 1);


    }

    //let keys = this.oreCount.keys();

    //for (let i = 0; i < keys.size; i++) {
    //    this.itemArray.add(keys.get(i));
    //}
	let keys = this.oreCount.keys().toSeq();

for (let i = 0; i < keys.size; i++) {
    let item = keys.get(i);
    this.itemArray.add(item);
}

    print("oreCount size = " + this.itemArray.size);

    if (this.itemArray.size == 0) {
        return;
    }

    let th = this;

    let comparator = new Packages.java.util.Comparator({
        compare: function(item1, item2) {
            let type = java.lang.Boolean.compare(
                !item1.lowPriority,
                !item2.lowPriority
            );

            if (type != 0) return type;

            let amounts = java.lang.Integer.compare(
                th.oreCount.get(item1, 0),
                th.oreCount.get(item2, 0)
            );

            if (amounts != 0) return amounts;

            return java.lang.Integer.compare(item1.id, item2.id);
        }
    });

    this.itemArray.sort(comparator);

    this.returnItem = this.itemArray.peek();
    this.returnCount = this.oreCount.get(this.returnItem, 0);

    print(
        "returnItem = " +
        this.returnItem.name +
        ", returnCount = " +
        this.returnCount
    );
},

		getOutput(tile) 
		{
			this.countOre(tile);
			//if(this.returnItem == null)
			return this.returnItem != null ? this.returnItem : Items.sand
		},

		getUnderDrop(b)
		{
			if(b instanceof OverlayFloor && (typeof b.getCustomDrop === "function"))
			{
				let u = b
				return u.getCustomDrop()
			}
			else return null
		},

		nearestDetector(team, wx, wy)
		{
			//return Vars.indexer.findTile(team, wx, wy, 999, b => (typeof b.block.detector === "function"))//(b.block instanceof Drill)
				//&& Mathf.within(wx, wy, b.x, b.y, b.range()));
				
return Vars.indexer.findTile(
    team,
    wx,
    wy,
    999,
    new JavaAdapter(Boolf, {
        get(b) {
			//if(wx == 111)
			//print(typeof b.block.detector === "function")
            return typeof b.block.detector === "function" && Mathf.within(wx, wy, b.x, b.y, b.range())
        }
    })
);
		},

		drillables(drillTime, drillMultiplier, size, multipliers, filter)
		{
			print("drillables")
			return extend(StatValue, {
    display(table) {
        table.row();

        table.table(conss(function(c) {
            var count = 0;
            var blocks = Vars.content.blocks();

            for (var i = 0; i < blocks.size; i++) {
                var block = blocks.get(i);

                if (!(block instanceof OverlayFloor) ||
                    !filter.get(block)) {
                    continue;
                }

                var uo = block;

                c.table(Styles.grayPanel, conss(function(b) {
                    b.image(uo.uiIcon)
                        .size(40)
                        .pad(10)
                        .left()
                        .scaling(Scaling.fit);

                    b.image(uo.getCustomDrop().uiIcon)
                        .size(40)
                        .pad(10)
                        .left()
                        .scaling(Scaling.fit);

                    b.table(conss(function(info) {
                        info.left();

                        info.add(uo.localizedName)
                            .left()
                            .row();
                    })).grow();

                    if (multipliers != null) {
                        var value =
                            60 /
                            (
                                Math.max(
                                    drillTime +
                                        drillMultiplier *
                                        uo.getCustomDrop().hardness,
                                    drillTime
                                ) /
                                multipliers.get(uo.itemDrop, 1)
                            ) *
                            size;

                        b.add(
                            Strings.autoFixed(value, 2) +
                            StatUnit.perSecond.localized()
                        )
                        .right()
                        .pad(10)
                        .padRight(15)
                        .color(Color.lightGray);
                    }
                }))
                .growX()
                .pad(5);

                count++;

                if (count % 2 === 0) {
                    c.row();
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
			//let t = Packages.mindustry.entities.comp.TimerComp
            if(this.timer.get(block.timerDump, block.dumpTime))
			{
                this.dump(this.dominantItem != null && this.items.has(this.dominantItem) ? this.dominantItem : null);
            }

            if(this.dominantItem == null)return;

            this.timeDrilled += this.warmup * this.delta();

            let delay = block.getDrillTime(this.dominantItem);
		//print("1 " + this.dominantItem + "\n2 " + block.dominantItems)
			
            if(this.items.total() < block.itemCapacity && this.dominantItems > 0 && this.efficiency > 0)
			{
                let speed = Mathf.lerp(1, block.liquidBoostIntensity, this.optionalEfficiency) * this.efficiency;

                this.lastDrillSpeed = (speed * this.dominantItems * this.warmup) / delay;
                this.warmup = Mathf.approachDelta(this.warmup, speed, block.warmupSpeed);
                this.progress += this.delta() * this.dominantItems * speed * this.warmup;
				
                //if(Mathf.chanceDelta(block.updateEffectChance * this.warmup))
                    //this.updateEffect.at(x * 8 + Mathf.range(block.size * 2), y * 8 + Mathf.range(block.size * 2));
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

                // Fix drill effect chance being mistaken for update effect chance. TODO: If PR #10440 gets merged and v8 releases, then remove this override
                //if(this.wasVisible && Mathf.chanceDelta(block.drillEffectChance * this.warmup)) //block.drillEffect.at(x + Mathf.range(block.drillEffectRnd), y + Mathf.range(block.drillEffectRnd), this.tileOn().floor().mapColor);
            }
        },

        onProximityUpdate()
		{
            this.super$onProximityUpdate();

            this.dominantItem = block.getOutput(this.tile);
			this.dominantItems = block.returnCount;
			if(block.returnCount == 0)this.dominantItems = 2
			print("onProximityUpdate")
        },

        draw()
		{
			let x = this.tile.x
			let y = this.tile.y
            this.super$draw();

            Draw.color(this.dominantItem.color);
            Draw.rect(block.itemRegion, x, y);
            Draw.color();
        },

        /*efficiencyScale()
		{
			let x = this.tile.x
			let y = this.tile.y
            let other = block.nearestDetector(this.team, x, y);
            return other != null && other.range() >= Mathf.dst(x, y, other.x(), other.y()) ? 1 : 0;
			print("efficiencyScale")
        },*/

        drawSelect()
		{
			let x = this.tile.worldx()
			let y = this.tile.worldy()
            this.super$drawSelect();
			//print(d)
            let d = block.nearestDetector(Vars.player.team(), x, y);
            if(d != null)
			{	
				Drawf.dashLine(this.team.color, x + 4, y + 4, d.x, d.y);
            }
        }
    })
	
	block.buildType = build
	return block
}

let OverdriveDrill = new UndergroundDrill("overdrive-drill")