; (function (root, factory) {
  root.CONFESSION = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const DBMAIN = "CCMAIN"

  const statusSchemaMap = {
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    status: {
      type: "string",
      defaultValue: 'pending',
      enums: ['pending', 'posted', 'rejected', 'skipped']
    }
  }

  const statusSchema = new Schema(statusSchemaMap)

  const confessionSchemaMap = {
    confession: {
      validate: () => { },
      defaultValue: "",
      type: "string"
    },
    sn: {
      type: "number"
    },
    category: {
      type: "string"
    },
    statusArr: [statusSchema]
  };


  const confessionSchema = new Schema(confessionSchemaMap,
    {
      dbMain: DBMAIN,
      dbSplit: {
        core: ["name", "age", "email", 'key', 'id'],
        aux: ['statusArr', 'key', 'id']
      }
    })

  const model = new Model(confessionSchema, {});

  return model

})
