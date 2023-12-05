const express = require('express');

const routes = express.Router();
const APIUser = require ("../apis/user.js");
const apiUser = new APIUser();

routes.post('/', async (req, res) => {
  apiUser
    .getAllUser(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/create',  (req, res) => {
  apiUser
    .createUser(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/lockUnlock',  (req, res) => {
  apiUser
    .lockUnlock(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/top',  (req, res) => {
  apiUser
    .top(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/edit',  (req, res) => {
  apiUser
    .edit(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});


module.exports = routes

