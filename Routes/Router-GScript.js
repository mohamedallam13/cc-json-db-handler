; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  const response = {
    timestamp: new Date(),
    sucess: false,
    code: 400,
  }

  const {
    handleCompiledConfessionRequest,
    handleCompiledApplicationRequest,
    getCCerByEmail,
    getFullCCerByEmail,
    getAllApplications,
    getAllFullApplications,
    getApplications,
    getApplicationByEmail,
    getFullApplicationByEmail,
    updateApplicationStatus
  } = CONTROLLER

  const Router = {
    addUser(request) {

    },
    updateUser(request) {

    },
    getCCerByEmail(request) {
      
      return getCCerByEmail(request)
    },
    getFullCCerByEmail(request) {

      return getFullCCerByEmail(request)
    },
    handleCompiledApplicationRequest(request) {

      return handleCompiledApplicationRequest(request)
    },
    getAllApplications(request) {

      return getAllApplications(request)
    },
    getAllFullApplications(request) {

      return getAllFullApplications(request)
    },
    getApplicants(request) {

      return getApplications(request)
    },
    getApplicationByEmail(request) {

      return getApplicationByEmail(request)
    },
    getFullApplicationByEmail(request) {

      return getFullApplicationByEmail(request)
    },
    updateApplicationStatus(request) {

      return updateApplicationStatus(request)
    }
  }

  function route({ path, ...request }) {
    if (!Router[path]) throw `Path (${path})does not exist!`
    response.data = Router[path](request);
    console.log(response.data)
    response.sucess = true;
    response.code = 200;

    return response
  }


  return {
    route
  }

})

function handleRequest(request) {
  const { REFERENCES_MANAGER } = CCLIBRARIES
  const { startConnection } = ORM

  const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
  const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex", "sourcesIndexed"];

  let referencesObj = REFERENCES_MANAGER.init(MASTER_INDEX_FILE_ID).requireFiles(REQUIRED_REFERENCES).requiredFiles;
  const { CCJSONsDBSuperIndex } = referencesObj;
  startConnection(CCJSONsDBSuperIndex.fileContent); // Start the Database
  return GSCRIPT_ROUTER.route(request)
}