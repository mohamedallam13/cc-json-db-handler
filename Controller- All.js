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
      ccer = createNewCCer(userRequest);
    } else {
      ccer = addNewEntryToExistingCCer(userRequest, ccer);
    }
    ccer = addConfessionToCCer(ccer, confession);
    confession = addCCerToConfession(confession, ccer);
  }

  function handleCompiledApplicationRequest({ userRequest, applicationRequest }) {
    let ccer = getCCer(userRequest);
    let application = getApplication(applicationRequest);
    const { fillCheck } = userRequest;
    if (!application) {
      application = createNewApplication(applicationRequest);
    } else {
      application = addNewEntryToExistingApplication(applicationRequest, application);
    }
    if (!ccer) {
      ccer = createNewCCer(userRequest, application);
      if (!fillCheck) {
        warn(application.email);
      }
    } else {
      if (ccer.roles.includes("applicant") && !fillCheck) {
        warn(applicationObj.email);
      } else {
        ccer = addNewEntryToExistingCCer(userRequest, ccer);
      }
    }
    ccer = addApplicationToCCer(ccer, application)
    application = addCCerToApplication(application, ccer)
  }

  function getAllApplications({ divisionId, eventId }) {
    // return CCAPPLICATION[divisionId][eventId].find();
  }

  function getApplication(request) {
    const { email, eventId } = request;
    // return CCAPPLICATION[divisionId][eventId].findByKey(email);
  }

  function getCCer(request) {
    const { email } = request;
    // return CCER.findByKey(email);
  }

  function createNewConfession(request) {
    const { divisionId, eventId } = request;
    // return CONFESSION[divisionId][eventId].create(request);
  }

  function createNewApplication(request) {
    const { divisionId, eventId } = request;
    // return CCAPPLICATION[divisionId][eventId].create(request)
  }

  function createNewCCer(request) {
    // return CCER.create(request)
  }

  function createNewCCerAndAddApplication(request, application) {
    // return CCER.create(request).update({applicationId: application._id}, ["activities"])
  }

  function addNewEntryToExistingCCer(request, ccer) {
    return ccer.update(userRequest, ["userInfo", "contactInfo"])
  }

  function addNewEntryToExistingApplication(request, application) {
    return application.update()
  }

  function addNewEntryToExistingConfession(request, confession) {
    return confession.update()
  }

  function addCCerToApplication(application, ccer) {
    return application.update({ ccerId: ccer._id }, ["ccer"])
  }

  function addApplicationToCCer(ccer, application) {
    return ccer.update({ applicationId: application._id }, ["activities"])
  }

  function addCCerToConfession(confession, ccer) {
    return confession.update({ ccerId: ccer._id }, ["ccer"])
  }

  function addConfessionToCCer(ccer, confession) {
    return ccer.update({ confessionId: confession._id }, ["potentialConfessArr"])
  }

  function warn() {

  }


  return {
    handleCompiledConfessionRequest,
    handleCompiledApplicationRequest,
    getAllApplications
  }

})

