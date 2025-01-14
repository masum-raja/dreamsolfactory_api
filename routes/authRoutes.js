const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
} = require("../controllers/authController");

const Joi = require("joi");
const { requestParamsValidate } = require("../middlewares");

const registerSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email(),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      }),
    phone: Joi.string().min(10).max(12).required(),
  }),
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

router.post("/register", requestParamsValidate(registerSchema), register);
router.post("/login", requestParamsValidate(loginSchema), login);
router.get("/refresh", refreshToken);

module.exports = router;
