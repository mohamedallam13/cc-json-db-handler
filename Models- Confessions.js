; (function (root, factory) {
  root.CONFESSION = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

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
      dbSplit: {
        core: ['confessionArr', 'key', 'id', '_id'],
        aux: ['statusArr', 'key', 'id', '_id'],
        secret: ['emailsArr']
      },
      id: 'sn',
      key: 'refNum',
      base: 'id'
    })

  return {
    CCMAIN: new Model(confessionSchema, { dbMain: "CCMAIN" })
  }

})
