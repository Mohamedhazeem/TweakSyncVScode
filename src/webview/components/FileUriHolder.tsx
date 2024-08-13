import React, { memo } from "react";
import FileUriEditRemove from "./FileUriEditAndRemove";

type FileUriHolderType = {
  cssFiles: string[];
  htmlReactFiles: string[];
};
// function FileUriHolder({ files }: FileUriHolderType) {
//   const cssFiles = files.filter((file) => file.endsWith(".css"));
//   const htmlReactFiles = files.filter((file) =>
//     [".html", ".jsx", ".tsx"].some((ext) => file.endsWith(ext))
//   );
//   return (
//     <div className="FileUriHolder">
//       <div className="css-container">
//         <h3>CSS Files</h3>
//         <ul>
//           {cssFiles.map((file, index) => (
//             <FileUriEditRemove key={file} file={file} index={index} />
//           ))}
//         </ul>
//       </div>
//       <div className="html-react-container">
//         <h3>HTML/React Files</h3>
//         <ul>
//           {htmlReactFiles.map((file, index) => (
//             <FileUriEditRemove key={file} file={file} index={index} />
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }
const FileUriHolder = memo(({ cssFiles, htmlReactFiles }: FileUriHolderType) => {
  return (
    <div className="FileUriHolder">
      <div>
        {cssFiles.map((file, index) => (
          <div>
            {file} & {index}
          </div>
        ))}
        {htmlReactFiles.map((file, index) => (
          <div>
            {file} & {index}
          </div>
        ))}
      </div>
      <div className="css-container">
        <h3>CSS Files</h3>
        <div>
          {cssFiles.map((file, index) => (
            <div key={file}>
              <FileUriEditRemove key={file} file={file} index={index} />
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
              <FileUriEditRemove key={file} file={file} index={index} />
              {index}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
export default FileUriHolder;
