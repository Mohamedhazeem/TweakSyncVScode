import React from "react";

function TutorialPage() {
  return (
    <div className="px-12 py-10">
      <ol className="orderedList">
        <li>
          <span className="tutorialTitle">Opening TweakSync</span>
          <ul className="listDisc">
            <li>
              <span className="tutorialSubTitle">Status Bar:</span>
              <ul className="listSquare">
                <li>
                  {`-> Locate the TweakSync icon in the status bar. Click on it to open the TweakSync
                  Hub.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle">Command Palette:</span>
              <ul className="listSquare">
                <li> {`-> Press Ctrl+Shift+P to open the Command Palette.`}</li>
                <li>
                  {`-> Type "TweakSync: Open TweakSync Hub" and select it to open the TweakSync Hub.`}
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <span className="tutorialTitle">Working with HTML Files</span>
          <ul className="listDisc">
            <li>
              <span className="tutorialSubTitle"> Select HTML File:</span>
              <ul className="listSquare">
                <li>{`-> Click on the "Select HTML File" button to choose an HTML file.`}</li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Watch All:</span>
              <ul className="listSquare">
                <li>
                  {`-> Click the "Watch All" button to start monitoring all elements in the selected HTML
                  file.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Watch Specific File:</span>
              <ul className="listSquare">
                <li>
                  {`-> If you change a particular file and want to monitor it again, use the "Watch"
                  button to re-watch that specific file.`}
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <span className="tutorialTitle"> Working with CSS Files</span>
          <ul className="listDisc">
            <li>
              <span className="tutorialSubTitle">Select CSS File:</span>
              <ul className="listSquare">
                <li>
                  {`-> Click on the "Select CSS File" button to choose a CSS file. Note that only one CSS
                  file can be selected at a time.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle">No Need to Watch:</span>
              <ul className="listSquare">
                <li>
                  {`-> You do not need to use the "Watch" functionality for CSS files. Simply selecting
                  the CSS file is sufficient.`}
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <span className="tutorialTitle">Starting and Managing TweakSync</span>
          <ul className="listDisc">
            <li>
              <span className="tutorialSubTitle"> Start TweakSync:</span>
              <ul className="listSquare">
                <li>{`-> Click the "Start" button to begin the TweakSync process.`}</li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Remove All Files:</span>
              <ul className="listSquare">
                <li>{`-> If you want to remove all tracked files, click the "Remove All" button.`}</li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Remove Single File:</span>
              <ul className="listSquare">
                <li>
                  {`-> To remove a specific file from tracking, click the "Remove" button for that file.`}
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
    </div>
  );
}

export default TutorialPage;
