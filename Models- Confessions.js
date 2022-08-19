; (function (root, factory) {
  root.CONFESSION = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const DBMAIN = "CCMAIN"

  const confessionSchemaMap = {
    confession: {
      db: "core",
      validate: () => { },
      defaultValue: "",
      type: "string"
    },
    sn: {
      db: "core"
    },
    category: {
      db: "core"

    },
    status: {
      db: "status",
      enums: ['posted', 'rejected', 'skipped']
    }
  };


  const confessionSchema = new Schema(confessionSchemaMap,
    { dbMain: DBMAIN })

  const model = new Model(confessionSchema, {});

  return model

})
