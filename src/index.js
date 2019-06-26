import React from "react";
import ReactDOM from "react-dom";
import { SlateView } from "./slateview";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <SlateView
        readOnly={false}
        document={"<html><body><h3>Heading 3</h3></body></html>"}
        pageLoaded={() => {
          console.log("Page loaded");
        }}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
