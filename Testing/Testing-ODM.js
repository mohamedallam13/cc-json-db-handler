; (function (root, factory) {
    root.TESTING_ORM = factory()
})(this, function () {

    //// TEST_ORM

    const { Toolkit, REFERENCES_MANAGER } = CCLIBRARIES;
    const { timestampCreate } = Toolkit;
    const { Model, Schema, clearDB, saveDB, startConnection } = ORM
    const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
    const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex"];

    const test_requests = {
        preliminary: test_createPreliminaryRequests,
        full_CCER: test_createCCERRequests
    }

    const test_models = {
        preliminary: test_createSchemaModel,
        full_CCER: function () { return CCER }
    }

    function test_createPreliminaryRequests() {
        const requests = [{
            name: "Mohamed Allam",
            age: 34,
            email: "mh.allam@yahoo.com",
            status: "pending",
            id: 1
        }]
        return requests
    }

    function test_createCCERRequests() {

    }

    function test_dbStart() {
        const referencesObj = REFERENCES_MANAGER.init(MASTER_INDEX_FILE_ID).requireFiles(REQUIRED_REFERENCES).requiredFiles;
        const { CCJSONsDBSuperIndex } = referencesObj;
        const connectionsObj = startConnection(CCJSONsDBSuperIndex.fileContent); // Start the Database
        console.log(connectionsObj);
    }

    function test_createSchemaModel() {

        const DBMAIN = "CCONE";

        const statusSchemaMap = {
            timestamp: {
                type: "object",
                defaultValue: timestampCreate()
            },
            status: {
                type: "string",
                enums: ['pending', 'accepted', 'rejected', 'deferred']
            }
        }

        const statusSchema = new Schema(statusSchemaMap)

        const userSchemaMap = {
            name: {
                defaultValue: "",
                type: "string"
            },
            age: {
                type: "number"
            },
            email: {
                type: "string"
            },
            statusArr: [statusSchema],
            id: {
                type: "number"
            }
        };

        const userSchema = new Schema(userSchemaMap,
            {
                dbMain: DBMAIN,
                dbSplit: {
                    core: ["name", "age", "email", 'key', 'id'],
                    aux: ['statusArr', 'key', 'id']
                },
                id: "id",
                key: "email",
                base: "key"
            });

        const model = new Model(userSchema, {});

        return model
    }

    function test_ORMModelMethods({ model }) {
        test_dbStart();
        const requests = test_requests[model]()
        const test_model = test_models[model]()
        const users = requests.map(function (request) { return test_model.create(request) });
        users[0].test()

    }

    function test_ORMDestroy() {
        test_dbStart();
        clearDB();
    }



    return {
        test_ORMModelMethods,
        test_ORMDestroy
    }

})

function allORMTests() {
    const { test_ORMModelMethods } = TESTING_ORM;
    test_ORMModelMethods({ model: "preliminary" })
}

function testCompile() {
    console.log("Compiled!")
}
