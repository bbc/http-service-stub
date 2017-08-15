'use strict';

var server = require("./lib/server");

const PORT = (process.env.PORT || 8080);

server.listen(PORT, function(){
  console.log("Listening on port: " + PORT)
});
