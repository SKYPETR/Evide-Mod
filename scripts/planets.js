let w1 = Color.valueOf("#6d7cdf"), w2 = Color.valueOf("#6058ba"),
		iw1 = Color.valueOf("#9fa7de"), iw2 = Color.valueOf("#828edd"),
		ice1 = Color.valueOf("#b2c3cb"), ice2 = Color.valueOf("#97adb5"),
		bice1 = Color.valueOf("#aab2d2"), bice2 = Color.valueOf("#8e9fc1"),
		cap1 = Color.valueOf("#d3dce7"), cap2 = Color.valueOf("#bad2e2");

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

			if(poles + base * 0.5 > this.capThresh)
			{
				return 0.23 + Simplex.noise3d(this.seed, 5, 0.7, 0.86, pos.x, pos.y, pos.z) * 0.7;
			}

			if(poles > this.ridgeThresh)
			{
				let fact = (poles - this.ridgeThresh) / ((this.capThresh - 0.2) - this.ridgeThresh);
				return (cliffs * fact > 0.05) ? cliffs * 0.37 : 0;
			}

			if(poles > 0.3)
			{
				let spike = Simplex.noise3d(this.seed + 2, 8, 0.55, 1.4, pos.x, pos.y, pos.z);

				if(spike > this.spikeThresh)
				{
					let fact = Mathf.clamp((poles - 0.4) / (this.ridgeThresh - 0.4));
					return (spike - this.spikeThresh) / (1 - this.spikeThresh) * 0.3 * fact;
				}
			}

			let berg = Simplex.noise3d(this.seed + 1, 5, 0.6, 1.3, pos.x, pos.y, pos.z);

			if(berg > this.bergThresh)
			{
				return Mathf.pow((berg - this.bergThresh) / (1 - this.bergThresh), 0.5) * 0.5;
			}
			return 0;
    },

		getHeight(position)
		{
			return this.rawHeight(position);
		},

		getColor(position, out)
		{
			out.set(this.makeColor(position));
			//out.set(Color.valueOf("4da6ff"));
			//let depth = Simplex.noise3d(this.seed, 2, 0.56, 1.7, position.x, position.y, position.z) / 2;
			//let c1 = Color.valueOf("4da6ff")
			//let c2 = Color.valueOf("006699")
			//out.set(c1).lerp(c2, Mathf.clamp(Mathf.round(depth, 0.15))).a = (1 - 0.2)
		},

		makeColor(position)
		{
			let poles = Math.abs(position.y);
			let base = Simplex.noise3d(this.seed, 6, 0.7, 0.8, position.x, position.y, position.z);
			let raw = this.rawHeight(position);
			let t = Mathf.clamp(Mathf.round(base, 0.15));
			let cliffs = Ridged.noise3d(12345, position.x, position.y, position.z, 5, 2);
			
			let isIce = raw > 0;

			if(isIce)
			{
				if(poles + base * 0.5 > this.capThresh)
				{
					return cap1.lerp(cap2, t);
				};

				let factice = (poles - this.ridgeThresh) / ((this.capThresh - 0.2) - this.ridgeThresh);

				if(factice * cliffs > 0.2)
				{
					return bice1.lerp(bice2, t);
				}
				return ice1.lerp(ice2, t);
			}

			let factwater = (poles - this.ridgeThresh * 0.8) / ((this.capThresh) - this.ridgeThresh * 0.8);
			let spike = Simplex.noise3d(this.seed + 2, 8, 0.55, 1.4, position.x, position.y, position.z);

			if(factwater > 0 && cliffs > 0.18)
			{
				return iw1.lerp(iw2, cliffs);
			}

			if(spike * base * factwater * 2 > 0.23)
			{
				return iw1.lerp(iw2, spike);
			}
      return w1.lerp(w2, t);
    }
	})
	return generator;
}

Events.on(ClientLoadEvent, () => {
	let planet = Vars.content.planet("evide-evide")
	planet.generator = new EvidePlanetGenerator()
	planet.meshLoader = () => new HexMesh(planet, 5)
	planet.reloadMesh()
	Log.infoTag(Core.bundle.get("mod.evide.name"), "planets.js loaded!")
})