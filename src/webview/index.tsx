import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./styles/index.css";
const App = () => {
  return <div className="check">Hello from React in a Webview!</div>;
};

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
