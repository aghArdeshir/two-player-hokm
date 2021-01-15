import { useContext } from "react";
import { createUseStyles } from "react-jss";
import {
  CARD_FORMAT,
  GAME_ACTION,
  IGameState,
  IGameStateForHokmChoosing,
} from "../common.typings";
import FormatDrawer from "./FormatDrawer";
import { GameStateContext } from "./GameStateContext";
import { socketService } from "./socket-service";

const useStyles = createUseStyles({
  hokmButton: {
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    width: 150,
    justifyContent: "start",
    cursor: "pointer",
    height: 50,

    "&:hover": {
      backgroundColor: "blue",
      width: 200,
    },

    "&:focus": {
      boxShadow: "2px 2px 5px green",
    },
  },
});

export function isChooseHokm(
  gameState: IGameState
): gameState is IGameStateForHokmChoosing {
  return gameState.nextAction === GAME_ACTION.CHOOSE_HOKM;
}

export default function ChooseHokm() {
  const classes = useStyles();
  const gameContext = useContext(GameStateContext);

  if (!isChooseHokm(gameContext)) return <></>;

  if (!gameContext.player.isHaakem)
    return (
      <div
        style={{
          position: "fixed",
          top: "calc(50% - 50px)",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        Waiting for Haakem to select Hokm
      </div>
    );

  return (
    <div
      style={{
        position: "fixed",
        top: "calc(50% - 50px)",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      Choose the Hokm:
      <div style={{ display: "flex", flexWrap: "wrap", width: 300 }}>
        {[
          CARD_FORMAT.SPADES,
          CARD_FORMAT.HEARTS,
          CARD_FORMAT.CLUBS,
          CARD_FORMAT.DIAMONDS,
        ].map((format) => (
          <button
            key={format}
            onClick={() => socketService.selectHokm(format)}
            className={classes.hokmButton}
          >
            <FormatDrawer format={format} />
            <span style={{ width: 10 }}>{/* divider */}</span>
            {format}
          </button>
        ))}
      </div>
    </div>
  );
}
