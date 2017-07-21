const http  = require('http');
const Catalogue = require('./Catalogue')
const PrepareResponse = require('./PrepareResponse');

const server = http.createServer(handleRequest);

var stubsCatalogue = new Catalogue();

var requestLog = [];

var defaultResponse = [ 404, { 'Content-Type': 'text/plain' }, '' ]

function handleRequest(request, response) {

  var host = request.headers.host;
  var path = request.url;

  switch(request.method) {

    case "OPTIONS":
      response.writeHead(200, {
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS'
      });
      response.end();
      break;

    case "GET":

      switch(true) {
        case /^\/?$/.test(request.url):
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.write("{}");
          response.end();
          break;
        case /^\/status\/?$/.test(request.url):
          response.writeHead(200);
          response.end();
          break;
        case /^\/log\/?$/.test(request.url):
          response.writeHead(200);
          response.write(JSON.stringify(requestLog));
          response.end();
          break;          
        case /^\/favicon\.ico$/.test(request.url):
          response.writeHead(200, { 'Content-Type': 'image/x-icon' });
          response.end();
          break;
        default:
          retrieveStubFor(host, path)
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
            response.writeHead(stub[0], stub[1] || {});
            if (stub[2]) { response.write(stub[2], 'utf-8') };
            response.end();
          })
          .catch(function(err) {
            requestLog.push(path);
            response.writeHead(404, { }, err.message );
            response.end();
          })
        }
      break;

    case "PUT":

      switch(true) {
        case /^\/status\/?$/.test(path):
          response.writeHead(403);
          response.end();
          break;
        default:
          extractBodyFrom(request)
          .then(function(result){
            return result;
          })
          .then(JSON.parse)
          .then(stub(host, path))
          .then(function() {
            response.writeHead(201, { 'Access-Control-Allow-Origin' : '*' });
            response.end();
          }).catch(function(err) {
            response.writeHead(400);
            response.end();
          })
        }
        break;

    case "DELETE":
      switch(true) {
        case /^\/status\/?$/.test(request.url):
          response.writeHead(403);
          response.end();
          break;
        case /^\/$/.test(request.url):
          deleteAllStubs().then(function() {
            response.writeHead(200);
            response.end();
          }).catch(function(err) {
            response.writeHead(500);
            response.end();
          })
          break;
        default:
          deleteStubsFor(host, path).then(function() {
            response.writeHead(200);
            response.end();
          }).catch(function(err) {
            response.writeHead(500);
            response.end();
          })
      break;
    }

  }

}

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

function deleteAllStubs() {
  return new Promise(function(resolve, reject) {
    try {
      stubsCatalogue.empty()
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
