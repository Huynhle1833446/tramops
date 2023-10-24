const bcrypt = require('bcryptjs');
const { hashedPassword, hashPassword } = require("../utils/funtions.js")
const TramDBConnection = require("../utils/connection");
const moment = require("moment");


module.exports = class APILocation {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  get = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { current, pageSize } = req.body;
      let valueOffset = (current - 1) * pageSize;
      try {
        const getTotal = await this.tramDB.runQuery('SELECT COUNT(id) as total FROM locations');
        const total = getTotal.rows[0].total;
        valueOffset = valueOffset > total ? total : valueOffset;

        const list = await this.tramDB.runQuery(`SELECT locations.id as key, *
                  FROM locations
                  ORDER BY id desc
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
  create = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { viName, enName, x, y, z, startedAt, closedAt } = req.body;
        const timeFormatRegex = /^\d{2}:\d{2}:\d{2}$/;
        const queryCheck = `SELECT * FROM locations WHERE en_name = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [enName]);
        let checkLeng2 = 0;
        if(x && y && z) {
          const queryCheck2 = `SELECT * FROM locations WHERE x = $1 AND y = $2 AND z = $3`;
          const check2 = await this.tramDB.runQuery(queryCheck2, [x, y, z]);
          checkLeng2 = check2.rowCount;
        }

        if (startedAt && closedAt && (!timeFormatRegex.test(startedAt) || !timeFormatRegex.test(closedAt))) {
          reject('Thời gian bạn nhập không đúng định dạng!')
        }
        else if (check.rowCount > 0) reject('Tên địa điểm đã tồn tại!')
        else if (checkLeng2 > 0) reject('Toạ độ đã tồn tại!')
        else {

          try {
            await this.tramDB.runQuery('INSERT INTO locations (vi_name, en_name, x, y, z, started_at, closed_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id', [viName, enName, x, y, z, startedAt, closedAt]);


            resolve({
              msg: `Chúc mừng bạn đã tạo thông tin địa điểm ${viName} thành công`
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
        const queryUpdate = await this.tramDB.runQuery(`UPDATE locations SET is_locked = $1 WHERE id = $2 RETURNING locations.vi_name as name`, [value, id]);

        resolve(queryUpdate.rows[0].name)

      } catch (e) {
        reject(e);
      }
    });
  };

  edit = async(req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const newLoc = {
          vi_name: req.body.vi_name,
          en_name: req.body.en_name,
          x: req.body.x,
          y: req.body.y,
          z: req.body.z,
          started_at: req.body.started_at,
          closed_at: req.body.closed_at,
          id: req.body.id
        }
        
        const queryCheck = `SELECT * FROM locations WHERE id = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [newLoc.id]);

        if (check.rowCount > 0) {
          const queryUpdate = `UPDATE locations SET vi_name = $1, en_name = $2, x = $3, y = $4, z = $5, started_at = $6, closed_at = $7 WHERE id = $8 RETURNING id as key`;
          const update = await this.tramDB.runQuery(queryUpdate, [newLoc.vi_name, newLoc.en_name, newLoc.x, newLoc.y, newLoc.z, newLoc.started_at, newLoc.closed_at, newLoc.id]);
          resolve(update.rows[0]?.key || update.rows[0]?.id);
        } else {
          reject('Không tồn tại địa điểm này!')
        }
      } catch (error) {
        reject(error);
      }
    })
  }
}
