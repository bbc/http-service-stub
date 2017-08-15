'use strict';

const handlerFactory = require('./handler');
const parser = require('url');
var handlers = {
  "HEAD": {},
  "GET" : {},
  "PUT" : {},
  "POST": {},
  "DELETE": {},
  "OPTIONS": {},
  "PATCH": {}
};

exports.clear = function() {
  handlers = {
    "HEAD": {},
    "GET" : {},
    "PUT" : {},
    "POST": {},
    "DELETE": {},
    "OPTIONS": {},
    "PATCH": {}
  }
}

exports.register = function(httpRequestMethod, urlMatcher, handler) {
  handlers[httpRequestMethod][urlMatcher] = handlerFactory.createHandler(handler);
}

exports.route = function(httpRequestMethod, url) {
  var url = parser.parse(url, true);
  handlers[httpRequestMethod]

  return handlers[httpRequestMethod][url.pathname] ||
  findByMatchingRegex(handlers[httpRequestMethod], url.pathname) ||
  this.missing(httpRequestMethod, url);

  function findByMatchingRegex(potentialMatches, pathname) {
    var match = Object.keys(potentialMatches).find(function(potentialMatch) {
      return (new RegExp(potentialMatch)).test(pathname);
    })
    return potentialMatches[match];
  }
}

exports.missing = function(httpRequestMethod, url) {
  return handlerFactory.createHandler(function(req, res) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write("No route registered for a " + httpRequestMethod + " request on " + url.pathname);
    res.end();
  });  
}
