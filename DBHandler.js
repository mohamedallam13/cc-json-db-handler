; (function (root, factory) {
  root.JSON_DB_HANDLER = factory()
})(this, function () {

  const { Toolkit } = CCLIBRARIES

  const MAX_ENTRIES_COUNT = 10000;

  let INDEX = {
    CCONE: {
      properties: {
        rootFolder: "",
        filesPrefix: "",
        fragmentsList: []
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
        filesPrefix: "",
        fragmentsList: []
      },
      dbFragments: {
        CCGS1R1: {
          queryArray: [],
          fileId: "",
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
    const INDEX = initiateDB(indexFileId);
    const OPEN_DB = {};
    const DBMANAGER = {
      indexFileId,
      INDEX,
      OPEN_DB,
      addToDB,
      updateInDB,
      lookUp,
      saveToDBFiles,
      closeDB,
      clearDB,
      destroyDB
    }
    return DBMANAGER;
  }

  function saveIndex() {
    Toolkit.writeToJSON(this.INDEX, this.indexFileId);
  }

  function initiateDB() {
    return Toolkit.readFromJSON(indexFileId);
  }


  function closeDB({ dbMain, dbFragment }) {
    if (!dbFragment) closeDBMain(dbMain);
    else closeFragment(dbFragment);
  }

  function closeDBMain(dbMain) {
    const { fragmentsList } = INDEX[dbMain].properties;
    fragmentsList.forEach(closeFragment)
  }

  function closeFragment(dbFragment) {
    if (OPEN_DB[dbFragment]) delete OPEN_DB[dbFragment];
  }

  function clearDB({ dbMain, dbFragment }) {
    if (!dbFragment) clearDBMain(dbMain);
    else clearFragment(dbFragment);
    //saveIndex
  }

  function clearDBMain(dbMain) {
    const { fragmentsList } = INDEX[dbMain].properties;
    fragmentsList.forEach(dbFragment => clearFragment(dbMain, dbFragment))
  }

  function clearFragment(dbMain, dbFragment) {
    const { fileId } = INDEX[dbMain].dbFragments[dbFragment];
    Toolkit.writeToJSON({}, fileId);
    INDEX[dbMain].dbFragments[dbFragment].queryArray = [];
  }

  function destroyDB({ dbMain, dbFragment }) {
    if (!dbFragment) destroyDBMain(dbMain);
    else destroyFragment(dbFragment);
    //saveIndex
  }

  function destroyDBMain(dbMain) {
    const { fragmentsList } = INDEX[dbMain].properties;
    fragmentsList.forEach(dbFragment => destroyFragment(dbMain, dbFragment))
  }

  function destroyFragment(dbFragment) {
    const { fileId } = INDEX[dbMain].dbFragments[dbFragment];
    Toolkit.destroyJSON(fileId);
    delete INDEX[dbMain].dbFragments[dbFragment];
  }

  function saveToDBFiles() {
    const { INDEX, OPEN_DB } = this;
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
    properties.isChanged = false;
  }

  function createNewFile(main, dbFragment, properties) {
    const { INDEX } = this;
    const { dbFragments, properties } = INDEX[main];
    const { rootFolder, filesPrefix } = properties;
    fileId = createDBFile(toWrite, rootFolder, filesPrefix, dbFragment);
    dbFragments[dbFragment].fileId = fileId;
  }

  function addToDB(entry, { dbMain, dbFragment }) {
    const { OPEN_DB } = this;
    CheckIfInIndexAndIfInOpen(dbMain, dbFragment)
    if (dbMain && !dbFragment) dbFragment = getLastCreatedFragment(dbMain);
    dbFragment = checkOpenDBSize(dbMain, dbFragment);
    const { key, id } = entry;
    OPEN_DB[dbFragment].toWrite.index[key] = id;
    OPEN_DB[dbFragment].toWrite.data[id] = entry;
    OPEN_DB[dbFragment].properties.isChanged = true;
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
    const { INDEX } = this;
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
    const { OPEN_DB } = this;
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
    const { INDEX, OPEN_DB } = this;
    if (!INDEX[dbMain]) {
      console.log("No configs found for this DB")
      return
    }
    const { dbFragments } = INDEX[dbMain];
    if (!dbFragment) {
      dbFragment = createNewFragment(dbMain);
    }
    if (!dbFragments[dbFragment]) {
      dbFragments[dbFragment] = new IndexEntry();
      dbFragments[dbFragment].properties.fragmentsList.push(dbFragment);

    }
    if (!OPEN_DB[dbFragment]) {
      const { fileId } = dbFragments[dbFragment];
      openDBFragment(dbFragment, fileId);
    }
  }

  function openDBFragment(dbFragment, fileId) {
    const { OPEN_DB } = this;
    if (OPEN_DB[dbFragment]) return;
    let fragmentFileObj;
    if (fileId) fragmentFileObj = Toolkit.readFromJSON(fileId);
    addToOpenDBsObj(dbFragment, fragmentFileObj)
  }

  function addToOpenDBsObj(dbFragment, fragmentFileObj) {
    OPEN_DB[dbFragment] = new OpenDBEntry(fragmentFileObj)
  }

  function checkOpenDBSize(dbMain, dbFragment) {
    const { OPEN_DB } = this;
    const { toWrite } = OPEN_DB[dbFragment];
    const { data } = toWrite;
    if (data.length >= MAX_ENTRIES_COUNT) return createNewFragment(dbMain, dbFragment);
    return dbFragment;
  }

  function createNewFragment(dbMain, dbFragment) {
    const { INDEX } = this;
    const lastDBFragment = dbFragment || getLastCreatedFragment(dbMain);
    const countingRegex = /_\d/g
    let newFragment
    if (!lastDBFragment) newFragment = dbMain + "_1";
    else if (countingRegex.test(lastDBFragment)) {
      const count = parseInt(paragraph.match(countingRegex)[1]);
      newFragment = lastDBFragment.replace(countingRegex, "") + "_" + count++;
    } else {
      newFragment = lastDBFragment + "_2";
    }
    INDEX[dbMain].dbFragments[newFragment] = new IndexEntry();
    //saveIndex
  }

  function getLastCreatedFragment(dbMain) {
    const { INDEX } = this;
    const { properties } = INDEX[dbMain];
    const { fragmentsList } = properties;
    const fragmentsCount = fragmentsList.length;
    if (fragmentsCount != 0) return dbFragmentArray[fragmentsCount - 1]
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

