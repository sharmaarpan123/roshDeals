import { z } from 'zod';
import {
    optionalEmailString,
    optionalPhoneNUmber,
    optionalString,
    requiredBoolean,
    requiredEmailString,
    requiredPassword,
    requiredPhoneNumber,
    requiredString,
} from '../../../utilities/ValidationSchema.js';

class subAdminValidation {
    permissionSchema = () => {
        return z.object({
            moduleId: requiredString('Module Id'),
            allowAccess: requiredBoolean('Allow Access'),
            canEdit: requiredBoolean('Can Edit'),
            canAdd: requiredBoolean('Can Add'),
            canView: requiredBoolean('Can View'),
            canViewList: requiredBoolean('Can View List'),
        });
    };

    getByIdSchema = z.object({
        adminId: requiredString('Admin Id'),
    });

    addSubAdminSchema = z.object({
        name: requiredString('Name'),
        phoneNumber: requiredPhoneNumber(),
        email: requiredEmailString(),
        password: requiredPassword(),
        fcmToken: optionalString(),
        permissions: z.array(this.permissionSchema()).optional(),
    });
    updateSubAdminSchema = z.object({
        adminId: requiredString('Admin id'),
        name: optionalString('Name'),
        phoneNumber: optionalPhoneNUmber(),
        email: optionalEmailString(),
        password: optionalString(),
        fcmToken: optionalString(),
        permissions: z.array(this.permissionSchema()).optional(),
    });
}

const subAdminValidationSchema = new subAdminValidation();

export default subAdminValidationSchema;
