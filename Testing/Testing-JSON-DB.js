; (function (root, factory) {
    root.TESTING_DB_HANDLER = factory()
})(this, function () {

    //// TEST_DBHANDLER

    const test_indexId = "1SQHe3W33uCD20bn-yWhpO89cqC_VEkXV";
    const { init } = JSON_DB_HANDLER

    const SEQUENCES = [
        ["add", "save"],
        ["lookupId", "lookupKey", "lookupCriteria", "deleteByKey", "deleteById", "save"],
        ["destroy"]
    ]

    const CRITERIA = [
        [
            {
                param: "email",
                criterion: "findMe@gmail.com"
            },
            {
                param: "age",
                criterion: function (age) { return age > 20 }
            }
        ],
        [
            {
                param: "age",
                criterion: function (age) { return age > 20 }
            }
        ],
        [
            {
                param: "age",
                criterion: function (age) { return age > 20 },
            },
            {
                param: "statusArr",
                criterion: function (statusArr) { return statusArr.filter(function (statusObj) { return statusObj.status == "Done" }).length > 0 },
            }
        ]
    ]

    const SCENARIOS = [
        {
            dbMain: "CCONE",
            sequence: 2
        },
        {
            dbMain: "CCONE",
            sequence: 0,
            model: "preliminary",
            criteriaSet: 0
        },
        {
            dbMain: "CCONE",
            sequence: 1,
            model: "preliminary",
            criteriaSet: 1
        },
        {
            dbMain: "CCONE",
            sequence: 0,
            model: "preliminaryNested",
            criteriaSet: 2
        },
        {
            dbMain: "CCONE",
            sequence: 1,
            model: "preliminaryNested",
            criteriaSet: 2
        },
        {
            dbMain: "CCG",
            dbFragment: "CCGS1R1",
            sequence: 0,
            model: "preliminaryNested",
            criteriaSet: 2
        },
        {
            dbMain: "CCG",
            dbFragment: "CCGS1R1",
            sequence: 1,
            model: "preliminaryNested",
            criteriaSet: 2
        },
        {
            dbMain: "CCG",
            dbFragment: "CCGS1R1",
            sequence: 2,
            model: "preliminaryNested",
            criteriaSet: 1
        }
    ]

    const METHODS = {
        add: test_add,
        lookupId: test_lookupId,
        lookupKey: test_lookupKey,
        lookupCriteria: test_lookupByCriteria,
        deleteByKey: test_deleteFromDBByKey,
        deleteById: test_deleteFromDBById,
        save: test_saveToDBFiles,
        clear: test_clearDB,
        destroy: test_destroyDB
    }

    const TEST_ENTRIES = {
        preliminary: test_createPreliminaryEntries(),
        preliminaryNested: test_createPreliminaryEntries({ nested: true }),
        preliminaryNestedLimited: test_createPreliminaryEntries({ nested: true, count: 100 })
    }

    function test_createPreliminaryEntries({ nested, count = 500 } = {}) {
        const requests = [];

        for (var i = 0; i < count; i++) {
            const generatedEmail = generateRandomEmail();
            let request = {
                key: generatedEmail,
                email: generatedEmail,
                id: i + 1,
                name: generateNameCombinations(),
                age: generateRandomAge(18, 49)
            }
            if (nested) request.statusArr = generateStatusArray()
            requests.push(request)
        }

        let findMeRequest = {
            key: "findMe@gmail.com",
            id: i + 1,
            name: "Find Me",
            age: 34
        }

        let findMeAndDeleteRequest = {
            key: "findMeAndDelete@gmail.com",
            id: i + 2,
            name: "Find Me And Delete",
            age: 34
        }

        requests.push(findMeRequest)
        requests.push(findMeAndDeleteRequest)

        return requests
    }

    // MAIN

    function testDBStart() {
        return init(test_indexId);
    }

    function testByScenarios(scenarios = []) {
        if (scenarios.length == 0) scenarios = [0];
        scenarios.forEach(scenario => {
            const testScenario = SCENARIOS[scenario];
            const { model, sequence, criteriaSet, dbMain, dbFragment } = testScenario
            testBySequence({ model, sequence, criteriaSet, dbMain, dbFragment })
        })
    }

    function testBySequence({ model, sequence = 0, criteriaSet = 0, dbMain, dbFragment }) {
        const methods = SEQUENCES[sequence]
        const criteria = CRITERIA[criteriaSet]
        testDBHandlerMethods({ model, methods, criteria, dbMain, dbFragment })
    }

    function testDBHandlerMethods({ model, methods = [], criteria = [], dbMain, dbFragment }) {
        const db = testDBStart()
        const entries = model ? TEST_ENTRIES[model] : []
        methods.forEach(method => {
            if (METHODS[method]) METHODS[method]({ db, entries, criteria, dbMain, dbFragment })
            else console.log(`Method "${method}" is not recognized`)
        })
    }

    // METHODS

    function test_add({ db, entries, dbMain, dbFragment }) {
        console.log(`Total Add ${entries.length} entries: from`)
        entries.forEach(entry => {
            db.addToDB(entry, { dbMain, dbFragment })
        })
        console.log(`Total Add ${entries.length} entries: to`)
    }

    function test_lookupId({ db, dbMain, dbFragment }) {
        console.log("Lookup by Id: from")
        const id = 5;
        const entry = db.lookUpById(id, { dbMain, dbFragment });
        console.log(entry)
        console.log("Lookup by Id: to")
    }

    function test_lookupKey({ db, dbMain, dbFragment }) {
        console.log("Lookup by key: from")
        const key = "findMe@gmail.com";
        const entry = db.lookUpByKey(key, { dbMain, dbFragment })
        console.log(entry)
        console.log("Lookup by key: to")
    }

    function test_lookupByCriteria({ db, criteria, dbMain, dbFragment }) {
        console.log("Lookup by criteria: from")
        const entries = db.lookupByCriteria(criteria, { dbMain, dbFragment })
        console.log(entries)
        console.log("Lookup by criteria: to")
    }

    function test_deleteFromDBByKey({ db, dbMain, dbFragment }) {
        console.log("Delete by key: from")
        const key = "findMeAndDelete@gmail.com";
        db.deleteFromDBByKey(key, { dbMain, dbFragment })
        console.log("Delete by key: to")
    }

    function test_deleteFromDBById({ db, dbMain, dbFragment }) {
        console.log("Delete by id: from")
        const id = 5;
        db.deleteFromDBById(id, { dbMain, dbFragment })
        console.log("Delete by id: to")
    }

    function test_saveToDBFiles({ db }) {
        console.log("Save: from")
        db.saveToDBFiles();
        console.log("Save: to")
    }

    function test_clearDB({ db, dbMain, dbFragment }) {
        console.log("Destroy: from")
        db.clearDB({ dbMain, dbFragment })
        console.log("Destroy: to")
    }

    function test_destroyDB({ db, dbMain, dbFragment }) {
        console.log("Destroy: from")
        db.destroyDB({ dbMain, dbFragment })
        console.log("Destroy: to")
    }




    //// HELPERS

    function generateNameCombinations() {
        return "Mohamed Allam"
    }

    function generateRandomEmail() {
        var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
        const LENGTH = 8;
        var string = '';
        for (var ii = 0; ii < LENGTH; ii++) {
            string += chars[Math.floor(Math.random() * chars.length)];
        }
        return string + '@gmailÍ.com';
    }

    function generateRandomAge(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateStatusArray() {
        const statusArr = [
            [
                {
                    timestamp: new Date(),
                    status: "Pending"
                }
            ],
            [
                {
                    timestamp: new Date(),
                    status: "Pending"
                },
                {
                    timestamp: new Date(),
                    status: "Done"
                }
            ]
        ]
        const randomStatusArray = statusArr[Math.floor(Math.random() * statusArr.length)];
        return [...randomStatusArray];
    }


    //// RETURNS


    return {
        testByScenarios,
        testBySequence,
        testDBHandlerMethods
    }

})



function testDBHandlerScenario() {
    const { testByScenarios } = TESTING_DB_HANDLER();
    const fixedScenarios = {
        cumulativeDestroy: [0],
        cumulativeSimpleCreateManipulateDestroy: [1, 2, 0],
        cumulativeSimpleCreateManipulate: [1, 2],
        cumulativeNestedCreateManipulateDestroy: [3, 4, 0],
        cumulativeNestedCreateManipulate: [3, 4],
        cumulativeNestedManipulate: [4],
        fragmentSimpleCreateManipulateDestroy: [5, 6, 7],
        fragmentSimpleCreateManipulate: [5, 6],
        fragmentSimpleManipulate: [6],
        fragmentADestroy: [7]
    }
    testByScenarios(fixedScenarios.fragmentADestroy)
}
