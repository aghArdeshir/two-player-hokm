import { CARD_SYMBOL, ICard } from "../common.typings";

const CHARACTERS = {
  [CARD_SYMBOL.SPADES]: [
    "🂡",
    "🂢",
    "🂣",
    "🂤",
    "🂥",
    "🂦",
    "🂧",
    "🂨",
    "🂩",
    "🂪",
    "🂫",
    "🂭",
    "🂮",
  ],
  [CARD_SYMBOL.HEARTS]: [
    "🂱",
    "🂲",
    "🂳",
    "🂴",
    "🂵",
    "🂶",
    "🂷",
    "🂸",
    "🂹",
    "🂺",
    "🂻",
    "🂽",
    "🂾",
  ],

  [CARD_SYMBOL.CLUBS]: [
    "🃑",
    "🃒",
    "🃓",
    "🃔",
    "🃕",
    "🃖",
    "🃗",
    "🃘",
    "🃙",
    "🃚",
    "🃛",
    "🃝",
    "🃞",
  ],

  [CARD_SYMBOL.DIAMONDS]: [
    "🃁",
    "🃂",
    "🃃",
    "🃄",
    "🃅",
    "🃆",
    "🃇",
    "🃈",
    "🃉",
    "🃊",
    "🃋",
    "🃍",
    "🃎",
  ],
};
export default function CardDrawer(props: { card: ICard }) {
  return (
    <div
      style={{
        fontSize: 100,
        color:
          props.card.symbol === CARD_SYMBOL.HEARTS ||
          props.card.symbol === CARD_SYMBOL.DIAMONDS
            ? "red"
            : "black",
        backgroundColor: "white",
        cursor: "default",
      }}
    >
      {CHARACTERS[props.card.symbol][props.card.number - 1]}
    </div>
  );
}
