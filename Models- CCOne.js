; (function (root, factory) {
  root.CCER = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const statusSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    status: {
      type: "string",
      defaultValue: 'pending',
      enums: ['pending', 'accepted', 'rejected', 'deferred']
    }
  }

  const statusSchema = new Schema(statusSchemaMap)

  const rolesSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    status: {
      type: "string",
      defaultValue: 'undecided',
      enums: ['undecided','applicant', 'confessor']
    }
  }

  const roleSchema = new Schema(rolesSchemaMap)

  const confessSNSchemaSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    sn: {
      type: "IdObject"
    }
  }

  const confessSNSchema = new Schema(confessSNSchemaSchemaMap)

  const activitiesSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    applicationId: {
      type: "IdObject"
    }
  }

  const activitiesSchema = new Schema(activitiesSchemaMap)

  const emailsSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    email: {
      type: "string"
    }
  }

  const emailsSchema = new Schema(emailsSchemaMap)

  const mergedAccountsSchemaMap = {
    blankOnCreation: true,
    timestamp: {
      defaultValue: timestampCreate()
    },
    userId: {
      type: "IdObject"
    }
  }

  const mergedAccountsSchema = new Schema(mergedAccountsSchemaMap)

  const userInfoSchemaMap = {
    firstName: {
      defaultValue: "",
      type: "string"
    },
    lastName: {
      defaultValue: "",
      type: "string"
    },
    age: {
      type: "number"
    }
  }
  const userInfoSchema = new Schema(userInfoSchemaMap)

  const userContactInfoSchemaMap = {
    email: {
      type: "string"
    },
    mobile: {
      type: "string"
    },
  }
  const userContactInfoSchema = new Schema(userContactInfoSchemaMap)

  const createId = function(entry){
    return "CCER" + "-" +new Date(entry.timestamp).valueOf();
  }

  const userSchemaMap = {
    userInfoArr: [userInfoSchema],
    userContactInfo: [userContactInfoSchema],
    statusArr: [statusSchema],
    rolesArr: [roleSchema],
    potentialConfessArr: [confessSNSchema],
    activities: [activitiesSchema],
    emailsArr: [emailsSchema],
    mergedAccountsArr: [mergedAccountsSchema],
    id: {
      setValue: createId,
      type: "string"
    }
  };


  const userSchema = new Schema(userSchemaMap,
    {
      dbSplit: {
        core: ['userInfoArr','userContactInfo', 'activities', 'emailsArr', 'mergedAccountsArr', 'key', 'id', '_id','_v'],
        aux: ['statusArr'],
        secret: ['potentialConfessArr']
      },
      id: 'id',
      key: 'email',
      base: 'key'
    });

  const model = new Model(userSchema, { dbMain: "CCONE" });

  return model

})