import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getVsCodeApi } from "../utils/vscodeApi";
import FileUriHolder from "./components/FileUriHolder";
import { FileIdMap } from "@/types/ElementTypes";
import NavBar from "./NavBar";

const App = () => {
  const vscode = getVsCodeApi();
  const [isServerRunning, setIsServerRunning] = useState();
  const [cssFiles, setCssFiles] = React.useState<string[]>([]);
  const [htmlReactFiles, setHtmlReactFiles] = React.useState<FileIdMap[]>([]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "serverStarted") {
        setIsServerRunning(message.value);
      } else if (message.command === "updateFileList") {
        console.log("Updating file list:", message.files);
        setCssFiles(message.files.css || []);
        setHtmlReactFiles(message.files.htmlReact || []);
      }
    };

    window.addEventListener("message", handleMessage);
    vscode.postMessage({ command: "requestServerStatus" });
    vscode.postMessage({ command: "getStoredFiles" });
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
  const removeFiles = () => {
    vscode.postMessage({ command: "removeFiles" });
  };
  return (
    <div className="tweakSyncContainer">
      <NavBar />
      <div className="parentContainer">
        <div className="container">
          <div className="optionButtonsHolder">
            <Button className="optionButton">Home</Button>
            <Button className="optionButton">Support</Button>
          </div>
          <div className="containerPanel">
            <div className="tweakSyncHomeOptions">
              <Button
                variant={"default"}
                className={`${
                  !isServerRunning
                    ? "startTweakSync min-w-40 hover:bg-green-500"
                    : "endTweakSync min-w-40 hover:bg-red-500"
                }`}
                onClick={() => {
                  vscode.postMessage({
                    command: "startTweakSync",
                    value: !isServerRunning ? true : false,
                  });
                }}
              >
                {!isServerRunning ? "Start TweakSync" : "End TweakSync"}
              </Button>
              <Button variant={"default"} className="tweakSyncButton" onClick={selectFiles}>
                Select Files
              </Button>
              <Button variant={"default"} className="tweakSyncButton" onClick={watchFiles}>
                Watch HTML Files
              </Button>
              <Button variant={"default"} className="tweakSyncButton" onClick={removeFiles}>
                Remove All Files
              </Button>
            </div>
            <FileUriHolder cssFiles={cssFiles} htmlReactFiles={htmlReactFiles} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
