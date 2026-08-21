function UndergroundOreBlock(name, item)
{
	let block = extend(OverlayFloor, name, {
		drop: item,
    	depth: 1,

		shouldDrawBase: false,
		
		needsSurface: false,
		useColor: false,
		playerUnmineable: true,
		variants: 1,
		
		getSDB()
		{
			return this.shouldDrawBase
		},
		
		setSDB(value)
		{
			this.shouldDrawBase = value
		},
		
		getCustomDrop()
		{
			return this.drop
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

let UndergroundOreLead = new UndergroundOreBlock("underground-ore-lead", Items.lead)
UndergroundOreLead.variants = 2