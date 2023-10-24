const express = require('express');

const routes = express.Router();
const APITrip = require ("../apis/trip.js");
const apiTrip = new APITrip();

routes.post('/', async (req, res) => {
  apiTrip
    .get(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/create',  (req, res) => {
  apiTrip
    .create(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

// routes.post('/lockUnlock',  (req, res) => {
//   apiTrip
//     .lockUnlock(req)
//     .then((data) => {
//       res.status(200).send({ success: true, data: data });
//     })
//     .catch((e) => {
//       res.status(400).send({ success: false, error: e });
//     });
// });
// routes.post('/edit',  (req, res) => {
//   apiTrip
//     .edit(req)
//     .then((data) => {
//       res.status(200).send({ success: true, data: data });
//     })
//     .catch((e) => {
//       res.status(400).send({ success: false, error: e });
//     });
// });

module.exports = routes

