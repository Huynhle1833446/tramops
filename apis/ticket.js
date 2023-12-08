const bcrypt = require('bcryptjs');
const { hashedPassword, hashPassword } = require("../utils/funtions.js")
const TramDBConnection = require("../utils/connection");
const moment = require("moment");


module.exports = class APITicket {
  constructor() {
    this.tramDB = new TramDBConnection();
  }

  getById = async (req) => {
    return new Promise(async (resolve, reject) => {
      const { id } = req.body;
      try {
        const checkQuery = `SELECT id FROM tickets WHERE id = $1`;
        const check = await this.tramDB.runQuery(checkQuery, [id]);
        
        if (!check.rowCount) reject('Không tồn tại vé này!')
        else {
          const ticket = await this.tramDB.runQuery(`SELECT tic.created_at, tic.count_slot as ticket_buy_slot,
          concat(cus.last_name, ' ', cus.first_name)     as cus_name,
          trips.started_at,
          trips.count_slot                               as total_slot_trip,
          trips.created_at as trip_created_at,
          stages.price                                   as price,
          stages.created_at                              as stage_created_at,
          CONCAT(users.first_name, ' ', users.last_name) as driver_name,
          from_location.vi_name                          as from_location_name,
          to_location.vi_name                            as to_location_name,
          cars.name                                      as car_name,
          cars.number_plate
   FROM tickets tic
            LEFT JOIN users cus on cus.id = tic.customer_id
            LEFT JOIN users dri on dri.id = tic.driver_id
            LEFT JOIN trips on trips.id = tic.trip_id
            LEFT JOIN stages ON trips.stage_id = stages.id
            LEFT JOIN users ON trips.driver_id = users.id
            LEFT JOIN locations from_location ON stages.from_location_id = from_location.id
            LEFT JOIN locations to_location ON stages.to_location_id = to_location.id
            LEFT JOIN cars ON users.car_id = cars.id
            LEFT JOIN tickets ON tickets.trip_id = trips.id WHERE tic.id = $1`, [id]);

          resolve({
            ...ticket.rows[0],
            created_at: moment(ticket.rows[0].created_at).format('DD/MM/YYYY HH:mm:ss'),
            started_at: moment(ticket.rows[0].started_at).format('DD/MM/YYYY HH:mm:ss'),
          })
        }
      } catch (e) {
        reject(e);
      }
    });
  };
  create = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let { trip_id, count_slot, note } = req.body;
        const userInfo = req.user;

        const queryCheck = `SELECT sum(tickets.count_slot) as total_ticket_slot, trips.count_slot, trips.id FROM trips lEFT JOIN tickets on trips.id = tickets.trip_id WHERE trips.id = $1 and status = 'new' GROUP BY trips.count_slot, trips.id ;`;

        const check = await this.tramDB.runQuery(queryCheck, [trip_id]);
        if (!check.rowCount) reject("Không tồn tại chuyến xe này hoặc chuyến đi đã kết thúc!")
        const totalTicketSlot = check.rows[0].total_ticket_slot || 0;
        const calCountLeft = check.rows[0].count_slot - totalTicketSlot;
      
        if (count_slot > calCountLeft) reject(`Chuyến này không đủ chỗ! Chỉ còn ${calCountLeft} ghế trống.`)
        else {
         const ticket = await this.tramDB.runQuery('INSERT INTO tickets (trip_id, count_slot, note, customer_id) VALUES ($1, $2, $3, $4) RETURNING id', [trip_id, count_slot, note, userInfo.id]);
          resolve(ticket.rows[0].id)
        }
      } catch (e) {
        reject(e);
      }
    });
  };

  myself = async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        const userInfo = req.user;

        const query = `SELECT tic.created_at, tic.id as ticket_id,
        tic.count_slot                                 as ticket_buy_slot,
        concat(cus.last_name, ' ', cus.first_name)     as cus_name,
        trips.started_at,
        trips.count_slot                               as total_slot_trip,
        trips.created_at                               as trip_created_at,
        stages.price                                   as price,
        stages.created_at                              as stage_created_at,
        CONCAT(users.first_name, ' ', users.last_name) as driver_name,
        from_location.vi_name                          as from_location_name,
        to_location.vi_name                            as to_location_name,
        cars.name                                      as car_name,
        cars.number_plate
 FROM tickets tic
          LEFT JOIN users cus on cus.id = tic.customer_id
          LEFT JOIN users dri on dri.id = tic.driver_id
          LEFT JOIN trips on trips.id = tic.trip_id
          LEFT JOIN stages ON trips.stage_id = stages.id
          LEFT JOIN users ON trips.driver_id = users.id
          LEFT JOIN locations from_location ON stages.from_location_id = from_location.id
          LEFT JOIN locations to_location ON stages.to_location_id = to_location.id
          LEFT JOIN cars ON users.car_id = cars.id
          LEFT JOIN tickets ON tickets.trip_id = trips.id
 WHERE tic.customer_id = $1
 GROUP BY tic.created_at, tic.count_slot , tic.id,
         concat(cus.last_name, ' ', cus.first_name)     ,
         trips.started_at,
         trips.count_slot                              ,
         trips.created_at ,
         stages.price                                  ,
         stages.created_at                              ,
         CONCAT(users.first_name, ' ', users.last_name) ,
         from_location.vi_name                          ,
         to_location.vi_name                            ,
         cars.name                                      ,
         cars.number_plate
  ORDER BY tic.created_at DESC;`;
        const rs = await this.tramDB.runQuery(query, [userInfo.id]);
        resolve(rs.rows.length > 0 ? rs.rows.map(item => {
          return {
            ...item, 
            started_at: moment(item.started_at).format('DD/MM/YYYY | HH:mm'),
          }
        }) : [])
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
