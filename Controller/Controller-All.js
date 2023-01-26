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
      // if(userRequest.email == "shaalano@hotmail.com" && userRequest.fillCheck == false){
      //   const stop = true
      // }
      let ccer = getCCerByEmail(userRequest);
      let application = getApplicationByEmail(applicationRequest);
      const { fillCheck } = userRequest;
      if (!application) {
        // If no application found, create one
        application = createNewApplication(applicationRequest);
      } else {
        // If an appplication already made, update it
        application = addNewEntryToExistingApplication(applicationRequest, application);
      }
      if (!ccer) {
        // if no user if found, create one as long as he has a filled application, if no filled application then warn and do not create anything
        if (!fillCheck) {
            warn(userRequest.email)
            console.log(applicationRequest.divisionId, applicationRequest.eventId)
          }else {
            ccer = createNewCCer({ ...userRequest, role: 'applicant' });
          }

      } else {
        // if there is a user already, were they applicants? if yes update, if no warn and do not create anything
        const roleCheckIfApplicant = checkRole(ccer, "applicant");
        if (roleCheckIfApplicant == false && fillCheck == false) { // Check roles
          warn(userRequest.email);
          console.log(applicationRequest.divisionId, applicationRequest.eventId)
        } else {
          ccer = addNewEntryToExistingCCer(userRequest, ccer);
        }
      }
      if(ccer){
        // after all of that, if there is a user created or already existed, add the application to it
          ccer = addApplicationToCCer(ccer, application)
          application = addCCerToApplication(application, ccer)
          // console.log(`Compiled application request handled successfully!`)
      }
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
      applications.forEach(applicaiton => applicaiton.populate("ccer"))
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
      return entry.populate("ccer")
    }

    function getCCerByEmail(request) {
      const { email } = request;
      return CCER.findByKey(email);
    }

    function getFullCCerByEmail(request) {
      const { email } = request;
      const ccer = CCER.findByKey(email);
      ccer.populate("applicationsArr")
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
      // if(request.email == "NO_EMAIL_1433586969000"){
      //   const stop = 2
      // }
      return CCER.create(request)
    }

    function createNewCCerAndAddApplication(request, application) {
      return CCER.create(request).update({ applicationId: application._id }, ["applicationsArr"])
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
      if (!application.ccer) application.update({ ccer: ccer._id }, ["ccer"])
      return application
    }

    function addApplicationToCCer(ccer, application) {
      const applicationId = application._id
      const { id } = applicationId;
      const idIncludedCheck = ccer.checkArrayParameterFor("applicationsArr", function (activityEntry) { return activityEntry.applicationId.id == id });
      if (idIncludedCheck) return ccer
      return ccer.update({ timestamp: application.timestamp, applicationId: application._id }, ["applicationsArr"])
    }

    // function addCCerToConfession(confession, ccer) {
    //   return confession.update({ ccer: ccer._id }, ["ccer"])
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

    function warn(email) {
        console.log(`Warning ${email}!`)
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

