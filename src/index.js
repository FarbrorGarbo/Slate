import React from "react";
import ReactDOM from "react-dom";
// import { SlateView } from "./slateview";
import { SlateEditor } from "./slateeditor";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <SlateEditor
        readOnly={false}
        document={
          "<html><body><h3>Slate-lists table bug</h3><p>Select text in the table text and hit the 'Make list' button. The whole table becomes part of the new list instead of selected text inside the table cell</p><table><thead><td>Collumn 1</td><td>Collumn 2</td></thead><tr><td>Some text</td><td>Some text</td></tr></table></body></html>"
        }
        pageLoaded={() => {
          console.log("Page loaded");
        }}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
