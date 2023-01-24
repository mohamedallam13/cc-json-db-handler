; (function (root, factory) {
  root.CONFESSION = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const statusSchemaMap = {
    timestamp: {
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
    },
    location: {
      type: "string"
    }
  }

  const confessionsInfoSchema = new Schema(confessionsInfoSchemaMap)

  const similarConfessionsSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    confessionId: {
      type: "IdObject"
    }
  }

  const similarConfessionsSchema = new Schema(similarConfessionsSchemaMap)

  const confessionSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    confessionArr: [confessionsInfoSchema],
    statusArr: [statusSchema],
    similarConfessions: [similarConfessionsSchema],
    emailsArr: [emailsSchema],
    sn: {
      type: "string"
    }
  };


  const confessionSchema = new Schema(confessionSchemaMap,
    {
      dbSplit: {
        core: ['sn','confessionArr', 'key', 'id', '_id', '_v'],
        aux: ['statusArr', 'key', 'id'],
        secret: ['emailsArr', 'key', 'id']
      },
      id: 'sn',
      key: 'refNum',
      base: 'id'
    })

  return {
    CCMAIN: new Model(confessionSchema, { dbMain: "CCMAIN" })
  }

})
