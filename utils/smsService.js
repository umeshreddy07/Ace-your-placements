const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOtpSms(toPhoneNumber, otp) {
    try {
        await client.messages.create({
            body: `Your Ace Your Placement OTP is: ${otp}. It is valid for 5 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber,
        });
        console.log(`OTP SMS sent to ${toPhoneNumber}`);
    } catch (error) {
        console.error(`Error sending OTP SMS to ${toPhoneNumber}:`, error);
        throw new Error('Could not send OTP SMS.');
    }
}

module.exports = { sendOtpSms }; 