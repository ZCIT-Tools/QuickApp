'use strict';
const express = require('express');
const router = express.Router();

require('./routers')(router);

module.exports = router;
