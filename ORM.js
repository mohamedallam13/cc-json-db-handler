; (function (root, factory) {
  root.ORM = factory()
})(this, function () {

  const connectionsObj = {};

  const { init } = JSON_DB_HANDLER;

  function startConnection(indexFileIdsObj) {
    Object.entries(indexFileIdsObj).forEach(([connectionLabel, { indexFileId }]) => {
      connectionsObj[connectionLabel] = init(indexFileId);
    })
    return connectionsObj
  }

  function saveDB() {
    Object.entries(connectionsObj).forEach(([, connectionObj]) => {
      connectionObj.saveToDBFiles();
    });
  }

  function clearDB() {
    Object.entries(connectionsObj).forEach(([, connectionObj]) => {
      connectionObj.destroyDB();
    })
  }

  class Schema {
    constructor(map, options = {}) {
      this.map = map;
      this.options = options;
    }

    getProperObj(rawObj, updateKeys) {
      const { map, options } = this;
      const properObj = Object.entries(map).reduce((acc, [key, properties]) => {
        if (updateKeys) if (updateKeys.includes(key)) return
        let value;
        if (Array.isArray(properties)) {
          const innerSchema = properties[0];
          value = innerSchema.getProperObj(rawObj);
          if (checkArrayValueIsEmpty(value)) return { ...acc, [key]: [] }
          return { ...acc, [key]: [value] }
        }
        value = this.applyConfigs(key, properties, rawObj);
        return { ...acc, [key]: value }
      }, {});
      if (!Object.keys(options).length == 0) {
        this.addId(properObj, rawObj)
        this.addKey(properObj, rawObj)
      }
      return properObj
    }

    applyConfigs(key, properties, rawObj) {  //Private
      let { validate, defaultValue, type, required, enums, setValue } = properties;
      let value = rawObj[key];
      if (setValue) value = setValue(rawObj);
      if (required) if (!value || value == "") throw `${key} has to have a value!`;
      if (defaultValue) value = value || defaultValue;
      if (type) {
        if (type == "IdObject") {
          if (!value || value == "") {
            value = ""; // Set value to blank in case there is no value provided for an id object
          } else if (!value instanceof IdObj) {
            throw `${key} does not have the correct type of IdObj!`;
          }
        } else if (typeof value != type) {
          throw `${key} does not have the correct type!`;
        }
      }

      if (validate) if (!validate(value)) throw `${key} does not have a valid value!`;
      if (enums) if (!enums.includes(value)) throw `${key} does not have a valid choices!`;
      return value;
    }


    addId(properObj, rawObj) { //Private
      const IdObj = function (id, dbMain, dbFragment) {
        this.id = id
        this.dbMain = dbMain;
        this.dbFragment = dbFragment;
      }
      const { id } = this.options;
      const { dbMain, dbFragment } = rawObj;
      const _id = properObj[id];
      if (!_id) return
      properObj.id = new IdObj(_id, dbMain, dbFragment)
    }

    addKey(properObj, rawObj) {  //Private
      const { key } = this.options;
      properObj.key = rawObj[key];
    }

    checkArrayValueIsEmpty(value) {  //Private
      if (typeof value == "object") {
        let bool = false;
        Object.entries(value).forEach(([key, val]) => {
          if (key == "timestamp") return
          bool = val == "" && bool
        })
        return bool
      }
      return value == "";
    }

    getSplitObj(properObj) {
      const { dbSplit } = this.options;
      let splitObj = {};
      Object.entries(dbSplit).forEach(([db, propsArray]) => {
        propsArray.forEach(key => {
          if (!splitObj[db]) splitObj[db] = {};
          splitObj[db][key] = properObj[key]
        })
      })
      return splitObj;
    }

  }

  class Model {
    constructor(schema, options) {
      this.schema = schema
      this.options = options
    }

    createFragmentModel(dbFragment) {
      this[dbFragment] = new Model(schema, { ...this.options, dbFragment })
      return this
    }

    augmentMethodsToEntryObj(entry) {
      const { map } = this.schema

      const populate = function (paramKey) {
        const idsArr = this[paramKey];
        this[paramKey] = idsArr.map(idObj => {
          const { id, dbMain, dbFragment } = idObj;
          const innerEntry = assembleFromDBById(id, { dbMain, dbFragment });
          Object.setPrototypeOf(innerEntry, { populate });
          return innerEntry
        })
      }
      Object.setPrototypeOf(entry, { populate });
    }

    create(request) {
      const { getSplitObj, getProperObj } = this.schema;
      const { dbMain, dbFragment } = this.options;
      const getProperObj_ = getProperObj.bind(this.schema);
      const getSplitObj_ = getSplitObj.bind(this.schema);

      const properObj = getProperObj_(request);
      this.augmentMethodsToEntryObj(properObj)
      const splitProperObj = getSplitObj_(properObj);
      divideEntryToDB(splitProperObj, { dbMain, dbFragment });
      return properObj
    }

    update(id, request, updateParam) {
      const { getSplitObj, getProperObj } = this.schema;
      const { dbMain, dbFragment } = this.options;
      const getProperObj_ = getProperObj.bind(this.schema);
      const getSplitObj_ = getSplitObj.bind(this.schema);
      const entry = this.findById(id, { dbMain, dbFragment });
      this.augmentMethodsToEntryObj(entry)
      if (entry == null) return null;

      const updateObj = getProperObj_(request, updateParam);
      Object.entries(updateObj).forEach(([key, value]) => {
        if (Array.isArray(value)) entry[key] = [...updateObj[key], ...entry[key]];
        else entry[key] = updateObj[key]
      })
      const splitProperObj = getSplitObj_(entry);
      divideEntryToDB(splitProperObj, { dbMain, dbFragment });
      return entry
    }

    pull(id, [paramKey, paramValue], arrayParam) {
      const { getSplitObj } = this.schema;
      const { dbMain, dbFragment } = this.options;
      const getSplitObj_ = getSplitObj.bind(this.schema);
      const entry = this.findById(id, { dbMain, dbFragment });
      if (entry == null) return null;
      if (!entry[arrayParam]) return null;

      const index = entry[arrayParam].findIndex(obj => obj[paramKey] == paramValue);
      if (index != -1) entry[arrayParam].splice(index, 1);
      const splitProperObj = getSplitObj_(entry);
      divideEntryToDB(splitProperObj, { dbMain, dbFragment });
      return this
    }

    deleteByKey(key) {
      const { dbMain, dbFragment } = this.options;
      Object.entries(connectionsObj).forEach(([, connectionObj]) => connectionObj.deleteFromDBByKey(key, { dbMain, dbFragment }));
    }

    deleteById(id) {
      const { dbMain, dbFragment } = this.options;
      Object.entries(connectionsObj).forEach(([, connectionObj]) => connectionObj.deleteFromDBById(id, { dbMain, dbFragment }));
    }

    findByKey(key) {
      const { dbMain, dbFragment } = this.options;
      let entry = this.assembleFromDBByKey(key, { dbMain, dbFragment });
      this.augmentMethodsToEntryObj(entry)
      return entry
    }

    findById(id) {
      const { dbMain, dbFragment } = this.options;
      let entry = this.assembleFromDBById(id, { dbMain, dbFragment });
      this.augmentMethodsToEntryObj(entry)
      return entry
    }



    find(criteria) {
      const { dbMain, dbFragment } = this.options;
      const resultsAccumulator = this.findInEachConnection(criteria, { dbMain, dbFragment });
      const resultsArray = this.getInteresctionOfArrays(resultsAccumulator);
      return resultsArray
    }

    /////Utilities

    //Accumulate queries of all components in 1 array
    findInEachConnection(criteria, { dbMain, dbFragment }) {
      let resultsAccumulator = [];
      Object.entries(connectionsObj).forEach(([, connectionObj]) => {
        const entries = connectionObj.lookupByCriteria(criteria, { dbMain, dbFragment })
        resultsAccumulator = [...resultsAccumulator, entries];
      });
      return resultsAccumulator
    }

    //Iterate results array to count the occurance of id and compare it to the number of components, if they are equal this will mean that this entry has all its components and can be returned
    getInteresctionOfArrays(resultsAccumulator) {
      const resultsArray = [];
      resultsAccumulator.forEach(entry => {
        const { id } = entry.id
        const allEntryComponentsById = [...resultsAccumulator].filter(entry_ => entry_.id.id == id);
        const componentsCount = allEntryComponentsById.length;
        //If count is correct, merge all components
        if (componentsCount == connectionsObj.length) {
          let completeEntry = {};
          allEntryComponentsById.forEach(subEntry => completeEntry = { ...completeEntry, ...subEntry });
          this.augmentMethodsToEntryObj(completeEntry)
          resultsArray.push(completeEntry)
        }
      })
      return resultsArray;
    }

    divideEntryToDB(splitProperObj, { dbMain, dbFragment }) {
      Object.entries(splitProperObj).forEach(([db, obj]) => {
        connectionsObj[db].addToDB(obj, { dbMain, dbFragment });
      });
    }

    assembleFromDBByKey(key, { dbMain, dbFragment }) {
      const assembledEntry = Object.entries(connectionsObj).reduce((acc, [, connectionObj]) => {
        const entry = connectionObj.lookUpByKey(key, { dbMain, dbFragment }) || {};
        return { ...acc, ...entry }
      }, {});
      if (Object.keys(assembledEntry).length == 0) return null
      return assembledEntry
    }


    assembleFromDBById(id, { dbMain, dbFragment }) {
      const assembledEntry = Object.entries(connectionsObj).reduce((acc, [, connectionObj]) => {
        const entry = connectionObj.lookUpById(id, { dbMain, dbFragment }) || {};
        return { ...acc, ...entry }
      }, {});
      if (Object.keys(assembledEntry).length == 0) return null
      return assembledEntry
    }

  }

  return {
    connectionsObj,
    startConnection,
    clearDB,
    saveDB,
    Schema,
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
  const {  Model, Schema, saveDB } = ORM

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