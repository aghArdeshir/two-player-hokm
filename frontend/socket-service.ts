import { io, Socket } from "socket.io-client";

class SocketService {
  private connected = false;
  private socketConnection: Socket;

  constructor() {
    this.socketConnection = io("localhost:3000");

    this.socketConnection.on("connect", () => {
      this.connected = true;
      this.setupListeners();
      document.body.dispatchEvent(new CustomEvent("socket-connected"));
    });
  }

  onConnected(callback: () => void) {
    if (this.connected) callback();
    else this.once("socket-connected", callback);
  }

  once(eventName: "socket-connected" | "game-started", listener: () => void) {
    function _listener() {
      listener();
      document.body.removeEventListener(eventName, _listener);
    }

    document.body.addEventListener(eventName, _listener);
  }

  registerUser(username: string) {
    this.socketConnection.emit("register", { register: username });
  }

  setupListeners() {
    this.socketConnection.on("error", console.error);
    this.socketConnection.on("game-started", () =>
      document.body.dispatchEvent(new CustomEvent("game-started"))
    );
  }
}

export const socketService = new SocketService();
