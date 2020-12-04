import { useEffect, useState } from "react";
import { GAME_EVENTS, IGameStateForUi } from "../common.typings";
import { GameStateContext } from "./GameStateContext";
import LoginPage from "./LoginPage";
import PickingPage from "./PickingPage";
import PlayerCards from "./PlayerCards";
import { socketService } from "./socket-service";

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameState, setGameState] = useState<IGameStateForUi>(null);

  console.log(222, gameState);

  useEffect(() => {
    socketService.onConnected(() => setSocketConnected(true));
    socketService.on(GAME_EVENTS.GAME_STATE, setGameState);
  }, []);

  if (gameState)
    return (
      <GameStateContext.Provider value={gameState}>
        <PickingPage />
        <PlayerCards />
      </GameStateContext.Provider>
    );
  if (socketConnected) return <LoginPage />;
  return <div>Waiting for server</div>;
}
