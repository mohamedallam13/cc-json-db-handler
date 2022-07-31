; (function (root, factory) {
  root.API = factory()
})(this, function () {

  function handleRequest(request, dbName) {
    addNewEntry(request, dbName)
  }

  function addNewEntry(request, dbName) {
    JSON_DB_HANDLER.addToDB(request, dbName)
  }

  return {
    handleRequest
  }

})
