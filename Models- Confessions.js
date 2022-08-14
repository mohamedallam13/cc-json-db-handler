; (function (root, factory) {
    root.CONFESSION = factory()
})(this, function () {

    const { Schema, modelCreate } = ORM;

    const confessionSchemaMap = {
        confession: {
            db: "core",
            validate: () => { },
            defaultValue: "",
            type: "string"
        },
        sn: {
            db: "core"
        },
        category: {
            db: "core"

        },
        status: {
            db: "status",
            enums:['posted', 'rejected', 'skipped']
        }
    };


    const schema = new Schema(confessionSchemaMap,
        { dbMain: "CCMAIN" })
    return modelCreate(schema)

})


