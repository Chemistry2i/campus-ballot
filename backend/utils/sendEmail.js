const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Kyambogo University Voting System" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        console.log('[EMAIL SENT]:', to);
    } catch (error) {
        console.error('[EMAIL ERROR]:', error.message);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;
