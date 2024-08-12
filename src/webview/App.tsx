import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getVsCodeApi } from "../utils/vscodeApi";
const App = () => {
  const vscode = getVsCodeApi();
  const [isServerRunning, setIsServerRunning] = useState();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "serverStarted") {
        setIsServerRunning(message.value);
      }
    };

    // Add the event listener
    window.addEventListener("message", handleMessage);
    vscode.postMessage({ command: "requestServerStatus" });
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [vscode]);
  return (
    <>
      <div className="check">Hello from React in a Webview!</div>
      <Button
        className={`${!isServerRunning ? "startTweakSync" : "endTweakSync"}`}
        onClick={() => {
          vscode.postMessage({ command: "startTweakSync", value: !isServerRunning ? true : false });
        }}
      >
        {!isServerRunning ? "Start TweakSync" : "End TweakSync"}
      </Button>
    </>
  );
};
export default App;
