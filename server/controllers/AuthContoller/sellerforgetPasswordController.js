import { z } from 'zod';
import Seller from '../../database/models/Seller.js';
import forgetPasswordTemplate from '../../services/email/emailsTemplates/forgetpasswordTemplate.js';
import NodeMailerTransPorter from '../../services/email/NodeMailerTransPorter.js';
import catchAsync from '../../utilities/catchAsync.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import { randomOtp } from '../../utilities/utilitis.js';
const schema = z.object({
    email: z
        .string({
            required_error: 'Email is required',
        })
        .trim()
        .email('Please send a valid email')
        .toLowerCase(),
});
const sellerForgetPasswordController = catchAsync(async (req, res) => {
    const body = schema.parse(req.body);
    let { email } = body;

    const isUserRegistered = await Seller.findOne({
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
    await Seller.findOneAndUpdate({ email }, { otp });
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
export default sellerForgetPasswordController;
//# sourceMappingURL=sellerForgetPasswordController.js.map
