; (function (root, factory) {
  root.DATA_REFIT = factory()
})(this, function () {

  const { Toolkit } = CCLIBRARIES;

  let cleanMap
  let secondaryClassifierCode;

  function cleanEntries(sourceObj, entry) {
    let entries = entry ? [entry] : sourceObj.entries
    const cleanEntriesArray = entries.map(entry => cleanEntry(sourceObj, entry));
    console.log(cleanEntriesArray)
    if (entry) return cleanEntriesArray[0]
    return cleanEntriesArray;
  }

  function cleanEntry(sourceObj, entry) {
    const { map } = sourceObj;
    getCleanMap(map, sourceObj);
    const cleanEntry = getCleanEntry(cleanMap, entry);
    augmentExtraInfo(cleanEntry, sourceObj)
    return cleanEntry
  }

  function getCleanMap(map, sourceObj) {
    if (secondaryClassifierCode == sourceObj.secondaryClassifierCode) return
    cleanMap = Object.entries(map).reduce((acc, [mapKey, equivalent]) => {
      const cleanKey = mapKey.replace(/_\w/g, "");
      return { ...acc, [cleanKey]: equivalent }
    }, {})
    secondaryClassifierCode = sourceObj.secondaryClassifierCode;
  }

  function getCleanEntry(cleanMap, entry) {
    let cleanEntry = {}
    Object.entries(cleanMap).forEach(([cleanKey, cleanEquivalentKey]) => {
      const normalizedCleanKey = normalize(cleanKey);
      if (entry[cleanEquivalentKey]) {
        cleanEntry[normalizedCleanKey] = refit(cleanKey, entry[cleanEquivalentKey])
      }
    })
    return cleanEntry
  }

  function augmentExtraInfo(cleanEntry, sourceObj) {
    const { primaryClassifierCode, secondaryClassifierCode } = sourceObj;
    cleanEntry.divisionId = primaryClassifierCode;
    cleanEntry.eventId = secondaryClassifierCode;
    cleanEntry.fillCheck = getFillCheck(cleanEntry);
  }

  function refit(cleanKey, cleanEquivalent) {
    return cleanEquivalent
  }

  function normalize(cleanKey) {
    return cleanKey
  }

  function getFillCheck(cleanEntry) {
    return true
  }

  return {
    cleanEntries
  }
})