import mockDb from "../config/mockDb.js";

export function wrapModel(modelName, realModel) {
  return new Proxy(realModel, {
    // Intercept construction: e.g., const newDoc = new Model(data);
    construct(target, args) {
      if (global.useMockDb) {
        const data = args[0] || {};
        return {
          ...data,
          save: async function() {
            return mockDb.save(modelName, this);
          }
        };
      }
      return new target(...args);
    },

    // Intercept static methods: e.g., Model.find(), Model.findById()
    get(target, prop) {
      if (global.useMockDb) {
        if (prop === "find") {
          return (query) => mockDb.find(modelName, query);
        }
        if (prop === "findOne") {
          return (query) => mockDb.findOne(modelName, query);
        }
        if (prop === "findById") {
          return (id) => mockDb.findById(modelName, id);
        }
        if (prop === "findByIdAndUpdate") {
          return (id, update) => mockDb.findByIdAndUpdate(modelName, id, update);
        }
      }
      return target[prop];
    }
  });
}
