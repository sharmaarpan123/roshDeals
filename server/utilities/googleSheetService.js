import { google } from 'googleapis';
import setting from '../../setting.js';
import path from 'path';

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(setting, './config/googleSheet.json'), // path to your
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export const isSpreadsheetAndSheetValid = async ({
    SPREADSHEET_ID,
    sheetName,
}) => {
    try {
        const res = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheetTitles = res.data.sheets.map(
            (sheet) => sheet.properties.title,
        );

        const sheetExists = sheetTitles.includes(sheetName);

        return {
            success: sheetExists ? true : false,
            spreadsheetExists: true,
            sheetExists,
            availableSheets: sheetTitles,
        };
    } catch (error) {
        return {
            success: false,
            spreadsheetExists: false,
            sheetExists: false,
            error,
            errorCode: error.code,
        };
    }
};

const HEADERS = [
    'Order ID',
    'Platform Order ID',
    'Reviewer Name',
    'Order Date',
    'Delivery Fee',
    'User ID',
    'Deal ID',
    'Order Status',
    'Created At',
];

export const addNewOrderToSheet = async ({
    orders,
    SPREADSHEET_ID,
    SHEET_NAME,
}) => {
    try {
        const checkSpreadSheet = await isSpreadsheetAndSheetValid({
            SPREADSHEET_ID,
            SHEET_NAME,
        });

        if (!checkSpreadSheet.success) {
            return checkSpreadSheet;
        }

        // First, check if the sheet exists and has headers
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A1:I1`,
        });

        // If no headers exist, add them with styling
        if (!response.data.values || response.data.values.length === 0) {
            // Add headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A1:I1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [HEADERS],
                },
            });
        }

        // Add the new order
        const values = [
            ...orders.map((order) => [
                order._id,
                order.orderIdOfPlatForm,
                order.reviewerName,
                order.orderDate,
                order.deliveryFee,
                order.userId,
                order.dealId,
                order.orderFormStatus,
                order.createdAt,
            ]),
        ];

        const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values,
            },
        });

        console.log('Order successfully added:', appendResponse);
    } catch (error) {
        console.error('Failed to log order in sheet:', error.message);
    }
};

export const updateOrderStatus = async ({
    orderId,
    newStatus,
    SPREADSHEET_ID,
    SHEET_NAME,
}) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:Z1000`,
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === orderId);

    if (rowIndex === -1) return;

    const actualRow = rowIndex + 2;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!B${actualRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[newStatus]],
        },
    });
};

export const getOrders = async ({ SPREADSHEET_ID, SHEET_NAME }) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:Z1000`,
    });

    return response.data.values || [];
};
