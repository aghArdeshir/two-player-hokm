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

  if (!isChooseHokm(gameContext) || !gameContext.player.isHaakem) return <></>;

  return (
    <>
      {[
        CARD_FORMAT.SPADES,
        CARD_FORMAT.HEARTS,
        CARD_FORMAT.CLUBS,
        CARD_FORMAT.DIAMONDS,
      ].map((format) => (
        <button
          key={format}
          onClick={() => socketService.selectHokm(format)}
          className={"choose-hokm-button choose-hokm-" + format.toLowerCase()}
        >
          <FormatDrawer format={format} />
          <span style={{ width: 10 }}>{/* divider */}</span>
          {format}
        </button>
      ))}
    </>
  );
}
