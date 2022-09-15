; (function (root, factory) {
  root.ORM = factory()
})(this, function () {

  const connectionsObj = {};

  const { init } = JSON_DB_HANDLER;

  function startConnection(indexFileIdsObj) {
    Object.entries(indexFileIdsObj).forEach(([connectionLabel, { indexFileId, properties }]) => {
      if (!indexFileId) return
      connectionsObj[connectionLabel] = {};
      connectionsObj[connectionLabel].db = init(indexFileId);
      connectionsObj[connectionLabel].properties = properties;

    })
    return connectionsObj
  }

  function saveDB() {
    Object.entries(connectionsObj).forEach(([, connectionObj]) => {
      connectionObj.db.saveToDBFiles();
    });
  }

  function clearDB() {
    Object.entries(connectionsObj).forEach(([, connectionObj]) => {
      connectionObj.db.destroyDB();
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
        if (updateKeys) if (!updateKeys.includes(key)) return
        let value;
        if (Array.isArray(properties)) {
          const innerSchema = properties[0];
          value = innerSchema.getProperObj(rawObj);
          if (this.checkArrayValueIsEmpty(value)) return { ...acc, [key]: [] }
          return { ...acc, [key]: [value] }
        }
        value = this.applyConfigs(key, properties, rawObj);
        return { ...acc, [key]: value }
      }, {});
      if (!Object.keys(options).length == 0 && !updateKeys) {
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
          }
        } else if (typeof value != type) {
          throw `${key} does not have the correct type!`;
        }
      }

      if (validate) if (!validate(value)) throw `${key} does not have a valid value!`;
      if (enums) if (!enums.includes(value)) throw `${key} does not have a valid choices!`;
      return value;
    }


    addId(properObj, rawObj) { //Private //Needs Checking
      const IdObj = function (id, dbMain, dbFragment) {
        this.id = id
        this.dbMain = dbMain;
        this.dbFragment = dbFragment;
      }
      const { id } = this.options;
      const { dbMain, dbFragment } = rawObj;
      console.log(this.options)
      const _id = properObj[id];
      if (!_id) return
      properObj.id = id;
      properObj._id = new IdObj(_id, dbMain, dbFragment);
      console.log(properObj._id)
      var stop = 1
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
    constructor(schema, options = {}) {
      this.schema = schema
      this.options = options
    }

    createFragmentModel(dbFragment) {
      this[dbFragment] = new Model(this.schema, { ...this.options, dbFragment })
      return this
    }

    augmentMethodsToEntryObj(entry) {
      const update_ = this.update.bind(this);

      const checkArrayParameterFor = function (param, filterFunc) {
        const arrayParam = this[param]
        if (!Array.isArray(arrayParam)) return
        const matchArray = arrayParam.filter(filterFunc);
        if (matchArray.length == 0) return
        return true
      }

      const populate = function (paramKey) {
        const idsArr = this[paramKey];
        this[paramKey] = idsArr.map(idObj => {
          const { id, dbMain, dbFragment } = idObj;
          const innerEntry = assembleFromDBById(id, { dbMain, dbFragment });
          Object.setPrototypeOf(innerEntry, { populate: this.populate });
          return innerEntry
        })
        return this
      }

      const update = function (request, updateParam) {
        const { id } = entry
        return update_(id, request, updateParam)
        return this
      }

      const test = function () {
        console.log("Working!")
      }

      Object.setPrototypeOf(entry, { populate, update, checkArrayParameterFor, test });
    }

    create(request) {
      const { getSplitObj, getProperObj } = this.schema;
      const { dbMain, dbFragment } = this.options;
      const getProperObj_ = getProperObj.bind(this.schema);
      const getSplitObj_ = getSplitObj.bind(this.schema);

      const properObj = getProperObj_(request);
      this.augmentMethodsToEntryObj(properObj)
      const splitProperObj = getSplitObj_(properObj);
      this.divideEntryToDB(splitProperObj, { dbMain, dbFragment });
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
      console.log(updateObj)
      Object.entries(updateObj).forEach(([key, value]) => {
        if (Array.isArray(value)) entry[key] = [...updateObj[key], ...entry[key]];
        else entry[key] = updateObj[key]
      })
      const splitProperObj = getSplitObj_(entry);
      this.divideEntryToDB(splitProperObj, { dbMain, dbFragment });
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
      this.divideEntryToDB(splitProperObj, { dbMain, dbFragment });
      return this
    }

    deleteByKey(key) {
      const { dbMain, dbFragment } = this.options;
      Object.entries(connectionsObj).forEach(([, connectionObj]) => connectionObj.db.deleteFromDBByKey(key, { dbMain, dbFragment }));
    }

    deleteById(id) {
      const { dbMain, dbFragment } = this.options;
      Object.entries(connectionsObj).forEach(([, connectionObj]) => connectionObj.db.deleteFromDBById(id, { dbMain, dbFragment }));
    }

    findByKey(key) {
      const { dbMain, dbFragment } = this.options;
      let entry = this.assembleFromDBByKey(key, { dbMain, dbFragment });
      if (entry !== null) this.augmentMethodsToEntryObj(entry)
      return entry
    }

    findById(id) {
      const { dbMain, dbFragment } = this.options;
      let entry = this.assembleFromDBById(id, { dbMain, dbFragment });
      if (entry !== null) this.augmentMethodsToEntryObj(entry)
      return entry
    }



    find(criteria) {
      const { dbMain, dbFragment } = this.options;
      const { resultsAccumulator, count } = this.findInEachConnection(criteria, { dbMain, dbFragment });
      const resultsArray = this.getInteresctionOfArrays(resultsAccumulator);
      return resultsArray
    }

    /////Utilities

    //Accumulate queries of all components in 1 array
    findInEachConnection(criteria, { dbMain, dbFragment }, secret) {
      let resultsAccumulator = [];
      let count = 0;
      Object.entries(connectionsObj).forEach(([, connectionObj]) => {
        if (secret) if (connectionObj.properties.isSecret && connectionObj.properties.secret != secret) return // Secret safeguard statement
        const entries = connectionObj.db.lookupByCriteria(criteria, { dbMain, dbFragment })
        resultsAccumulator = [...resultsAccumulator, entries];
        count++
      });
      return { resultsAccumulator, count }
    }

    //Iterate results array to count the occurance of id and compare it to the number of components, if they are equal this will mean that this entry has all its components and can be returned
    getInteresctionOfArrays(resultsAccumulator, count) {
      const resultsArray = [];
      resultsAccumulator.forEach(entry => {
        const { id } = entry
        const allEntryComponentsById = [...resultsAccumulator].filter(entry_ => entry_.id == id);
        const componentsCount = allEntryComponentsById.length;
        //If count is correct, merge all components
        if (componentsCount == count) {
          let completeEntry = {};
          allEntryComponentsById.forEach(subEntry => completeEntry = { ...completeEntry, ...subEntry });
          if (entry !== null) this.augmentMethodsToEntryObj(completeEntry)
          resultsArray.push(completeEntry)
        }
      })
      return resultsArray;
    }

    divideEntryToDB(splitProperObj, { dbMain, dbFragment }) {
      Object.entries(splitProperObj).forEach(([db, obj]) => {
        connectionsObj[db].db.addToDB(obj, { dbMain, dbFragment });
      });
    }

    assembleFromDBByKey(key, { dbMain, dbFragment }, secret) {
      const assembledEntry = Object.entries(connectionsObj).reduce((acc, [, connectionObj]) => {
        if (secret) if (connectionObj.properties.isSecret && connectionObj.properties.secret != secret) return // Secret safeguard statement
        const entry = connectionObj.db.lookUpByKey(key, { dbMain, dbFragment }) || {};
        return { ...acc, ...entry }
      }, {});
      if (Object.keys(assembledEntry).length == 0) return null
      return assembledEntry
    }


    assembleFromDBById(id, { dbMain, dbFragment }, secret) {
      const assembledEntry = Object.entries(connectionsObj).reduce((acc, [, connectionObj]) => {
        if (secret) if (connectionObj.properties.isSecret && connectionObj.properties.secret != secret) return // Secret safeguard statement
        const entry = connectionObj.db.lookUpById(id, { dbMain, dbFragment }) || {};
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


function testCompile() {
  console.log("Compiled!")
}