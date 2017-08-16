'use strict'

const Catalogue = require('./Catalogue');

var stubsCatalogue = new Catalogue();

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

exports.extractBodyFrom = extractBodyFrom;
exports.stub = stub;
exports.retrieveStubFor = retrieveStubFor;
exports.deleteAllStubs = deleteAllStubs;
exports.deleteStubsFor = deleteStubsFor;