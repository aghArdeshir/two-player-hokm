import { useContext } from "react";
import { isChooseHokm } from "./ChooseHokm";
import FormatDrawer from "./FormatDrawer";
import { GameStateContext } from "./GameStateContext";

export default function ShowHokm() {
  const gameState = useContext(GameStateContext);

  if (isChooseHokm(gameState)) return <></>;

  if (!gameState.hokm) return <></>;

  return (
    <div className="hokm">
      <span style={{ fontSize: 12 }}>Hokm:</span>
      <br />
      <div className="hokm-symbol">
        <FormatDrawer format={gameState.hokm} /> {gameState.hokm}
      </div>
    </div>
  );
}
