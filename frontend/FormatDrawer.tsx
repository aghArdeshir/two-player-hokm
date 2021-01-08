import { CARD_FORMAT, ICard } from "../common.typings";
//@ts-ignore
import deckAsPng from "./deck.png";

export default function FormatDrawer(props: { format: CARD_FORMAT }) {
  let height = -28;
  if (props.format === CARD_FORMAT.HEARTS) height = -252;
  if (props.format === CARD_FORMAT.CLUBS) height = -699;
  if (props.format === CARD_FORMAT.DIAMONDS) height = -475;

  return (
    <div
      style={{
        backgroundImage: `url(${deckAsPng})`,
        width: 26,
        height: 38,
        backgroundSize: 2000,
        display: "inline-block",
        backgroundPositionX: -222,
        backgroundPositionY: height,
      }}
    />
  );
}
