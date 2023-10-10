const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// Helper function to compare passwords
async function comparePasswords(password, hash) {
  const rs = await bcrypt.compare(password, hash);
  return rs;
}

// Helper function to hash a password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// const generateOTP = () => {
//   // Implement your OTP generation logic here
//   // For example, you can use the 'otp-generator' library (npm install otp-generator)
//   const otpGenerator = require('otp-generator');
//   const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });
//   console.log("otp",otp)
//   return otp;
// };

 function generateOTP() {
  const digits = '0123456789';
  let otp = '';

  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
}


module.exports = {
  comparePasswords,
  hashPassword,
  generateOTP
}