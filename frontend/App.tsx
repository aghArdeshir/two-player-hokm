import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import PickingPage from "./PickingPage";
import { socketService } from "./socket-service";

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socketService.onConnected(() => setSocketConnected(true));
    socketService.once("game-started", () => setGameStarted(true));
  }, []);

  if (gameStarted) return <PickingPage />;
  if (socketConnected) return <LoginPage />;
  return <div>Waiting for server</div>;
}
