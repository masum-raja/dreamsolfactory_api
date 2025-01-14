const express = require("express");
const app = express();
const PORT = process.env.PORT || 4500;
const { authRoutes, userRoutes } = require("./routes");
const cookieParser = require("cookie-parser");
const { authVerify } = require("./middlewares");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/auth", authRoutes);

app.use(authVerify);
app.use("/user", userRoutes);

app.all("*", (req, res) => {
  return res.status(404).json({ message: "Not Found" });
});

// initApp();
mongoose.connection.once("open", () => {
  //listening requests only after connected to mongoDB
  app.listen(PORT, (req, res) => {
    console.log(`server is running on port : ${PORT}`);
  });
});
