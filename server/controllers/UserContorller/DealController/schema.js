import { z } from 'zod';

const getDeal = z.object({
    dealId: z.string({ required_error: 'DealId is  required' }).trim(),
});

export { getDeal };
//# sourceMappingURL=schema.js.map
