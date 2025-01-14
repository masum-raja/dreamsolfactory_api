const jwt = require("jsonwebtoken");
const Users = require("../models/user");

const authVerify = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  //getting token from request header
  const accessToken = req.headers["authorization"].split(" ")[1];

  //verifying access token
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.sendStatus(403); //Forbidden

      let foundUser = await Users.findOne({ id: decoded.id });

      if (!foundUser) {
        return res.sendStatus(403);
      }

      req.username = decoded.username;
      req.id = decoded.id;
      next();
    }
  );
};

module.exports = authVerify;
