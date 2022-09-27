; (function (root, factory) {
  root.CCAPPLICATION = factory()
})(this, function () {


  const { Schema, Model } = ORM;

  const { Toolkit } = CCLIBRARIES;
  const { timestampCreate } = Toolkit;

  const createId = function(entry){
    return entry.divisionId + "-" +new Date(entry.timestamp).valueOf();
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
      type: "string"
    },
    facebook: {
      type: "string"
    }
  }
  const contactInfoSchema = new Schema(contactInfoSchemaMap)

  const mainQuestionsSchemaMap = {
    pastActivities: {
      type: "string"
    },
    background: {
      type: "string"
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

  const gatheringApplicationSchemaMap = {
     timestamp: {
      defaultValue: timestampCreate()
    },
    ccerId: {
      type: "IdObject"
    },
    contactInfo: [contactInfoSchema],
    mainQuestions: [mainQuestionsSchema],
    otherQuestions: [otherQuestionsSchema],
    statusArr: [statusSchema],
    id: {
      setValue: createId,
      type: "string"
    }
  };

  const gatheringApplicationSchema = new Schema(gatheringApplicationSchemaMap,
    {
      dbSplit: {
        core: ['userId', 'contactInfo', 'mainQuestions', 'otherQuestions', 'key', 'id', '_id'],
        aux: ['statusArr']
      },
      id: 'id',
      key: 'email',
      base: 'key'
    });

  return {
    CCG: new Model(gatheringApplicationSchema, { dbMain: "CCG" })
  }

})
