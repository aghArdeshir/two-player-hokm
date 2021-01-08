import { useContext } from "react";
import {
  CARD_FORMAT,
  GAME_ACTION,
  IGameState,
  IGameStateForHokmChoosing,
} from "../common.typings";
import FormatDrawer from "./FormatDrawer";
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
      You are haakem. Select the hokm:
      {[
        CARD_FORMAT.SPADES,
        CARD_FORMAT.HEARTS,
        CARD_FORMAT.CLUBS,
        CARD_FORMAT.DIAMONDS,
      ].map((format) => (
        <button
          key={format}
          onClick={() => socketService.selectHokm(format)}
          style={{
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            width: 150,
            justifyContent: "start",
            border: "1px solid green",
            margin: 10,
            boxShadow: "2px 2px 5px green",
            height: 50,
          }}
        >
          <FormatDrawer format={format} />
          <span style={{ width: 10 }}>{/* divider */}</span>
          {format}
        </button>
      ))}
    </>
  );
}
