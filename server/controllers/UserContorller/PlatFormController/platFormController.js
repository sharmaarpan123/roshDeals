import PlatForm from '../../../database/models/PlatForm.js';

import catchAsync from '../../../utilities/catchAsync.js';
import {
   
    successResponse,
} from '../../../utilities/Responses.js';

const getAllPlatFormController = catchAsync(async (req, res) => {
    const AllPlatForms = await PlatForm.find().sort({ createdAt: -1 });
    return res.status(200).json(
        successResponse({
            message: 'All PlatForms',
            data: AllPlatForms,
        }),
    );
});

export default {
    getAllPlatFormController,
};
//# sourceMappingURL=platFormController.js.map
