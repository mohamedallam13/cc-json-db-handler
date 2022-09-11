; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  const { handleCompiledRequest } = CONTROLLER

  const Router = {
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