const http  = require('http');

const server = http.createServer(handleRequest);

var excludedURLS = ['/', '/log', '/favicon.ico'];

var requestLog;

var stubsCatalogue = { "/favicon.ico": [ 200, { 'Content-Type': 'image/x-icon' }, '' ] }

var defaultResponse = [ 404, { 'Content-Type': 'text/plain' }, '' ]

function handleRequest(request, response) {

  var path = request.url;

  var respond = (function(response) {   

    return function respond(triple) {
      response.writeHead(parseInt(triple[0]), triple[1]);
      response.write(JSON.stringify(triple[2]), 'utf-8')
      response.end();     
    } 

  })(response);

  switch(request.method) {

    case "GET":
      retrieveStubFor(path)
      .then(function(res) {
        response.writeHead(res.status, res.headers || {});
        if (res.body) { response.write(res.body, 'utf-8') };
        response.end();   
      })
      .catch(function(err) {
        response.writeHead(404, { });
        response.end();    
      })
      break;
    case "PUT":
      extractBodyFrom(request)
      .then(JSON.parse)
      .then(stub(path))
      .then(function() {
        response.writeHead(201);
        response.end();    
      }).catch(function() {
        response.writeHead(400);
        response.end();        
      })
      break;
    case "DELETE":
      deleteStubsFor(path).then(function() {
        response.writeHead(200);
        response.end();     
      })  
      break;  

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
    return (function(response) {
      stubsCatalogue[path] = stubsCatalogue[path];
      stubsCatalogue[path] = response;
    });
  }

  function retrieveStubFor(path) {
    stubsCatalogue[path] = stubsCatalogue[path];
    return new Promise(function(resolve, reject) {
      var stub;
      try {
        stub = stubsCatalogue[path];
        if (!stub) { throw Error('Stub for the path ' + path + ' does not exist') }
      } catch(err) {
        reject(err);
      }
      resolve({ status: parseInt(stub[0]), headers: stub[1], body: stub[2] });
    })

  }

  function deleteStubsFor(path) {
    return new Promise(function(resolve, reject) {
      if (path != '/') {
        try {
          stubsCatalogue[path] = null;
          resolve()      
        } catch(err) {
          reject(err);
        }
      } else {
        try {
          Object.keys(stubsCatalogue).forEach(function(path) {
            stubsCatalogue[path] = null; 
          })
          resolve()
        } catch(err) {
          reject(err);
        }
      }
    })

  }

}

module.exports = server;