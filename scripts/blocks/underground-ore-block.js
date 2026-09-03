/*
 * Copyright (C) 2026 FoksT4on
 * This script is based on code from the project: https://github.com/TeamOct/FOS.
 * The source code is available at: https://github.com/TeamOct/FOS/blob/master/src/fos/world/blocks/environment/UndergroundOreBlock.java.
 * The license of the original code: GPL-3.0.
 * This script is distributed under the same license: GPL-3.0.
 */

function UndergroundOreBlock(name, item, dep)
{
	let depth = dep

	let block = extend(OverlayFloor, name, {
		drop: item,
		shouldDrawBase: false,
		
		needsSurface: false,
		useColor: false,
		playerUnmineable: true,
		variants: 1,

		UOB(){},

		getD()
		{
			return this.drop
		},

		getDepth()
		{
			return depth
		},
		
		getSDB()
		{
			return this.shouldDrawBase
		},
		
		setSDB(value)
		{
			this.shouldDrawBase = value
		},

		load()
		{
			this.super$load();
  	
			if(this.itemDrop != null)
			{
				this.drop = this.itemDrop;
				this.itemDrop = null;
			}
		},

		drawBase(tile)
		{
			if(tile.overlay().getSDB() || Vars.state.isEditor())
			{
				let l = Draw.z();
				Draw.z(Layer.light);
				
				this.super$drawBase(tile);
				
				Draw.z(l);
			}
		}
	})
	return block
}

exports.UndergroundOreBlock = UndergroundOreBlock