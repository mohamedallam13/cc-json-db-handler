; (function (root, factory) {
  root.SEED = factory()
})(this, function () {

  const { imp, Toolkit } = CCLIBRARIES

  const SOURCES_FILE_ID = "1KYrju7TNNTJKO29IXAMPX5sJ-_uuQyDZ";
  const JSON_DB_INDEX = "1SQHe3W33uCD20bn-yWhpO89cqC_VEkXV"
  const TARGETED_BRANCHES = ["Events"]

  function run() {
    JSON_DB_HANDLER.initiateDB(JSON_DB_INDEX); // Start the Database
    const aggregatedSources = getSources(); // Get sources data from sources file and read sources
    aggregatedSources.forEach(processSource); // Process Every source
    const stop = 1
  }

  function getSources() {
    const allBranchesSources = Toolkit.readFromJSON(SOURCES_FILE_ID);
    return extractSources(allBranchesSources);


  }

  function extractSources(allBranchesSources) {
    const aggregatedSources = getAggregatedSources(allBranchesSources);
    aggregatedSources.forEach(augmentData);
    return aggregatedSources;
  }

  function getAggregatedSources(allBranchesSources) {
    let aggregatedSources = [];
    TARGETED_BRANCHES.forEach(branch => {
      const allActivitiesObj = allBranchesSources[branch];
      Object.keys(allActivitiesObj).forEach(activityName => aggregatedSources = [...aggregatedSources, ...allActivitiesObj[activityName]])
    })
    return aggregatedSources
  }

  function augmentData(sourceObj) {
    const { ssid, sheetName, headerRow, skipRows } = sourceObj;
    const parseObj = { headerRow, skipRows }
    const ssMan = imp.createSpreadsheetManager(ssid).addSheets([sheetName]);
    const sheetObj = ssMan.sheets[sheetName]
    sheetObj.parseSheet(parseObj).objectifyValues();
    sourceObj.entries = sheetObj.objectifiedValues;
  }

  function processSource(sourceObj) {
    const { entries, secondaryClassifierCode } = sourceObj;
    entries.forEach(entry => {
      API.handleRequest(entry, secondaryClassifierCode);
    })
  }

  return {
    run
  }

})

function run() {
  SEED.run();
}