; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

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

  function route(path, request) {
    return Router[path](request)
  }


  return {
    route
  }

})