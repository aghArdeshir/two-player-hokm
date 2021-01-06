import { useContext } from "react";
import {
  CARD_FORMAT,
  GAME_ACTION,
  IGameState,
  IGameStateForHokmChoosing,
} from "../common.typings";
import { GameStateContext } from "./GameStateContext";
import { socketService } from "./socket-service";

export function isChooseHokm(
  gameState: IGameState
): gameState is IGameStateForHokmChoosing {
  return gameState.nextAction === GAME_ACTION.CHOOSE_HOKM;
}

export default function ChooseHokm() {
  const gameContext = useContext(GameStateContext);

  // if (gameContext.NEXT_STEP !== GAME_EVENTS.CHOOSE_HOKM) return <></>;
  if (!isChooseHokm(gameContext)) return <></>;

  if (!gameContext.player.isHaakem)
    return <>Waiting for haakem to select hokm</>;

  return (
    <>
      You are haakem. Select your hokm:
      {[
        CARD_FORMAT.PIKES,
        CARD_FORMAT.HEARTS,
        CARD_FORMAT.CLOVERS,
        CARD_FORMAT.TILES,
      ].map((format) => (
        <button key={format} onClick={() => socketService.selectHokm(format)}>
          {format}
        </button>
      ))}
    </>
  );
}
