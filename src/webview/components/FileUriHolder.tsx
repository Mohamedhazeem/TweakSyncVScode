import React, { memo } from "react";
import FileUriEditRemove from "./FileUriEditAndRemove";
import { FileIdMap } from "@/types/ElementTypes";

type FileUriHolderType = {
  cssFiles: string[];
  htmlReactFiles: FileIdMap[];
};

const FileUriHolder = memo(({ cssFiles, htmlReactFiles = [] }: FileUriHolderType) => {
  return (
    <div className="FileUriHolder">
      <div className="html-react-container">
        <span className="htmlCssTitle">HTML Files</span>
        <div className="fileUriEditRemoveContainer">
          {htmlReactFiles.map((fileIdMap, index) => (
            <div key={fileIdMap.fileUri}>
              <FileUriEditRemove file={fileIdMap.fileUri} index={index} isHtmlReact={true} />
            </div>
          ))}
        </div>
      </div>
      <div className="css-container">
        <span className="htmlCssTitle">CSS Files</span>
        <div className="fileUriEditRemoveContainer">
          {cssFiles.map((file, index) => (
            <div key={file}>
              <FileUriEditRemove file={file} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FileUriHolder;
