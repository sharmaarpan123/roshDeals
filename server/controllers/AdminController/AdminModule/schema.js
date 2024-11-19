import { z } from 'zod';
import {
    optionalString,
    requiredString,
} from '../../../utilities/ValidationSchema.js';

class AdminModuleValidationSchema {
    addAdminModuleSchema = z.object({
        name: requiredString('name'),
        uniqueSlug: requiredString('uniqueSlug'),
    });
    updateAdminModuleSchema = z.object({
        name: optionalString(),
        uniqueSlug: optionalString(),
        moduleId: requiredString('module id'),
    });
    getByIdSchema = z.object({
        moduleId: requiredString('Module Id'),
    });
}

export default new AdminModuleValidationSchema();
