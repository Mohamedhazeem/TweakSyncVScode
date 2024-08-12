import React from "react";
import { Button } from "../../components/ui/button";
import { formatFilePath } from "../../utils/formatFilePath";
import { getVsCodeApi } from "../../utils/vscodeApi";

type FileUriEditRemoveType = {
  file: string;
};
function FileUriEditRemove({ file }: FileUriEditRemoveType) {
  const formattedPath = formatFilePath(file);
  const vscode = getVsCodeApi();
  const editFile = (file: string) => {
    vscode.postMessage({ command: "editFile", oldFile: file });
  };
  const removeFile = (file: string) => {
    if (file) {
      vscode.postMessage({ command: "removeFile", file });
    } else {
      console.error("File URI is undefined or invalid.");
    }
  };
  return (
    <div key={file} className="FileUriEditRemoveContainer">
      <div>{formattedPath}</div>
      <Button onClick={() => editFile(file)}>Edit</Button>
      <Button onClick={() => removeFile(file)}>Remove</Button>
    </div>
  );
}

export default FileUriEditRemove;
