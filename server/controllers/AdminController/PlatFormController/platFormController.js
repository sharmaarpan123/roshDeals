import PlatForm from '../../../database/models/PlatForm.js';
import {
    addPlatFormSchema,
    platFormIdSchema,
    editPlatFormSchema,
    updateStatusChangeSchema,
} from './schema.js';
import catchAsync from '../../../utilities/catchAsync.js';
import {
    errorResponse,
    successResponse,
} from '../../../utilities/Responses.js';
import { filterSchema } from '../../../utilities/ValidationSchema.js';

const getAllPlatFormWithFiltersController = catchAsync(async (req, res) => {
    const { limit, offset, search, status } = filterSchema.parse(req.query);

    const AllPlatForms = PlatForm.find({
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: Boolean(+status) }),
    }).sort({ createdAt: -1 });

    if (limit) {
        AllPlatForms.skip(offset).limit(limit);
    }

    const totalCount = PlatForm.find({
        ...(search && { name: { $regex: search, $options: 'i' } }),
        ...(status && { isActive: Boolean(+status) }),
    }).countDocuments();

    const data = await Promise.all([AllPlatForms, totalCount]);

    return res.status(200).json(
        successResponse({
            message: 'All PlatForms',
            data: data[0],
            total: data[1],
        }),
    );
});

const getPlatFormById = catchAsync(async (req, res) => {
    const { platFormId } = platFormIdSchema.parse(req.params);
    const platFrom = await PlatForm.findOne({
        _id: platFormId,
    });
    return res.status(200).json(
        successResponse({
            message: 'PlatForm details',
            data: platFrom,
        }),
    );
});
const addPlatFormController = catchAsync(async (req, res) => {
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
});
const editPlatFormController = catchAsync(async (req, res) => {
    const body = editPlatFormSchema.parse(req.body);
    const { name, platFormId, image } = body;
    if (name) {
        const alreadyExists = await PlatForm.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();
        if (alreadyExists && alreadyExists._id.toString() !== platFormId) {
            return res.status(400).json(
                errorResponse({
                    message: 'This platform already exists',
                }),
            );
        }
    }
    const UpdatedPlatForm = await PlatForm.findByIdAndUpdate(
        { _id: platFormId },
        { name, image },
        { new: true },
    );
    if (UpdatedPlatForm) {
        return res.status(200).json(
            successResponse({
                message: 'Platform Updated successfully.',
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
});
const platFormStatusChangeController = catchAsync(async (req, res) => {
    const body = updateStatusChangeSchema.parse(req.body);
    const { platFormId, status } = body;
    const UpdatedPlatForm = await PlatForm.findByIdAndUpdate(
        { _id: platFormId },
        {
            isActive: status,
        },
        { new: true, upsert: true },
    );
    if (UpdatedPlatForm) {
        return res.status(200).json(
            successResponse({
                message: `Platform ${status ? 'Active' : 'Inactive'} successfully`,
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
});
export default {
    addPlatFormController,
    editPlatFormController,
    platFormStatusChangeController,
    getPlatFormById,
    getAllPlatFormWithFiltersController,
};
//# sourceMappingURL=platFormController.js.map
