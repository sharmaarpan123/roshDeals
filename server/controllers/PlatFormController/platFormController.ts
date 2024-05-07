import PlatForm from '@/models/PlatForm';
import { Request, Response } from 'express';
import { addPlatFormSchema, editPlatFormSchema } from './schema';
import catchAsync from '@/utilities/catchAsync';

const AddPlatFormController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = addPlatFormSchema.parse(req.body);

        const { name } = body;

        const alreadyExists = await PlatForm.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();

        if (alreadyExists) {
            return res.status(400).json({
                success: false,
                message: 'This platform already exists',
            });
        }

        const newPlatForm = await PlatForm.create({
            name,
        });

        const platForm = await newPlatForm.save();

        return res.status(200).json({
            success: true,
            data: platForm,
        });
    },
);

const EditPlatFormController = catchAsync(
    async (req: Request, res: Response): Promise<Response> => {
        const body = editPlatFormSchema.parse(req.body);

        const { name, platFormId } = body;

        const UpdatedPlatForm = await PlatForm.findByIdAndUpdate(
            { _id: platFormId },
            { name: name },
            { new: true },
        );

        if (UpdatedPlatForm) {
            return res.status(200).json({
                success: true,
                message: 'platForm updated successfully',
                data: UpdatedPlatForm,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Not found any Data with this PlatForm id',
            });
        }
    },
);

const DeletePlatFormController = catchAsync(
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
            return res.status(200).json({
                success: true,
                message: 'platForm deleted successfully',
                data: UpdatedPlatForm,
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Not found any Data with this PlatForm id',
            });
        }
    },
);
export = {
    AddPlatFormController,
    EditPlatFormController,
    DeletePlatFormController,
};
