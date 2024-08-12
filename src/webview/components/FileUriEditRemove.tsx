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
  const editFile = () => {
    vscode.postMessage({ command: "editFile", oldFile: file });
  };
  const removeFile = () => {
    vscode.postMessage({ command: "removeFile", file });
  };
  return (
    <div key={file} className="FileUriEditRemoveContainer">
      <div>{formattedPath}</div>
      <Button onClick={() => editFile()}>Edit</Button>
      <Button onClick={() => removeFile()}>Remove</Button>
    </div>
  );
}

export default FileUriEditRemove;
