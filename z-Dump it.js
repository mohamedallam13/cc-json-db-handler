; (function (root, factory) {
  root.DUMP_IT = factory()
})(this, function () {

  const { imp, Toolkit, REFERENCES_MANAGER } = CCLIBRARIES
  const { startConnection, clearDB, saveDB } = ORM

  const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
  const TARGETED_BRANCHES = ["Events"]
  const TARGETED_DIVISIONS = ["CCG"];

  const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex", "sourcesIndexed"];

  let referencesObj;
  let sourcesIndex;
  let sourcesUpdateObj = {};
  const DUMP_ID = "1Myh_Uh8lnY1QNf7wA9d68KimOYswL6HU";
  let dump = []

  let n = 1;

  function createDump() {
    getReferences();
    const aggregatedSources = extractSources(); // Get sources data from sources file and read sources
    aggregatedSources.forEach((sourceObj) => {
      if (sourceObj.eventIndex > n) return;
      processSource(sourceObj)
    }); // Process Every source
    augmentToSourcesIndex();
    Toolkit.writeToJSON(DUMP_ID, dump)
  }

  function seedDump() {
    getReferences();
    dbStart();
    dump = Toolkit.readFromJSON(DUMP_ID);
    dump.forEach((entry, i) => {
      GSCRIPT_ROUTER.route("handleCompiledApplicationRequest", entry);
      console.log(`saved!`)
    })
    saveDB()
    console.log(`Done dumping!`)
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
      console.log(entry);
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
  DUMP_IT.createDump();
}

function seedDump() {
  DUMP_IT.seedDump();
}

function reset() {
  DUMP_IT.reset();
}