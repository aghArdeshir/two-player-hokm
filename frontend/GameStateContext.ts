import { createContext } from "react";
import { IGameStateForUi } from "../common.typings";

export const GameStateContext = createContext({} as IGameStateForUi);
