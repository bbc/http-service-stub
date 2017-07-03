const http  = require('http');
const Routes = require('./lib/Routes.js')
const Catalogue = require('./lib/Catalogue.js')
const PrepareResponse = require('./lib/PrepareResponse.js');

const server = http.createServer(handleRequest);

var stubsCatalogue = new Catalogue();

var requestLog = [];

var defaultResponse = [ 404, { 'Content-Type': 'text/plain' }, '' ]

function handleRequest(request, response) {

  var path = request.url;

  switch(request.method) {

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
          retrieveStubFor(path)
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
          .then(stub(path))
          .then(function() {
            response.writeHead(201);
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
          deleteStubsFor(path).then(function() {
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

function stub(path) {
  return function(responseToStub) {
    stubsCatalogue.add(path, responseToStub);
  }
}

function retrieveStubFor(path) {
  return new Promise(function(resolve, reject) {
    var stub = stubsCatalogue.retrieve(path);
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

function deleteStubsFor(path) {
  return new Promise(function(resolve, reject) {
    try {
      stubsCatalogue.delete(path)
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
