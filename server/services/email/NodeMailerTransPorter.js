import nodemailer from 'nodemailer';
const NodeMailerTransPorter = () => {
    return nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.GOOGLE_APP_USER,
            pass: process.env.GOOGLE_APP_PASSWORD,
        },
    });
};
export default NodeMailerTransPorter;
//# sourceMappingURL=NodeMailerTransPorter.js.map