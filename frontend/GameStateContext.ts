import { createContext } from "react";
import { IGameState } from "../common.typings";

export const GameStateContext = createContext({} as IGameState);
