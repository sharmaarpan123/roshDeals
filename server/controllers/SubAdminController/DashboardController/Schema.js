import { z } from 'zod';
    const checkDateFunc = () => {
        return (data) => {
            if (!data) {
                return true;
            } else if (new Date(data) == 'Invalid Date') {
                return false;
            } else {
                return true;
            }
        };
    };

    export const dashboardReportSchema = z
        .object({
            revenueReportType: z.enum(['yearly', 'monthly', 'weekly']).optional(),
            startDate: z.string().optional().refine(checkDateFunc(), {
                message: 'please enter the valid start date',
            }),
            endDate: z.string().optional().refine(checkDateFunc(), {
                message: 'please enter the valid end  date',
            }),
        })
        .refine(
            (data) => {
                if (
                    (data.endDate && !data.startDate) ||
                    (!data.startDate && data.endDate)
                ) {
                    return false;
                }
                return true;
            },
            {
                message:
                    'please send start date and end date both other wise none of this.',
            },
        );
