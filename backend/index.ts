import { createServer as createHttpServer } from "http";
import { Server as SocketServer } from "socket.io";

const http = createHttpServer();
http.on("listening", () => {
  console.log("backend listening on port 3000");
});

const socketServer = new SocketServer();
socketServer.attach(http);
socketServer.on("connect", () => {
  console.log("a user connected");
});

http.listen(3000);
