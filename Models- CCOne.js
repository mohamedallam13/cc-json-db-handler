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
      type: number
    }
  }

  const confessSNSchema = new Schema(confessSNSchemaSchemaMap)

  const activityHistorySchemaMap = {
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    applicationId: {
      type: "string"
    }
  }

  const activityHistorySchema = new Schema(activityHistorySchemaMap)

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
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    userId: {
      type: "string"
    }
  }

  const mergedAccountsSchema = new Schema(mergedAccountsSchemaMap)

  const userInfoSchemaMap = {
    name: {
      defaultValue: "",
      type: "string"
    },
    age: {
      type: "number"
    },
    email: {
      type: "string"
    },
  }
  const userInfoSchema = new Schema(userInfoSchemaMap)

  const userSchemaMap = {
    userInfoArr: [userInfoSchema],
    statusArr: [statusSchema],
    rolesArr: [roleSchema],
    potentialConfessArr: [confessSNSchema],
    activityHistoryArr: [activityHistorySchema],
    emailsArr: [emailsSchema],
    mergedAccountsArr: [mergedAccountsSchema],
    key: {
      type: "string"
    },
    id: {
      value: function () { },
      type: "number"
    }
  };

  const userSchema = new Schema(userSchemaMap,
    {
      dbMain: DBMAIN,
      dbSplit: {
        core: ["name", "age", "email", 'key', 'id'],
        aux: ['statusArr', 'key', 'id']
      },
      id: "id",
      key: "email",
      base: "key"
    });

  const model = new Model(userSchema, {});

  return model

})