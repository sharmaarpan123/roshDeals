import { decodeToken, verifyJwt } from "./jwt.js";

const tokenVerificationMiddleWare = (req, res, next) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    console.log(req.headers)

    const decoded = decodeToken(token);

    if (decoded?.data?._id) {
      req.id = decoded?.data._id;
      return next();
    }

    return res.send({
      success: false,
      message: "please login again token Expire",
    });
  } catch (error) {
    res.send({ success: false, message: "Error while verifying your token" });
  }
};

export default tokenVerificationMiddleWare;
