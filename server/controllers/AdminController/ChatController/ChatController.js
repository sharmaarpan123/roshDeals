import Mongoose from 'mongoose';
import SupportChatMessage from '../../../database/models/SupportChatMessage.js';
import catchAsync from '../../../utilities/catchAsync.js';
import { successResponse } from '../../../utilities/Responses.js';
import { getAllAdminsFromCache } from '../../../utilities/utilitis.js';
import { getChatWithFilters } from './Schema.js';

class chat {
    getChatList = catchAsync(async (req, res) => {
        const { limit, offset, reciever, sender } = getChatWithFilters.parse(
            req.body,
        );

        let adminIds = [];

        const adminData = await getAllAdminsFromCache();

        adminIds = adminData.map(
            (item) => new Mongoose.Types.ObjectId(item?._id),
        );

        const matchObj = {
            $or: [
                {
                    sender: { $in: [...adminIds] },
                },
                {
                    reciever: { $in: [...adminIds] },
                },
            ],
        };

        const dataApi = SupportChatMessage.aggregate([
            {
                $sort: { createdAt: 1 },
            },
            { $match: matchObj },
            {
                $group: {
                    _id: '$sender',
                    lastMessageDetails: {
                        $last: '$$ROOT',
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'lastMessageDetails.reciever',
                    as: 'recieverDetails',
                },
            },

            {
                $lookup: {
                    from: 'users',
                    foreignField: '_id',
                    localField: 'lastMessageDetails.sender',
                    as: 'senderDetails',
                },
            },
            {
                $addFields: {
                    userDetails: {
                        $cond: {
                            if: { $gt: [{ $size: '$senderDetails' }, 0] }, // Check if senderDetails exists
                            then: '$senderDetails',
                            else: '$recieverDetails',
                        },
                    },
                },
            },
            {
                $project: {
                    lastMessageDetails: {
                        msg: 1,
                    },
                    userDetails: {
                        _id: 1,
                        name: 1,
                        email: 1,
                    },
                },
            },
            {
                $unwind: {
                    path: '$userDetails',
                },
            },
            {
                $skip: offset || 0,
            },
            {
                $limit: limit || 10,
            },
        ]);

        const totalCountApi = SupportChatMessage.aggregate([
            { $match: matchObj },
            {
                $group: {
                    _id: '$sender',
                    lastMessageDetails: {
                        $last: '$$ROOT',
                    },
                },
            },
            {
                $count: 'totalCount',
            },
        ]);

        const data = await Promise.all([dataApi, totalCountApi]);

        return res.status(200).json(
            successResponse({
                message: 'message list',
                data: data[0],
                total: (data[1] && data[1][0] && data[1][0]?.totalCount) || 0,
            }),
        );
    });
    getChatHistory = catchAsync(async (req, res) => {
        const { limit, offset, reciever, sender } = getChatWithFilters.parse(
            req.body,
        );

        let adminIds = [];

        const adminData = await getAllAdminsFromCache();

        adminIds = adminData.map(
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

const chatController = new chat();

export default chatController;
