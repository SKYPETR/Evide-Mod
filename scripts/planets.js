function EvidePlanetGenerator()
{
	let generator = extend(PlanetGenerator, {
		capThresh: 1.13,
		ridgeThresh: 0.42,
		spikeThresh: 0.8,
		bergThresh: 0.65,

		rawHeight(pos)
		{
			let poles = Math.abs(pos.y);
			let base = Simplex.noise3d(this.seed, 6, 0.7, 0.8, pos.x, pos.y, pos.z);
			let cliffs = Ridged.noise3d(12345, pos.x, pos.y, pos.z, 5, 2);

			if(poles + base * 0.5 > capThresh)
			{
				return 0.23 + Simplex.noise3d(this.seed, 5, 0.7, 0.86, pos.x, pos.y, pos.z) * 0.7;
			}

			if(poles > ridgeThresh)
			{
				let fact = (poles - ridgeThresh) / ((capThresh - 0.2) - ridgeThresh);
				return (cliffs * fact > 0.05) ? cliffs * 0.37 : 0;
			}

			if(poles > 0.3)
			{
				let spike = Simplex.noise3d(this.seed + 2, 8, 0.55, 1.4, pos.x, pos.y, pos.z);

				if(spike > spikeThresh)
				{
					let fact = Mathf.clamp((poles - 0.4) / (ridgeThresh - 0.4));
					return (spike - spikeThresh) / (1 - spikeThresh) * 0.3 * fact;
				}
			}

			let berg = Simplex.noise3d(seed + 1, 5, 0.6, 1.3, pos.x, pos.y, pos.z);

			if(berg > bergThresh)
			{
				return Mathf.pow((berg - bergThresh) / (1 - bergThresh), 0.5) * 0.5;
			}
			return 0;
    },
		
		getSlope(position, sampleRadius)
		{
			let center = getHeight(position);
			let samples = {
				position.cpy().add(sampleRadius, 0, 0),
				position.cpy().add(-sampleRadius, 0, 0),
				position.cpy().add(0, 0, sampleRadius),
				position.cpy().add(0, 0, -sampleRadius)
			};

			let slopeSum = 0;

			for(let sample in samples) {
				slopeSum += Math.abs(center - getHeight(sample));
			}
			return slopeSum / samples.length;
		},

		getHeight(position)
		{
			return rawHeight(position);
		},

		getColor(position, out)
		{
			out.set(Color.valueOf("4da6ff"));
		}
	})
	return generator;
}

Events.on(ClientLoadEvent, () => {
	let planet = Vars.content.planet("evide-evide")
	planet.generator = new EvidePlanetGenerator()
	planet.meshLoader = () => new HexMesh(planet, 5)
})