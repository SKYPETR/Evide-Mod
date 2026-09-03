let EItems = {
  ice: new Item("ice", Color.valueOf("90bfef")),
  iridium: new Item("iridium", Color.valueOf("cfd6e7")),
  phosphorus: new Item("phosphorus", Color.valueOf("ae3f3f")),
  steelPlate: new Item("steel-plate", Color.valueOf("3f3f3f")),

  init()
  {
    this.phosphorus.explosiveness = 1.2
    this.phosphorus.flammability = 2
  }
}

EItems.init()

exports.EItems = EItems