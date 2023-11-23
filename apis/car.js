const bcrypt = require('bcryptjs');
const { hashedPassword, hashPassword } = require("../utils/funtions.js")
const TramDBConnection = require("../utils/connection");
const moment = require("moment");


module.exports = class APIUser {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  getCar = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { current, pageSize } = req.body;
      let valueOffset = (current - 1) * pageSize;
      try {
        const getTotal = await this.tramDB.runQuery('SELECT COUNT(id) as total FROM cars');
        const total = getTotal.rows[0].total;
        valueOffset = valueOffset > total ? total : valueOffset;

        const list = await this.tramDB.runQuery(`SELECT c.id as key, c.* FROM cars c
                  ORDER BY c.id DESC
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
  createCar = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { name, numberPlate } = req.body;

        const queryCheck = `SELECT * FROM cars WHERE name = $1 OR number_plate = $2`;
        const check = await this.tramDB.runQuery(queryCheck, [name, numberPlate]);

        if (check.rowCount > 0) reject('Tên hoặc biển số đã tồn tại!')
        else {
          try {
            await this.tramDB.runQuery('INSERT INTO cars (name, number_plate) VALUES ($1, $2) RETURNING id', [name, numberPlate]);
          } catch (error) {
            console.log("🚀 ~ file: car.js:50 ~ APIUser ~ returnnewPromise ~ error:", error)
            reject(error)
          }

          resolve({
            msg: `Chúc mừng bạn đã tạo thông tin xe ${name} | ${numberPlate} thành công`
          })
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
        const queryUpdate = await this.tramDB.runQuery(`UPDATE cars SET is_locked = $1 WHERE id = $2 RETURNING cars.name as name`, [value, id]);

        resolve(queryUpdate.rows[0].name)

      } catch (e) {
        reject(e);
      }
    });
  };
  getListCarToAssign = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userInfo = req.userInfo;
        const query = `SELECT c.*
        FROM cars c
        LEFT JOIN users u ON c.id = u.car_id
        WHERE u.car_id IS NULL;
        `;
        const list = await this.tramDB.runQuery(query)
        resolve({options: list.rows})
      } catch (error) {
        reject(error)
      }
    })
  } 
  assign = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { car, user } = req.body;
      const userInfo = req.userInfo;
      const carId = car.id;
      const userId = user.key;
      try {
        const query = `UPDATE users SET car_id = $1 WHERE id = $2;
        `;
        await this.tramDB.runQuery(query, [carId, userId])
        resolve('Cập nhật thành công xe của' + user.name)
      } catch (error) {
        reject(error)
      }
    })
  } 
  edit = async(req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const newCar = {
          name: req.body.name,
          number_plate: req.body.number_plate,
          id: req.body.id
        }
        
        const queryCheck = `SELECT * FROM cars WHERE id = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [newCar.id]);

        if (check.rowCount > 0) {
          const queryUpdate = `UPDATE cars SET name = $1, number_plate = $2 WHERE id = $3 RETURNING id as key`;
          const update = await this.tramDB.runQuery(queryUpdate, [newCar.name, newCar.number_plate, newCar.id]);
          resolve(update.rows[0]?.key || update.rows[0]?.id);
        } else {
          reject('Không tồn tại xe này!')
        }
      } catch (error) {
        reject(error);
      }
    })
  }
}
