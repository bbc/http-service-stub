'use strict';

function PrepareResponse(input) {
  var httpCode = input[0];
  var headers = input[1];
  var body = input[2];

  switch(typeof(body)) {
    case 'string':
      break;
    case 'object':
      body = JSON.stringify(body);
      break;
  }

  return [httpCode, headers, body];

}

module.exports = PrepareResponse;
