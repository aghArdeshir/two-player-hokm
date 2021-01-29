import React from "react";
import { render } from "react-dom";
import App from "./App";

window.React = React;

document.body.onload = () => {
  render(<App />, document.body.querySelector("#root"));
};
