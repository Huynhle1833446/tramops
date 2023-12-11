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
routes.post('/getByParams', async (req, res) => {
  apiTrip
    .getByParams(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/getTripByDriver', async (req, res) => {
  apiTrip
    .getTripByDriver(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data.listTrip, dataStage: data.listStage });
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

routes.post('/updateStatus',  (req, res) => {
  apiTrip
    .updateStatus(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/edit',  (req, res) => {
  apiTrip
    .edit(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/changeDriver',  (req, res) => {
  apiTrip
    .changeDriver(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

routes.post('/balance',  (req, res) => {
  apiTrip
    .balance(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});


routes.post('/customer/info',  (req, res) => {
  apiTrip
    .getCustomerInfoByTripId(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});
routes.post('/stop/location',  (req, res) => {
  apiTrip
    .stopLocation(req)
    .then((data) => {
      res.status(200).send({ success: true, data: data });
    })
    .catch((e) => {
      res.status(400).send({ success: false, error: e });
    });
});

module.exports = routes

