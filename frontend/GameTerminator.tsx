import { socketService } from "./socket-service";

export default function GameTerminator() {
  return (
    <button
      style={{
        position: "fixed",
        top: 5,
        right: 5,
      }}
      onClick={() => socketService.endGame()}
    >
      End Game
    </button>
  );
}
