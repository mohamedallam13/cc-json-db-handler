; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  const { getAllApplications } = CONTROLLER

  const Router = {
    getAllApplications(request) {
      getAllApplications(request)
    },
    addUser(request) {

    },
    updateUser(request) {

    },
    handleCompoundedRequest(request) {

    }
  }

  function route(path, request) {
    return Router[path](request)
  }


  return {
    route
  }

})