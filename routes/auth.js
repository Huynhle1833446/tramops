const express = require('express');

const routes = express.Router();
const APIAuth = require ("../apis/auth.js");
const apiAuth = new APIAuth();

routes.post('/login', async (req, res) => {
  apiAuth
    .login(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.put('/change-password', async (req, res) => {
  apiAuth
    .changePassword(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});




module.exports = routes

