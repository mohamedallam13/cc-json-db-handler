; (function (root, factory) {
  root.DATA_REFIT = factory()
})(this, function () {

  const { Toolkit } = CCLIBRARIES;

  function cleanEntries(sourceObj) {
    const { map, entries } = sourceObj;
    const cleanMap = getCleanMap(map);
    const cleanEntriesArray = entries.map(entry => {
      const cleanEntry = getCleanEntry(cleanMap, entry);
      augmentExtraInfo(cleanEntry, sourceObj)
    })
    return cleanEntriesArray;
  }

  function getCleanMap(map) {
    const cleanMap = {};
    Object.entries(map).forEach(([mapKey, equivalent]) => {
      const cleanKey = mapKey.replace(/_a-z/g, "");
      cleanMap[cleanKey] = equivalent;
    })
    return cleanMap;
  }

  function getCleanEntry(cleanMap, entry) {
    const cleanEntry = {};
    Object.entries(cleanMap).forEach(([cleanKey, cleanEquivalentKey]) => {
      const normalizedCleanKey = normalize(cleanKey);
      cleanEntry[normalizedCleanKey] = refit(cleanKey, entry[cleanEquivalentKey]);
    })
  }

  function augmentExtraInfo(cleanEntry, sourceObj) {
    const { primaryClassifierCode, secondaryClassifierCode } = sourceObj;
    cleanEntry.divisionId = primaryClassifierCode;
    cleanEntry.eventId = secondaryClassifierCode;
  }

  function refit(cleanKey, cleanEquivalent) {

  }

  function normalize() {

  }

  return {
    cleanEntries
  }
})