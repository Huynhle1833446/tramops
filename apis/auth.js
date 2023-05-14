const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { comparePasswords, hashPassword } = require("../utils/funtions.js");
const TramDBConnection = require("../utils/connection.js");
const { getUserByUsername, updateUserPassword } = require('../constants/dbQueries.js');

module.exports = class APIUser {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  login = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { username, password } = req.body;
        const result = await this.tramDB.runQuery('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        if (!user) reject('Sai thông tin người dùng !');

        const validPassword = await comparePasswords(password, user.password);
        if (!validPassword) reject('Sai thông tin người dùng !');

        const token = jwt.sign({ id: user.id, fullname: user.fullname, username: user.username }, process.env.JWT_SECRET);
        resolve({
          msg: `Chúc mừng bạn đã đăng nhập thành công`,
          user: {
            ...user,
            token
          }
        })
      } catch (error) {
        reject(error);
      }
    });
  };
  changePassword = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { username, oldPassword, newPassword } = req.body;

        if (!username || !oldPassword || !newPassword) {
          reject('Vui lòng điền đủ thông tin!');
        }
        const user = await this.tramDB.runQuery(getUserByUsername, [username]);

        if(!user.rowCount) reject('Không tồn tại người dùng này!')

        const userInfo = user.rows[0];

        const check = await comparePasswords(oldPassword, userInfo.password);

        if (!check) {
          reject('Mật khẩu bạn nhập không khớp với hệ thống!');
        } else {
          const hashedPassword = await hashPassword(newPassword);
          await this.tramDB.runQuery(updateUserPassword, [hashedPassword, userInfo.id]);
          resolve('Đổi mật khẩu thành công')
        }

      } catch (error) {
        reject(error)
      }
    })
  }
}
