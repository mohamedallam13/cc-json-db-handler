; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  function route(path, request) {
    return Router[path](request)
  }

  const Router = {
    addUser(request) {

    },
    updateUser(request) {

    },
    handleCompoundedRequest(request){

    }
  }

  return {
    route
  }

})