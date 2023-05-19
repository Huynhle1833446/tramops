const bcrypt = require ('bcryptjs');


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

const generateOTP = () => {
  // Implement your OTP generation logic here
  // For example, you can use the 'otp-generator' library (npm install otp-generator)
  const otpGenerator = require('otp-generator');
  const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });
  return otp;
};

module.exports = {
  comparePasswords,
  hashPassword,
  generateOTP
}