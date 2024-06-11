import * as vscode from "vscode";
interface InlineStyles {
  [key: string]: string;
}

interface ExternalStyles {
  classes: { [key: string]: { [key: string]: string } };
  ids: { [key: string]: { [key: string]: string } };
  tags: { [key: string]: { [key: string]: string } };
  attribute: { [key: string]: { [key: string]: string } };
  descendant: { [key: string]: { [key: string]: string } };
  pseudoElementStyles: { [key: string]: { [key: string]: string } };
  pseudoClassStyles: { [key: string]: { [key: string]: string } };
}

interface ElementStyles {
  inline: InlineStyles;
  external: ExternalStyles;
  temporaryId?: string | null;
}
const mockElementStyles: ElementStyles = {
  inline: {
    //   color: "red",
    //   fontSize: "16px",
    //   display: "block"
  },
  external: {
    classes: {
      // "header": {
      //   color: "blue",
      //   margin: "10px",
      //   fontSize: "20px"
      // },
      // "content": {
      //   color: "green",
      //   padding: "15px",
      //   lineHeight: "1.5"
      //}
    },
    ids: {
      // "mainHeader": {
      //   color: "darkblue",
      //   fontWeight: "bold",
      //   textTransform: "uppercase"
      // },
      // "mainFooter": {
      //   backgroundColor: "lightgrey",
      //   padding: "20px",
      //   textAlign: "center"
      // }
    },
    tags: {
      // "h1": {
      //   fontSize: "24px",
      //   fontWeight: "600"
      // },
      // "p": {
      //   margin: "0",
      //   padding: "10px"
      // }
    },
    attribute: {
      // "[data-theme='dark']": {
      //   backgroundColor: "black",
      //   color: "white"
      // },
      // "[data-theme='light']": {
      //   backgroundColor: "white",
      //   color: "black"
      // }
    },
    descendant: {
      // "nav ul li": {
      //   listStyle: "none",
      //   padding: "5px"
      // },
      // "article h2": {
      //   fontSize: "18px",
      //   margin: "15px 0"
      // }
    },
    pseudoElementStyles: {
      // "::before": {
      //   content: "'• '",
      //   color: "grey"
      // },
      // "::after": {
      //   content: "'• '",
      //   color: "grey"
      // }
    },
    pseudoClassStyles: {
      'a[href^="https://"]': {
        color: "rgb(180, 180, 180)",
        "text-align": "center",
      },
    },
  },
  //temporaryId: "temp-1234"
};

export const findCssFiles = async () => {
  const files = await vscode.workspace.findFiles("**/*.{css}");
  const matchingFiles: vscode.Uri[] = [];

  for (const file of files) {
    console.log(file.toString());
    const content = await vscode.workspace.fs.readFile(file);
    const contentString = content.toString();

    let fileMatches = false;

    Object.entries(mockElementStyles).forEach(([styleType, styleContent]) => {
      if (typeof styleContent === "object" && styleContent !== null) {
        Object.entries(styleContent as { [key: string]: any }).forEach(
          ([key, value]) => {
            if (
              typeof value === "object" &&
              value !== null &&
              Object.keys(value).length > 0
            ) {
              // Check if key is a nested object and contains selectors
              Object.entries(value as { [key: string]: string }).forEach(
                ([innerKey, innerValue]) => {
                  if (contentString.includes(innerKey)) {
                    console.log(
                      `Found selector ${innerKey} in file ${file.toString()}`
                    );
                    console.log(innerValue);
                    fileMatches = true;
                  }
                }
              );
            }
          }
        );
      } else {
        console.log(styleType);
        console.log(styleContent);
      }
    });

    if (fileMatches) {
      matchingFiles.push(file);
    }
  }

  return matchingFiles;
};
export const findAndReplaceCssSelectors = async () => {
  const files = await vscode.workspace.findFiles("**/*.{css}");

  for (const file of files) {
    console.log(file.toString());
    const content = await vscode.workspace.fs.readFile(file);
    let contentString = content.toString();

    Object.entries(mockElementStyles).forEach(([styleType, styleContent]) => {
      if (styleContent && typeof styleContent === "object") {
        Object.entries(styleContent).forEach(([key, value]) => {
          if (
            value &&
            typeof value === "object" &&
            Object.keys(value).length > 0
          ) {
            Object.entries(value).forEach(([innerKey, innerValue]) => {
              if (contentString.includes(innerKey)) {
                console.log(
                  `Found selector ${innerKey} in file ${file.toString()}`
                );
                console.log(innerValue);

                // Construct the new CSS rule
                let newRule = `${innerKey} {`;
                Object.entries(innerValue).forEach(([prop, val]) => {
                  newRule += `\n  ${prop}: ${val};`;
                });
                newRule += `\n}`;

                // Improved regex to match the selector and its block
                const regex = new RegExp(
                  `${innerKey.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                  )}\\s*{[^}]*}`,
                  "g"
                );
                const matches = contentString.match(regex);
                if (matches) {
                  console.log(`Old rule: ${matches[0]}`);
                } else {
                  console.log(`No match found for ${innerKey}`);
                }
                console.log(`New rule: ${newRule}`);

                // Replace the old CSS rule with the new rule
                contentString = contentString.replace(regex, newRule);
              }
            });
          }
        });
      } else {
        console.log(styleType);
        console.log(styleContent);
      }
    });

    // Write the updated content back to the file
    const updatedContent = Buffer.from(contentString, "utf-8");
    await vscode.workspace.fs.writeFile(file, updatedContent);
  }

  console.log("CSS files updated successfully.");
};
