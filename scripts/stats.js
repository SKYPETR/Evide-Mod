function customDrillables(drillTime, drillMultiplier, size, multipliers, filter, underground)
{
	return extend(StatValue, {
		display(table)
		{
			table.row();
			table.table(cons(c => {
				let count = 0;
				let blocks = Vars.content.blocks();
				
				for(let block of blocks.toArray())
				{
					if(!filter.get(block))continue;
					let drop = underground ? (block.UOB != null ? block.getD() : null) : block.itemDrop;
					c.table(Styles.grayPanel, cons(b => {
						b.image(block.uiIcon)
						.size(40)
						.pad(10)
						.left()
						.scaling(Scaling.fit);
						b.table(cons(info => {
							info.left();
							info.add(block.localizedName)
							.left()
							.row();
							info.add("")
							.with(l => StatValues.withTooltip(l, drop))
							.left();
						})).grow();
						if(multipliers != null)
						{
							b.add(Strings.autoFixed(60 / (Math.max(drillTime + drillMultiplier * drop.hardness, drillTime) / multipliers.get(drop, 1)) * size, 2) + StatUnit.perSecond.localized())
							.right()
							.pad(10)
							.padRight(15)
							.color(Color.lightGray);
						}
					}))
					.grow()
					.pad(5);
					if(++count % 2 == 0)c.row();
				}
			}))
			.growX()
			.colspan(table.getColumns());
		}
	})
}

exports.customDrillables = customDrillables