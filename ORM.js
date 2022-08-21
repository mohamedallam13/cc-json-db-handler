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

  function clearDB() {
    Object.entries(connectionsObj).forEach(([connectionLabel, connectionObj]) => {
      connectionObj.destroyDB();
    })
  }

  class Schema {
    constructor(map, options) {
      this.map = map;
      this.options = options;
    }

    // getProperObj(rawObj) {
    //   let splitProperObj = {};
    //   Object.entries(rawObj).forEach(([key, value]) => {
    //     applyConfigs(key, value, properObj);
    //   });
    //   return splitProperObj;
    // }

    // applyConfigs(key, value, splitProperObj) {
    //   let { db = 'core', validate, defaultValue, type, enums } = this.map[key];
    //   if (defaultValue) value = value || defaultValue;
    //   if (required) if (value == "") throw `${key} has to have a value!`;
    //   if (type) if (typeof value != type) throw `${key} does not have the correct type!`;
    //   if (!validate(value)) throw `${key} does not have a valid value!`;
    //   if (enums) if (!enums.includes(value)) throw `${key} does not have a valid choices!`;
    //   if (!splitProperObj[db]) splitProperObj = {};
    //   splitProperObj[db] = { ...splitProperObj[db], [key]: value };
    // }


    //Different approach

    getSplitObj(rawObj) {
      const { dbSplit } = this.options;
      const properObj = getProperObj(rawObj);
      let splitObj = {};
      Object.entries(dbSplit).forEach(([db, propsArray])=>{
        propsArray.forEach(key => {
          if (!splitObj[db]) splitObj[db] = {};
          splitObj[db][key] = properObj[key]
        })
      })
      return getSplitObj;
    }

    getProperObj(rawObj) {
      const { map } = this;
      let properObj = {};
      Object.entries(map).forEach(([key, properties]) => {
        let value;
        if (Array.isArray(properties)) {
          const innerSchema = properties[0];
          value = innerSchema.getProperObj(rawObj);
          properObj = { [key]: [value], ...properObj }
        } else {
          value = applyConfigs(key, properties, rawObj);
          properObj = { [key]: value, ...properObj }
        }
      });
      return properObj
    }

    applyConfigs(key, properties, rawObj) {
      let { validate, defaultValue, type, enums } = properties;
      let value = rawObj[key];
      if (required) if (!value || value == "") throw `${key} has to have a value!`;
      if (defaultValue) value = value || defaultValue;
      if (type) if (typeof value != type) throw `${key} does not have the correct type!`;
      if (!validate(value)) throw `${key} does not have a valid value!`;
      if (enums) if (!enums.includes(value)) throw `${key} does not have a valid choices!`;
      return value;
    }

  }



  class Model {
    constructor(schema, options) {
      this.schema = schema
      this.options = options
    }

    test() {
      console.log(1)
    }

    createFragmentModel(dbFragment) {
      this[dbFragment] = new Model(schema, { dbFragment })
      return this
    }

    add(request) {
      const { dbMain } = this.schema.options
      const { dbFragment } = this.options

      const splitProperObj = schema.getSplitObj(request);
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

  return {
    connectionsObj,
    startConnection,
    clearDB,
    Schema,
    Model
  }

})

function test2() {
  let entry;
  // entry = Object.assign({}, entry, { a: 1, b: 2 })
  console.log(entry)
}