import Mongoose from 'mongoose';
import SupportChatMessage from '../../database/models/SupportChatMessage.js';
import User from '../../database/models/User.js';
import catchAsync from '../../utilities/catchAsync.js';
import { verifyJwt } from '../../utilities/jwt.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
import { getAllAdminsFromCache } from '../../utilities/utilitis.js';
import userControllerSchema from './Schema.js';

class controller {
    meQueryController = catchAsync(async (req, res) => {
        const { token } = userControllerSchema.meQuerySchema(req.body);

        const verifiedData = verifyJwt(token);

        if (!verifiedData?.data) {
            return res.status(401).json(
                errorResponse({
                    message: 'In valid token',
                }),
            );
        }

        const user = await User.findById(verifiedData?.data?._id);

        if (!user || !user?.isActive) {
            return res.status(401).json(
                errorResponse({
                    message: !user
                        ? 'User Not exists'
                        : 'User is inActive please contact admin',
                }),
            );
        }

        const allAdminsData = await getAllAdminsFromCache();

        return res.status(200).json(
            successResponse({
                message: 'User Details',
                data: {
                    userData: user,
                    adminId: allAdminsData[0]?._id,
                },
            }),
        );
    });
    supportChatHistoryController = catchAsync(async (req, res) => {
        const { limit, offset, reciever, sender } =
            userControllerSchema.getChatWithFilters.parse(req.body);

        let adminIds = [];

        const adminData = await getAllAdminsFromCache();

        console.log(adminData);

        adminIds = adminData?.map(
            (item) => new Mongoose.Types.ObjectId(item?._id),
        );

        const matchObj = {
            $or: [
                {
                    sender: { $in: [...adminIds] },
                    reciever: new Mongoose.Types.ObjectId(sender),
                },
                {
                    sender: new Mongoose.Types.ObjectId(reciever),
                    reciever: { $in: [...adminIds] },
                },
            ],
        };

        const dataApi = SupportChatMessage.find(matchObj)
            .populate('senderAdminId', 'name , _id , email')
            .populate('recieverUserId', 'name , _id , email')
            .populate('senderUserId', 'name , _id , email')
            .populate('recieverAdminId', 'name , _id , email')
            .sort({ createdAt: -1 })
            .skip(offset || 0)
            .limit(limit || 10);

        const totalCountApi =
            SupportChatMessage.find(matchObj).countDocuments();

        const data = await Promise.all([dataApi, totalCountApi]);

        return res.status(200).json(
            successResponse({
                message: 'message list',
                data: data[0],
                total: data[1],
            }),
        );
    });
}

const UserController = new controller();

export default UserController;
