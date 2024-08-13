import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { formatFilePath } from "../../utils/formatFilePath";
import { getVsCodeApi } from "../../utils/vscodeApi";

type FileUriEditRemoveType = {
  file: string;
  index: number;
};
function FileUriEditRemove({ file, index }: FileUriEditRemoveType) {
  const [isRemove, setRemove] = useState<boolean>();
  const formattedPath = formatFilePath(file);
  const vscode = getVsCodeApi();
  const editFile = (file: string) => {
    vscode.postMessage({ command: "editFile", oldFile: file });
  };
  const removeFile = (file: string, index: number) => {
    if (file) {
      vscode.postMessage({ command: "removeFile", file, index });
    } else {
      console.error("File URI is undefined or invalid.");
    }
  };
  return (
    // ${isRemove ? "hide" : ""}
    <div key={`fileUriEditRemove${file}`} className={`FileUriEditRemoveContainer `}>
      <div>{formattedPath}</div>
      <Button onClick={() => editFile(file)}>Edit</Button>
      <Button onClick={() => removeFile(file, index)}>Remove</Button>
    </div>
  );
}

export default FileUriEditRemove;
