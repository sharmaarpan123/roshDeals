import {
    addSchema,
    deleteSchema,
    editSchema,
    statusChangeSchema,
} from './schema';
import catchAsync from '@/utilities/catchAsync';
import { errorResponse, successResponse } from '@/utilities/Responses';
import Poster from '@/database/models/Poster';
import { filterSchema } from '@/utilities/ValidationSchema';
import { Request, Response } from 'express';

const getAllPosterController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const { offset, limit, search } = filterSchema.parse(req.body);

        const AllData = Poster.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        })
            .skip(offset || 0)
            .limit(limit || 20);

        const total = Poster.find({
            ...(search && { name: { $regex: search, $options: 'i' } }),
        }).countDocuments();

        const data = await Promise.all([AllData, total]);

        return res.status(200).json(
            successResponse({
                message: 'All Posters',
                data: data[0],
                total: data[1],
            }),
        );
    },
);

const addPosterController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addSchema.parse(req.body);

        const { name, title, image } = body;

        const newPoster = await Poster.create({
            name,
            title,
            image,
        });

        const PosterRes = await newPoster.save();

        return res.status(200).json(
            successResponse({
                message: 'Poster Added successfully',
                data: PosterRes,
            }),
        );
    },
);

const editPosterController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editSchema.parse(req.body);

        const { name, title, posterId, image } = body;

        const updatedPoster = await Poster.findByIdAndUpdate(
            { _id: posterId },
            { name, title, image },
            { new: true },
        );

        if (updatedPoster) {
            return res.status(200).json(
                successResponse({
                    message: 'Updated successfully',
                    data: updatedPoster,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    message: 'Not found any data with this Poster id',
                }),
            );
        }
    },
);

const deletePosterController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = deleteSchema.parse(req.body);

        const { posterId } = body;

        const deletedData = await Poster.findByIdAndUpdate(
            { _id: posterId },
            {
                isDeleted: true,
            },
            { new: true },
        );

        if (deletedData) {
            return res.status(200).json(
                successResponse({
                    message: 'Deleted successfully',
                    data: deletedData,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    statusCode: 404,
                    message: 'Not found any data with this Poster id',
                }),
            );
        }
    },
);

const statusChangeController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = statusChangeSchema.parse(req.body);

        const { posterId, status } = body;

        const data = await Poster.findByIdAndUpdate(
            { _id: posterId },
            {
                isActive: status,
            },
            { new: true },
        );

        if (data) {
            return res.status(200).json(
                successResponse({
                    message: 'Status Updated successfully',
                    data: data,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    statusCode: 404,
                    message: 'Not found any data with this Poster id',
                }),
            );
        }
    },
);

export = {
    addPosterController,
    editPosterController,
    deletePosterController,
    statusChangeController,
    getAllPosterController,
};
