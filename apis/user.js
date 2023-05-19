const bcrypt = require ('bcryptjs');
const {hashedPassword, hashPassword} = require ("../utils/funtions.js")
const TramDBConnection = require ("../utils/connection");



module.exports = class APIUser {
    constructor() {
      this.tramDB = new TramDBConnection();
    }

    getAllUser = async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
              const list = await this.tramDB.runQuery('SELECT * from users');
              if(list.rowCount > 0) {
                resolve(list.rows)
              } else {
                reject('Không có dữ liệu!')
              }
            } catch (e) {
                reject(e);
            }
        });
    };
    createUser = async (req) => {
        return new Promise(async (resolve, reject) => {
          try {
              const { fullname, username, password, phone } = req.body;
              const hashedPassword = await hashPassword(password);
              await this.tramDB.runQuery('INSERT INTO users (fullname, username, password, phone, register_at) VALUES ($1, $2, $3, $4, $5) RETURNING id', [fullname, username, hashedPassword, phone, 'NOW()']);

              resolve({
                msg: `Chúc mừng bạn đã tạo thông tin người dùng ${username} thành công`
              })
            } catch (e) {
                reject(e);
            }
        });
    };
}
