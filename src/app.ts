import { reportingController } from "./server";
import * as express from 'express'

// import server from "./servet";

let port = 3000

 let server = express();

server.get('/reporting', reportingController)
server.get('*', function (req, res) {
  res.sendStatus(404);
  res.end()
});
server.listen(port, function () {
  console.log('Server running on port %d', port);
});

export default server
