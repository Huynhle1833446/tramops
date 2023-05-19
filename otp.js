const twilio = require('twilio');

const accountSid = process.env.ACCOUNTSID; // Replace with your Twilio Account SID
const authToken = process.env.AUTHTOKEN; // Replace with your Twilio Auth Token
const phoneNumber = process.env.SERVERPHONE; // Replace with your Twilio phone number
const toNumber = process.env.CLIENTPHONE;
const client = twilio(accountSid, authToken);

const sendOTP = async (phone, otp) => {
  const message = `Your OTP is: ${otp}`;
  return new Promise(async (resolve, reject) => {

    try {
      const message_1 = await client.messages.create({
        body: message,
        from: phoneNumber,
        to: toNumber
      });


      resolve(message_1);
    } catch (error) {
     reject(error);
    }
  })
};

module.exports = { sendOTP };
