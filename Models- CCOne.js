; (function (root, factory) {
  root.CCER = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const DBMAIN = "CCONE";

  const statusSchemaMap = {
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    status: {
      type: "string",
      enums: ['pending', 'accepted', 'rejected', 'deferred']
    }
  }

  const statusSchema = new Schema(statusSchemaMap)

  const userSchemaMap = {
    name: {
      defaultValue: "",
      type: "string"
    },
    age: {
      type: "number"
    },
    email: {
      type: "string"
    },
    statusArr: [statusSchema],
    key: {
      type: "string"
    },
    id: {
      type: "number"
    }
  };

  const userSchema = new Schema(userSchemaMap,
    {
      dbMain: DBMAIN,
      dbSplit: {
        core: ["name", "age", "email", 'key', 'id'],
        aux: ['statusArr', 'key', 'id']
      }
    });

  const model = new Model(userSchema, {});

  return model

})