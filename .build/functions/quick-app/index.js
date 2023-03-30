'use strict';
const express = require('express');
const router = express.Router();
// const bodyParser = require('body-parser');

// router.use(bodyParser.json());
// router.use(bodyParser.urlencoded({ extended: true }));

require('./routers')(router);

module.exports = router;
