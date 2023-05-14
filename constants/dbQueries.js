const Queries = {
  getUserByUsername: 'SELECT * FROM users WHERE username = $1',
  updateUserPassword: 'UPDATE users SET password = $1 WHERE id = $2',
}

module.exports = Queries