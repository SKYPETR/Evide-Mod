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