import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import LoginPage from "./LoginPage";

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  useEffect(() => {
    const socketConnection = io("localhost:3000");

    socketConnection.on("connect", () => {
      setSocketConnected(true);
    });
  }, []);

  if (socketConnected) return <LoginPage />;

  return <div>Waiting for server</div>;
}
