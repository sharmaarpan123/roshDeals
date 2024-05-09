import PlatForm from '@/models/PlatForm';
import { Request, Response } from 'express';
import { addPlatFormSchema, editPlatFormSchema } from './schema';
import catchAsync from '@/utilities/catchAsync';
import { errorResponse, successResponse } from '@/utilities/Responses';

const getAllPlatFormController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const AllPlatForms = await PlatForm.find({ isDeleted: false });
        return res.status(200).json(
            successResponse({
                message: 'All PlatForms',
                data: AllPlatForms,
            }),
        );
    },
);

const addPlatFormController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addPlatFormSchema.parse(req.body);

        const { name, image } = body;

        const alreadyExists = await PlatForm.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();

        if (alreadyExists) {
            return res.status(400).json(
                errorResponse({
                    message: 'This platform already exists',
                }),
            );
        }

        const newPlatForm = await PlatForm.create({
            name,
            image,
        });

        const platForm = await newPlatForm.save();

        return res.status(200).json(
            successResponse({
                message: 'Plat Form Added successfully',
                data: platForm,
            }),
        );
    },
);

const editPlatFormController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editPlatFormSchema.parse(req.body);

        const { name, platFormId, image } = body;

        const UpdatedPlatForm = await PlatForm.findByIdAndUpdate(
            { _id: platFormId },
            { name, image },
            { new: true },
        );

        if (UpdatedPlatForm) {
            return res.status(200).json(
                successResponse({
                    message: 'platForm updated successfully',
                    data: UpdatedPlatForm,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    message: 'Not found any Data with this PlatForm id',
                }),
            );
        }
    },
);

const deletePlatFormController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editPlatFormSchema.parse(req.body);

        const { platFormId } = body;

        const UpdatedPlatForm = await PlatForm.findByIdAndUpdate(
            { _id: platFormId },
            {
                isDeleted: true,
            },
            { new: true },
        );

        if (UpdatedPlatForm) {
            return res.status(200).json(
                successResponse({
                    message: 'platForm deleted successfully',
                    data: UpdatedPlatForm,
                }),
            );
        } else {
            return res.status(404).json(
                errorResponse({
                    statusCode: 404,
                    message: 'Not found any Data with this PlatForm id',
                }),
            );
        }
    },
);
export = {
    addPlatFormController,
    editPlatFormController,
    deletePlatFormController,
    getAllPlatFormController,
};
