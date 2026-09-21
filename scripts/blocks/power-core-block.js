function PowerCoreBlock(name)
{
	let block = extend(CoreBlock, name, {
		powerProduction: 1,
		hasPower: true,
		conductivePower: true,
		outputsPower: true,
		consumesPower: false,
		drawDisabled: true,

		setBars()
		{
			this.super$setBars();
			this.addBar("poweroutput", b => new Bar(
				() => Core.bundle.format("bar.poweroutput", Strings.fixed(b.getPowerProduction() * 60 + 0.0001, 1)),
				() => Pal.powerBar,
				() => 1
			));
		},

		setStats(){
			this.super$setStats();
			this.stats.remove(Stat.basePowerGeneration);
			this.stats.add(Stat.basePowerGeneration, this.powerProduction * 60.0, StatUnit.powerSecond);
		}
	});

	let build = () => extend(CoreBlock.CoreBuild, block, {
		getPowerProduction()
		{
			return this.enabled ? block.powerProduction : 0;
		}
	});
	block.buildType = build;
	return block;
}

exports.PowerCoreBlock = PowerCoreBlock