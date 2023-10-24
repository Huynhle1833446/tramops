const express = require('express');

const routes = express.Router();
const APIStage = require ("../apis/stage.js");
const apiStage = new APIStage();

routes.post('/', async (req, res) => {
  apiStage
    .get(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/create',  (req, res) => {
  apiStage
    .create(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

// routes.post('/lockUnlock',  (req, res) => {
//   apiStage
//     .lockUnlock(req)
//     .then((data) => {
//       res.status(200).send({ success: true, data: data });
//     })
//     .catch((e) => {
//       res.status(400).send({ success: false, error: e });
//     });
// });
// routes.post('/edit',  (req, res) => {
//   apiStage
//     .edit(req)
//     .then((data) => {
//       res.status(200).send({ success: true, data: data });
//     })
//     .catch((e) => {
//       res.status(400).send({ success: false, error: e });
//     });
// });

module.exports = routes

