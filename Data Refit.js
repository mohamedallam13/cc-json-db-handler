; (function (root, factory) {
  root.DATA_REFIT = factory()
})(this, function () {

  const { Toolkit } = CCLIBRARIES;
  const { toCamelCase, toTitleCase, dateValueString, similarity, refitTimestamp, refitProperMobileNumber } = Toolkit

  const EMAIL_SIMILARITY_LOWER_LIMIT = 0.85;
  const DEFAULT_EMAIL = "n@n.com";

  function refitToCompoundRequest(sourceObj, entry) {
    const processedHeaders = [];
    const userRequest = getUserRequest(sourceObj, processedHeaders, entry);
    const applicationRequest = getApplicationRequest(sourceObj, processedHeaders, entry);
    return {
      userRequest,
      applicationRequest
    }
  }

  function getUserRequest(sourceObj, processedHeaders, entry) {
    const userRequestObj = {};
    getBLabeledData(userRequestObj, sourceObj, processedHeaders, entry);
    refitUserData(userRequestObj);
    augmentInfo(sourceObj, userRequestObj);
    return userRequestObj;
  }

  function getBLabeledData(userRequestObj, sourceObj, processedHeaders, entry) {
    const { map } = sourceObj;
    Object.entries(map).forEach(([mainHeader, equivalentHeader]) => {
      if (!mainHeader.includes("_b") && !mainHeader.includes("_a")) return
      if (!entry[equivalentHeader]) return
      const cleanMainHeader = toCamelCase(mainHeader.replace(/_b/g, "").replace(/_a/g, ""));
      userRequestObj[cleanMainHeader] = entry[equivalentHeader];
      processedHeaders.push(equivalentHeader);
    })
  }

  function getApplicationRequest(sourceObj, processedHeaders, entry) {
    const applicationRequest = {};
    getNonLabeledData(applicationRequest, sourceObj, processedHeaders, entry);
    getNonEquivalentData(applicationRequest, processedHeaders, entry);
    refitApplicationData(applicationRequest);
    augmentInfo(sourceObj, applicationRequest);
    return applicationRequest;
  }

  function getNonLabeledData(applicationRequest, sourceObj, processedHeaders, entry) {
    const { map } = sourceObj;
    applicationRequest.other = {};
    Object.entries(map).forEach(([mainHeader, equivalentHeader]) => {
      if (mainHeader.includes("_b")) return
      if (!entry[equivalentHeader]) return
      let cleanHeader
      if (mainHeader.includes("_o")) {
        cleanHeader = mainHeader.replace(/_o/g, "")
        applicationRequest.other[cleanHeader] = entry[equivalentHeader];
      } else {
        cleanMainHeader = toCamelCase(mainHeader.replace(/_a/g, ""));
        applicationRequest[cleanMainHeader] = entry[equivalentHeader];
        processedHeaders.push(equivalentHeader);
      }
    })
  }

  function getNonEquivalentData(applicationRequest, processedHeaders, entry) {
    Object.entries(entry).forEach(([equivalentHeader, value]) => {
      if (processedHeaders.includes(equivalentHeader)) return
      applicationRequest.other[equivalentHeader] = value;
    })
  }

  function augmentInfo(sourceObj, request) {
    request.divisionId = sourceObj.primaryClassifierCode;
    request.eventId = sourceObj.secondaryClassifierCode;
  }

  function refitUserData(entry) {
    refitTimestamp_(entry);
    refitEmail(entry);
    refitName(entry);
    refitDateOfBirth(entry);
    refitAddress(entry);
    refitMajor(entry);
    refitMobile(entry);
  }

  function refitApplicationData(entry) {
    refitTimestamp_(entry);
    refitEmail(entry);
  }

  function refitTimestamp_(entry) {
    entry.timestamp = refitTimestamp(entry.timestamp)
  }

  /////////////////////////////Refiting Name;

  function refitName(entry) {
    entry.firstName = toTitleCase(entry.firstName);
    entry.lastName = toTitleCase(entry.lastName);
  }

  function refitDateOfBirth(entry) {
    if (!entry.dob) {
      if (!entry.age) {
        entry.age = entry.ageOther
        delete entry.ageOther
      }
      if (entry.age) {
        entry.age = entry.age == '' ? '' : parseInt(entry.age.toString().match(/\d+/)[0]);
        entry.dob = new Date(new Date(entry.timestamp).setYear(entry.timestamp.getYear() - entry.age));
        entry.dobType = "V";
      }
    } else {
      if (entry.age) {
        entry.age = parseInt(entry.age.toString().match(/\d+/)[0]);
        var now = new Date();
        if (now.getYear() - entry.timestamp.getYear() < 10) {
          entry.dob = new Date(new Date(entry.dob).setYear(now.getYear() - entry.age))
          entry.dobType = "A";
        }
      }
    }
  }

  /////////////////////////////Refiting Address;

  function refitAddress(entry) {
    if (entry.cityGov) {
      entry.cityGov = entry.cityGov.toUpperCase();
    }
    if (!entry.district || entry.district == '') {
      entry.district = entry.districtOther;
    }
    if (!entry.addressDistrict || entry.addressDistrict == '') {
      var pre = entry.address ? entry.address : "";
      entry.addressDistrict = pre + ", " + entry.district
    }
    delete entry.district;
    delete entry.address;
    delete entry.districtOther;
  }

  /////////////////////////////Refiting Major;

  function refitMajor(entry) {
    if (!entry.majorIfUniversity) {
      if (!entry.otherMajor) {
        if (entry.education == 'Highschool') {
          entry.major = 'Highschool';
        } else {
          entry.major = 'Unspecified'
        }
      }
    } else {
      entry.major = entry.majorIfUniversity;
      delete entry.otherMajor;
      delete entry.majorIfUniversity;
    }
  }

  /////////////////////////////Refiting Emails;

  function refitEmail(entry) {
    removeDefaultEmail(entry);
    var emailA = entry.email;
    var emailB = entry["-email"];
    if (!emailA && !emailB) {
      getAnonEmail(entry);
    } else if (!emailA || typeof emailA === "undefined" || emailA == "") {
      delete entry["-email"];
      entry.email = emailB.toString().toLowerCase();
    } else {
      entry.email = emailA.toString().toLowerCase();
    }
  }

  function getAnonEmail(entry) {
    entry.email = "NO_EMAIL_" + dateValueString(entry.timestamp); //TODO: Check Tools
  }

  function removeDefaultEmail(entry) {
    let { email } = entry;
    if (!email) {
      return;
    }
    var similarityValue = similarity(DEFAULT_EMAIL, email);
    if (similarityValue <= 1 && similarityValue > EMAIL_SIMILARITY_LOWER_LIMIT) {
      delete entry.email;
    }
  }

  function refitMobile(entry) {
    entry.mobile = refitProperMobileNumber(entry.mobile)
  }

  return {
    refitToCompoundRequest
  }

})

function testCompile() {
  console.log("Compiled!")
}