import { useEffect, useState } from "react";
import { GAME_EVENTS, IGameState } from "../common.typings";
import CenterMessage from "./CenterMessage";
import ChooseHokm from "./ChooseHokm";
import { useDeveloperOptions } from "./use-developer-options";
import GameFinishStater from "./GameFinishStater";
import { GameStateContext } from "./GameStateContext";
import LoginPage, { useBooleanState } from "./LoginPage";
import OtherPlayerCards from "./OtherPlayerCards";
import OtherPlayerInfo from "./OtherPlayerInfo";
import PickingPage from "./PickingPage";
import PlayerAction from "./PlayerAction";
import PlayerCards from "./PlayerCards";
import PlayerInfo from "./PlayerInfo";
import PlayingPage from "./PlayingPage";
import ShowHokm from "./ShowHokm";
import { socketService } from "./socket-service";
import GameTerminator from "./GameTerminator";

export default function App() {
  const [socketConnected, toggleSocketConnected] = useBooleanState(false);
  const [gameState, setGameState] = useState<IGameState | null>(null);

  useEffect(() => {
    socketService.onConnected(() => toggleSocketConnected());
    socketService.on(GAME_EVENTS.GAME_STATE, setGameState);
  }, [toggleSocketConnected]);

  useDeveloperOptions(gameState);

  if (gameState) {
    return (
      <div className="gameboard-container">
        <GameStateContext.Provider value={gameState}>
          <OtherPlayerCards />
          <GameTerminator />
          <OtherPlayerInfo />
          <ChooseHokm />
          <ShowHokm />
          <PickingPage />
          <PlayingPage />
          <GameFinishStater />
          <PlayerAction />
          <PlayerInfo />
          <PlayerCards />
        </GameStateContext.Provider>
      </div>
    );
  } else if (socketConnected) return <LoginPage />;
  else return <CenterMessage>Waiting for Server</CenterMessage>;
}
