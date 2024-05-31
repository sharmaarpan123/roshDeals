import Brand from '@/database/models/Brand';
import PlatForm from '@/database/models/PlatForm';
import DealCategory from '@/database/models/DealCategory';
import Deal from '@/database/models/Deal';
import User from '@/database/models/User';

export const validatingMongoObjectIds = async ({
    brand,
    dealCategory,
    platForm,
    deal,
    user,
}: {
    brand?: string;
    dealCategory?: string;
    platForm?: string;
    deal?: string;
    user?: string;
}) => {
    const validatingIdsArr = [];

    if (brand) {
        validatingIdsArr.push({
            collection: 'Brand',
            query: Brand.findOne({ _id: brand }),
        });
    }
    if (user) {
        validatingIdsArr.push({
            collection: 'User',
            query: User.findOne({ _id: brand }),
        });
    }
    if (dealCategory) {
        validatingIdsArr.push({
            collection: 'DealCategory',
            query: DealCategory.findOne({ _id: dealCategory }),
        });
    }
    if (platForm) {
        validatingIdsArr.push({
            collection: 'PlatForm',
            query: PlatForm.findOne({ _id: platForm }),
        });
    }

    if (deal) {
        validatingIdsArr.push({
            collection: 'Deal',
            query: Deal.findOne({ _id: deal }),
        });
    }

    const validatingIdsArrRes = await Promise.all(
        validatingIdsArr.map((item) => item.query),
    );

    if (validatingIdsArrRes.includes(null)) {
        const ind = validatingIdsArrRes.findIndex((i) => !i);
        return `${validatingIdsArr[ind].collection} id is not valid`;
    } else {
        return false;
    }
};
