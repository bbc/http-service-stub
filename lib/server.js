'use strict';

const http  = require('http');
const router = require('./router');
const Catalogue = require('./Catalogue');
const PrepareResponse = require('./PrepareResponse');

var stubsCatalogue = new Catalogue();
var logOfRequestsForNonStubbedURLS = {};

router.register('OPTIONS', '/', function(req, res) {
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

router.register('GET', '^\/(?!status\/?$)[\w\d\/\&\$\+\,\:\;\=\?\@\#\-\_]*', function(req, res) {
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

router.register('GET', '/favicon.ico', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'image/x-icon' });
  res.end();
})

router.register('GET', '/log', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'image/x-icon' });
  res.write(JSON.stringify(logOfRequestsForNonStubbedURLS[req.headers.host] || []));
  res.end();
})

router.register('GET', '/status', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end();
})

router.register('GET', '/', function(req, res) {
  res.writeHead(200);
  res.end();
})

router.register('PUT', '/status', function(req, res) {
  res.writeHead(403);
  res.end();
})

router.register('PUT', '^\/(?!status\/?$)[\w\d\/\&\$\+\,\:\;\=\?\@\#\-\_]*', function(req, res) {

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

router.register('DELETE', '/status', function(req, res) {
  res.writeHead(403);
  res.end();
})

router.register('DELETE', '/log', function(req, res) {
  res.writeHead(403);
  res.end();
})

router.register('DELETE', '^\/(?!status\/?$)[\w\d\/\&\$\+\,\:\;\=\?\@\#\-\_]*', function(req, res) {

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

router.register('DELETE', '/', function(req, res) {

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

const server = http.createServer(function (req, res) {
  router.route(req.method, req.url).process(req, res);
});

function extractBodyFrom(request) {
  return new Promise(function(resolve, reject) {
    var body = '';
    request.on('data', function(chunk) {
      body += chunk;
    });
    request.on('end', function() {
      resolve(body);
    });
  })
}

function stub(host, path) {
  return function(responseToStub) {
    stubsCatalogue.add(host, path, responseToStub);
  }
}

function retrieveStubFor(host, path) {
  return new Promise(function(resolve, reject) {
    var stub = stubsCatalogue.retrieve(host, path);
    if (stub) {
      resolve(stub);
    } else {
      reject(Error("Stub for " + path + " does not exist"))
    }
  })
}

function deleteAllStubs(host) {
  return new Promise(function(resolve, reject) {
    try {
      stubsCatalogue.empty(host)
      resolve();
    } catch(err) {
      reject(err);
    }
  })
}

function deleteStubsFor(host, path) {
  return new Promise(function(resolve, reject) {
    try {
      stubsCatalogue.delete(host, path)
      resolve()
    } catch(err) {
      reject(err);
    }
  })
}

function log(data) {
  console.log(typeof(data), data)
  return data;
}

module.exports = server;
