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
          {htmlReactFiles.map((fileIdMap, index) => (
            <div key={fileIdMap.fileUri}>
              <FileUriEditRemove file={fileIdMap.fileUri} index={index} isHtmlReact={true} />
              <div>IDs: {fileIdMap.ids.join(", ")}</div>
              {index}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FileUriHolder;
