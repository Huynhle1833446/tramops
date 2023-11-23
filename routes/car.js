const express = require('express');

const routes = express.Router();
const APICar = require ("../apis/car.js");
const apiCar = new APICar();

routes.post('/', async (req, res) => {
  apiCar
    .getCar(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/create',  (req, res) => {
  apiCar
    .createCar(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/lockUnlock',  (req, res) => {
  apiCar
    .lockUnlock(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/listToAssign',  (req, res) => {
  apiCar
    .getListCarToAssign(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/assignCar',  (req, res) => {
  apiCar
    .assign(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/edit',  (req, res) => {
  apiCar
    .edit(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

module.exports = routes

