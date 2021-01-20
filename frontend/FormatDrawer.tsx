import { CARD_FORMAT } from "../common.typings";

export default function FormatDrawer(props: { format: CARD_FORMAT }) {
  let character: string;
  let color: "black" | "red";

  switch (props.format) {
    case CARD_FORMAT.SPADES:
      character = "♠";
      color = "black";
      break;
    case CARD_FORMAT.HEARTS:
      character = "♥";
      color = "red";
      break;
    case CARD_FORMAT.CLUBS:
      character = "♣";
      color = "black";
      break;
    case CARD_FORMAT.DIAMONDS:
      character = "♦";
      color = "red";
      break;
  }

  return (
    <h1
      style={{
        margin: 0,
      }}
    >
      {character}
    </h1>
  );
}
