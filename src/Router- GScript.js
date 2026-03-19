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
      observer.inRoute = true
      return getCCerByEmail(request)
    },
    getFullCCerByEmail(request) {
      observer.inRoute = true

      return getFullCCerByEmail(request)
    },
    handleCompiledApplicationRequest(request) {
      observer.inRoute = true

      return handleCompiledApplicationRequest(request)
    },
    getAllApplications(request) {
      observer.inRoute = true

      return getAllApplications(request)
    },
    getAllFullApplications(request) {
      observer.inRoute = true

      return getAllFullApplications(request)
    },
    getApplicants(request) {
      observer.inRoute = true

      return getApplications(request)
    },
    getApplicationByEmail(request) {
      observer.inRoute = true

      return getApplicationByEmail(request)
    },
    getFullApplicationByEmail(request) {
      observer.inRoute = true

      return getFullApplicationByEmail(request)
    },
    updateApplicationStatus(request) {
      observer.inRoute = true

      return updateApplicationStatus(request)
    }
  }

  function route({ path, ...request }) {
    response.console = { a: { path, ...request } }
    if (!Router[path]) throw `Path (${path})does not exist!`
    response.data = Router[path](request);
    console.log(response.data)
    response.observer = observer;
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