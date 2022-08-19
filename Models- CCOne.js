// ; (function (root, factory) {
//   root.USER = factory()
// })(this, function () {

//   const { Schema, Model } = ORM;

//   const DBMAIN = "CCONE"

//   const userSchemaMap = {
//     confession: {
//       db: "core",
//       validate: () => { },
//       defaultValue: "",
//       type: "string"
//     },
//     sn: {
//       db: "core"
//     },
//     category: {
//       db: "core"

//     },
//     status: {
//       db: "status",
//       enums: ['posted', 'rejected', 'skipped']
//     }
//   };


//   const userSchema = new Schema(confessionSchemaMap,
//     { dbMain: DBMAIN })

//   const model = new Model(userSchema, {});

//   return model

// })