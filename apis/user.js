const bcrypt = require('bcryptjs');
const { hashedPassword, hashPassword } = require("../utils/funtions.js")
const TramDBConnection = require("../utils/connection");
const moment = require("moment");


module.exports = class APIUser {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  getAllUser = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { current, pageSize } = req.body;
      let valueOffset = (current - 1) * pageSize;
      try {
        const getTotal = await this.tramDB.runQuery('SELECT COUNT(id) as total FROM users WHERE role != \'admin\'');
        const total = getTotal.rows[0].total;
        valueOffset = valueOffset > total ? total : valueOffset;

        const list = await this.tramDB.runQuery(`SELECT last_name || ' ' || first_name AS name,
                          u.address,
                          u.id AS key,
                          DATE_PART('year', AGE(current_date, u.date_of_birth)) AS age,
                          u.date_of_birth,
                          u.register_at,
                          u.status,
                          u.is_locked,
                          phone,
                          u.email,
                          u.gender,
                          c.number_plate, 
                          c.name as name_car,
                          u.image
                  FROM users u
                  LEFT JOIN cars c ON c.id = u.car_id
                  WHERE u.role != 'admin'
                  ORDER BY u.register_at DESC, u.id DESC
                  OFFSET $1 ROWS 
                  LIMIT $2; `, [valueOffset, pageSize]);
        if (list.rowCount > 0) {
          resolve({
            data: list.rows,
            pagination: { current, pageSize, total },
          })
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
        let { lastName, firstName, username, password, phone, birthday, address, gender } = req.body;

        const queryCheck = `SELECT * FROM users WHERE username = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [username]);
        if (check.rowCount > 0) reject('Tên đăng nhập đã tồn tại!')
        else {
          password = password || process.env.PASSWORD_DEFAULT;

          const hashedPassword = await hashPassword(password);

          try {
            await this.tramDB.runQuery('INSERT INTO users (last_name, first_name, username, password, phone, register_at, date_of_birth, address, gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id', [lastName, firstName, username, hashedPassword, phone, 'NOW()', birthday, address, gender]);


            resolve({
              msg: `Chúc mừng bạn đã tạo thông tin người dùng ${username} thành công`
            })
          } catch (error) {
            reject(error)
          }
        }
      } catch (e) {
        reject(e);
      }
    });
  };
  lockUnlock = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { action, id } = req.body;
      const value = action === 'lock' ? 1 : 0;
      try {
        const queryUpdate = await this.tramDB.runQuery(`UPDATE users SET is_locked = $1 WHERE id = $2 RETURNING users.username as name`, [value, id]);

        resolve(queryUpdate.rows[0].name)

      } catch (e) {
        reject(e);
      }
    });
  };
  top = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `select a.*, u.username, u.image, CONCAT(u.first_name, ' ', u.last_name) as name
        from users u  join (select driver_id, count(t.id) as total
        from trips t
        group by t.driver_id
        order by total desc
        LIMIT 10) a on a.driver_id = u.id;`
        const rs = await this.tramDB.runQuery(query);

        resolve(rs.rows)
      } catch (error) {
        reject(error)
      }
    })
  }
}
