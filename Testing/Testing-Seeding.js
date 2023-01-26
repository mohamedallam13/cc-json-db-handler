; (function (root, factory) {
  root.TEST_SEEDING = factory()
})(this, function () {

// This is a Test Library used to test Data Refit and also Seeding this into the DB through the router, controller and then the ORM (Tests Router, Controller, ORM and DBHandler)

  const { imp, Toolkit, REFERENCES_MANAGER } = CCLIBRARIES
  const { startConnection, clearDB, saveDB } = ORM

  const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
  const TARGETED_BRANCHES = ["Events", "Activities"]
  const TARGETED_DIVISIONS = ["CCG","CCT", "CCST", "CCL", "CCAG","CCPSCC", "CCME"];

  const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex", "sourcesIndexed"];

  let referencesObj;
  let sourcesIndex;
  let sourcesUpdateObj = {};
  const DUMP_ID = "1Myh_Uh8lnY1QNf7wA9d68KimOYswL6HU";
  let dump = []

  let n = 100;

  function createDump() {
    // Tests mainly for the data refit and then adds the file into a temp "dump it" file
    console.time("Clean Entries")
    getReferences();
    const aggregatedSources = extractSources(); // Get sources data from sources file and read sources
    aggregatedSources.forEach((sourceObj) => {
      if (sourceObj.eventIndex > n) return;
      // if(sourceObj.eventIndex == 14){
      //   const stop = true;
      // }
      processSource(sourceObj)
    }); // Process Every source
    augmentToSourcesIndex();
    Toolkit.writeToJSON(DUMP_ID, dump)
    console.timeEnd("Clean Entries")
  }

  function seedDump() {
    console.time("Seeding")
    getReferences();
    dbStart();
    dump = Toolkit.readFromJSON(DUMP_ID);
    dump.forEach((entry, i) => {
      // if(i == 0) return
      // if(entry.userRequest.email == "NO_EMAIL_1433586969000"){
      //   const stop = 2
      // }
      GSCRIPT_ROUTER.route({path:"handleCompiledApplicationRequest", ...entry});
      // console.log(`saved!`)
    })
    saveDB()
    console.log(`Done dumping!`)
    console.timeEnd("Seeding")
  }

  function reset() {
    getReferences();
    dbStart();
    clearDB();
  }

  function getReferences() {
    getRequiredIndexes();
    getSourcesIndex();
  }

  function dbStart() {
    const { CCJSONsDBSuperIndex } = referencesObj;
    startConnection(CCJSONsDBSuperIndex.fileContent); // Start the Database
  }


  function getRequiredIndexes() {
    referencesObj = REFERENCES_MANAGER.init(MASTER_INDEX_FILE_ID).requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  function getSourcesIndex() {
    sourcesIndex = referencesObj.sourcesIndexed.fileContent;
  }

  function extractSources() {
    const aggregatedSources = getAggregatedSources().filter(filterOutSeeded);
    aggregatedSources.forEach(getDataFromSource);
    return aggregatedSources;
  }

  function getAggregatedSources() {
    console.log("Started Aggregation...")
    let aggregatedSources = [];
    TARGETED_BRANCHES.forEach(branch => {
      const allDivisionsObj = sourcesIndex[branch];
      Object.entries(allDivisionsObj).forEach(([divisionName, activitiesArray]) => {
        console.log(`Started Aggregation of ${divisionName}...`)
        if (!TARGETED_DIVISIONS.includes(divisionName)) return;
        const newActivitiesArray = activitiesArray.map(activityObj => {
          const eventIndex = getEventIndex(activityObj);
          return { eventIndex, ...activityObj }
        })
        aggregatedSources = [...aggregatedSources, ...newActivitiesArray]
      })
    })
    return aggregatedSources
  }

  function getEventIndex(activityObj) {
    const { branch, primaryClassifierCode, secondaryClassifierCode, seeded, counter } = activityObj;
    const eventIndex = getIndex(branch, primaryClassifierCode, secondaryClassifierCode);
    addToUpdateObj(primaryClassifierCode, eventIndex, seeded, counter)
    return eventIndex;
  }

  function filterOutSeeded(sourcesObj) {
    const { eventIndex, primaryClassifierCode } = sourcesObj;
    return !sourcesUpdateObj[primaryClassifierCode][eventIndex].seeded;
  }

  function getDataFromSource(sourceObj, i) {
    if (i > n) return
    const { ssid, sheetName, headerRow, skipRows, column } = sourceObj;
    console.log(`Started Reading Source ${sourceObj.secondaryClassifierCode}..`)
    const parseObj = { headerRow, skipRows }
    const ssMan = imp.createSpreadsheetManager(ssid).addSheets([sheetName]);
    const sheetObj = ssMan.sheets[sheetName]
    sheetObj.parseSheet(parseObj).objectifyValues();
    sourceObj.entries = sheetObj.objectifiedValues;
    if (column) {
      sheetObj.columnToArray(column);
      sourceObj[column] = sheetObj.column;
    };
    console.log("Finished Reading Source")
  }

  function processSource(sourceObj) {
    const { entries, primaryClassifierCode, eventIndex } = sourceObj;
    const { counter } = sourcesUpdateObj[primaryClassifierCode][eventIndex]
    entries.slice(counter).forEach((entry, i) => {
      // console.log(entry);
      const cleanEntry = DATA_REFIT.refitToCompoundRequest(sourceObj, entry);
      dump.push(cleanEntry);
      addToCounters(primaryClassifierCode, eventIndex, i);
    })
    markSourceAsDone(primaryClassifierCode, eventIndex);
  }

  function getIndex(branch, primaryClassifierCode, secondaryClassifierCode) {
    const eventLevelArray = sourcesIndex[branch][primaryClassifierCode];
    let eventIndex;
    eventLevelArray.forEach((entry, i) => {
      if (entry.secondaryClassifierCode == secondaryClassifierCode) {
        eventIndex = i;
      }
    })
    return eventIndex
  }

  function addToUpdateObj(primaryClassifierCode, eventIndex, seeded, counter = 0) {
    if (!sourcesUpdateObj[primaryClassifierCode]) {
      sourcesUpdateObj[primaryClassifierCode] = {};
    }
    if (!sourcesUpdateObj[primaryClassifierCode][eventIndex]) {
      sourcesUpdateObj[primaryClassifierCode][eventIndex] = {};
    }
    sourcesUpdateObj[primaryClassifierCode][eventIndex].seeded = seeded;
    sourcesUpdateObj[primaryClassifierCode][eventIndex].counter = counter;

  }

  function addToCounters(primaryClassifierCode, eventIndex, i) {
    sourcesUpdateObj[primaryClassifierCode][eventIndex].counter = i + 1;
  }

  function markSourceAsDone(primaryClassifierCode, eventIndex) {
    sourcesUpdateObj[primaryClassifierCode][eventIndex].seeded = true;
  }

  function augmentToSourcesIndex() {
    Object.entries(sourcesIndex).forEach(([branchName, allDvisionsObj]) => {
      Object.entries(allDvisionsObj).forEach(([divisionName, activitiesArray]) => {
        const updateObjArr = sourcesUpdateObj[divisionName];
        activitiesArray.forEach((activityObj, i) => {
          if (!updateObjArr) return
          sourcesIndex[branchName][divisionName][i] = {
            ...sourcesIndex[branchName][divisionName][i],
            ...updateObjArr[i]
          }
        })
      })
    })
  }

  return {
    createDump,
    reset,
    seedDump
  }

})

function createDump() {
  TEST_SEEDING.createDump();
}

function seedDump() {
  TEST_SEEDING.seedDump();
}

function reset() {
  TEST_SEEDING.reset();
}