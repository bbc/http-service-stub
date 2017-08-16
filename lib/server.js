'use strict';

const http  = require('http');
const router = require('./routes');

const server = http.createServer(function (req, res) {
  router.route(req.method, req.url).process(req, res);
});

module.exports = server;
