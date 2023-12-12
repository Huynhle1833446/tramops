const express = require('express');

const routes = express.Router();
const APITicket = require ("../apis/ticket.js");
const apiTicket = new APITicket();

routes.post('/getById', async (req, res) => {
  apiTicket
    .getById(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/create',  (req, res) => {
  apiTicket
    .create(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/myself',  (req, res) => {
  apiTicket
    .myself(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/delete',  (req, res) => {
  apiTicket
    .delete(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

// routes.post('/lockUnlock',  (req, res) => {
//   apiTicket
//     .lockUnlock(req)
//     .then((data) => {
//       res.status(200).send({ success: true, data: data });
//     })
//     .catch((e) => {
//       res.status(400).send({ success: false, error: e });
//     });
// });
// routes.post('/edit',  (req, res) => {
//   apiTicket
//     .edit(req)
//     .then((data) => {
//       res.status(200).send({ success: true, data: data });
//     })
//     .catch((e) => {
//       res.status(400).send({ success: false, error: e });
//     });
// });

module.exports = routes

