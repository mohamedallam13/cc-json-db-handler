// ; (function (root, factory) {
//   root.CONTROLLER = factory()
// })(this, function () {

//   // const { addToDB, updateInDB, lookupDB } = ORM;

//   function handleCompiledRequest(request) {
//     const { userId } = getUser(request);
//     const { applicationId } = getApplication(request);
//     const { fillCheck, roles } = request
//     if (!applicationId) {
//       addNewApplicationToDB(request, dbName);
//     } else {
//       updateApplicationInDB(request, dbName);
//     }
//     if (!userId) {
//       if (applicationObj.fillCheck) {
//         userId = getId("CCER", row.Timestamp);
//         addNewUserToDB(userId, applicationId, row);
//       } else {
//         warn(applicationObj.Email);
//       }
//     } else {
//       if (roles.includes("Applicant") && !fillCheck) {
//         warn(applicationObj.Email);
//       } else {
//         updateUserInDB(userId, applicationId, row, fillCheck);
//       }
//     }

//     addNewEntry(request, dbName)
//   }


//   function getApplication(request) {
//     const { email, eventId } = request;
//     return CCAPPLICATION[eventId].findByKey(email);
//   }

//   function getUser(request) {
//     const { email } = request;
//     // return CCER.findByKey(email)
//   }

//   function addNewApplicationToDB(request) {
//     const { eventId } = request;
//     // CCAPPLICATION[eventId].add(request)
//   }

//   function addNewUserToDB(request) {
//     // CCER.add(request)
//   }

//   function updateApplicationInDB(request, dbName) {
//     updateInDB(request, dbName)
//   }

//   function updateUserInDB() {
//     // updateInDB(request, CCONE)
//   }

//   function warn() {

//   }

//   return {
//     handleRequest
//   }

// })

// function test() {
//   CONFESSION.test()
// }
