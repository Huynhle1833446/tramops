const bcrypt = require('bcryptjs');
const { hashedPassword, hashPassword } = require("../utils/funtions.js")
const TramDBConnection = require("../utils/connection");
const moment = require("moment");


module.exports = class APITrip {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  create = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { stage_id, count_slot, started_at, driver_id } = req.body;
        const userInfo = req.user;

        const queryCheck = `SELECT * FROM stages WHERE id = $1`;
        const check = await this.tramDB.runQuery(queryCheck, [stage_id]);
        if (!check.rowCount) reject("Không tồn tại chặng xe này!")

        const queryCheckDriver = `SELECT * FROM users WHERE id = $1 and role = 'staff'`;
        const checkDriver = await this.tramDB.runQuery(queryCheckDriver, [driver_id]);
        if (!checkDriver.rowCount) reject("Không tồn tại tài xế này!")

        else {
          const trip = await this.tramDB.runQuery('INSERT INTO trips (stage_id, driver_id, started_at, count_slot) VALUES ($1, $2, $3, $4) RETURNING *', [stage_id, count_slot, started_at, driver_id]);
          resolve(trip.rows[0])
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  get = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { current, pageSize } = req.body;
      let valueOffset = (current - 1) * pageSize;
      try {
        const getTotal = await this.tramDB.runQuery('SELECT COUNT(id) as total FROM trips');
        const total = getTotal.rows[0].total;
        valueOffset = valueOffset > total ? total : valueOffset;

        const list = await this.tramDB.runQuery(`SELECT trips.id                                       as key,
        trips.status,
        trips.started_at,
        trips.count_slot                               as total_slot_trip,
        trips.created_at,
        stages.price                                   as price,
        stages.created_at                              as stage_created_at,
        CONCAT(users.first_name, ' ', users.last_name) as driver_name,
        from_location.vi_name                          as from_location_name,
        to_location.vi_name                            as to_location_name,
        cars.name                                      as car_name,
        cars.number_plate
 FROM trips
          LEFT JOIN stages ON trips.stage_id = stages.id
          LEFT JOIN users ON trips.driver_id = users.id
          LEFT JOIN locations from_location ON stages.from_location_id = from_location.id
          LEFT JOIN locations to_location ON stages.to_location_id = to_location.id
          LEFT JOIN cars ON users.car_id = cars.id
          LEFT JOIN tickets ON tickets.trip_id = trips.id
 GROUP BY trips.id, stages.price, trips.started_at, trips.count_slot, trips.created_at, from_location.vi_name,
          cars.number_plate, stages.created_at, users.first_name, users.last_name, to_location.vi_name, cars.name
                  OFFSET $1 ROWS 
                  LIMIT $2; `, [valueOffset, pageSize]);

        const checkTicketQuery = `SELECT sum(count_slot) as total_slot, count(id) as total_ticket FROM tickets WHERE trip_id = $1`;
        const checkTicket = await this.tramDB.runQuery(checkTicketQuery, [list.rows[0].key]);

        const total_ticket_slot = checkTicket.rows[0].total_ticket;
        const total_ticket = checkTicket.rows[0].total_slot;
        resolve({
          data: list.rows.map(item => {
            return {
              ...item,
              started_at: moment(item.started_at).format('DD/MM/YYYY HH:mm:ss'),
              created_at: moment(item.created_at).format('DD/MM/YYYY HH:mm:ss'),
              total_ticket_slot: Number(total_ticket_slot) || 0,
              total_ticket: Number(total_ticket) || 0,
              slot_left: item.total_slot_trip - total_ticket_slot
            }
          }),
          pagination: { current, pageSize, total },
        })
      } catch (e) {
        reject(e);
      }
    });
  };
  action = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { trip_id, action } = req.body;

        if (action === 'finish') {
          await this.tramDB.runQuery(`UPDATE trips SET status = 'finished' and finished_at = now() WHERE id = $1 RETURNING *`, [trip_id]);
        } else if (action === 'processing') {
          await this.tramDB.runQuery(`UPDATE trips SET status = 'processing' WHERE id = $1 RETURNING *`, [trip_id]);
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  getTripByDriver = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userInfo = req.user;
        const query = `SELECT trips.id                                       as key,
        trips.status,
        trips.started_at,
        trips.count_slot                               as total_slot_trip,
        trips.created_at,
        stages.price                                   as price,
        stages.created_at                              as stage_created_at,
        CONCAT(users.first_name, ' ', users.last_name) as driver_name,
        from_location.vi_name                          as from_location_name,
        to_location.vi_name                            as to_location_name,
        cars.name                                      as car_name,
        cars.number_plate,
        count(tickets.id) as total_ticket,
        sum(tickets.count_slot) as total_slot_ticket
 FROM trips
          LEFT JOIN stages ON trips.stage_id = stages.id
          LEFT JOIN users ON trips.driver_id = users.id
          LEFT JOIN locations from_location ON stages.from_location_id = from_location.id
          LEFT JOIN locations to_location ON stages.to_location_id = to_location.id
          LEFT JOIN cars ON users.car_id = cars.id
          LEFT JOIN tickets ON tickets.trip_id = trips.id
  WHERE trips.driver_id = $1
 GROUP BY trips.id, stages.price, trips.started_at, trips.count_slot, trips.created_at, from_location.vi_name,
          cars.number_plate, stages.created_at, users.first_name, users.last_name, to_location.vi_name, cars.name`;
        const list = await this.tramDB.runQuery(query, [userInfo.id]);
        resolve(list.rows || [])
      } catch (error) {
        reject(error)
      }
    })
  }
  getByParams = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {started_at, from_location_id, to_location_id} = req.body;

        const query = `SELECT trips.id                                       as key,
        trips.status,
        trips.started_at,
        trips.count_slot                               as total_slot_trip,
        trips.created_at,
        stages.price                                   as price,
        stages.created_at                              as stage_created_at,
        CONCAT(users.first_name, ' ', users.last_name) as driver_name,
        from_location.vi_name                          as from_location_name,
        to_location.vi_name                            as to_location_name,
        cars.name                                      as car_name,
        cars.number_plate
 FROM trips
          LEFT JOIN stages ON trips.stage_id = stages.id
          LEFT JOIN users ON trips.driver_id = users.id
          LEFT JOIN locations from_location ON stages.from_location_id = from_location.id
          LEFT JOIN locations to_location ON stages.to_location_id = to_location.id
          LEFT JOIN cars ON users.car_id = cars.id
          LEFT JOIN tickets ON tickets.trip_id = trips.id
  WHERE DATE(trips.started_at) = $1 AND stages.from_location_id = $2 AND stages.to_location_id = $3
 GROUP BY trips.id, stages.price, trips.started_at, trips.count_slot, trips.created_at, from_location.vi_name,
          cars.number_plate, stages.created_at, users.first_name, users.last_name, to_location.vi_name, cars.name`;
          const rs = await this.tramDB.runQuery(query, [started_at, from_location_id, to_location_id])

          resolve(rs.rows)
      } catch (error) {
        reject(error)
      }
    })
  }
  updateStatus = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const {status, trip_id} = req.body;
        const userInfo = req.user;

        const queryCheckTrip = `SELECT * FROM trips WHERE id = $1`;
        const checkTrip = await this.tramDB.runQuery(queryCheckTrip, [trip_id]);
        if(checkTrip.rows.length === 0) {
          reject('Trip not found')
        }
        
        switch (status) {
          case 'new':
            await this.tramDB.runQuery(`UPDATE trips SET status = 'new', created_at=NOW(), started_at= NULL, finished_at= NULL  WHERE id = $1 `, [trip_id]);
            break;
          case 'in_progress':
            await this.tramDB.runQuery(`UPDATE trips SET status = 'in_progress', started_at=NOW(), finished_at =NULL WHERE id = $1 `, [trip_id]);
            break;
          case 'finished':
            await this.tramDB.runQuery(`UPDATE trips SET status = 'finished', finished_at=NOW() WHERE id = $1 `, [trip_id]);
            break;
          case 'expired':
            await this.tramDB.runQuery(`UPDATE trips SET status = 'expired' WHERE id = $1 `, [trip_id]);
            break;  
          default:
            reject('Trạng thái không hợp lệ!')
            break;
        }
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
  // lockUnlock = async (req) => {
  //   return new Promise(async (resolve, reject) => {
  //     const { action, id } = req.body;
  //     const value = action === 'lock' ? 1 : 0;
  //     try {
  //       const queryUpdate = await this.tramDB.runQuery(`UPDATE locations SET is_locked = $1 WHERE id = $2 RETURNING locations.vi_name as name`, [value, id]);

  //       resolve(queryUpdate.rows[0].name)

  //     } catch (e) {
  //       reject(e);
  //     }
  //   });
  // };

  // edit = async (req) => {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const newLoc = {
  //         vi_name: req.body.vi_name,
  //         en_name: req.body.en_name,
  //         x: req.body.x,
  //         y: req.body.y,
  //         z: req.body.z,
  //         started_at: req.body.started_at,
  //         closed_at: req.body.closed_at,
  //         id: req.body.id
  //       }

  //       const queryCheck = `SELECT * FROM locations WHERE id = $1`;
  //       const check = await this.tramDB.runQuery(queryCheck, [newLoc.id]);

  //       if (check.rowCount > 0) {
  //         const queryUpdate = `UPDATE locations SET vi_name = $1, en_name = $2, x = $3, y = $4, z = $5, started_at = $6, closed_at = $7 WHERE id = $8 RETURNING id as key`;
  //         const update = await this.tramDB.runQuery(queryUpdate, [newLoc.vi_name, newLoc.en_name, newLoc.x, newLoc.y, newLoc.z, newLoc.started_at, newLoc.closed_at, newLoc.id]);
  //         resolve(update.rows[0]?.key || update.rows[0]?.id);
  //       } else {
  //         reject('Không tồn tại địa điểm này!')
  //       }
  //     } catch (error) {
  //       reject(error);
  //     }
  //   })
  // }
}
