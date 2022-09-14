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
  const mainQuestionsSchema = new Schema(mainQuestionsSchemaMap)

  const otherQuestionsSchemaMap = {
    timestamp: {
      type: "object",
      defaultValue: timestampCreate()
    },
    other: {
      type: "object"
    }
  }

  const otherQuestionsSchema = new Schema(otherQuestionsSchemaMap)

  const gatheringApplicationSchemaMap = {
    userId: {
      type: "IdObject"
    },
    contactInfo: [contactInfoSchema],
    mainQuestions: [mainQuestionsSchema],
    otherQuestions: [otherQuestionsSchema],
    statusArr: [statusSchema],
    id: {
      setValue: createId,
      type: "number"
    }
  };

  const gatheringApplicationSchema = new Schema(gatheringApplicationSchemaMap,
    {
      dbSplit: {
        core: ['userId', 'contactInfo', 'mainQuestions', 'otherQuestions', 'key', 'id', '_id'],
        aux: ['statusArr', 'key', 'id', '_id']
      },
      id: 'id',
      key: 'email',
      base: 'key'
    });

  return {
    CCG: new Model(gatheringApplicationSchema, { dbMain: "CCG" })
  }

})
