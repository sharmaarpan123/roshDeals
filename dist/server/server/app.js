import express from "express";
import path from "path";
import logger from "morgan";
import userRouter from "../../routes/user.js";
import AuthRouter from "../../routes/auth.js";
import mongoInit from "../../models/index.js";
import tokenVerificationMiddleWare from "../../utils/tokenVerificationMiddleWare.js";
import { config } from "dotenv";
import cors from "cors";
import user from "../../models/user/user.js";

const init = async () => {
  config();
  var app = express();

  app.use(cors());
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join("public")));
  await mongoInit();

  app.use("/auth", AuthRouter);
  app.get("/", (req, res) => res.send("server is running"));
  app.get("/healthy", (req, res) => res.send("server is healthy"));
  app.use("/user", tokenVerificationMiddleWare, userRouter);

  app.listen(8000, () => {
    console.log("server start on " + 8000 + " port");
  });
};

init();
