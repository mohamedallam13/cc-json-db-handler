// ; (function (root, factory) {
//     root.ORM = factory()
// })(this, function () {

//     const connectionsObj = {};

//     function startConnection(indexFileIdsObjArray) {
//         if (!Array.isArray(indexFileIdsObjArray)) indexFileIdsObjArray = [indexFileIdsObjArray];
//         const connectionsObj = {};
//         indexFileIdsObjArray.forEach(connectionInfoObj => {
//             const { connectionLabel, indexFileId } = connectionInfoObj;
//             connectionsObj[connectionLabel] = JSON_DB_HANDLER.init(indexFileId);
//         })
//         return connectionsObj
//     }

//     class Schema {
//         constructor(map, options) {
//             this.map = map;
//             this.options = options;
//         }

//         getProperObj(rawObj) {
//             let splitProperObj = {};
//             Object.entries(rawObj).forEach(([key, value]) => {
//                 applyConfigs(key, value, properObj);
//             });
//             return splitProperObj;
//         }

//         applyConfigs(key, value, splitProperObj) {
//             let { db = 'core', validate, defaultValue, type, enums } = this.map[key];
//             if (defaultValue) value = value || defaultValue;
//             if (type) if (typeof value != type) throw `${key} does not have the correct type!`;
//             if (!validate(value)) throw `${key} does not have a valid value!`;
//             if (enums) if(!enums.includes(value)) throw `${key} does not have a valid choices!`;
//             if (!splitProperObj[db]) splitProperObj = {};
//             splitProperObj[db] = { ...splitProperObj[db], [key]: value };
//         }
//     }



//     function modelCreate(schema, options) {
//         const { dbMain } = schema.properties
//         const { dbFragment } = options

//         return {
//             createFragmentModel(dbFragment) {
//                 return model(schema, {dbFragment})
//             },
//             add(request) {
//                 const splitProperObj = schema.getObj(request);
//                 Object.entries(splitProperObj).forEach(([db, obj]) => {
//                     connectionsObj[db].addToDB(obj, { dbMain, dbFragment });
//                 });
//             },
//             updateArray(){

//             },
//             delete(id, db) {

//             }
//         }
//     }

//     return {
//         startConnection,
//         Schema,
//         modelCreate
//     }

// })