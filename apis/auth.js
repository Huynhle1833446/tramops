const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { comparePasswords, hashPassword, generateOTP } = require("../utils/funtions.js");
const TramDBConnection = require("../utils/connection.js");
const { getUserByUsername, updateUserPassword } = require('../constants/dbQueries.js');
const { sendOTP } = require('../otp.js');
const moment = require("moment-timezone");

module.exports = class APIUser {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  sendOTP = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { phone } = req.body;
        if(!phone) reject('Vui lòng điền số điện thoại !')
        const otp = generateOTP();
        await sendOTP(phone, otp);

        const queryCheckExist = `SELECT * FROM otps WHERE phone = $1`;
        const check = await this.tramDB.runQuery(queryCheckExist, [phone]);
        const otpdb = check.rowCount
        if(otpdb > 0) {
          await this.tramDB.runQuery('UPDATE otps SET otp = $1 WHERE phone = $2', [otp, phone])
        } else {
          await this.tramDB.runQuery('INSERT INTO otps (phone, otp) VALUES ($1, $2)', [phone, otp]);
        }

        resolve(`Đã gửi OTP đến ${phone}`)

      } catch (error) {
        reject(error)
      }
    })
  }

  verifyOTP = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {phone, otp} = req.body;

        if(!phone || !otp) reject('Vui lòng điền đủ số điện thoại hoặc mã OTP!')

        const checkQuery = `SELECT id, phone, otp, created_at FROM otps WHERE phone = $1 AND otp = $2`;
        const rs = await this.tramDB.runQuery(checkQuery, [phone, otp])
        if(rs.rowCount === 0 ) reject('Mã OTP bạn nhập không đúng!')

        else {
          const otpdb = rs.rows[0];

          const createdAtMoment = moment(otpdb['created_at'], 'YYYY-MM-DD HH:mm:ss').tz("Asia/Ho_Chi_Minh");
          const minutesDiff = moment().diff(createdAtMoment, 'minutes');

          const expiryDuration = 5;

          if (minutesDiff > expiryDuration) {
            reject('Mã OTP này đã quá hạn!');
          } else {
            await this.tramDB.runQuery('DELETE FROM otps WHERE phone = $1', [phone])
            resolve('Chúc mừng bạn đã xác thực sms thành công!')
          }
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  login = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { username, password, platform } = req.body;

        platform = platform || 'mobile';

        if(!username || !password) reject('Vui lòng nhập đủ thông tin đăng nhập!')
        const result = await this.tramDB.runQuery(`SELECT *, image as imgUrl, last_name || ' ' || first_name as fullname FROM users WHERE username = $1`, [username]);

        const user = result.rows[0];
        if (!user) reject('Sai thông tin người dùng !');

        const validPassword = await comparePasswords(password, user.password);
        if (!validPassword) reject('Sai thông tin người dùng !');

        if(platform !== 'mobile' && user.role !== 'admin') {
          reject('Bạn không phải là ADMIN !')
        }

        const token = jwt.sign({ id: user.id, fullname: user.fullname, username: user.username }, process.env.JWT_SECRET);

        await this.tramDB.runQuery("UPDATE users SET lastest_login_at = NOW() WHERE username = $1", [username])

        resolve({
          msg: `Chúc mừng bạn đã đăng nhập thành công`,
          user: {
            ...user,
            imgUrl: user.imgurl ? user.imgurl : null,
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
  
  splitFullName(fullName) {
    // Split the full name into an array of words
    const words = fullName.split(' ');
  
    // Check if there are at least two words (first name and last name)
    if (words.length >= 2) {
      const lastname = words.pop(); // Remove and get the last word as the last name
      const firstname = words.join(' '); // The remaining words are the first name
  
      return {
        firstname: firstname,
        lastname: lastname,
      };
    } else {
      // If there are not enough words, consider the entire name as the first name
      return {
        firstname: fullName,
        lastname: '',
      };
    }
  }

  register = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { fullname, lastname, firstname, username, password, phone } = req.body;
        const hashedPassword = await hashPassword(password);
        if(fullname) {
          lastname = this.splitFullName(fullname).lastname;
          firstname = this.splitFullName(fullname).firstname;
        }
        const queryCheck = `SELECT * FROM users WHERE username = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [username]);
        if(check.rowCount > 0) reject('Tên đăng nhập đã tồn tại!')
       
        try {
          await this.tramDB.runQuery('INSERT INTO users (last_name, first_name, username, password, phone, register_at, role) VALUES ($1, $2, $3, $4, $5, $6, $7)', [lastname, firstname, username, hashedPassword, phone, 'NOW()', 'customer']);
        } catch (error) {
          reject(error);
        }
        resolve({
          msg: `Chúc mừng bạn đã tạo thông tin người dùng ${username} thành công`
        })
      } catch (e) {
          reject(e);
      }
    })
  }
}
