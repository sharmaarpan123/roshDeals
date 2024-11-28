import redis from '../lib/redis.js';
import Admin from '../database/models/Admin.js';

export const setSubAdminCaches = async () => {
    try {
        const allSubAdmins = await Admin.find({}).populate(
            'permissions.moduleId',
        );
        await redis.set('admins', JSON.stringify(allSubAdmins));
    } catch (error) {
        console.log(error, 'error while cashing the data');
    }
};

export default async () => {
    await setSubAdminCaches();
};
