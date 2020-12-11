import { useContext } from "react";
import { formats, GAME_EVENTS } from "../common.typings";
import { GameStateContext } from "./GameStateContext";
import { socketService } from "./socket-service";

export default function ChooseHokm() {
  const gameContext = useContext(GameStateContext);

  if (gameContext.NEXT_STEP !== GAME_EVENTS.CHOOSE_HOKM) return <></>;
  if (gameContext.hokm) return <></>;

  if (!gameContext.isHaakem) return <>Waiting for haakem to select hokm</>;

  return (
    <>
      You are haakem. Select your hokm:
      {formats.map((format) => (
        <button key={format} onClick={() => socketService.selectHokm(format)}>
          {format}
        </button>
      ))}
    </>
  );
}
