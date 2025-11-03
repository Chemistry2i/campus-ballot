// const nodemailer = require('nodemailer');

// const sendEmail = async ({ to, subject, html }) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         const mailOptions = {
//             from: `"Campus Ballot" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             html
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('[EMAIL SENT]:', to);
//     } catch (error) {
//         console.error('[EMAIL ERROR]:', error.message);
//         throw new Error('Email could not be sent');
//     }
// };

// module.exports = sendEmail;

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // use 465 for SSL (secure connection)
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // helps in some hosting environments
      },
    });

    const mailOptions = {
      from: `"Campus Ballot" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL SENT]:', info.response);
  } catch (error) {
    console.error('[EMAIL ERROR]:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;

