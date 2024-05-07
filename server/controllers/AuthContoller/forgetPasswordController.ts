import User from '@/models/User';
import catchAsync from '@/utilities/catchAsync';
import { randomOtp } from '@/utilities/utilitis';
import { Response, Request } from 'express';
import { z } from 'zod';
import forgetPasswordTemplate from '@/services/email/emailsTemplates/forgetpasswordTemplate';
import NodeMailerTransPorter from '@/services/email/NodeMailerTransPorter';

const schema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
});

const forgetPasswordController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        schema.parse(req.body);

        const { email } = req.body;

        const isUserRegistered = await User.findOne({
            email,
        });

        if (!isUserRegistered) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'This email is not registered',
            });
        }

        const otp: number = randomOtp();

        await User.findOneAndUpdate({ email }, { otp });

        const transporter = NodeMailerTransPorter();

        const mailOptions = {
            from: process.env.GOOGLE_APP_USER,
            to: email,
            subject: 'ROSH DEALS - Reset Your Password ',
            html: forgetPasswordTemplate(otp),
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: `something went wrong while sending the mail please contact us at ==>  ${process.env.HELP_CONTACT_NUMBER}`,
                    errorInfo: error,
                });
            } else {
                return res.status(200).json({
                    success: true,
                    statusCode: 200,
                    message: 'Your One Time Password is sended to the mail',
                });
            }
        });
    },
);

export default forgetPasswordController;
