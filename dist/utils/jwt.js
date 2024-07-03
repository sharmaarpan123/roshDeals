import jwt from "jsonwebtoken";

const jwtGen = (data) => {
  return jwt.sign({ data }, process.env.JWT_SECRET);
};

const verifyJwt = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return false;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log("error while decoding the token", error);
  }
};

export { jwtGen, verifyJwt, decodeToken };
