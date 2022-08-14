; (function (root, factory) {
    root.USER = factory()
})(this, function () {

    const { Schema, modelCreate } = ORM;

    const userSchemaMap = {

    };


    const schema = new Schema(confessionSchemaMap,
        { dbMain: "CCONE" })
    return modelCreate(schema)

})


