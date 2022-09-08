; (function (root, factory) {
  root.TESTING = factory()
})(this, function () {

  //// TEST_DBHANDLER

  function test_DBHandler() {
    const test_indexId = "1SQHe3W33uCD20bn-yWhpO89cqC_VEkXV";
    const { init } = JSON_DB_HANDLER

    const SEQUENCES = [
      ["add", "lookupId", "lookupCriteria", "deleteByKey", "deleteById", "save"]
    ]

    const SCENARIOS = [
      {
        dbMain: "CCONE",
        sequence: 0,
        model: "preliminary"
      }
    ]

    const METHODS = {
      add: test_add,
      lookupId: test_lookupId,
      lookupKey: test_lookupKey,
      lookupCriteria: test_lookupByCriteria,
      deleteByKey: test_deleteFromDBByKey,
      deleteById: test_deleteFromDBById,
      save: test_saveToDBFiles,
      clear: test_clearDB,
      destroy: test_destroyDB
    }

    const TEST_ENTRIES = {
      preliminary: test_createPreliminaryEntries,
    }

    function test_createPreliminaryEntries() {
      const COUNT = 500;
      const requests = [];

      for (var i = 0; i < COUNT; i++) {
        let request = {
          key: generateRandomEmail(),
          id: i + 1,
          name: generateNameCombinations(),
          age: generateRandomAge(18, 49)
        }
        requests.push(request)
      }

      let findMeRequest = {
        key: "findMe@gmail.com",
        id: i + 1,
        name: "Find Me",
        age: 34
      }

      let findMeAndDeleteRequest = {
        key: "findMeAndDelete@gmail.com",
        id: i + 1,
        name: "Find Me And Delete",
        age: 34
      }

      requests.push(findMeRequest)
      requests.push(findMeAndDeleteRequest)

      return requests
    }

    // MAIN

    function testDBStart() {
      return init(test_indexId);
    }

    function testByScenarios(scenario = 0) {
      const testScenario = SCENARIOS[scenario];
      const { model, sequence, dbMain, dbFragment } = testScenario
      testBySequence({ model, sequence, dbMain, dbFragment })
    }

    function testBySequence({ model, sequence = 0, dbMain, dbFragment }) {
      const methods = SEQUENCES[sequence]
      testDBHandlerMethods({ model, methods, dbMain, dbFragment })
    }

    function testDBHandlerMethods({ model, methods = [], dbMain, dbFragment }) {
      const db = testDBStart()
      const entries = TEST_ENTRIES[model]()
      methods.forEach(method => {
        if (METHODS[method]) METHODS[method]({ db, entries, dbMain, dbFragment })
        else console.log(`Method "${method}" is not recognized`)
      })
    }

    // METHODS

    function test_add({ db, entries }) {
      console.log(`Total Add ${entries.length} entries: from`)
      entries.forEach(entry => {
        db.addToDB(entry, { dbMain, dbFragment })
      })
      console.log(`Total Add ${entries.length} entries: to`)
    }

    function test_lookupId({ db }) {
      console.log("Lookup by Id: from")
      const id = 5;
      const entry = db.lookUpById(id, { dbMain, dbFragment });
      console.log(entry)
      console.log("Lookup by Id: to")
    }

    function test_lookupKey({ db }) {
      console.log("Lookup by key: from")
      const key = "findMe@gmail.com";
      const entry = db.lookUpByKey(key, { dbMain, dbFragment })
      console.log(entry)
      console.log("Lookup by key: to")
    }

    function test_lookupByCriteria({ db }) {
      console.log("Lookup by criteria: from")
      const criteria = [
        {
          param: "email",
          criterion: "findMe@gmail.com"
        },
        {
          param: "age",
          criterion: function (age) { return age > 20 }
        }
      ]
      const entry = db.lookupByCriteria(key, { criteria, dbFragment })
      console.log(entry)
      console.log("Lookup by criteria: to")
    }

    function test_deleteFromDBByKey() {
      console.log("Delete by key: from")
      const key = "findMeAndDelete@gmail.com";
      deleteFromDBByKey(key, { dbMain, dbFragment })
      console.log("Delete by key: to")
    }

    function test_deleteFromDBById() {
      console.log("Delete by id: from")
      const id = 5;
      deleteFromDBById(id, { dbMain, dbFragment })
      console.log("Delete by id: to")
    }

    function test_saveToDBFiles() {
      console.log("Save: from")
      db.saveToDBFiles();
      console.log("Save: to")
    }

    function test_clearDB() {
      console.log("Destroy: from")
      db.clearDB({ dbMain, dbFragment })
      console.log("Destroy: to")
    }

    function test_destroyDB() {
      console.log("Destroy: from")
      db.destroyDB({ dbMain, dbFragment })
      console.log("Destroy: to")
    }

    return {
      testByScenarios,
      testBySequence,
      testDBHandlerMethods
    }

  }

  //// TEST_ORM

  function test_ORM() {
    const { Toolkit, REFERENCES_MANAGER } = CCLIBRARIES;
    const { timestampCreate } = Toolkit;
    const { Model, Schema, clearDB, saveDB, startConnection } = ORM
    const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
    const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex"];

    const test_requests = {
      preliminary: test_createPreliminaryRequests,
      full_CCER: test_createCCERRequests
    }

    const test_models = {
      preliminary: test_createSchemaModel,
      full_CCER: function () { return CCER }
    }

    function test_createPreliminaryRequests() {
      const requests = [{
        name: "Mohamed Allam",
        age: 34,
        email: "mh.allam@yahoo.com",
        status: "pending",
        key: "mh.allam@yahoo.com",
        id: 1
      }]
      return requests
    }

    function test_dbStart() {
      const referencesObj = REFERENCES_MANAGER.init(MASTER_INDEX_FILE_ID).requireFiles(REQUIRED_REFERENCES).requiredFiles;
      const { CCJSONsDBSuperIndex } = referencesObj;
      const connectionsObj = startConnection(CCJSONsDBSuperIndex.fileContent); // Start the Database
      console.log(connectionsObj);
    }

    function test_createSchemaModel() {

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
    }

    function test_ORMModelMethods({ model }) {
      const requests = test_requests[model]()
      const Model = test_models[models]()


    }

    function test_ORMDestroy() {
      test_dbStart();
      clearDB();
    }

    return {
      test_ORMModelMethods,
      test_ORMDestroy
    }
  }


  //// HELPERS

  function generateNameCombinations() {
    return "Mohamed Allam"
  }

  function generateRandomEmail() {
    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    const LENGTH = 8;
    var string = '';
    for (var ii = 0; ii < LENGTH; ii++) {
      string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string + '@gmailÍ.com';
  }

  function generateRandomAge(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  //// RETURNS

  return {
    test_DBHandler,
    test_ORM
  }

})



function testDBHandlerScenario() {
  const { test_DBHandler } = TESTING;
  const { testByScenarios } = test_DBHandler();
  testByScenarios()
}

// function allORMTests() {

// }
