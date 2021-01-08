import { CARD_FORMAT, ICard } from "../common.typings";
//@ts-ignore
import deckAsPng from "./deck.png";

export default function CardDrawer(props: { card: ICard }) {
  let height = -9;
  if (props.card.format === CARD_FORMAT.HEARTS) height = -204;
  if (props.card.format === CARD_FORMAT.CLOVERS) height = -595;
  if (props.card.format === CARD_FORMAT.TILES) height = -399;

  return (
    <div
      style={{
        backgroundImage: `url(${deckAsPng})`,
        width: 126,
        height: 188,
        backgroundSize: "1387%",
        display: "inline-block",
        backgroundPositionX: -7 + (props.card.number - 1) * -134,
        backgroundPositionY: height,
      }}
    />
  );
}
