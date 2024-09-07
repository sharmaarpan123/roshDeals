import { Redis } from 'ioredis';

const getUrl = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }

    throw Error('REDIS_URL not found');
};

export default new Redis(getUrl());
