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

  const emailsSchemaMap = {
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

  const emailsSchema = new Schema(emailsSchemaMap)

  const confessionsInfoSchemaMap = {
    confession: {
      defaultValue: "",
      type: "string"
    },
    sn: {
      type: "number"
    },
    category: {
      type: "string"
    }
  }

  const confessionsInfoSchema = new Schema(confessionsInfoSchemaMap)

  const confessionSchemaMap = {
    confessionArr: [confessionsInfoSchema],
    statusArr: [statusSchema],
    emailsArr: [emailsSchema]
  };


  const confessionSchema = new Schema(confessionSchemaMap,
    {
      dbMain: DBMAIN,
      dbSplit: {
        core: ["name", "age", 'key', 'id'],
        aux: ['statusArr', 'key', 'id'],
        secret: ["email"]
      },
      id: "sn",
      key: "refNum",
      base: "id"
    })

  const model = new Model(confessionSchema, {});

  return model

})
