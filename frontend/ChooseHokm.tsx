import { useContext } from "react";
import {
  CARD_SYMBOL,
  GAME_ACTION,
  IGameState,
  IGameStateForHokmChoosing,
} from "../common.typings";
import SymbolDrawer from "./SymbolDrawer";
import { GameStateContext } from "./GameStateContext";
import { socketService } from "./socket-service";

export function isChooseHokm(
  gameState: IGameState
): gameState is IGameStateForHokmChoosing {
  return gameState.nextAction === GAME_ACTION.CHOOSE_HOKM;
}

export default function ChooseHokm() {
  const gameState = useContext(GameStateContext);

  if (!isChooseHokm(gameState) || !gameState.player.isHaakem) return <></>;

  return (
    <>
      {[
        CARD_SYMBOL.SPADES,
        CARD_SYMBOL.HEARTS,
        CARD_SYMBOL.CLUBS,
        CARD_SYMBOL.DIAMONDS,
      ].map((symbol) => (
        <button
          key={symbol}
          onClick={() => socketService.selectHokm(symbol)}
          className={"choose-hokm-button choose-hokm-" + symbol.toLowerCase()}
        >
          <SymbolDrawer symbol={symbol} />
          <span style={{ width: 10 }}>{/* divider */}</span>
          {symbol}
        </button>
      ))}
    </>
  );
}
