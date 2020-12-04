import { io, Socket } from "socket.io-client";

class SocketService {
  private connected = false;
  private socketConnection: Socket;

  constructor() {
    this.socketConnection = io("localhost:3000");

    this.socketConnection.on("connect", () => {
      this.connected = true;
      document.body.dispatchEvent(new Event("socket-connected"));
    });
  }

  onConnected(callback: () => void) {
    if (this.connected) callback();
    else this.once("socket-connected", callback);
  }

  private once(eventName: "socket-connected", listener: () => void) {
    function _listener() {
      listener();
      document.body.removeEventListener(eventName, _listener);
    }

    document.body.addEventListener(eventName, _listener);
  }

  registerUser(username: string) {
    this.socketConnection.emit("register", { register: username });
  }
}

export const socketService = new SocketService();
