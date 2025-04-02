import { z } from 'zod';
import {
    optionalEmailString,
    optionalPassword,
    optionalPhoneNUmber,
    optionalString,
    requiredBoolean,
    requiredEmailString,
    requiredPassword,
    requiredPhoneNumber,
    requiredString,
} from '../../../utilities/ValidationSchema.js';
import { ADMIN_ROLE_TYPE_ENUM } from '../../../utilities/commonTypes.js';

const adminRoleCreateRefineFunction =
    ({ editMode = false }) =>
    (data) => {
        if (editMode && !data?.roles) {
            return true;
        } else if (
            data?.apiAccessorRoles?.includes(ADMIN_ROLE_TYPE_ENUM?.SUPERADMIN)
        ) {
            // super admin can add every role
            return true;
        } else if (
            data?.apiAccessorRoles?.includes(
                ADMIN_ROLE_TYPE_ENUM?.SUPERSUBADMIN,
            ) &&
            !data?.roles.includes(ADMIN_ROLE_TYPE_ENUM?.SUPERADMIN)
        ) {
            // super sub admin  only can't add super admin
            return true;
        } else if (
            data?.apiAccessorRoles?.includes(ADMIN_ROLE_TYPE_ENUM?.ADMIN) &&
            data?.roles?.includes(ADMIN_ROLE_TYPE_ENUM?.SUBADMIN)
        ) {
            // admin can only add sub admin
            return true;
        }
        return false;
    };

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
            apiAccessorRoles: z.array(z.string()),
            isActive: z.boolean({ required_error: 'Status is required' }),
            userName: z
                .string()
                .min(5, {
                    message: 'Username must be at least 5 characters long.',
                })
                .max(20, { message: 'Username must not exceed 20 characters.' })
                .regex(/^[a-zA-Z0-9]+$/, {
                    message:
                        'Username can only contain alphanumeric characters.',
                }),
            roles: z
                .array(z.nativeEnum(ADMIN_ROLE_TYPE_ENUM))
                .min(1, { message: 'Role is required' }),
        })
        .refine(adminRoleCreateRefineFunction({ editMode: false }), {
            message: "You don't have permission to create this role!",
            path: ['roles'],
        });
    updateSubAdminSchema = z
        .object({
            adminId: requiredString('Admin id'),
            name: optionalString('Name'),
            phoneNumber: optionalPhoneNUmber(),
            email: optionalEmailString(),
            password: optionalPassword(),
            fcmToken: optionalString(),
            permissions: z.array(this.permissionSchema()).optional(),
            apiAccessorRoles: z.array(z.string()),
            isActive: z.boolean().optional(),
            userName: z
                .string()
                .min(5, {
                    message: 'Username must be at least 5 characters long.',
                })
                .max(20, { message: 'Username must not exceed 20 characters.' })
                .regex(/^[a-zA-Z0-9]+$/, {
                    message:
                        'Username can only contain alphanumeric characters.',
                })
                .optional(),
            roles: z.array(z.nativeEnum(ADMIN_ROLE_TYPE_ENUM)).optional(),
        })
        .refine(adminRoleCreateRefineFunction({ editMode: true }), {
            message: "You don't have permission to create this role!",
            path: ['roles'],
        });

    manageAdminSubAdminRelation = z.object({
        subAdminId: requiredString('Sub admin'),
        adminId: requiredString('Admin'),
        isActive: requiredBoolean('Status'),
    });

    linkAdminSubAdmin = z.object({
        subAdminUserName: requiredString('Sub admin'),
        adminUserName: requiredString('Admin'),
    });
}

const subAdminValidationSchema = new subAdminValidation();

export default subAdminValidationSchema;
