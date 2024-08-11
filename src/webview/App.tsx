import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
const App = () => {
  const vscode = acquireVsCodeApi();
  return (
    <>
      <div className="check">Hello from React in a Webview!</div>
      <Button
        className="initiateTweakSync"
        onClick={() => {
          vscode.postMessage({ command: "webviewToExtension", value: "Message from webview" });
        }}
      >
        Start TweakSync for VS Code
      </Button>
    </>
  );
};
export default App;
