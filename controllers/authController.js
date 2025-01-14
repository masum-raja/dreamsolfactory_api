const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../models/user");

const register = async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    let where = {},
      foundUser = null;

    if (email || phone) {
      where = {
        ["$or"]: [],
      };

      if (email) {
        where["$or"].push({ email });
      }

      if (phone) {
        where["$or"].push({ phone_number: phone });
      }
    }
    foundUser = await Users.findOne(where);

    if (foundUser) {
      throw { code: 409, message: "User Already Exists" };
    }
    const hashPwd = await bcrypt.hash(password, 10);
    const User = await Users.create({
      name: username,
      password: hashPwd,
      email,
      phone_number: phone,
    });

    return res.send({ message: `User registered ${User.name} ${User.id}` });
  } catch (Exception) {
    let customeError = null;
    if (Exception.name === "SequelizeUniqueConstraintError") {
      customeError = Exception.errors[0].message;
    }
    return res.status(Exception.code || 500).json({
      message: customeError || Exception.message || Exception.toString(),
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let where = {
      email: email,
    };
    let foundUser = await Users.findOne(where);
    if (!foundUser) {
      throw { code: 409, message: "No user found" };
    }

    const isPassEqual = await bcrypt.compare(password, foundUser.password);
    if (!isPassEqual) {
      throw { code: 401, message: "Invalid Crendentials" };
    }

    const accessToken = jwt.sign(
      { username: foundUser.name, id: foundUser.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.name, id: foundUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    foundUser.set("refreshToken", refreshToken);
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      // domain: process.env.REACT_PROJECT_DOMAIN, sameSite: 'None', secure: true, //for https and different domains
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.send({ message: "Logged IN!!!", accessToken });
  } catch (Exception) {
    console.log(Exception);
    let customeError = null;
    if (Exception.name === "SequelizeUniqueConstraintError") {
      customeError = Exception.errors[0].message;
    }
    return res.status(Exception.code || 500).json({
      message: customeError || Exception.message || Exception.toString(),
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    console.log(cookies);
    if (!cookies?.jwt) return res.sendStatus(403);

    let refreshToken = cookies?.jwt;

    let foundUser = await Users.findOne({ refreshToken });

    if (!foundUser) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        //throwing err if token username and DB token username not matched
        if (err || decoded.username != foundUser.name)
          return res.sendStatus(403);

        const accessToken = jwt.sign(
          {
            username: decoded.username,
            id: decoded.id,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );

        return res
          .status(201)
          .json({ message: "Access token created", accessToken });
      }
    );
  } catch (Exception) {
    console.log(Exception);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { register, login, refreshToken };
