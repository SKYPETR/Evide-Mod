Events.on(ClientLoadEvent, () => {
  let node = TechTree.node;
  let nodeRoot = TechTree.nodeRoot;
  let nodeProduce = TechTree.nodeProduce;
  
  let root = Vars.content.block("evide-core-breeze")
  
  Vars.content.planet("evide-evide").techTree = new nodeRoot("@planet.evide-evide.name", root, () => {
    new node(Vars.content.block("evide-iridium-duct"), () => {
      new node(Vars.content.block("evide-iridium-junction"), () => {
        new node(Vars.content.block("evide-iridium-router"), () => {
          new node(Vars.content.block("evide-iridium-sorter"), () => {
            new node(Vars.content.block("evide-iridium-inverted-sorter"), () => {})
          })
          new node(Vars.content.block("evide-iridium-bridge"), () => {})
        })
      })
    })
    
    new node(Vars.content.block("evide-steel-plasma-bore"), () => {
      new node(Vars.content.block("evide-ore-radar-small"), () => {
        new node(Vars.content.block("evide-overdrive-drill"), () => {})
      })
    })

    new node(Vars.content.block("evide-phosphorus-distiller"), () => {})
    
    new node(Vars.content.block("evide-arsonist"), () => {})
    
    new nodeProduce(Vars.content.item("evide-steel-plate"), () => {
      new nodeProduce(Vars.content.item("evide-phosphorus"), () => {
        new nodeProduce(Vars.content.liquid("evide-liquid-phosphorus"), () => {})
      })
      new nodeProduce(Vars.content.item("evide-iridium"), () => {
        new nodeProduce(Vars.content.item("evide-ice"), () => {
          new nodeProduce(Vars.content.liquid("water"), () => {})
        })
      })
    })
  })
})