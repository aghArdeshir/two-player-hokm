import { useEffect, useState } from "react";
import { GAME_EVENTS } from "../common.typings";
import LoginPage from "./LoginPage";
import PickingPage from "./PickingPage";
import { socketService } from "./socket-service";

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socketService.onConnected(() => setSocketConnected(true));
    socketService.once(GAME_EVENTS.GAME_STARTED, () => setGameStarted(true));
  }, []);

  if (gameStarted) return <PickingPage />;
  if (socketConnected) return <LoginPage />;
  return <div>Waiting for server</div>;
}
