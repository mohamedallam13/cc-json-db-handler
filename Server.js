; (function (root, factory) {
    root.SERVER = factory()
})(this, function () {

    let referencesObj
    const { route } = ROUTER;

    const init = function () {
        const response = {}
        try {
            startAllDBs()
            response.handledResponse = handleRequest(request);
            saveDBs()
            response.code = 200;
        } catch (e) {
            console.log(e);
            response.error = e;
            response.code = 400;
        }
        return response
    }

    const startAllDBs = function () {

    }

    const handleRequest = function (request) {
        if (!Array.isArray(rawRequest)) return route[request.path]({ method, ...request })
        return request.map(rawReq => route[rawReq.path]({ method, ...rawReq }))
    }

    const saveDBs = function () {

    }

    return init

})

function doPost(e) {
    return CCLIBRARIES.MODULESEXPORT.postRequest(e, this)
}

function doGet(e) {
    return CCLIBRARIES.MODULESEXPORT.getRequest(e, this)
}