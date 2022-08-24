; (function (root, factory) {
  root.ORM = factory()
})(this, function () {

  const connectionsObj = {};

  const { init } = JSON_DB_HANDLER;

  function startConnection(indexFileIdsObj) {
    Object.entries(indexFileIdsObj).forEach(([connectionLabel, indexFileId]) => {
      connectionsObj[connectionLabel] = init(indexFileId);
    })
    return connectionsObj
  }

  function saveDB() {
    Object.entries(connectionsObj).forEach(([connectionLabel, connectionObj]) => {
      connectionObj.saveToDBFiles();
    });
  }

  function clearDB() {
    Object.entries(connectionsObj).forEach(([connectionLabel, connectionObj]) => {
      connectionObj.destroyDB();
    })
  }

  class Schema {
    constructor(map, options = {}) {
      this.map = map;
      this.options = options;
    }

    getSplitObj(rawObj) {
      console.log(this)
      const { dbSplit } = this.options;
      console.log(connectionsObj)
      const properObj = this.getProperObj(rawObj);
      let splitObj = {};
      Object.entries(dbSplit).forEach(([db, propsArray]) => {
        propsArray.forEach(key => {
          if (!splitObj[db]) splitObj[db] = {};
          splitObj[db][key] = properObj[key]
        })
      })
      return splitObj;
    }

    getProperObj(rawObj) {
      const { map } = this;
      const properObj = Object.entries(map).reduce((acc, [key, properties]) => {
        let value;
        if (Array.isArray(properties)) {
          const innerSchema = properties[0];
          value = innerSchema.getProperObj(rawObj);
          return { ...acc, [key]: [value] }
        }
        value = this.applyConfigs(key, properties, rawObj);
        return { ...acc, [key]: value }
      }, {});
      return properObj
    }

    applyConfigs(key, properties, rawObj) {
      let { validate, defaultValue, type, required, enums } = properties;
      let value = rawObj[key];
      if (required) if (!value || value == "") throw `${key} has to have a value!`;
      if (defaultValue) value = value || defaultValue;
      console.log(typeof value)
      if (type) if (typeof value != type) throw `${key} does not have the correct type!`;
      if (validate) if (!validate(value)) throw `${key} does not have a valid value!`;
      if (enums) if (!enums.includes(value)) throw `${key} does not have a valid choices!`;
      return value;
    }

  }

  function createSchema(map, options = {}) {

    function getSplitObj(rawObj) {
      const { dbSplit } = options;
      const properObj = getProperObj(rawObj);
      let splitObj = {};
      Object.entries(dbSplit).forEach(([db, propsArray]) => {
        propsArray.forEach(key => {
          if (!splitObj[db]) splitObj[db] = {};
          splitObj[db][key] = properObj[key]
        })
      })
      return splitObj;
    }

    function getProperObj(rawObj) {
      const properObj = Object.entries(map).reduce((acc, [key, properties]) => {
        let value;
        if (Array.isArray(properties)) {
          const innerSchema = properties[0];
          value = innerSchema.getProperObj(rawObj);
          return { ...acc, [key]: [value] }
        }
        value = applyConfigs(key, properties, rawObj);
        return { ...acc, [key]: value }
      }, {});
      return properObj
    }

    function applyConfigs(key, properties, rawObj) {
      let { validate, defaultValue, type, required, enums } = properties;
      let value = rawObj[key];
      if (required) if (!value || value == "") throw `${key} has to have a value!`;
      if (defaultValue) value = value || defaultValue;
      console.log(typeof value)
      if (type) if (typeof value != type) throw `${key} does not have the correct type!`;
      if (validate) if (!validate(value)) throw `${key} does not have a valid value!`;
      if (enums) if (!enums.includes(value)) throw `${key} does not have a valid choices!`;
      return value;
    }
    return {
      map,
      options,
      getSplitObj,
      getProperObj
    }
  }


  class Model {
    constructor(schema, options) {
      this.schema = schema
      this.options = options
    }

    createFragmentModel(dbFragment) {
      this[dbFragment] = new Model(schema, { dbFragment })
      return this
    }

    add(request) {
      const { getSplitObj } = this.schema;
      const { dbMain } = this.schema.options
      const { dbFragment } = this.options

      // const splitProperObj = getSplitObj.call(this.schema, request);
      const getSplitObj_ = getSplitObj.bind(this.schema);
      const splitProperObj = getSplitObj_(request);
      Object.entries(splitProperObj).forEach(([db, obj]) => {
        connectionsObj[db].addToDB(obj, { dbMain, dbFragment });
      });
      return this
    }

    updateArray() {

    }

    delete(id, db) {

    }

    findByKey(key) {
      const { dbMain } = this.schema.options
      const { dbFragment } = this.options

      let entry;
      Object.entries(connectionsObj).forEach(([connectionLabel, connectionObj]) => {
        const partialEntry = connectionObj.lookUp(key, { dbMain, dbFragment });
        if (partialEntry) entry = Object.assign({}, entry, partialEntry);
      })
      if (!entry) return entry;
      return entry;
    }
  }

  // return {
  //   connectionsObj,
  //   startConnection,
  //   clearDB,
  //   Schema,
  //   Model
  // }
  return {
    connectionsObj,
    startConnection,
    clearDB,
    saveDB,
    Schema,
    createSchema,
    Model
  }

})

function dbStart() {
  const { REFERENCES_MANAGER } = CCLIBRARIES;
  const { startConnection } = ORM
  const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
  const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex"];
  const referencesObj = REFERENCES_MANAGER.init(MASTER_INDEX_FILE_ID).requireFiles(REQUIRED_REFERENCES).requiredFiles;
  const { CCJSONsDBSuperIndex } = referencesObj;
  const connectionsObj = startConnection(CCJSONsDBSuperIndex.fileContent); // Start the Database
  console.log(connectionsObj);
}

function test_ORMDestroy() {
  const { clearDB } = ORM
  dbStart();
  clearDB();
}

function test_ORM() {

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;
  const { createSchema, Model, Schema, saveDB } = ORM

  dbStart();

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

  // const statusSchema = createSchema(statusSchemaMap)
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

  // const userSchema = createSchema(userSchemaMap,
  //   {
  //     dbMain: DBMAIN,
  //     dbSplit: {
  //       core: ["name", "age", "email", 'key', 'id'],
  //       aux: ['statusArr', 'key', 'id']
  //     }
  //   });

  const userSchema = new Schema(userSchemaMap,
    {
      dbMain: DBMAIN,
      dbSplit: {
        core: ["name", "age", "email", 'key', 'id'],
        aux: ['statusArr', 'key', 'id']
      }
    });

  const model = new Model(userSchema, {});

  const request = {
    name: "Mohamed Allam",
    age: 34,
    email: "mh.allam@yahoo.com",
    status: "pending",
    key: "mh.allam@yahoo.com",
    id: 1
  }

  model.add(request)
  saveDB()
  const x = 1;
}

function testCompile() {
  console.log("Compiled!")
}