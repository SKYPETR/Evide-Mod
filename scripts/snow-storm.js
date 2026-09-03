Events.on(ClientLoadEvent, () => {

	const STEP_CHANCE = 0.03;
	const MAX_CHANCE = 0.30;
	const REPLACE_INTERVAL = 120;
	const TILES_PER_TICK = 10;
	const STORM_NAME = "evide-snow-storm";

	const snowFloor = [Vars.content.block("snow").asFloor(), Vars.content.block("snow").asFloor()];

	let allTiles = [];
	let snowTiles = [];
	let snowIndex = 0;
	let currentChance = 0;
	let isStorming = false;
	let timer = 0;

	function isStormActive()
	{
		if(Vars.content.weather(STORM_NAME).isActive())return true;
		return false;
	}

	function collectAllTiles()
	{
		allTiles = [];
		let world = Vars.world;
		let w = world.width();
		let h = world.height();

		for(let x = 0; x < w; x++)
		{
			for(let y = 0; y < h; y++)
			{
				let tile = world.tile(x, y);
				if(tile != null)allTiles.push(tile);
			}
		}

		for(let i = allTiles.length - 1; i > 0; i--)
		{
			let j = Math.floor(Math.random() * (i + 1));
			let tmp = allTiles[i];
			allTiles[i] = allTiles[j];
			allTiles[j] = tmp;
		}
	}

	function addNextStep()
	{
		if(currentChance >= MAX_CHANCE)return;

		currentChance = Math.min(currentChance + STEP_CHANCE, MAX_CHANCE);
		let targetCount = Math.floor(allTiles.length * currentChance);

		for(let i = snowTiles.length; i < targetCount; i++)
		{
			snowTiles.push(allTiles[i]);
		}
	}

	function replaceNextBatch()
	{
		if(snowIndex >= snowTiles.length)return;

		let end = Math.min(snowIndex + TILES_PER_TICK, snowTiles.length);
		for(let i = snowIndex; i < end; i++)
		{
			let tile = snowTiles[i];
			let conditionF = tile.floor().liquidDrop == null;
			let conditionB = tile.block() != Vars.content.block("evide-icy-steel-wall");
			
			if(tile != null && conditionF)
			{
				let snow = snowFloor[Math.floor(Math.random() * snowFloor.length)];
				tile.setFloor(snow);
			}

			if(tile.block() instanceof StaticWall && tile.team() == "derelict" && conditionB)
			{
				tile.setBlock(Vars.content.block("snow-wall"));
			}
			
			if(tile.block() instanceof StaticProp && tile.team() == "derelict" && conditionB)
			{
				tile.setBlock(Vars.content.block("snow-boulder"));
			}
		}
		snowIndex = end;
	}

	Events.run(Trigger.update, () => {

		if(!Vars.state.isPlaying())
		{
			reb();
			return;
		}

		let active = isStormActive();

		if(active && !isStorming)
		{
			isStorming = true;
			currentChance = 0;
			snowTiles = [];
			snowIndex = 0;
			timer = 0;
			collectAllTiles();
			addNextStep();
		}
		else if(!active && isStorming)reb();

		if(!isStorming)
		{
			reb();
			return;
		}

		timer++;
		if(timer >= REPLACE_INTERVAL)
		{
			timer = 0;
			addNextStep();
		}

		replaceNextBatch();
	})

	function reb()
	{
		isStorming = false;
		allTiles = [];
		snowTiles = [];
		snowIndex = 0;
		currentChance = 0;
	}
	
	Vars.ui.content.show(Vars.content.block("evide-overdrive-drill"));
	Vars.ui.content.hide();

	Events.run(Trigger.update, () => {
		let block = Vars.content.block("evide-overdrive-drill");
		if(Vars.state.isPlaying())
		{
			if(isStormActive())block.drillTime = 250;		
			else block.drillTime = 200;
		
			block.stats.replace(Stat.drillSpeed, StatValues.number(60 / block.drillTime * block.size * block.size, StatUnit.itemsSecond));
		}
	})
})