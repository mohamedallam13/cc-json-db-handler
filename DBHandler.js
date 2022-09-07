; (function (root, factory) {
  root.JSON_DB_HANDLER = factory()
})(this, function () {

  //Needs heavy refactoring

  const { Toolkit } = CCLIBRARIES

  const MAX_ENTRIES_COUNT = 100;


  function init(indexFileId) {
    if (!indexFileId) return null

    const INDEX = initiateDB(indexFileId);
    const OPEN_DB = {};

    function saveIndex() {
      Toolkit.writeToJSON(indexFileId, INDEX);
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
      saveIndex();
    }

    function clearDBMain(dbMain) {
      const { fragmentsList } = INDEX[dbMain].properties;
      fragmentsList.forEach(dbFragment => clearFragment(dbMain, dbFragment))
    }

    function clearFragment(dbMain, dbFragment) {
      const { fileId } = INDEX[dbMain].dbFragments[dbFragment];
      Toolkit.writeToJSON(fileId, {});
      INDEX[dbMain].dbFragments[dbFragment].keyQueryArray = [];
    }

    function destroyDB({ dbMain, dbFragment } = {}) {
      if (!dbMain) Object.keys(INDEX).forEach(dbMain => destroyDBMain(dbMain));
      else if (!dbFragment) destroyDBMain(dbMain);
      else destroyFragment(dbFragment);
      saveIndex()
    }

    function destroyDBMain(dbMain) {
      const { fragmentsList } = INDEX[dbMain].properties;
      const fragmentsList_ = [...fragmentsList];
      fragmentsList_.forEach(dbFragment => destroyFragment(dbMain, dbFragment))
    }

    function destroyFragment(dbMain, dbFragment) {
      const { fileId } = INDEX[dbMain].dbFragments[dbFragment];
      const { fragmentsList } = INDEX[dbMain].properties;
      Toolkit.deleteFile(fileId);
      delete INDEX[dbMain].dbFragments[dbFragment];
      pull(fragmentsList, dbFragment)
    }

    function saveToDBFiles() {
      let saveIndexBool = false;
      Object.keys(OPEN_DB).forEach(dbFragment => {
        const { properties, toWrite } = OPEN_DB[dbFragment];
        const { isChanged, main } = properties;
        if (!isChanged) return
        saveIndexBool = true;
        const { fileId } = INDEX[main].dbFragments[dbFragment];
        if (fileId == "") {
          createNewFile(main, dbFragment, toWrite);
        } else {
          Toolkit.writeToJSON(fileId, toWrite);
        }
        properties.isChanged = false;
      })
      if (saveIndexBool) saveIndex();
    }

    function createNewFile(main, dbFragment, toWrite) {
      const { dbFragments, properties } = INDEX[main];
      const { rootFolder, filesPrefix } = properties;
      fileId = createDBFile(toWrite, rootFolder, filesPrefix, dbFragment);
      dbFragments[dbFragment].fileId = fileId;
    }

    function addToDB(entry, { dbMain, dbFragment }) {
      dbFragment = getProperFragment(dbMain, dbFragment);
      dbFragment = checkOpenDBSize(dbMain, dbFragment);
      if (!dbFragment) return
      const { key, id } = entry;
      const { ignoreIndex } = INDEX[dbMain].dbFragments[dbFragment];
      if (!ignoreIndex) {
        OPEN_DB[dbFragment].toWrite.index[key] = id;
        INDEX[dbMain].dbFragments[dbFragment].keyQueryArray.push(key);
      }
      OPEN_DB[dbFragment].toWrite.data[id] = entry;
      INDEX[dbMain].dbFragments[dbFragment].idQueryArray.push(id);
      OPEN_DB[dbFragment].properties.isChanged = true;
      return this
    }

    function lookupByCriteria(criteria = [], { dbMain, dbFragment }) {
      dbFragment = getProperFragment(dbMain, dbFragment);
      if (!dbFragment) return
      if (dbMain) return lookUpDBMainByCriteria(criteria, dbMain);
      return lookUpFragmentByCriteria(criteria, dbFragment);
    }

    function lookUpDBMainByCriteria(criteria, dbMain) {
      const { dbFragments } = INDEX[dbMain];
      let entries = [];
      const idObj = getCriterionObjByParam(criteria, "id");
      Object.keys(dbFragments).forEach(dbFragment => {
        openDBFragment(dbMain, dbFragment);
        const { idQueryArray } = dbFragments[dbFragment];
        if (idObj) {
          const id = idObj.criterion;
          if (!idQueryArray.includes(id)) return;
          entry = lookUpInFragmentById(id, dbFragment)
          entries.push(entry)
        } else {
          entries = [...entries, ...lookUpFragmentByCriteria(criteria, dbFragment)]
        }
        closeFragment(dbFragment);
      })
      return entries
    }

    function lookUpFragmentByCriteria(criteria, dbFragment) {
      const { toWrite } = OPEN_DB[dbFragment];
      const { data } = toWrite;
      let entries = Object.values(data);
      if (!criteria || criteria.length == 0) return entries;
      criteria.forEach(criterionObj => {
        const { param, path, criterion } = criterionObj
        entries = entries.filter(entry => {
          const value = getValueFromPath(path, param, entry);
          if (!value) return true
          if (typeof criterion === 'function') return criterion(value)
          else return value == criterion;
        })
      })
      return entries;
    }

    function getCriterionObjByParam(criteria, param) {
      return criteria.filter(criterionObj => criterionObj.param = param)[0];
    }

    function getValueFromPath(path, param, entry) {
      let value;
      if (!path || path.length == 0) return entry[param]
      path.forEach((pathParam, i) => {
        if (i == 0) {
          value == entry[pathParam];
        } else {
          if (!value) return
          value = value[pathParam]
        }
      })
      if (value) value = value[param]
      return value
    }

    function lookUpByKey(key, { dbMain, dbFragment }) {
      dbFragment = getProperFragment(dbMain, dbFragment);
      if (!dbFragment) return
      if (dbMain) return lookUpByKeyQueryArray(key, dbMain);
      return lookUpInFragmentByKey(key, dbFragment);
    }

    function lookUpById(id, { dbMain, dbFragment }) {
      dbFragment = getProperFragment(dbMain, dbFragment);
      if (!dbFragment) return
      if (dbMain) return lookUpByIdQueryArray(key, dbMain);
      return lookUpInFragmentById(key, dbFragment);
    }

    function deleteFromDBByKey(key, { dbMain, dbFragment }) {
      dbFragment = getProperFragment(dbMain, dbFragment);
      const id = OPEN_DB[dbFragment].toWrite.index[key];
      deleteFromDBById(id, { dbMain, dbFragment });
    }


    function deleteFromDBById(_id, { dbMain, dbFragment }) {
      dbFragment = getProperFragment(dbMain, dbFragment);
      const iterativeIndex = { ...OPEN_DB[dbFragment].toWrite.index }
      Object.entries(iterativeIndex).forEach(([key, id]) => {
        if (_id == id) delete OPEN_DB[dbFragment].toWrite.index[key];
      })
      delete OPEN_DB[dbFragment].toWrite.data[_id];
      OPEN_DB[dbFragment].properties.isChanged = true;
    }

    function lookUpByKeyQueryArray(key, dbMain) {
      const { dbFragments } = INDEX[dbMain];
      let entry = null;
      Object.keys(dbFragments).forEach(dbFragment => {
        const { keyQueryArray } = dbFragments[dbFragment];
        if (!keyQueryArray.includes(key)) return;
        openDBFragment(dbMain, dbFragment);
        entry = lookUpInFragmentByKey(key, dbFragment)
      })
      return entry
    }

    function lookUpByIdQueryArray(id, dbMain) {
      const { dbFragments } = INDEX[dbMain];
      let entry = null;
      Object.keys(dbFragments).forEach(dbFragment => {
        const { idQueryArray } = dbFragments[dbFragment];
        if (!idQueryArray.includes(id)) return;
        openDBFragment(dbMain, dbFragment);
        entry = lookUpInFragmentByKey(id, dbFragment)
      })
      return entry
    }

    function lookUpInFragmentByKey(key, dbFragment) {
      const { toWrite } = OPEN_DB[dbFragment];
      const id = toWrite.index[key];
      const entry = toWrite.data[id];
      return entry;
    }

    function lookUpInFragmentById(id, dbFragment) {
      const { toWrite } = OPEN_DB[dbFragment];
      const entry = toWrite.data[id];
      return entry;
    }

    function createDBFile(toWrite, rootFolder, filesPrefix, dbFragment) {
      const fileName = filesPrefix + "_" + dbFragment;
      return Toolkit.createJSON(fileName, rootFolder, toWrite);
    }

    function getProperFragment(dbMain, dbFragment) {
      //This function does the following: checks the index if the main adn the fragment exists, checks if the fragment is part of cumulative or stand alone db and returns the fragment name based on that, and adds the fragment to the OPEN_DB
      if (!INDEX[dbMain]) {
        console.log("No configs found for this DB")
        return
      }
      dbFragment = checkInIndex(dbMain, dbFragment);
      if (!OPEN_DB[dbFragment]) {
        openDBFragment(dbMain, dbFragment);
      }
      return dbFragment
    }

    function checkInIndex(dbMain, dbFragment) {
      if (!dbFragment) {
        //Cumulative
        dbFragment = getLatestdbMainFragment(dbMain);
      } else {
        //Non-cumulative
        const { dbFragments } = INDEX[dbMain];
        if (!dbFragments[dbFragment])
          addInIndexFile(dbMain, dbFragment);
      }
      return dbFragment;
    }

    function getLatestdbMainFragment(dbMain) {
      let dbFragment = getLastCreatedFragment(dbMain);
      if (!dbFragment) {
        dbFragment = createNewCumulativeFragment(dbMain, dbFragment);
      }
      return dbFragment;
    }

    function openDBFragment(dbMain, dbFragment) {
      if (OPEN_DB[dbFragment]) return;
      let fragmentFileObj;
      const { fileId } = INDEX[dbMain].dbFragments[dbFragment];
      if (fileId) fragmentFileObj = Toolkit.readFromJSON(fileId);
      addToOpenDBsObj(dbMain, dbFragment, fragmentFileObj)
    }

    function addToOpenDBsObj(dbMain, dbFragment, fragmentFileObj) {
      OPEN_DB[dbFragment] = new OpenDBEntry(dbMain, fragmentFileObj)
    }

    function checkOpenDBSize(dbMain, dbFragment) {
      const { toWrite } = OPEN_DB[dbFragment];
      const { data } = toWrite;
      if (Object.keys(data).length >= MAX_ENTRIES_COUNT) {
        dbFragment = createNewCumulativeFragment(dbMain, dbFragment);
        openDBFragment(dbMain, dbFragment);
        return dbFragment;
      };
      return dbFragment;
    }

    function createNewCumulativeFragment(dbMain, dbFragment) {
      const lastDBFragment = dbFragment || getLastCreatedFragment(dbMain);
      const countingRegex = /_\d/g
      let newFragment
      if (!lastDBFragment) newFragment = dbMain + "_1";
      else if (countingRegex.test(lastDBFragment)) {
        console.log(lastDBFragment.match(countingRegex)[0][1])
        let count = parseInt(lastDBFragment.match(countingRegex)[0][1]);
        count++;
        newFragment = lastDBFragment.replace(countingRegex, "") + "_" + count;
      } else {
        newFragment = lastDBFragment + "_2";
      }
      addInIndexFile(dbMain, newFragment);
      return newFragment;
    }

    function addInIndexFile(dbMain, dbFragment) {
      INDEX[dbMain].dbFragments[dbFragment] = new IndexEntry();
      INDEX[dbMain].properties.fragmentsList.push(dbFragment);
      // saveIndex();
    }

    function getLastCreatedFragment(dbMain) {
      const { properties } = INDEX[dbMain];
      const { fragmentsList } = properties;
      if (!fragmentsList) return null
      const fragmentsCount = fragmentsList.length;
      if (fragmentsCount != 0) return fragmentsList[fragmentsCount - 1]
      return null
    }

    function getExternalConfig(key, { dbMain, dbFragment }) {
      return INDEX[dbMain].dbFragments[dbFragment].externalConfigs[key]
    }

    function addExternalConfig(key, value, { dbMain, dbFragment }) {
      INDEX[dbMain].dbFragments[dbFragment].externalConfigs[key] = value;
      //saveIndex();
    }

    function OpenDBEntry(dbMain, fragmentFileObj) {
      this.properties = new OpenDBProperties(dbMain);
      this.toWrite = fragmentFileObj || new DBFileObj();

    }

    function OpenDBProperties(dbMain) {
      this.isChanged = false
      this.main = dbMain
    }

    function DBFileObj() {
      this.index = {}
      this.data = {}
    }

    function IndexEntry() {
      this.keyQueryArray = [];
      this.idQueryArray = [];
      this.externalConfigs = {};
      this.ignoreIndex = false;
      this.fileId = "";
    }

    return {
      INDEX,
      OPEN_DB,
      addToDB,
      lookUpByKey,
      lookUpById,
      lookupByCriteria,
      deleteFromDBByKey,
      deleteFromDBById,
      saveToDBFiles,
      closeDB,
      clearDB,
      destroyDB,
      getExternalConfig,
      addExternalConfig
    };
  }


  return {
    init
  }

})

function test() {
  const indexId = "1SQHe3W33uCD20bn-yWhpO89cqC_VEkXV";
  const COUNT = 500;
  const db = JSON_DB_HANDLER.init(indexId);

  // console.log("Add: from")
  // for (let i = 0; i < COUNT; i++) {
  //   let request = {
  //     key: generateRandomEmail(),
  //     id: i + 1,
  //     name: "Mohamed Allam"
  //   }
  //   if (i == 100) {
  //     let x = 0;
  //   }
  //   db.addToDB(request, { dbMain: "CCONE" });
  // }
  // console.log("Add: to")

  // /////
  // console.log("Lookup: from")
  // const entry = db.lookUp("wztlc6sk@gmail.com", { dbMain: "CCONE" });
  // console.log(entry)
  // console.log("Lookup: to")
  // /////

  // /////
  // console.log("Save: from")
  // db.saveToDBFiles();
  // console.log("Save: to")
  // /////


  console.log("Destroy: from")
  db.clearDB({ dbMain: "CCONE" })
  console.log("Destroy: to")


  console.log("Destroy: from")
  db.destroyDB({ dbMain: "CCONE" });
  console.log("Destroy: to")
  const l = 0;
  function generateRandomEmail() {
    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    const LENGTH = 8;
    var string = '';
    for (var ii = 0; ii < LENGTH; ii++) {
      string += chars[Math.floor(Math.random() * chars.length)];
    }
    return string + '@gmail.com';
  }
}

