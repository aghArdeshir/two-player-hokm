import { CARD_FORMAT } from "../common.typings";

export default function FormatDrawer(props: { format: CARD_FORMAT }) {
  let character: string;

  switch (props.format) {
    case CARD_FORMAT.SPADES:
      character = "♠";
      break;
    case CARD_FORMAT.HEARTS:
      character = "♥";
      break;
    case CARD_FORMAT.CLUBS:
      character = "♣";
      break;
    case CARD_FORMAT.DIAMONDS:
      character = "♦";
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
