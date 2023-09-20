const express = require('express');

const routes = express.Router();
const APILocation = require ("../apis/location.js");
const apiLocation = new APILocation();

routes.post('/', async (req, res) => {
  apiLocation
    .get(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/create',  (req, res) => {
  apiLocation
    .create(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/lockUnlock',  (req, res) => {
  apiLocation
    .lockUnlock(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

module.exports = routes

