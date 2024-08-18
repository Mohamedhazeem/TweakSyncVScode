import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getVsCodeApi } from "../utils/vscodeApi";
import FileUriHolder from "./components/FileUriHolder";
import { FileIdMap } from "@/types/ElementTypes";
import NavBar from "./NavBar";
import { StartIcon } from "./components/icons/StartIcon";
import { StopIcon } from "./components/icons/StopIcon";
import { SelectIcon } from "./components/icons/SelectIcon";
import { WatchAllIcon } from "./components/icons/WatchAllIcon";
import { RemoveAllIcon } from "./components/icons/RemoveAllIcon";

const App = () => {
  const vscode = getVsCodeApi();
  const [isServerRunning, setIsServerRunning] = useState();
  const [clickedOptionButton, setClickedOptionButton] = useState<number>(0);
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
            <div className="tweakSyncHomeOptions">
              <Button
                variant={"default"}
                className={`${
                  !isServerRunning
                    ? "startTweakSync hover:bg-[#00806bf6]"
                    : "endTweakSync  hover:bg-[#e44141f3]"
                }`}
                onClick={() => {
                  vscode.postMessage({
                    command: "startTweakSync",
                    value: !isServerRunning ? true : false,
                  });
                }}
              >
                {!isServerRunning ? (
                  <>
                    <StartIcon />
                    <span>Start</span>
                  </>
                ) : (
                  <>
                    <StopIcon />
                    <span>Stop</span>
                  </>
                )}
              </Button>
              <Button
                variant={"default"}
                className="tweakSyncButton selectFiles hover:bg-[#0055d4bf]"
                onClick={selectFiles}
              >
                <>
                  <SelectIcon />
                  <span>Files</span>
                </>
              </Button>
              <Button
                variant={"default"}
                className="tweakSyncButton watchAll hover:bg-[#e65c1ff5]"
                onClick={watchFiles}
              >
                <>
                  <WatchAllIcon />
                  <span>Watch All</span>
                </>
              </Button>
              <Button
                variant={"default"}
                className="tweakSyncButton removeAll hover:bg-[#c33c3cf3]"
                onClick={removeFiles}
              >
                <>
                  <RemoveAllIcon />
                  <span>Remove All</span>
                </>
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
