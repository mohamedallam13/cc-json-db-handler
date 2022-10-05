; (function (root, factory) {
  root.CONTROLLER = factory()
})(this, function () {

  function handleCompiledConfessionRequest({ userRequest, applicationRequest }) {
    let ccer = getCCer(userRequest);
    let confession = getConfession(applicationRequest);
    if (!confession) {
      confession = createNewConfession(applicationRequest);
    } else {
      confession = addNewEntryToExistingConfession(applicationRequest, confession);
    }
    if (!ccer) {
      ccer = createNewCCer({ ...userRequest, role: 'confessor' });
    } else {
      ccer = addNewEntryToExistingCCer(userRequest, ccer);
    }
    ccer = addConfessionToCCer(ccer, confession);
  }

  function handleCompiledApplicationRequest({ userRequest, applicationRequest }) {
    let ccer = getCCerByEmail(userRequest);
    let application = getApplicationByEmail(applicationRequest);
    const { fillCheck } = userRequest;
    if (!application) {
      application = createNewApplication(applicationRequest);
    } else {
      application = addNewEntryToExistingApplication(applicationRequest, application);
    }
    if (!ccer) {
      ccer = createNewCCer({ ...userRequest, role: 'applicant' });
      if (!fillCheck) {
        warn(application.email);
      }
    } else {
      if (checkRole(ccer, "applicant") && !fillCheck) { // Check roles
        warn(applicationObj.email);
      } else {
        ccer = addNewEntryToExistingCCer(userRequest, ccer);
      }
    }
    ccer = addApplicationToCCer(ccer, application)
    application = addCCerToApplication(application, ccer)
    console.log(`Compiled application request handled successfully!`)
  }

  function checkRole(ccer, role) {
    const roleCheck = ccer.checkArrayParameterFor("rolesArr", function (rolesEntry) { return rolesEntry.role == role });
    return roleCheck
  }

  function getAllApplications({ divisionId, eventId }) {
    checkFragmentModel(divisionId, eventId);
    return CCAPPLICATION[divisionId][eventId].find();
  }

  function getAllFullApplications({ divisionId, eventId }) {
    checkFragmentModel(divisionId, eventId);
    const applications = CCAPPLICATION[divisionId][eventId].find();
    applications.forEach(applicaiton => applicaiton.populate("ccerId"))
    return applications
  }

  function getApplications(request) {
    const { criteria, divisionId, eventId } = request;
    checkFragmentModel(divisionId, eventId);
    return CCAPPLICATION[divisionId][eventId].find(criteria);
  }

  function getApplicationByEmail(request) {
    const { email, divisionId, eventId } = request;
    checkFragmentModel(divisionId, eventId);
    return CCAPPLICATION[divisionId][eventId].findByKey(email);
  }

  function getFullApplicationByEmail(request) {
    const { email, divisionId, eventId } = request;
    checkFragmentModel(divisionId, eventId);
    const entry = CCAPPLICATION[divisionId][eventId].findByKey(email);
    return entry.populate("ccerId")
  }

  function getCCerByEmail(request) {
    const { email } = request;
    return CCER.findByKey(email);
  }

  function getFullCCerByEmail(request) {
    const { email } = request;
    const ccer = CCER.findByKey(email);
    ccer.populate("activities")
    return ccer;
  }

  function createNewConfession(request) {
    const { divisionId, eventId } = request;
    checkFragmentModel(divisionId, eventId);
    return CONFESSION[divisionId][eventId].create(request);
  }

  function createNewApplication(request) {
    const { divisionId, eventId } = request;
    checkFragmentModel(divisionId, eventId);
    return CCAPPLICATION[divisionId][eventId].create(request)
  }

  function createNewCCer(request) {
    return CCER.create(request)
  }

  function createNewCCerAndAddApplication(request, application) {
    return CCER.create(request).update({ applicationId: application._id }, ["activities"])
  }

  function addNewEntryToExistingCCer(request, ccer) {
    return ccer.update(request, ["userInfo", "contactInfo"])
  }

  function addNewEntryToExistingApplication(request, application) {
    return application.update(request, ["contactInfo", "mainQuestions", "otherQuestions"])
  }

  function addNewEntryToExistingConfession(request, confession) {
    return confession.update()
  }

  function addCCerToApplication(application, ccer) {
    if (!application.ccerId) application.update({ ccerId: ccer._id }, ["ccerId"])
    return application
  }

  function addApplicationToCCer(ccer, application) {
    const applicationId = application._id
    console.log(applicationId)
    const { id } = applicationId;
    const idIncludedCheck = ccer.checkArrayParameterFor("activities", function (activityEntry) { return activityEntry.applicationId.id == id });
    if (idIncludedCheck) return ccer
    return ccer.update({ timestamp: application.timestamp, applicationId: application._id }, ["activities"])
  }

  // function addCCerToConfession(confession, ccer) {
  //   return confession.update({ ccerId: ccer._id }, ["ccer"])
  // }

  function addConfessionToCCer(ccer, confession) {
    const confessionId = confession._id
    const { id } = confessionId;
    const idIncludedCheck = ccer.checkArrayParameterFor("potentialConfessArr", function (confessionEntry) { confessionEntry.confessionId.id == id });
    if (idIncludedCheck) return ccer
    return ccer.update({ timestamp: confession.timestamp, confessionId: confession._id }, ["potentialConfessArr"])
  }

  function updateApplicationStatus(request) {
    const { email, divisionId, eventId, status } = request;
    checkFragmentModel(divisionId, eventId);
    return CCAPPLICATION[divisionId][eventId].findByKey(email).update({ status }, ["statusArr"])
  }

  function warn() {

  }

  function checkFragmentModel(divisionId, eventId) {
    if (!CCAPPLICATION[divisionId][eventId]) CCAPPLICATION[divisionId].createFragmentModel(eventId);
  }


  return {
    handleCompiledConfessionRequest,
    handleCompiledApplicationRequest,
    getCCerByEmail,
    getFullCCerByEmail,
    getAllApplications,
    getAllFullApplications,
    getApplications,
    getApplicationByEmail,
    getFullApplicationByEmail,
    updateApplicationStatus
  }

})

