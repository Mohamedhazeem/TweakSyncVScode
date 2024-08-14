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
    // ${isRemove ? "hide" : ""}
    <div key={`fileUriEditRemove${file}`} className={`FileUriEditRemoveContainer `}>
      <div>{formattedPath}</div>
      {isHtmlReact && <Button onClick={() => watchFile(file)}>watch</Button>}
      {/* <Button onClick={() => editFile(file)}>Edit</Button> */}
      <Button onClick={() => removeFile(file, index)}>Remove</Button>
    </div>
  );
}

export default FileUriEditRemove;
