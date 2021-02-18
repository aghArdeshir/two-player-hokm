import { CARD_FORMAT, ICard } from "../common.typings";

const CHARACTERS = {
  [CARD_FORMAT.SPADES]: [
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
  [CARD_FORMAT.HEARTS]: [
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

  [CARD_FORMAT.CLUBS]: [
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

  [CARD_FORMAT.DIAMONDS]: [
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
          props.card.format === CARD_FORMAT.HEARTS ||
          props.card.format === CARD_FORMAT.DIAMONDS
            ? "red"
            : "black",
        backgroundColor: "white",
        cursor: "default",
      }}
    >
      {CHARACTERS[props.card.format][props.card.number - 1]}
    </div>
  );
}
