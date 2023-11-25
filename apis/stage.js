const bcrypt = require('bcryptjs');
const { hashedPassword, hashPassword } = require("../utils/funtions.js")
const TramDBConnection = require("../utils/connection");
const moment = require("moment");


module.exports = class APIStage {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  get = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { current, pageSize } = req.body;
      let valueOffset = (current - 1) * pageSize;
      try {
        const getTotal = await this.tramDB.runQuery('SELECT COUNT(id) as total FROM stages');
        const total = getTotal.rows[0].total;
        valueOffset = valueOffset > total ? total : valueOffset;

        const list = await this.tramDB.runQuery(`SELECT s.id as key, fl.vi_name as from_location_name, tl.vi_name as to_location_name ,*
                  FROM stages s LEFT JOIN locations fl ON s.from_location_id = fl.id
                                LEFT JOIN locations tl ON s.to_location_id = tl.id
                  ORDER BY s.id desc
                  OFFSET $1 ROWS 
                  LIMIT $2; `, [valueOffset, pageSize]);
        const locationDataQuery = 'SELECT * FROM locations where is_locked = 0 ORDER BY id DESC';
        const locationData = await this.tramDB.runQuery(locationDataQuery);
        resolve({
          data: list.rows,
          locationData: locationData.rows || [],
          pagination: { current, pageSize, total },
        })
      } catch (e) {
        reject(e);
      }
    });
  };
  create = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { fromLocation, toLocation, price } = req.body;

        const queryCheck = `SELECT * FROM stages WHERE from_location_id = $1 AND to_location_id = $2`;
        const check = await this.tramDB.runQuery(queryCheck, [fromLocation, toLocation]);

        if (check.rowCount) reject('Đã tồn tại chặng xe này rồi!');
        else {

          const queryCreate = 'INSERT INTO stages (from_location_id, to_location_id, price) VALUES ($1, $2, $3) RETURNING *';
          try {
           await this.tramDB.runQuery(queryCreate, [fromLocation, toLocation, price]);
            resolve({
              msg: `Chúc mừng bạn đã tạo thông tin chặng xe thành công`
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

  edit = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const newStage = {
          from_location_id: req.body.fromLocation,
          to_location_id: req.body.toLocation,
          price: req.body.price,
          id: req.body.id
        }

        const queryCheck = `SELECT * FROM stages WHERE id = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [newStage.id]);

        if (check.rowCount > 0) {

          const queryCheck = `SELECT * FROM stages WHERE from_location_id = $1 AND to_location_id = $2`;
        const check = await this.tramDB.runQuery(queryCheck, [newStage.from_location_id, newStage.to_location_id]);

        if (check.rowCount) reject('Đã tồn tại chặng xe này rồi!');
        else {

          const queryUpdate = `UPDATE stages SET car_id = $1, from_location_id = $2, to_location_id = $3, price = $4 WHERE id = $8 RETURNING id as key`;
          const update = await this.tramDB.runQuery(queryUpdate, [newStage.car_id, newStage.from_location_id, newStage.to_location_id, newStage.price, newStage.id]);
          resolve(update.rows[0]?.key || update.rows[0]?.id);
        }
        } else {
          reject('Không tồn tại tuyến xe này!')
        }
      } catch (error) {
        reject(error);
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

  top = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `select a.*, concat(l1.vi_name, ' - ',l2.vi_name) as name
        from stages s  join (select stage_id, count(t.id) as total
        from trips t
        group by t.stage_id
        order by total desc
        LIMIT 10) a on s.id = a.stage_id
        join locations l1 on l1.id = s.from_location_id
        join locations l2 on l2.id = s.to_location_id;`
        const rs = await this.tramDB.runQuery(query);

        resolve(rs.rows)
      } catch (error) {
        reject(error)
      }
    })
  }
}
