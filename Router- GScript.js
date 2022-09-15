; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  const { getAllApplications, handleCompiledApplicationRequest } = CONTROLLER

  const Router = {
    getAllApplications(request) {
      getAllApplications(request)
    },
    addUser(request) {

    },
    updateUser(request) {

    },
    handleCompiledApplicationRequest(request) {
      handleCompiledApplicationRequest(request)
    }
  }

  function route(path, request) {
    return Router[path](request)
  }


  return {
    route
  }

})