import React, { memo } from "react";
import FileUriEditRemove from "./FileUriEditAndRemove";

type FileUriHolderType = {
  cssFiles: string[];
  htmlReactFiles: string[];
};

const FileUriHolder = memo(({ cssFiles, htmlReactFiles }: FileUriHolderType) => {
  return (
    <div className="FileUriHolder">
      <div className="css-container">
        <h3>CSS Files</h3>
        <div>
          {cssFiles.map((file, index) => (
            <div key={file}>
              <FileUriEditRemove file={file} index={index} />
              {index}
            </div>
          ))}
        </div>
      </div>
      <div className="html-react-container">
        <h3>HTML/React Files</h3>
        <div>
          {htmlReactFiles.map((file, index) => (
            <div key={file}>
              <FileUriEditRemove file={file} index={index} />
              {index}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
export default FileUriHolder;
