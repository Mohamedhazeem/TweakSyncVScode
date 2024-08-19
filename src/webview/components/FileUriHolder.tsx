import React, { memo } from "react";
import FileUriEditRemove from "./FileUriEditAndRemove";
import { FileIdMap } from "@/types/ElementTypes";
import { SelectIcon } from "./icons/SelectIcon";

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
          {htmlReactFiles?.length > 0 ? (
            htmlReactFiles.map((fileIdMap, index) => (
              <div key={fileIdMap.fileUri}>
                <FileUriEditRemove file={fileIdMap.fileUri} index={index} isHtmlReact={true} />
              </div>
            ))
          ) : (
            <div className="emptyList">
              <p className="font-bold">Empty List</p>
              <p className="instruction-subtext">
                <p>Click the "</p>
                <SelectIcon />
                <p>Files" button to choose your HTML/React files.</p>
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="css-container">
        <span className="htmlCssTitle">CSS Files</span>
        <div className="fileUriEditRemoveContainer">
          {cssFiles.length > 0 ? (
            cssFiles.map((file, index) => (
              <div key={file}>
                <FileUriEditRemove file={file} index={index} />
              </div>
            ))
          ) : (
            <div className="emptyList">
              <p className="font-bold">Empty List</p>
              <p className="text-red-600">You need at least one CSS file to apply styles.</p>
              <p className="instruction-subtext">
                <p>Click the "</p>
                <SelectIcon />
                <p>Files" button to choose your CSS files.</p>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default FileUriHolder;
