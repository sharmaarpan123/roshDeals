import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, './buyrSheets.json'), // path to your service account key file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const HEADERS = [
    'Order ID',
    'Platform Order ID',
    'Reviewer Name',
    'Order Date',
    'Delivery Fee',
    'User ID',
    'Deal ID',
    'Order Status',
    'Created At'
];

export const addNewOrder = async (order, SPREADSHEET_ID, SHEET_NAME) => {
    try {
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
            [
                order._id,
                order.orderIdOfPlatForm,
                order.reviewerName,
                order.orderDate,
                order.deliveryFee,
                order.userId,
                order.dealId,
                order.orderFormStatus,
                new Date().toISOString(),
            ],
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

export const updateOrderStatus = async (orderId, newStatus, SPREADSHEET_ID, SHEET_NAME) => {
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

export const getOrders = async (SPREADSHEET_ID, SHEET_NAME) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:Z1000`,
    });

    return response.data.values || [];
};
