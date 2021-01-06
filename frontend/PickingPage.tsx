// import { useContext } from "react";
// import { GAME_EVENTS } from "../common.typings";
// import Card from "./Card";
// import { GameStateContext } from "./GameStateContext";
// import { socketService } from "./socket-service";

export default function PickingPage() {
  // const gameState = useContext(GameStateContext);

  // if (gameState.NEXT_STEP !== GAME_EVENTS.PICK) return <></>;
  // if (
  //   gameState.NEXT_STEP === GAME_EVENTS.PICK &&
  //   gameState.turn !== gameState.player
  // ) {
  //   return <p>other player is picking cards</p>;
  // }

  return (
    <div>
      {/* <Card format={gameState.card.format} number={gameState.card.number} /> */}
      {/* <button onClick={() => socketService.pickCard(gameState.card)}>
        I want it
      </button> */}
      {/* <button onClick={() => socketService.refuseCard(gameState.card)}>
        I DON'T want it
      </button> */}
    </div>
  );
}
