import PlatForm from '../../database/models/PlatForm.js';
import { addPlatFormSchema, deletePlatFormSchema, editPlatFormSchema, } from './schema.js';
import catchAsync from '../../utilities/catchAsync.js';
import { errorResponse, successResponse } from '../../utilities/Responses.js';
const getAllPlatFormController = catchAsync(async (req, res) => {
    const AllPlatForms = await PlatForm.find();
    return res.status(200).json(successResponse({
        message: 'All PlatForms',
        data: AllPlatForms,
    }));
});
const getPlatFormById = catchAsync(async (req, res) => {
    const { platFormId } = deletePlatFormSchema.parse(req.params);
    const platFrom = await PlatForm.findOne({
        _id: platFormId,
    });
    return res.status(200).json(successResponse({
        message: 'PlatForm details',
        data: platFrom,
    }));
});
const addPlatFormController = catchAsync(async (req, res) => {
    const body = addPlatFormSchema.parse(req.body);
    const { name, image } = body;
    const alreadyExists = await PlatForm.findOne({
        name: { $regex: new RegExp(name, 'i') },
    }).lean();
    if (alreadyExists) {
        return res.status(400).json(errorResponse({
            message: 'This platform already exists',
        }));
    }
    const newPlatForm = await PlatForm.create({
        name,
        image,
    });
    const platForm = await newPlatForm.save();
    return res.status(200).json(successResponse({
        message: 'Plat Form Added successfully',
        data: platForm,
    }));
});
const editPlatFormController = catchAsync(async (req, res) => {
    const body = editPlatFormSchema.parse(req.body);
    const { name, platFormId, image } = body;
    if (name) {
        const alreadyExists = await PlatForm.findOne({
            name: { $regex: new RegExp(name, 'i') },
        }).lean();
        if (alreadyExists && alreadyExists._id.toString() !== platFormId) {
            return res.status(400).json(errorResponse({
                message: 'This platform already exists',
            }));
        }
    }
    const UpdatedPlatForm = await PlatForm.findByIdAndUpdate({ _id: platFormId }, { name, image }, { new: true });
    if (UpdatedPlatForm) {
        return res.status(200).json(successResponse({
            message: 'platForm updated successfully',
            data: UpdatedPlatForm,
        }));
    }
    else {
        return res.status(404).json(errorResponse({
            message: 'Not found any Data with this PlatForm id',
        }));
    }
});
const deletePlatFormController = catchAsync(async (req, res) => {
    const body = editPlatFormSchema.parse(req.body);
    const { platFormId } = body;
    const UpdatedPlatForm = await PlatForm.findByIdAndUpdate({ _id: platFormId }, {
        isDeleted: true,
    }, { new: true });
    if (UpdatedPlatForm) {
        return res.status(200).json(successResponse({
            message: 'platForm deleted successfully',
            data: UpdatedPlatForm,
        }));
    }
    else {
        return res.status(404).json(errorResponse({
            statusCode: 404,
            message: 'Not found any Data with this PlatForm id',
        }));
    }
});
export default {
    addPlatFormController,
    editPlatFormController,
    deletePlatFormController,
    getAllPlatFormController,
    getPlatFormById,
};
//# sourceMappingURL=platFormController.js.map