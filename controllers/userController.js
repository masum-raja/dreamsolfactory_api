const Users = require("../models/user");

const getUser = async (req, res) => {
  try {
    const { uuids, names, phoneNumbers, emails } = req.query;
    let where = {};

    if (uuids) {
      where["id"] = { ["$or"]: uuids.split(",") };
    }

    if (names) {
      where["name"] = { ["$or"]: names.split(",") };
    }

    if (phoneNumbers) {
      where["phone_number"] = { ["$or"]: phoneNumbers.split(",") };
    }

    if (emails) {
      where["email"] = { ["$or"]: emails.split(",") };
    }

    const users = await Users.find(where, { password: 0 });
    return res.send(users);
  } catch (Exception) {
    console.error(Exception);
    let customeError = null;
    if (Exception.name === "SequelizeUniqueConstraintError") {
      customeError = Exception.errors[0].message;
    }
    return res.status(Exception.code || 500).json({
      message: customeError || Exception.message || Exception.toString(),
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.query;
    const { username, email } = req.body;

    const User = await Users.findOneAndUpdate({ id });

    if (!User) {
      throw { code: 404, message: "User not found" };
    }

    User.name = username ?? User.name;
    User.email = email ?? User.email;
    await User.save();

    return res.send({ message: `User updated successfully`, user: User });
  } catch (Exception) {
    console.error(Exception);
    let customeError = null;
    if (Exception.name === "SequelizeUniqueConstraintError") {
      customeError = Exception.errors[0].message;
    }
    return res.status(Exception.code || 500).json({
      message: customeError || Exception.message || Exception.toString(),
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.query;

    const User = await Users.findOne({ id });

    if (!User) {
      throw { code: 404, message: "User not found" };
    }

    if (User.id === req.id) {
      throw {
        code: 403,
        message: "You are not allowed to delete your own account.",
      };
    }

    await Users.findOneAndDelete({ id });

    return res.send({ message: "User deleted successfully" });
  } catch (Exception) {
    console.error(Exception);
    let customeError = null;
    if (Exception.name === "SequelizeUniqueConstraintError") {
      customeError = Exception.errors[0].message;
    }
    return res.status(Exception.code || 500).json({
      message: customeError || Exception.message || Exception.toString(),
    });
  }
};

module.exports = { getUser, updateUser, deleteUser };
