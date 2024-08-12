import React from "react";
import FileUriEditRemove from "./FileUriEditAndRemove";

type FileUriHolderType = {
  files: string[];
};
function FileUriHolder({ files }: FileUriHolderType) {
  const cssFiles = files.filter((file) => file.endsWith(".css"));
  const htmlReactFiles = files.filter((file) =>
    [".html", ".jsx", ".tsx"].some((ext) => file.endsWith(ext))
  );
  return (
    <div className="FileUriHolder">
      <div className="css-container">
        <h3>CSS Files</h3>
        <ul>
          {cssFiles.map((file) => (
            <FileUriEditRemove key={file} file={file} />
          ))}
        </ul>
      </div>
      <div className="html-react-container">
        <h3>HTML/React Files</h3>
        <ul>
          {htmlReactFiles.map((file) => (
            <FileUriEditRemove key={file} file={file} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FileUriHolder;
