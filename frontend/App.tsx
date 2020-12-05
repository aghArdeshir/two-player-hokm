import { useEffect, useState } from "react";
import { GAME_EVENTS, IGameStateForUi } from "../common.typings";
import ChooseHokm from "./ChooseHokm";
import { GameStateContext } from "./GameStateContext";
import LoginPage from "./LoginPage";
import PickingPage from "./PickingPage";
import PlayerCards from "./PlayerCards";
import ShowHokm from "./ShowHokm";
import { socketService } from "./socket-service";

export default function App() {
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameState, setGameState] = useState<IGameStateForUi>(null);

  useEffect(() => {
    socketService.onConnected(() => setSocketConnected(true));
    socketService.on(GAME_EVENTS.GAME_STATE, setGameState);
  }, []);

  if (gameState)
    return (
      <GameStateContext.Provider value={gameState}>
        <PlayerCards />
        <ShowHokm />
        <PickingPage />
        <ChooseHokm />
      </GameStateContext.Provider>
    );
  if (socketConnected) return <LoginPage />;
  return <div>Waiting for server</div>;
}
