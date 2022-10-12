; (function (root, factory) {
  root.CCAPPLICATION = factory()
})(this, function () {

  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const createId = function (entry) {
    return entry.divisionId + "-" + new Date(entry.timestamp).valueOf();
  }

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

  const contactInfoSchemaMap = {
    email: {
      type: "string"
    },
    mobile: {
      type: "string",
      defaultValue: ""
    },
    facebook: {
      type: "string",
      defaultValue: ""
    },
    twitter: {
      type: "string",
      defaultValue: ""
    }
  }
  const contactInfoSchema = new Schema(contactInfoSchemaMap)

  const mainQuestionsSchemaMap = {
    pastActivities: {
      type: "string",
      defaultValue: ""
    },
    background: {
      type: "string",
      defaultValue: ""
    }
  }
  const mainQuestionsSchema = new Schema(mainQuestionsSchemaMap)

  const otherQuestionsSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    other: {
      type: "object"
    }
  }

  const otherQuestionsSchema = new Schema(otherQuestionsSchemaMap)

  const applicationCommentsSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    comment: {
      type: "string",
      defaultValue: ""
    }
  }

  const applicationCommentsSchema = new Schema(applicationCommentsSchemaMap)

  const gatheringApplicationSchemaMap = {
    timestamp: {
      defaultValue: timestampCreate()
    },
    ccer: {
      type: "IdObject"
    },
    contactInfo: [contactInfoSchema],
    mainQuestions: [mainQuestionsSchema],
    otherQuestions: [otherQuestionsSchema],
    statusArr: [statusSchema],
    applicationComments: [applicationCommentsSchema],
    currentStage: {
      type: "string",
      defaultValue: "screening"
    },
    nextStage: {
      type: "string",
      defaultValue: ""
    },
    followUp: {
      type: "boolean",
      defaultValue: false
    },
    id: {
      setValue: createId,
      type: "string"
    }
  };

  const gatheringApplicationSchema = new Schema(gatheringApplicationSchemaMap,
    {
      dbSplit: {
        core: ['timestamp', 'ccer', 'contactInfo', 'mainQuestions', 'otherQuestions', 'applicationComments', 'currentStage', 'nextStage', 'followUp', 'key', 'id', '_id', '_v'],
        aux: ['statusArr', 'key', 'id']
      },
      id: 'id',
      key: 'email',
      base: 'key'
    });

  return {
    CCG: new Model(gatheringApplicationSchema, { dbMain: "CCG" })
  }

})
