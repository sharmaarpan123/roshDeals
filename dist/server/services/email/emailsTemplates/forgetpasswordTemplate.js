"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forgetPasswordTemplate = (otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Email</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
    
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            .logo {
                text-align: center;
                margin-bottom: 20px;
            }
    
            .logo img {
                max-width: 100px;
            }
    
            .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
            }
    
            .otp {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
                background-color: #f5f5f5;
                padding: 10px;
                border-radius: 5px;
            }
    
            .copy-button {
                display: block;
                width: 100%;
                padding: 10px;
                background-color: #007bff;
                color: #fff;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
    
            .copy-button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="logo">
                <img src="https://via.placeholder.com/150" alt="Logo">
            </div>
            <div class="title">Here is your One-Time OTP</div>
            <div class="otp" id="otp">${otp}</div>
        </div>
    
        
    </body>
    
    </html>
    `;
};
exports.default = forgetPasswordTemplate;
//# sourceMappingURL=forgetpasswordTemplate.js.map