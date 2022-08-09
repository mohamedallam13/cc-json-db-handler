; (function (root, factory) {
    root.JSON_DB_HANDLER = factory()
})(this, function () {

    let INDEX = {
        CCONE: {
            properties: {
                rootFolder: "",
                filesPrefix: ""
            },
            dbFragments: {
                CCONE_1: {
                    queryArray: [],
                    fileId: ""
                }
            }
        },
        CCG: {
            properties: {
                rootFolder: "",
                filesPrefix: ""
            },
            dbFragments: {
                CCGS1R1: {
                    queryArray: [],
                    fileId: ""
                },
                CCGS1R2: {
                    queryArray: [],
                    fileId: ""
                }
            }
        }
    }

    let OPEN_DB = {
        CCONE_1: {
            properties: {
                isChanged: true
            },
            toWrite: {
                index: {},
                data: {}
            }

        },
        CCGS1R1: {
            propertties: {
                isChanged: true
            },
            toWrite: {
                index: {},
                data: {}
            }

        }
    }


    function init(indexFileId) {
        INDEX = getIndex(indexFileId)
        return {
            index: INDEX,
            openDBs: OPEN_DB,
            saveIndex,
            openDB,
            saveAndClose
        }
    }

    function getIndex(indexFileId) {
        return Toolkit.readFromJSON(indexFileId);
    }

    function saveIndex() {

    }

    function saveAndClose() {

    }

    function openDB(dbName) {
        const { index } = this;
        const dbObj = new DBObj()

    }

    function DBObj() {

    }



})  