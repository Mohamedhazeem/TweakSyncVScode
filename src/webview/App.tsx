import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getVsCodeApi } from "../utils/vscodeApi";
import { FileIdMap } from "../types/ElementTypes";
import NavBar from "./NavBar";
import { HomePage } from "./HomePage";
import SupportPage from "./SupportPage";

const App = () => {
  const vscode = getVsCodeApi();
  const [isServerRunning, setIsServerRunning] = useState();
  const [isServerConnected, setIsServerConnected] = useState();
  const [clickedOptionButton, setClickedOptionButton] = useState<number>(0);
  const [cssFiles, setCssFiles] = React.useState<string[]>([]);
  const [htmlReactFiles, setHtmlReactFiles] = React.useState<FileIdMap[]>([]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "serverStarted") {
        setIsServerRunning(message.value);
      }
      if (message.command === "serverConnected") {
        setIsServerConnected(message.value);
      }
      if (message.command === "updateFileList") {
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
  const selectCssFiles = () => {
    vscode.postMessage({ command: "selectCssFile" });
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
            <Button
              className={`${
                clickedOptionButton === 0
                  ? "optionButtonSelected hover:bg-[#fffffffc]"
                  : "optionButtonNormal hover:bg-[#ffffff66]"
              }`}
              onClick={() => setClickedOptionButton(0)}
            >
              Home
            </Button>
            <Button
              className={`${
                clickedOptionButton === 1
                  ? "optionButtonSelected hover:bg-[#fffffffc]"
                  : "optionButtonNormal hover:bg-[#ffffff66]"
              }`}
              onClick={() => setClickedOptionButton(1)}
            >
              Support
            </Button>
          </div>
          <div className="containerPanel">
            {clickedOptionButton === 0 && (
              <HomePage
                isServerRunning={isServerRunning}
                vscode={vscode}
                selectFiles={selectFiles}
                selectCssFiles={selectCssFiles}
                watchFiles={watchFiles}
                removeFiles={removeFiles}
                cssFiles={cssFiles}
                htmlReactFiles={htmlReactFiles}
                isServerConnected={isServerConnected}
              />
            )}
            {clickedOptionButton === 1 && <SupportPage />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
