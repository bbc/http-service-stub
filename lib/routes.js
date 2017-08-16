'use strict';

const routes = require('./router');

const extractBodyFrom = require('./stubPromises').extractBodyFrom;
const stub = require('./stubPromises').stub;
const retrieveStubFor = require('./stubPromises').retrieveStubFor;
const deleteAllStubs = require('./stubPromises').deleteAllStubs;
const deleteStubsFor = require('./stubPromises').deleteStubsFor;
const Catalogue = require('./Catalogue');
const PrepareResponse = require('./PrepareResponse');

var stubsCatalogue = new Catalogue();
var logOfRequestsForNonStubbedURLS = {};

routes.register('OPTIONS', '/', function(req, res) {
  var isRequestFromBBC = (function(host) {
    return (host.split('.').slice(-3).join('.') == "bbc.co.uk");
  })(req.headers.host);

  var headers = isRequestFromBBC ? {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
  } : {};

  res.writeHead(200, headers);
  res.end();
})

routes.register('GET', '^\/(?!status\/?$)[\w\d\/\&\$\+\,\:\;\=\?\@\#\-\_]*', function(req, res) {
  retrieveStubFor(req.headers.host, req.url)
  .then(function(stub) {
    return new Promise(function(resolve, reject) {
      try {
        resolve(PrepareResponse(stub))
      } catch(err) {
        reject(err);
      }
    })
  })
  .then(function(stub) {
    res.writeHead(stub[0], stub[1] || {});
    if (stub[2]) { res.write(stub[2], 'utf-8') };
    res.end();
  })
  .catch(function(err) {
    logOfRequestsForNonStubbedURLS[req.headers.host] = logOfRequestsForNonStubbedURLS[req.headers.host] || [];
    logOfRequestsForNonStubbedURLS[req.headers.host].push(req.url);
    res.writeHead(404, { }, err.message );
    res.end();
  })
})

routes.register('GET', '/favicon.ico', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'image/x-icon' });
  res.end();
})

routes.register('GET', '/log', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'image/x-icon' });
  res.write(JSON.stringify(logOfRequestsForNonStubbedURLS[req.headers.host] || []));
  res.end();
})

routes.register('GET', '/status', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end();
})

routes.register('GET', '/', function(req, res) {
  res.writeHead(200);
  res.end();
})

routes.register('PUT', '/status', function(req, res) {
  res.writeHead(403);
  res.end();
})

routes.register('PUT', '^\/(?!status\/?$)[\w\d\/\&\$\+\,\:\;\=\?\@\#\-\_]*', function(req, res) {

  var isRequestFromBBC = (function(host) {
    return (host.split('.').slice(-3).join('.') == "bbc.co.uk");
  })(req.headers.host);

  var headers = isRequestFromBBC ? {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
  } : {};

  extractBodyFrom(req)
  .then(function(result){
    return result;
  })
  .then(JSON.parse)
  .then(stub(req.headers.host, req.url))
  .then(function() {
    res.writeHead(201, headers);
    res.end();
  }).catch(function(err) {
    res.writeHead(400);
    res.write(err.message);
    res.end();
  })
})

routes.register('DELETE', '/status', function(req, res) {
  res.writeHead(403);
  res.end();
})

routes.register('DELETE', '/log', function(req, res) {
  res.writeHead(403);
  res.end();
})

routes.register('DELETE', '^\/(?!status\/?$)[\w\d\/\&\$\+\,\:\;\=\?\@\#\-\_]*', function(req, res) {

  var isRequestFromBBC = (function(host) {
    return (host.split('.').slice(-3).join('.') == "bbc.co.uk");
  })(req.headers.host);

  var headers = isRequestFromBBC ? {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
  } : {};

  logOfRequestsForNonStubbedURLS[req.headers.host] = [];

  deleteStubsFor(req.headers.host, req.url).then(function() {
    res.writeHead(200, headers);
    res.end();
  }).catch(function(err) {
    res.writeHead(500);
    res.end();
  })

})

routes.register('DELETE', '/', function(req, res) {

  var isRequestFromBBC = (function(host) {
    return (host.split('.').slice(-3).join('.') == "bbc.co.uk");
  })(req.headers.host);

  var headers = isRequestFromBBC ? {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS'
  } : {};

  logOfRequestsForNonStubbedURLS[req.headers.host] = [];

  deleteAllStubs(req.headers.host).then(function() {
    res.writeHead(200, headers);
    res.end();
  }).catch(function(err) {
    res.writeHead(500);
    res.end();
  })
})

module.exports = routes;

