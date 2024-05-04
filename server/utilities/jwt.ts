import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET_KEY;

const jwtGen = (data) => {
    return jwt.sign({ data }, secret);
};

const verifyJwt = (token: string) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        console.log('error while verifying the token', error);
    }
};

export { jwtGen, verifyJwt };
