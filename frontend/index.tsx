import React from "react";
import { render } from "react-dom";
import App from "./App";

//@ts-ignore
window.React = React;

document.body.onload = () => {
  render(<App />, document.body.querySelector("#root"));
};
