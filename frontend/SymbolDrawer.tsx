import { CARD_SYMBOL } from "../common.typings";

export default function SymbolDrawer(props: { symbol: CARD_SYMBOL }) {
  let character: string;

  switch (props.symbol) {
    case CARD_SYMBOL.SPADES:
      character = "♠";
      break;
    case CARD_SYMBOL.HEARTS:
      character = "♥";
      break;
    case CARD_SYMBOL.CLUBS:
      character = "♣";
      break;
    case CARD_SYMBOL.DIAMONDS:
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
