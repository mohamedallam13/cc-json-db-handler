; (function (root, factory) {
  root.GSCRIPT_ROUTER = factory()
})(this, function () {

  function route(path, request) {
    return Router[path](request)
  }

  const Router = {
    addUser: function (request) {

    },
    updateUser: function (request) {

    }
  }

  return {
    route
  }

})