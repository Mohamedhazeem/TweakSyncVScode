import { Button } from "../components/ui/button";
import React from "react";
import { StartIcon } from "./components/icons/StartIcon";
import { StopIcon } from "./components/icons/StopIcon";
import { SelectIcon } from "./components/icons/SelectIcon";
import { WatchAllIcon } from "./components/icons/WatchAllIcon";
import { RemoveAllIcon } from "./components/icons/RemoveAllIcon";
import FileUriHolder from "./components/FileUriHolder";
import { FileIdMap } from "../types/ElementTypes";
import { Spinner } from "../components/ui/spinner";
import { TickIcon } from "./components/icons/TickIcon";

type HomePageType = {
  isServerRunning: undefined;
  vscode: VsCodeApi;
  selectFiles: () => void;
  selectCssFiles: () => void;
  watchFiles: () => void;
  removeFiles: () => void;
  cssFiles: string[];
  htmlReactFiles: FileIdMap[];
  isServerConnected: undefined;
};
export function HomePage({
  isServerRunning,
  vscode,
  selectFiles,
  selectCssFiles,
  watchFiles,
  removeFiles,
  cssFiles,
  htmlReactFiles,
  isServerConnected,
}: HomePageType) {
  return (
    <>
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
            <span>HTML Files</span>
          </>
        </Button>
        <Button
          variant={"default"}
          className="tweakSyncButton selectFiles hover:bg-[#0055d4bf]"
          onClick={selectCssFiles}
        >
          <>
            <SelectIcon />
            <span>CSS File</span>
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
      <div className="serverConnectionInfo">
        {isServerRunning ? (
          isServerConnected ? (
            <div className="flex items-center">
              <TickIcon />
              <span className="ml-1">Connected</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Spinner className="text-red-500" size="small" />
              <span className="ml-1">Waiting for connection...</span>
            </div>
          )
        ) : (
          ""
        )}
      </div>
      <FileUriHolder cssFiles={cssFiles} htmlReactFiles={htmlReactFiles} />;
    </>
  );
}
