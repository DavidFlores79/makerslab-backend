const twilio = require('twilio');

const sendOtp = async (phoneNumber, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio environment variables not configured properly.');
    throw new Error('Twilio configuration error. Please check environment variables.');
  }

  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body: `Your One Time Password (OTP) for login is: ${otp}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });
    console.log(`OTP sent to ${phoneNumber}`);
  } catch (error) {
    console.error(`Error sending OTP to ${phoneNumber}:`, error);
    // Check if the error is from Twilio due to unverified number for trial accounts
    if (error.code === 21614 || (error.message && error.message.includes('Trial accounts cannot send messages to unverified numbers'))) {
        console.error('Twilio Trial Account Error: The recipient phone number may need to be verified in your Twilio console.');
        throw new Error('Failed to send OTP due to Twilio trial account restrictions. Please verify the recipient number or upgrade your account.');
    }
    throw new Error('Failed to send OTP');
  }
};

module.exports = {
  sendOtp,
};
