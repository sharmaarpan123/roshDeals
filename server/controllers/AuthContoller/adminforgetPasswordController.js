import User from '../../database/models/User.js';
import catchAsync from '../../utilities/catchAsync.js';
import { randomOtp } from '../../utilities/utilitis.js';
import { z } from 'zod';
import forgetPasswordTemplate from '../../services/email/emailsTemplates/forgetpasswordTemplate.js';
import NodeMailerTransPorter from '../../services/email/NodeMailerTransPorter.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import Admin from '../../database/models/Admin.js';
const schema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
});
const AdminForgetPasswordController = catchAsync(async (req, res) => {
    const body = schema.parse(req.body);
    let { email } = body;

    const isUserRegistered = await Admin.findOne({
        email,
    });
    if (!isUserRegistered) {
        return res.status(400).json(
            errorResponse({
                message: 'Provided email address is not associated with any account',
            }),
        );
    }
    const otp = randomOtp();
    await Admin.findOneAndUpdate({ email }, { otp });
    const transporter = NodeMailerTransPorter();
    const mailOptions = {
        from: process.env.GOOGLE_APP_USER,
        to: email,
        subject: 'ROSH DEALS - Reset Your Password ',
        html: forgetPasswordTemplate(otp),
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(400).json(
                errorResponse({
                    message: `something went wrong while sending the mail please contact us at ==>  ${process.env.HELP_CONTACT_NUMBER}`,
                    errorInfo: error,
                }),
            );
        } else {
            return res.status(200).json(
                successResponse({
                    message: 'A one-time password has been sent to your email',
                }),
            );
        }
    });
});
export default AdminForgetPasswordController;
//# sourceMappingURL=forgetPasswordController.js.map
