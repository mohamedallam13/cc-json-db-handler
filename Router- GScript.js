; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  const {
    handleCompiledConfessionRequest,
    handleCompiledApplicationRequest,
    getCCerByEmail,
    getAllApplications,
    getAllFullApplications,
    getApplications,
    getApplicationByEmail,
    getFullApplicationByEmail
  } = CONTROLLER

  const Router = {
    addUser(request) {

    },
    updateUser(request) {

    },
    getCCerByEmail(request) {
      return getCCerByEmail(request)
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
    }
  }

  function route(path, request) {
    return Router[path](request)
  }


  return {
    route
  }

})