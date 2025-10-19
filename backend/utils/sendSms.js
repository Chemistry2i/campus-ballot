const africastalking = require('africastalking')({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME
});

const sms = africastalking.SMS;

// Helper function to format phone number for AfricasTalking
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove any whitespace and special characters
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Handle Uganda phone numbers (assuming this is for Uganda)
  if (cleanPhone.startsWith('0')) {
    // Convert 0786021431 to +256786021431
    cleanPhone = '+256' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('256')) {
    // Add + if missing
    cleanPhone = '+' + cleanPhone;
  } else if (!cleanPhone.startsWith('+256') && cleanPhone.length === 9) {
    // If it's 9 digits, assume it's missing the leading 0
    cleanPhone = '+256' + cleanPhone;
  } else if (!cleanPhone.startsWith('+')) {
    // Default to Uganda country code if no country code provided
    cleanPhone = '+256' + cleanPhone;
  }
  
  return cleanPhone;
};

async function sendSms(to, message) {
  try {
    // Validate inputs
    if (!to || !message) {
      console.log({ message: "Error sending SMS", error: "Phone number and message are required" });
      return { success: false, error: "Phone number and message are required" };
    }

    // Format the phone number
    const formattedPhone = formatPhoneNumber(to);
    
    if (!formattedPhone) {
      console.log({ message: "Error sending SMS", error: "Invalid phone number format" });
      return { success: false, error: "Invalid phone number format" };
    }

    console.log(`[SMS]: Attempting to send to formatted number: ${formattedPhone}`);

    const result = await sms.send({
      to: [formattedPhone],
      message: message,
      from: process.env.AFRICASTALKING_SENDER_ID || undefined // Optional sender ID
    });

    console.log({ message: "SMS sent successfully", result });
    return { success: true, result };
    
  } catch (error) {
    console.log({ message: "Error sending SMS", error: error.message });
    console.log({ message: "Error sending SMS", error });
    
    // Return structured error response
    return { 
      success: false, 
      error: error.message || "SMS sending failed",
      details: error 
    };
  }
}

module.exports = sendSms;