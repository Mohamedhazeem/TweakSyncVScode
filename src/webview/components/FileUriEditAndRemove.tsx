import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { formatFilePath } from "../../utils/formatFilePath";
import { getVsCodeApi } from "../../utils/vscodeApi";

type FileUriEditRemoveType = {
  file: string;
  index: number;
  isHtmlReact?: boolean;
};
function FileUriEditRemove({ file, index, isHtmlReact = false }: FileUriEditRemoveType) {
  const formattedPath = formatFilePath(file);
  const vscode = getVsCodeApi();
  const watchFile = (file: string) => {
    vscode.postMessage({ command: "watchSingleFile", file });
  };
  // const editFile = (file: string) => {
  //   vscode.postMessage({ command: "editFile", oldFile: file });
  // };
  const removeFile = (file: string, index: number) => {
    if (file) {
      vscode.postMessage({ command: "removeSingleFile", file, index });
    } else {
      console.error("File URI is undefined or invalid.");
    }
  };
  return (
    <div key={`fileUriEditRemove${file}`} className={`fileUriEditRemove`}>
      <div className="fileUri">{formattedPath}</div>
      <div className="fileUriButtonHolder">
        {isHtmlReact && (
          <Button className="fileUriButton" onClick={() => watchFile(file)}>
            Watch
          </Button>
        )}
        {/* <Button onClick={() => editFile(file)}>Edit</Button> */}
        <Button className="fileUriButton" onClick={() => removeFile(file, index)}>
          Remove
        </Button>
      </div>
    </div>
  );
}

export default FileUriEditRemove;
