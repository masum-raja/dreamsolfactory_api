const options = {
  // abortEarly: false, // Return all errors found
  // allowUnknown: true, // Allow unknown keys that are not specified in the schema
  // stripUnknown: true, // Remove unknown keys from the validated object
};

const requestParamsValidate = (schema) => {
  return (req, res, next) => {
    const { query: querySchema, body: bodySchema } = schema;

    const queryData = req.query;
    const bodyData = req.body;

    const queryResult = querySchema
      ? querySchema.validate(queryData, options)
      : { error: null };
    const bodyResult = bodySchema
      ? bodySchema.validate(bodyData, options)
      : { error: null };

    if (queryResult.error || bodyResult.error) {
      const queryError = queryResult.error
        ? queryResult.error.details.map((i) => i.message).join(",")
        : "";
      const bodyError = bodyResult.error
        ? bodyResult.error.details.map((i) => i.message).join(",")
        : "";
      const message = [queryError, bodyError].filter(Boolean).join(" | ");

      return res.status(422).json({ error: message });
    } else {
      next();
    }
  };
};

module.exports = requestParamsValidate;
