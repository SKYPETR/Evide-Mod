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
    hasPower: true,
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

			this.fogRadius = new java.lang.Integer(this.range / 8)
			this.clipSize = this.range * 2
			this.config(java.lang.Boolean, (r, b) => r.setSO(b));
    },

		setStats()
		{
      this.super$setStats();

      this.stats.add(Stat.range, this.range / Vars.tilesize, StatUnit.blocks);
    },

		drawPlace(x, y, rotation, valid)
		{
      this.super$drawPlace(x, y, rotation, valid);
      Drawf.dashCircle(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.range, this.effectColor);
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

		setSO(value)
		{
			this.showOres = value
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
    //  return this.canConsume() && this.showOres;
    //},

    radarRot()
		{
      return (this.curTime() * block.speed) % 360
    },

    curTime()
    {
      return Time.time - this.startTime;
    },

    updateTile()
		{
      if(this.canConsume() && block.drillEfficiencyMultiplier > 1)
			{
				Vars.indexer.eachBlock(
    			this,
    			this.range(),
    			new JavaAdapter(Boolf, {
        		get(other)
						{
            	return other != null &&
              	other.block instanceof Drill &&
                other.block.canOverdrive &&
                typeof other.block.UD === "function";
        		}
    			}),
    			new JavaAdapter(Cons, {
        		get(other)
						{
            	other.applyBoost(
                other.efficiency *
                block.drillEfficiencyMultiplier,
                10
            	);
        		}
    			})
				);
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
        Lines.circle(this.x, this.y, this.range() * 0.95);

        Draw.reset();
        this.locateOres(this.range());
      }
    },

    drawSelect()
		{
      Drawf.dashCircle(this.x, this.y, block.range, block.effectColor);
    },

    locateOres(radius)
    {
      let hoverTile = Vars.world.tileWorld(Core.input.mouseWorld().x, Core.input.mouseWorld().y);
            
      let th = this
            
      this.tile.circle(radius / Vars.tilesize, Cons({
				get(ore)
				{
					if(ore != null && ore.overlay() != null && ore.overlay() instanceof OverlayFloor && typeof ore.overlay().UOB === "function")
					{
						let angle = Mathf.angle(ore.x - th.tile.x, ore.y - th.tile.y);
						let c1 = th.radarRot();
						let c2 = th.radarRot() + block.radarCone;
						if(c2 >= 360 && angle < 180)angle += 360;

						if(angle >= c1 && angle <= c2 && !th.detectedOres.contains(ore))
						{
							th.detectedOres.add(ore);
						}
					}
				}
			}));

      for(let i = 0; i < this.detectedOres.size; i++)
			{
				let ore = this.detectedOres.get(i);
       
        if(ore.block() != Blocks.air || ore.overlay() == Blocks.air || block.tier < ore.overlay().getDepth())continue;
                
				let u = ore.overlay()
				
				let cond = true;
				
				if(!this.showOres){
					u.setSDB(true)
				}
				else
				{
					let angle = Mathf.angle(ore.x - this.tile.x, ore.y - this.tile.y);
					let c1 = this.radarRot();
					let c2 = this.radarRot() + block.radarCone;
					if(c2 >= 360 && angle < 180)angle += 360;
					
					let inCone = (angle >= c1 && angle <= c2);
				
					u.setSDB(inCone)
					cond = inCone
				}
				
				u.drawBase(ore);
				u.setSDB(false)

				if(ore == hoverTile && ore.block() != null && cond)
				{
					Draw.z(Layer.max);
					Draw.alpha(1);
					Draw.rect(u.getD().uiIcon, ore.x * 8, ore.y * 8 + 8);
				}
      }
    },

    onDestroyed()
		{
      this.super$onDestroyed();

      Vars.indexer.eachBlock(
        this,
        this.range(),
        new JavaAdapter(Boolf, {
          get(other)
          {
            return other != null &&
              other.block instanceof Drill &&
              other.enabled &&
              other.potentialEfficiency > 0 &&
              typeof other.block.UD === "function";
          }
        }),
        new JavaAdapter(Cons, {
          get(other)
          {
            Fx.circleColorSpark.at(other.x, other.y, Pal.orangeSpark);

            Sounds.shieldBreakSmall.at(other);
          }
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
  })
  block.buildType = build
  return block
}

exports.OreRadar = OreRadar