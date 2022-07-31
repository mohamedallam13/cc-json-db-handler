/// Data Flows in
/// Save to DB in 2 steps:
/// Save to Local JS Object - Based on Secondary classifier and what type of DB is it? Main data / statuses / complementary
/// Object write to File in fragmentation

/// Check if existing in file: check with if query array includes key


; (function (root, factory) {
  root.JSON_DB_HANDLER = factory()
})(this, function () {

  const { Toolkit } = CCLIBRARIES;


  let indexFileObj;
  const openDBs = {};

  function initiateDB(indexFileId) {
    indexFileObj = Toolkit.readFromJSON(indexFileId);
  }

  function addToDB(request, dbName) {
    checkDB(dbName);
    const { id, identifier } = request;
    openDBs[dbName].toWrite.index[identifier] = id;
    openDBs[dbName].toWrite.data[id] = request;

  }

  function lookupDB(key, dbName) {
    checkDB(dbName);
  }

  function updateInDB(entry, dbName) {

  }

  function checkDB(dbName) {
    if (!indexFileObj[dbName]) initiateIndex(dbName);
    if (!openDBs[dbName]) {
      if (!indexFileObj[dbName]) openDBs[dbName] = new OpenDBEntry();
      else openDBs[dbName] = getDBFileFromIndex(dbName);
    }
  }

  function getDBFileFromIndex(dbName) {
    const { db } = indexFileObj[dbName];
    openDBs[dbName].toWrite = {};
    db.forEach(dbFileIndexEntry => {
      const { fileId } = dbFileIndexEntry;
      if (!fileId) return;
      const dbFileContent = Toolkit.readFromJSON(fileId);
      openDBs[dbName].toWrite = { ...openDBs[dbName].toWrite, ...dbFileContent };
    })

  }

  function OpenDBEntry() {
    this.toWrite = new DBFileObj();


  }

  function DBFileObj() {
    this.index = {}
    this.data = {}
  }

  function IndexFile(rootFolder) {
    this.properties = new PropertiesObj(rootFolder, prefix);
    this.db = [new DBIndexEntryObj(queryArray, id)];
  }

  function PropertiesObj(rootFolder, prefix) {
    return {
      rootFolder,
      prefix
    }
  }

  function DBIndexEntryObj(queryArray, id) {
    this.queryArray = [];
    this.fileId = fileId
  }

  /// Methods:


  function checkInDB(key) {

  }

  // function addToDB() {

  // }

  function updateDB() {

  }

  function saveCloseDB() {
    if (fragment) fragmentDB()
    dbFileObj
  }

  // Add to DB (by secondary classifier and DB name)
  // Check existing
  // Write to files

  return {
    initiateDB,
    addToDB
  }

})

const INDEX = {
  Confessions: {
    properties: {
      rootFolder: "",
      prefix: {

      }
    },
    db: {
      mainData: {
        file1: {
          queryArray: [],
          id: ""
        }
      },

    }
  },
  Events: {

  },
  CCOne: {

  },
  Activities: {

  }
}



function myFunction() {

}
