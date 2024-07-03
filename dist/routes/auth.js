import express from "express";
import User from "../models/user/user.js";
import { comparePassword, creatingHashPassword } from "../utils/hash.js";
import { jwtGen, verifyJwt } from "../utils/jwt.js";
import nodemailer from "nodemailer";
import user from "../models/user/user.js";
import tokenVerificationMiddleWare from "../utils/tokenVerificationMiddleWare.js";

const router = express.Router();

router.get("/me", tokenVerificationMiddleWare, async (req, res) => {
  try {
    const userData = await user.findOne({ _id: req.id }, { password: 0 });
    if (userData) {
      return res.send({
        message: "User Details",
        user: userData,
        success: true,
      });
    }
    return res.send({
      message: "User not Found",
      user: null,
      success: false,
    });
  } catch (error) {
    res.send({
      message: "Server Error",
      user: null,
      success: false,
    });
  }
});

router.post("/sign-up", async (req, res) => {
  try {
    const { fullName, password, email } = req.body;

    if (!fullName?.trim() || !password?.trim() || !email?.trim()) {
      return res.send({ message: "please fill all the filed", success: false });
    }

    const isUserAlreadyExists = await User.findOne({
      email,
    });

    if (isUserAlreadyExists) {
      return res.send({
        message: "This Email is already exists",
        success: false,
      });
    }

    const hashPassword = await creatingHashPassword(password);

    const newUser = new User({
      email,
      fullName,
      password: hashPassword,
    });

    const userResponse = await newUser.save();

    const token = jwtGen(userResponse._id);

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GOOGLE_APP_USERNAME,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GOOGLE_APP_USERNAME,
      to: email,
      subject: "Verify your email - Arpan Sharma",
      html: `
      
      <p> click on this link to verify your email  </p>
      <a  href="${process.env.BACKEND_URL}/auth/email-verify/${token}"> click here  </a>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        res.send({
          message: "something went wrong while sending the mail",
          success: false,
        });
      } else {
        res.send({
          message: "user successfully sign up please check your mail to verify",
          success: true,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.send({ message: "server side error", success: false });
  }
});

// verify email route

router.get("/email-verify/:token", async (req, res) => {
  try {
    const token = req?.params?.token;

    if (!token?.trim()) {
      return res.send("<h1>Please provide the token</h1>");
    }

    const VerifiedData = verifyJwt(token);

    if (!VerifiedData) {
      return res.send("<h1>Token is not valid</h1>");
    }

    const verifiedUser = await user.findOneAndUpdate(
      { _id: VerifiedData.data },
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );

    if (verifiedUser) {
      res.redirect(`${process.env.FRONTEND_URL}/signin`);
    }
  } catch (error) {
    return res.send("<h1>Server Error </h1>");
  }
});

// sign-in

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password?.trim() || !email?.trim()) {
      return res.send({ message: "please fill all the filed", success: false });
    }

    const isUserAlreadyExists = await User.findOne({
      email,
    });

    if (!isUserAlreadyExists) {
      return res.send({
        message: "This Email is not  exists",
        success: false,
      });
    }

    if (!isUserAlreadyExists.isVerified) {
      return res.send({
        message: "This Email is not  Verified.",
        success: false,
      });
    }

    if (!(await comparePassword(password, isUserAlreadyExists.password))) {
      return res.send({
        message: "credentials does not match",
        success: false,
      });
    }

    const token = jwtGen(isUserAlreadyExists);

    res.send({
      message: "user successfully sign in",
      success: true,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.send({ message: "server side error", success: false });
  }
});

export default router;
