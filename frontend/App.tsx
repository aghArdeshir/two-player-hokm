import { useEffect, useState } from "react";
import { GAME_EVENTS, IGameState } from "../common.typings";
import ChooseHokm from "./ChooseHokm";
import { GameStateContext } from "./GameStateContext";
import LoginPage, { useBooleanState } from "./LoginPage";
import PickingPage from "./PickingPage";
import PlayerCards from "./PlayerCards";
import ShowHokm from "./ShowHokm";
import { socketService } from "./socket-service";

export default function App() {
  const [socketConnected, toggleSocketConnected] = useBooleanState(false);
  const [gameState, setGameState] = useState<IGameState | null>(null);

  useEffect(() => {
    socketService.onConnected(() => toggleSocketConnected());
    socketService.on(GAME_EVENTS.GAME_STATE, setGameState);
  }, []);

  if (gameState) {
    return (
      <GameStateContext.Provider value={gameState}>
        <PlayerCards />
        <ShowHokm />
        <PickingPage />
        <ChooseHokm />
      </GameStateContext.Provider>
    );
  } else if (socketConnected) return <LoginPage />;
  else return <div>Waiting for server</div>;
}
