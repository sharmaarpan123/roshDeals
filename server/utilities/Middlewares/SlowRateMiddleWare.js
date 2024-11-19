import redis from '../../lib/redis.js';
import catchAsync from '../catchAsync.js';
import { errorResponse } from '../Responses.js';
import { getIp, waitRequest } from '../utilitis.js';

export default (arg) => {
    return catchAsync(async (req, res, next) => {
        //  initial values
        const initialExpTime = arg?.initialExpTime || 15;
        const slowAfter = arg?.slowAfter || 2;
        const maxReq = arg?.maxReq || 4;
        const expTimeMultiPlyPerRequest = arg?.expTimeMultiPlyPerRequest || 2;

        // getting ip
        const ip = getIp(req);

        let isAlreadyRequested = await redis.get(ip);

        if (!isAlreadyRequested) {
            redis.setex(ip, initialExpTime, 1); // not using the await just to send  the response  is less time
            return next();
        }

        isAlreadyRequested = +isAlreadyRequested;

        const expTime =
            initialExpTime * (isAlreadyRequested * expTimeMultiPlyPerRequest);

        if (isAlreadyRequested >= maxReq) {
            redis.setex(ip, expTime, isAlreadyRequested + 1); // not using the await just to send  the response  is less time
            const message =
                'Tere jada chul mach rahi hai!! ab ruk ja ' + expTime + ' sec';
                
            return res.status(400).json(
                errorResponse({
                    message,
                }),
            );
        } else if (isAlreadyRequested < slowAfter) {
             redis.setex(ip, expTime, isAlreadyRequested + 1); // not using the await just to send  the response  is less time
            return next();
        } else if (
            isAlreadyRequested >= slowAfter &&
            isAlreadyRequested < maxReq
        ) {
            const waitTime =
                expTimeMultiPlyPerRequest * isAlreadyRequested * 1000;

            redis.setex(ip, expTime, isAlreadyRequested + 1); // not using the await just to send  the response  is less time
            await waitRequest(waitTime);

            return next();
        }

        return next();
    });
};

