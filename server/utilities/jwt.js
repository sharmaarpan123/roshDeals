import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();
const secret = process.env.JWT_SECRET_KEY;
const jwtGen = (data) => {
    return jwt.sign({ data }, secret);
};
const verifyJwt = (token) => {
    try {
        return jwt.verify(token, secret);
    }
    catch (error) {
        console.log('error while verifying the token', error);
    }
};
export { jwtGen, verifyJwt };
//# sourceMappingURL=jwt.js.map