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

module.exports = {
  comparePasswords,
  hashPassword
}