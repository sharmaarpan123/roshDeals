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
import { ADMIN_ROLE_TYPE_ENUM } from '../../../utilities/commonTypes.js';

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

    addSubAdminSchema = z
        .object({
            name: requiredString('Name'),
            phoneNumber: requiredPhoneNumber(),
            email: requiredEmailString(),
            password: requiredPassword(),
            fcmToken: optionalString(),
            permissions: z.array(this.permissionSchema()).optional(),
            apiAccessorRoles: z.array(),
            roles: z.nativeEnum(ADMIN_ROLE_TYPE_ENUM, {
                invalid_type_error: 'inValid roles type',
            }),
        })
        .refine(
            (data) => {
                // super sub admin can't create super admin
                if (
                    data?.apiAccessorRoles?.includes(
                        ADMIN_ROLE_TYPE_ENUM?.SUPERSUBADMIN,
                    ) &&
                    data?.roles.includes(ADMIN_ROLE_TYPE_ENUM?.SUPERADMIN)
                ) {
                    return false;
                }
                return true;
            },
            {
                message: "super sub admin can't create super admin",
                path: ['roles'],
            },
        )
        .refine(
            (data) => {
                if (
                    !data?.apiAccessorRoles?.includes(
                        ADMIN_ROLE_TYPE_ENUM?.SUPERSUBADMIN,
                    ) &&
                    data?.roles.includes(ADMIN_ROLE_TYPE_ENUM?.SUPERADMIN)
                ) {
                    return;
                }
            },
            { message: "super sub admin can't create super admin" },
        );
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
