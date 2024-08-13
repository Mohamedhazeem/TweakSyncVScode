import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getVsCodeApi } from "../utils/vscodeApi";
import FileUriHolder from "./components/FileUriHolder";

const App = () => {
  const vscode = getVsCodeApi();
  const [isServerRunning, setIsServerRunning] = useState();
  const [cssFiles, setCssFiles] = React.useState<string[]>([]);
  const [htmlReactFiles, setHtmlReactFiles] = React.useState<string[]>([]);
  useEffect(() => {
    console.log("called-1");
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "serverStarted") {
        setIsServerRunning(message.value);
      } else if (message.command === "updateFileList") {
        console.log("Updating file list:", message.files);
        console.log("called-2");
        setCssFiles(message.files.css);
        setHtmlReactFiles(message.files.htmlReact);
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
  useEffect(() => {
    console.log("Files state updated:", cssFiles);
  }, [cssFiles]);
  const selectFiles = () => {
    vscode.postMessage({ command: "selectFiles" });
  };
  const watchFiles = () => {
    vscode.postMessage({ command: "watchFiles" });
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
      <Button onClick={selectFiles}>Select Files</Button>
      <Button onClick={watchFiles}>Watch Files</Button>
      <FileUriHolder cssFiles={cssFiles} htmlReactFiles={htmlReactFiles} />
    </>
  );
};
export default App;
