; (function (root, factory) {
  root.JSON_DB_HANDLER = factory()
})(this, function () {

  const { Toolkit } = CCLIBRARIES

  const MAX_ENTRIES_COUNT = 10000;

  let INDEX = {
    CCONE: {
      properties: {
        rootFolder: "",
        filesPrefix: ""
      },
      dbFragments: {
        CCONE_1: {
          queryArray: [],
          fileId: ""
        }
      }
    },
    CCG: {
      properties: {
        rootFolder: "",
        filesPrefix: ""
      },
      dbFragments: {
        CCGS1R1: {
          queryArray: [],
          fileId: ""
        },
        CCGS1R2: {
          queryArray: [],
          fileId: ""
        }
      }
    }
  }

  let OPEN_DB = {
    CCONE_1: {
      properties: {
        isChanged: true,
        main: "CCONE"
      },
      toWrite: {
        index: {},
        data: {}
      }

    },
    CCGS1R1: {
      properties: {
        isChanged: true,
        main: "CCG"
      },
      toWrite: {
        index: {},
        data: {}
      }

    }
  }



  function init(indexFileId) {
    INDEX = initiateDB(indexFileId);
    const DBMANAGER = {
      addToDB,
      updateInDB,
      lookUp,
      saveToDBFiles
    }
    return DBMANAGER;
  }

  function initiateDB() {
    return Toolkit.readFromJSON(indexFileId);
  }

  function saveToDBFiles() {
    Object.keys(OPEN_DB).forEach(dbFragment => {
      const { properties, toWrite } = OPEN_DB[dbFragment];
      const { isChanged, main } = properties;
      if (!isChanged) return
      const { fileId } = INDEX[main].dbFragments[dbFragment];
      if (fileId == "") {
        createNewFile(main, dbFragment, properties);
        return
      }
      Toolkit.writeToJSON(toWrite, fileId);
    })
  }

  function createNewFile(main, dbFragment, properties){
    const { dbFragments, properties } = INDEX[main];
    const { rootFolder, filesPrefix } = properties;
    fileId = createDBFile(toWrite, rootFolder, filesPrefix, dbFragment);
    dbFragments[dbFragment].fileId = fileId;
  }

  function addToDB(entry, { dbMain, dbFragment }) {
    CheckIfInIndexAndIfInOpen(dbMain, dbFragment)
    if (dbMain && !dbFragment) dbFragment = getLastCreatedFragment(dbMain);
    dbFragment = checkOpenDBSize(dbMain, dbFragment);
    const { key, id } = entry;
    OPEN_DB[dbFragment].toWrite.index[key] = id;
    OPEN_DB[dbFragment].toWrite.data[id] = entry;
  }

  function updateInDB(entry, { dbMain, dbFragment }) {
    OPEN_DB[dbFragment].toWrite.index[key] = id;
    OPEN_DB[dbFragment].toWrite.data[id] = entry;
  }

  function lookUp(key, { dbMain, dbFragment }) {
    CheckIfInIndexAndIfInOpen(dbMain, dbFragment)
    if (dbMain) return lookUpByQueryArray(key, dbMain);
    return lookUpInFragment(key, dbFragment);
  }

  function lookUpByQueryArray(key, dbMain) {
    const { dbFragments } = INDEX[dbMain];
    let entry;
    Object.keys(dbFragments).forEach(dbFragment => {
      const { queryArray, fileId } = dbFragments[dbFragment];
      if (!queryArray.includes(key)) return;
      openDBFragment(dbFragment, fileId);
      entry = lookUpInFragment(key, dbFragment)
    })
    return entry
  }

  function lookUpInFragment(key, dbFragment) {
    const { toWrite } = OPEN_DB[dbFragment];
    const id = toWrite.index[key];
    const entry = toWrite.data[id];
    return entry;
  }

  function createDBFile(toWrite, rootFolder, filesPrefix, dbFragment) {
    const fileName = filesPrefix + "_" + dbFragment;
    return Toolkit.createJSON(fileName, rootFolder, toWrite);
  }

  function CheckIfInIndexAndIfInOpen(dbMain, dbFragment) {
    if(!INDEX[dbMain]){
      console.log("No configs found for this DB")
      return
    }
    const {dbFragments} = INDEX[dbMain];
    if(!dbFragments[dbFragment]){
      dbFragments[dbFragment] = new IndexEntry();
    }
    if(!OPEN_DB[dbFragment]){
      openDBFragment(dbFragment, fileId);
    }
  }

  function openDBFragment(dbFragment, fileId) {
    if (OPEN_DB[dbFragment]) return;
    const fragmentFileObj = Toolkit.readFromJSON(fileId);
    addToOpenDBsObj(dbFragment, fragmentFileObj)
  }

  function addToOpenDBsObj(dbFragment, fragmentFileObj) {
    OPEN_DB[dbFragment] = new OpenDBEntry(fragmentFileObj)
  }

  function checkOpenDBSize(dbMain, dbFragment) {
    const { toWrite } = OPEN_DB[dbFragment];
    const { data } = toWrite;
    if (data.length >= MAX_ENTRIES_COUNT) return createNewFragment(dbMain);
    return dbFragment;
  }

  function createNewFragment(dbMain) {
    const lastDBFragment = getLastCreatedFragment(dbMain);
    const countingRegex = /_\d/g
    let newFragment
    if (countingRegex.test(lastDBFragment)) {
      const count = parseInt(paragraph.match(countingRegex)[1]);
      newFragment = lastDBFragment.replace(countingRegex, "") + "_" + count++;
    } else {
      newFragment = lastDBFragment + "_2";
    }
    INDEX[dbMain].dbFragments[newFragment] = new IndexEntry();
  }

  function getLastCreatedFragment(dbMain) {
    const { dbFragments } = INDEX[dbMain];
    const dbFragmentArray = Object.keys(dbFragments);
    const fragmentsCount = dbFragmentArray.length;
    return dbFragmentArray[fragmentsCount - 1]
  }

  function OpenDBEntry(fragmentFileObj) {
    this.properties = new OpenDBProperties();
    this.toWrite = fragmentFileObj || new DBFileObj();

  }

  function OpenDBProperties(dbMain) {
    this.isChanged = true
    this.main = dbMain
  }

  function DBFileObj() {
    this.index = {}
    this.data = {}
  }

  function IndexEntry() {
    this.queryArray = [];
    this.fileId = "";
  }

  return {
    init
  }

})

