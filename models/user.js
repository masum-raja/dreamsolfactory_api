const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => uuid(), // Generates a UUID-like string
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Allows virtual fields in JSON responses
    toObject: { virtuals: true },
  }
);

// Add a compound index
userSchema.index({ id: 1, phone_number: 1, email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
