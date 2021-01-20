import { useContext } from "react";
import { isChooseHokm } from "./ChooseHokm";
import FormatDrawer from "./FormatDrawer";
import { GameStateContext } from "./GameStateContext";

export default function ShowHokm() {
  const gameContext = useContext(GameStateContext);

  if (isChooseHokm(gameContext)) return <></>;

  return (
    <div className="hokm">
      <span style={{ fontSize: 12 }}>Hokm:</span>
      <br />
      <div className="hokm-symbol">
        <FormatDrawer format={gameContext.hokm} /> {gameContext.hokm}
      </div>
    </div>
  );
}
