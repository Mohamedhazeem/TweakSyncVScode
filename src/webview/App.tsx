import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getVsCodeApi } from "../utils/vscodeApi";
import FileUriEditRemove from "./components/FileUriEditRemove";

const App = () => {
  const vscode = getVsCodeApi();
  const [isServerRunning, setIsServerRunning] = useState();
  const [files, setFiles] = React.useState<string[]>([]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "serverStarted") {
        setIsServerRunning(message.value);
      } else if (message.command === "updateFileList") {
        setFiles(message.files);
      }
    };

    // Add the event listener
    window.addEventListener("message", handleMessage);
    vscode.postMessage({ command: "requestServerStatus" });
    vscode.postMessage({ command: "getStoredFiles" });
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [vscode]);

  const collectFiles = () => {
    vscode.postMessage({ command: "collectFiles" });
  };
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
      <Button onClick={collectFiles}>Collect Files</Button>
      <div className="FileUriHolder">
        {files.map((file) => (
          <FileUriEditRemove key={file} file={file} />
        ))}
      </div>
    </>
  );
};
export default App;
