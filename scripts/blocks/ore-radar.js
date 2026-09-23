/*
 * Copyright (C) 2026 FoksT4on
 * This script is based on code from the project: https://github.com/TeamOct/FOS.
 * The source code is available at: https://github.com/TeamOct/FOS/blob/master/src/fos/world/blocks/production/OreDetector.java.
 * The license of the original code: GPL-3.0.
 * This script is distributed under the same license: GPL-3.0.
 */

function OreRadar(name, ran, radCone, spd, col, dem, tr)
{
	let block = extend(Block, name, {
		range: ran,
		radarCone: radCone,
		speed: spd,
		effectColor: col,
		drillEfficiencyMultiplier: dem,
		tier: tr,

		solid: true,
		update: true,
		configurable: true,
		emitLight: true,
		canOverdrive: false,

		drawer: new DrawMulti([
			new DrawDefault(),
			extend(DrawGlowRegion, Layer.block, {
				color: col
			})
		]),

		OR(){},

		load()
		{
			this.super$load();
			this.drawer.load(this);

			this.range = Math.floor(this.range / 8) * 8;
			this.fogRadius = new java.lang.Integer(this.range / 8);
			this.clipSize = this.range * 2;
			this.config(java.lang.Boolean, (b, v) => b.setSO(v));
		},

		setStats()
		{
			this.super$setStats();

			this.stats.add(Stat.range, this.range / Vars.tilesize, StatUnit.blocks);
		},

		drawPlace(x, y, rotation, valid)
		{
			this.super$drawPlace(x, y, rotation, valid);

			let _x = x * Vars.tilesize + this.offset;
			let _y = y * Vars.tilesize + this.offset;

			Drawf.dashCircle(_x, _y, this.range, this.effectColor);

			Vars.indexer.eachBlock(
				Vars.player.team(),
				_x,
				_y,
				this.range,
				boolf(b =>
					b.block.UD != null
				),
				cons(b => {
					Drawf.square(b.x, b.y, b.block.size * Vars.tilesize / 2 + 2, this.effectColor);
					Drawf.dashLine(Vars.player.team().color, _x, _y, b.x, b.y);
				})
			);
		},

		icons()
		{
			return this.drawer.icons(this);
		}
	})

	let build = () => extend(Building, {
		showOres: true,
		startTime: 0,
		detectedOres: new Seq(),
		lastFogRadius: 0,

		setSO(value)
		{
			this.showOres = value;
		},

		fogRadius()
		{
			return (block.fogRadius - 0.1) * this.efficiency;
		},

		created()
		{
			this.startTime = Time.time;
		},

		range()
		{
			return block.range * this.potentialEfficiency;
		},

		warmup()
		{
			return this.efficiency;
		},

		eyeIcon()
		{
			return this.showOres ? Icon.eyeSmall : Icon.eyeOffSmall;
		},

		buildConfiguration(table)
		{
			table.button(this.eyeIcon(), Styles.clearTogglei, () => {
				this.showOres = !this.showOres;
				this.startTime = Time.time;
				this.configure(this.showOres);
				this.deselect();
			}).size(40);
		},

		//Disabled because there is no sound
		//shouldActiveSound()
		//{
			//return this.canConsume() && this.showOres;
		//},

		radarRot()
		{
			return (this.curTime() * block.speed) % 360;
		},

		curTime()
		{
			return Time.time - this.startTime;
		},

		updateTile()
		{
			if(this.fogRadius() != this.lastFogRadius)
			{
				Vars.fogControl.forceUpdate(this.team, this);
				this.lastFogRadius = this.fogRadius();
			}
		},

		draw()
		{
			this.super$draw();
			block.drawer.draw(this);

			if(this.canConsume() && this.team == Vars.player.team())
			{
				Draw.z(Layer.light);
				Draw.alpha(0.6);
				Lines.stroke(2.5, block.effectColor);

				Draw.alpha(1 - (this.curTime() % 120) / 120);
				Lines.circle(this.x, this.y, (this.curTime() % 120) / 120 * this.range());

				Draw.alpha(0.3);
				Fill.arc(this.x, this.y, this.range(), block.radarCone / 360, this.radarRot());

				Draw.alpha(0.2);
				Lines.circle(this.x, this.y, this.range());

				Draw.reset();
				this.locateOres(this.range());
			}
		},

		drawSelect()
		{
			Drawf.dashCircle(this.x, this.y, this.range(), block.effectColor);

			Vars.indexer.eachBlock(
				this,
				this.range(),
				boolf(b =>
					b.block.UD != null
				),
				cons(b => {
					Drawf.square(b.x, b.y, b.block.size * Vars.tilesize / 2 + 2, block.effectColor);
					Drawf.dashLine(this.team.color, this.x, this.y, b.x, b.y);
				})
			);
		},

		drawLight()
		{
			this.super$drawLight();

			Drawf.light(
				this.x,
				this.y,
				block.range * (0.4 + (Mathf.absin(this.totalProgress(), 10, 0.9) * 0.12 + 1 - 0.12) * this.potentialEfficiency * 0.9),
				block.effectColor,
				this.potentialEfficiency
			);
		},

		circle(x, y, width, height, radius, cons)
		{
			for(let dx = Math.max(x - radius, 0); dx <= Math.min(x + radius, width - 1); dx++)
			{
				for(let dy = Math.max(y - radius, 0); dy <= Math.min(y + radius, height - 1); dy++)
				{
					if(Mathf.within(dx + 0.5, dy + 0.5, x, y, radius))
						cons(Vars.world.rawTile(dx, dy));
				}
			}
		},

		locateOres(radius)
		{
			let hoverTile = Vars.world.tileWorld(Core.input.mouseWorld().x, Core.input.mouseWorld().y);

			let s = this

			this.circle(
				this.tile.x + 1.5,
				this.tile.y + 1.5,
				Vars.world.width(),
				Vars.world.height(),
				radius / Vars.tilesize, 
				ore => {
					if(ore.overlay().UOB != null)
					{
						let angle = Mathf.angle(ore.x - s.tile.x, ore.y - s.tile.y);
						let c1 = s.radarRot();
						let c2 = s.radarRot() + block.radarCone;
						if(c2 >= 360 && angle < 180)angle += 360;

						if(angle >= c1 && angle <= c2 && !s.detectedOres.contains(ore))
							s.detectedOres.add(ore);
					}
				}
			);

			for(let ore of this.detectedOres.toArray())
			{
				if(ore.overlay().UOB == null || ore.block() != Blocks.air || block.tier < ore.overlay().getDepth())continue;

				let ov = ore.overlay();

				let cond = true;

				if(!this.showOres)ov.setSDB(true);
				else
				{
					let angle = Mathf.angle(ore.x - this.tile.x, ore.y - this.tile.y);
					let c1 = this.radarRot();
					let c2 = this.radarRot() + block.radarCone;
					if(c2 >= 360 && angle < 180)angle += 360;

					cond = (angle >= c1 && angle <= c2);

					ov.setSDB(cond);
				}

				ov.drawBase(ore);
				ov.setSDB(false);

				if(ore == hoverTile && cond)
				{
					Draw.z(Layer.max);
					Draw.rect(ov.getD().uiIcon, ore.x * Vars.tilesize - 4, ore.y * Vars.tilesize + 4, Vars.iconSmall / 4, Vars.iconSmall / 4);
				}
			}
		},

		onDestroyed()
		{
			this.super$onDestroyed();

			Vars.indexer.eachBlock(
				this,
				this.range(),
				boolf(b =>
					b.potentialEfficiency > 0 &&
					b.block.UD != null
				),
				cons(b => {
					Fx.circleColorSpark.at(b.x, b.y, Pal.orangeSpark);
					Sounds.shieldBreakSmall.at(b);
				})
			);
		},

		write(write)
		{
			write.bool(this.showOres);
		},

		read(read, revision)
		{
			this.showOres = read.bool();
		}
	});
	block.buildType = build;
	return block;
}

exports.OreRadar = OreRadar