const express = require("express");
const router = express.Router();
const {
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const Joi = require("joi");
const { requestParamsValidate } = require("../middlewares");

const getUserSchema = {
  query: Joi.object({
    uuids: Joi.string(),
    names: Joi.string(),
    phoneNumbers: Joi.string(),
    emails: Joi.string(),
  }),
};

const updateContactSchema = {
  query: Joi.object({
    id: Joi.string()
      .guid({ version: ["uuidv4"] })
      .required(),
  }),
  body: Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email(),
  }),
};

const deleteContactSchema = {
  query: Joi.object({
    id: Joi.string()
      .guid({ version: ["uuidv4"] })
      .required(),
  }),
};

router.get("/", requestParamsValidate(getUserSchema), getUser);
router.put("/", requestParamsValidate(updateContactSchema), updateUser);
router.delete("/", requestParamsValidate(deleteContactSchema), deleteUser);

module.exports = router;
