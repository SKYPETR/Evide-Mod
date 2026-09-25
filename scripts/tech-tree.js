let { EItems } = require("items")
let { EBlocks } = require("blocks")

Events.on(ClientLoadEvent, () => {
	let node = TechTree.node;
	let nodeRoot = TechTree.nodeRoot;
	let nodeProduce = TechTree.nodeProduce;

	let root = EBlocks.coreBreeze;

	Vars.content.planet("evide-evide").techTree = new nodeRoot("@planet.evide-evide.name", root, () => {
		new node(Vars.content.block("evide-iridium-duct"), () => {
			new node(Vars.content.block("evide-iridium-duct-router"), () => {
				new node(Vars.content.block("evide-iridium-duct-bridge"), () => {});
				new node(Vars.content.block("evide-iridium-overflow-duct"), () => {
					new node(Vars.content.block("evide-iridium-underflow-duct"), () => {});
					new node(Vars.content.block("evide-iridium-duct-unloader"), () => {});
				});
			});
		});

		new node(EBlocks.steelPlasmaBore, () => {
			new node(EBlocks.oreRadarSmall, () => {
				new node(EBlocks.overdriveDrill, () => {});
			});
		});

		new node(Vars.content.block("evide-phosphorus-distiller"), () => {});

		new node(Vars.content.block("evide-arsonist"), () => {});

		new nodeProduce(EItems.steelPlate, () => {
			new nodeProduce(EItems.phosphorus, () => {
				new nodeProduce(Vars.content.liquid("evide-liquid-phosphorus"), () => {});
			});
			new nodeProduce(EItems.iridium, () => {});
			new nodeProduce(EItems.ice, () => {
				new nodeProduce(Liquids.water, () => {});
			});
			new nodeProduce(Items.sand, () => {});
		});
	});
});