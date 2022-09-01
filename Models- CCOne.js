; (function (root, factory) {
  root.CCER = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const DBMAIN = "CCONE";

  const statusSchemaMap = {
    timestamp: {
      type: "object",
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
      type: "object",
      defaultValue: timestampCreate()
    },
    status: {
      type: "string",
      defaultValue: 'Undecided',
      enums: ['applicant', 'confessor']
    }
  }

  const roleSchema = new Schema(rolesSchemaMap)

  const confessSNSchemaSchemaMap = {
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    sn: {
      type: "IdObject"
    }
  }

  const confessSNSchema = new Schema(confessSNSchemaSchemaMap)

  const activitiesSchemaMap = {
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    applicationId: {
      type: "IdObject"
    }
  }

  const activitiesSchema = new Schema(activitiesSchemaMap)

  const emailsSchemaMap = {
    timestamp: {
      type: "object",
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
      type: "object",
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
      setValue: function () { },
      type: "number"
    }
  };

  const userSchema = new Schema(userSchemaMap,
    {
      dbSplit: {
        core: ["name", "age", "email", 'key', 'id'],
        aux: ['statusArr', 'key', 'id']
      },
      id: "id",
      key: "email",
      base: "key"
    });

  const model = new Model(userSchema, {
    dbMain: DBMAIN,
  });

  return model

})