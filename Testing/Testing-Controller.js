function testController() {
  const { REFERENCES_MANAGER } = CCLIBRARIES
  const { startConnection } = ORM

  const MASTER_INDEX_FILE_ID = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev";
  const REQUIRED_REFERENCES = ["CCJSONsDBSuperIndex", "sourcesIndexed"];
  const WORKING_DOCUMENT_ID = ""

  let referencesObj

  function dbStart() {
    const { CCJSONsDBSuperIndex } = referencesObj;
    startConnection(CCJSONsDBSuperIndex.fileContent); // Start the Database
  }

  function getRequiredIndexes() {
    referencesObj = REFERENCES_MANAGER.init(MASTER_INDEX_FILE_ID).requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  getRequiredIndexes()
  dbStart();
  const { route } = GSCRIPT_ROUTER
  // const ccer = route("getCCerByEmail", { email: "mahmoud.salama77@gmail.com" })
  // const applications = route("getAllApplications", { divisionId: "CCG", eventId: "SIR3" })
  // const application = route({path: "getApplicationByEmail",divisionId: "CCG", eventId: "SIR2", email: "mahmoud.salama77@gmail.com" })
  const fullApplication = route({path:"getFullApplicationByEmail", divisionId: "CCG", eventId: "SIR2", email: "mahmoud.salama77@gmail.com" })
  // const fullApplications = route({ path: "getAllFullApplications", divisionId: "CCG", eventId: "SIR3" })
  // const fullUser = route("getFullCCerByEmail", { email: "mahmoud.salama77@gmail.com" })
  // const updatedApplication = route("updateApplicationStatus", { email: "mahmoud.salama77@gmail.com", divisionId: "CCG", eventId: "SIR2", status: "accepted" })

  function updateWorkingDocument(fullApplications) {

  }
  console.log(`Loaded`)
  console.log(`All done!`)
}
