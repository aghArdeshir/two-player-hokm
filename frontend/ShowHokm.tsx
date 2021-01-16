import { useContext } from "react";
import { isChooseHokm } from "./ChooseHokm";
import FormatDrawer from "./FormatDrawer";
import { GameStateContext } from "./GameStateContext";

export default function ShowHokm() {
  const gameContext = useContext(GameStateContext);

  if (isChooseHokm(gameContext)) return <></>;

  return (
    <div className="hokm">
      Hokm:
      <br />
      <FormatDrawer format={gameContext.hokm} />
    </div>
  );
}
