import mongoose from 'mongoose';

const PaymentDetail = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: async function (userId: mongoose.Types.ObjectId) {
                    const platForm =
                        await mongoose.models.User.findById(userId).lean();
                    return !!platForm;
                },
                message: (props) => `${props.value} is not a valid User ID!`,
            },
        },
        bankName: { type: String },
        accountHolderName: { type: String },
        accountNumber: { type: String },
        IFSC: { type: String },
        upiId: { type: String, required: true },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('PaymentDetail', PaymentDetail);
