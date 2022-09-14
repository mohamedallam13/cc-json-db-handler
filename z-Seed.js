; (function (root, factory) {
  root.SEED = factory()
})(this, function () {

  const { imp, Toolkit, TRIGGERS_MANAGER, REFERENCES_MANAGER } = CCLIBRARIES
  const { startConnection, clearDB } = ORM

  const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
  const TARGETED_BRANCHES = ["Events"]
  const TARGETED_DIVISIONS = ["CCG"];

  const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex", "sourcesIndexed"];

  let referencesObj;
  let sourcesIndex;
  let sourcesUpdateObj = {};

  let n = 1;

  function run() {
    startTriggers();
    getReferences();
    const aggregatedSources = extractSources(); // Get sources data from sources file and read sources
    dbStart();
    aggregatedSources.forEach((sourceObj) => {
      if (sourceObj.eventIndex > n) return;
      processSource(sourceObj)
    }); // Process Every source
    augmentToSourcesIndex();
    Toolkit.writeToJSON(DUMP_ID, dump)
    saveSourcesIndex();
    stopTriggers()
  }

  function clearCache() {
    stopTriggers()
  }

  function reset() {
    getReferences();
    resetSourcesIndex();
    dbClear();
    saveSourcesIndex();
  }

  function resetSourcesIndex() {
    Object.entries(sourcesIndex).forEach(([branchName, allDivisionObj]) => {
      Object.entries(allDivisionObj).forEach(([divisionName, allActivitiesArray]) => {
        allActivitiesArray.forEach((sourceObj, i) => {
          sourcesIndex[branchName][divisionName][i].counter = 0;
          sourcesIndex[branchName][divisionName][i].seeded = false;
        })
      })
    })
  }

  function getReferences() {
    getRequiredIndexes();
    getSourcesIndex();
  }

  function dbClear() {
    dbStart();
    clearDB();
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

  function saveSourcesIndex() {
    referencesObj.sourcesIndexed.update();
  }

  function startTriggers() {
    TRIGGERS_MANAGER.setContinutaionTrigger("run");
    sourcesUpdateObj = TRIGGERS_MANAGER.getContVariable("sourcesUpdateObj") || {};
  }

  function stopTriggers() {
    TRIGGERS_MANAGER.deleteContinuationTrigger("run");
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
      GSCRIPT_ROUTER.route(primaryClassifierCode, cleanEntry);
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
    TRIGGERS_MANAGER.addContVariable("sourcesUpdateObj", sourcesUpdateObj);
  }

  function markSourceAsDone(primaryClassifierCode, eventIndex) {
    sourcesUpdateObj[primaryClassifierCode][eventIndex].seeded = true;
    TRIGGERS_MANAGER.addContVariable("sourcesUpdateObj", sourcesUpdateObj);
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
    run,
    reset,
    clearCache
  }

})

function run() {
  SEED.run();
}

function reset() {
  SEED.reset();
}

function clearCache() {
  SEED.clearCache();
}