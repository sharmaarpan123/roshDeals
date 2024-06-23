"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const NodeMailerTransPorter = () => {
    return nodemailer_1.default.createTransport({
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
exports.default = NodeMailerTransPorter;
//# sourceMappingURL=NodeMailerTransPorter.js.map