; (function (root, factory) {
  root.API = factory()
})(this, function () {

  const { addToDB, updateInDB, lookupDB } = JSON_DB_HANDLER;
  const CCONE = "CCOne";

  function handleRequest(request, dbName) {
    const { userId } = getUserId(request);
    const { applicationId } = getApplicationId(request, dbName);
    const { fillCheck, roles } = request
    if (!applicationId) {
      addNewApplicationToDB(request, dbName);
    } else {
      updateApplicationInDB(request, dbName);
    }
    if (!userId) {
      if (applicationObj.fillCheck) {
        userId = getId("CCER", row.Timestamp);
        addNewUserToDB(userId, applicationId, row);
      } else {
        warn(applicationObj.Email);
      }
    } else {
      if (roles.includes("Applicant") && !fillCheck) {
        warn(applicationObj.Email);
      } else {
        updateUserInDB(userId, applicationId, row, fillCheck);
      }
    }

    addNewEntry(request, dbName)
  }


  function getApplicationId(request, dbName) {
    lookupDB(request, dbName)
  }

  function getUserId(request) {
    lookupDB(request, CCONE)
  }

  function addNewApplicationToDB(request, dbName) {
    addToDB(request, dbName)
  }

  function addNewUserToDB(request) {
    addToDB(request, CCONE)
  }

  function updateApplicationInDB(request, dbName) {
    updateInDB(request, dbName)
  }

  function updateUserInDB() {
    updateInDB(request, CCONE)
  }

  function warn() {

  }

  return {
    handleRequest
  }

})
