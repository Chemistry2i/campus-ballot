const africastalking = require('africastalking')({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME
});

const sms = africastalking.SMS;

async function sendSms(to, message) {
  try {
    const result = await sms.send({
      to: [to],
      message
    });
    console.log({ message: "SMS sent", result });
    return result;
  } catch (error) {
    console.log({ message: "Error sending SMS", error: error.message });
    console.log({ message: "Error sending SMS", error });
    // Do not throw, just return null or an error object
    return null;
  }
}

module.exports = sendSms;