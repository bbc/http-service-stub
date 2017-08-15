'use strict';

exports.createHandler = function(method) {
  return new Handler(method);
}

function Handler(method) {
  this.process = function(req, res) {
    return method.apply(this, [req, res]);
  }
}
