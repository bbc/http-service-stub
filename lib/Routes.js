function Routes(routes, defaultRoute) {
  this.routes = routes || [];
  this.defaultRoute = (defaultRoute || function() { return ["400", {}, ''] })
}

Routes.prototype.match = function(method, path) {
  var methodMap = this.routes[method] || {};
  var pathsForMethod = Object.keys(methodMap);
  var matchingPath = pathsForMethod.find(function(pathToMatch) {
    return path.match(RegExp(pathToMatch))
  })

  return (methodMap[matchingPath] || this.defaultRoute);
};

module.exports = Routes;
