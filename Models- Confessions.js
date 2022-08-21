; (function (root, factory) {
  root.CONFESSION = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const DBMAIN = "CCMAIN"

  const confessionSchemaMap = {
    confession: {
      validate: () => { },
      defaultValue: "",
      type: "string"
    },
    sn: {
    },
    category: {

    },
    status: {
      enums: ['posted', 'rejected', 'skipped']
    }
  };


  const confessionSchema = new Schema(confessionSchemaMap,
    {
      dbMain: DBMAIN,
      dbSplit: {
        core: [],
        aux: []
      }
    })

  const model = new Model(confessionSchema, {});

  return model

})
