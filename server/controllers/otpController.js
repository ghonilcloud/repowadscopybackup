const nodemailer = require('nodemailer');
require('dotenv').config();

// Email templates
const emailTemplates = {
    verification: (otp) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>Email Verification</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .verification-code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #004ac2;
                    letter-spacing: 4px;
                    padding: 20px;
                    background-color: #f5f5f5;
                    border-radius: 8px;
                    margin: 20px 0;
                    text-align: center;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #68423d;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>Cottoneight</h1>
                </div>
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <div class="verification-code">${otp}</div>
                <p>This code will expire in 3 minutes.</p>
                <p>If you didn't request this code, you can safely ignore this email.</p>
                <div class="footer">
                    <p>Thanks,<br>Cottoneight Support Team</p>
                </div>
            </div>
        </body>
        </html>
    `,

    serviceAgentWelcome: (email, password) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="x-ua-compatible" content="ie=edge">
            <title>Welcome to Cottoneight Customer Service Team</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f9f9f9;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .credentials {
                    background-color: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .warning {
                    color: #d32f2f;
                    font-weight: bold;
                    padding: 10px;
                    background-color: #ffebee;
                    border-radius: 4px;
                    margin: 15px 0;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #68423d;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }
                .key-points {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: #f0f7ff;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>Cottoneight</h1>
                </div>
                <h2>Welcome to Our Customer Service Team!</h2>
                <p>Congratulations on joining Cottoneight's Customer Service team. We're excited to have you on board!</p>
                
                <div class="credentials">
                    <h3>Your Login Credentials</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${password}</p>
                </div>
                
                <div class="warning">
                    🔐 For security reasons, please change your password immediately after your first login.
                </div>

                <div class="key-points">
                    <h3>Getting Started</h3>
                    <ul>
                        <li>Access the customer service portal at <strong>cottoneight.com/login</strong></li>
                        <li>Review our customer service guidelines and policies</li>
                        <li>Familiarize yourself with our ticketing system</li>
                        <li>Set up your profile with professional information</li>
                    </ul>
                </div>

                <p>Your role is crucial in providing excellent customer support and maintaining Cottoneight's high service standards. You'll be helping our customers with their inquiries, resolving issues, and ensuring a positive shopping experience.</p>

                <div class="footer">
                    <p>If you have any questions, please contact your supervisor.</p>
                    <p>Best regards,<br>Cottoneight Management Team</p>
                </div>
            </div>
        </body>
        </html>
    `
};

const userSendMail = async (to, content, subject, type, res, customMessage = null) => {
    try {
        let config = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        };

        let transporter = nodemailer.createTransport(config);

        // Determine email content and subject based on type
        let htmlContent;
        let emailSubject = subject;

        if (type === 'Verify Email') {
            htmlContent = emailTemplates.verification(content);
            emailSubject = "Email Verification - Cottoneight";
        } else if (type === 'Welcome Service Agent') {
            htmlContent = emailTemplates.serviceAgentWelcome(to, content);
            emailSubject = "Welcome to Cottoneight Customer Service Team";
        } else if (customMessage) {
            // For any custom messages
            htmlContent = `
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">
                    ${customMessage}
                </body>
                </html>
            `;
        }

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: emailSubject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        
        // Only send response if res object is provided
        if (res) {
            return res.status(200).json({ message: 'Email sent successfully' });
        }
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        if (res) {
            return res.status(500).json({ message: 'Failed to send email', error: error.message });
        }
        throw error;
    }
};

module.exports = { userSendMail };