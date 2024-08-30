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
                  {`-> Locate the `}
                  <strong className="bg-[#ffffffd6] rounded-md px-1">TweakSync Icon</strong>
                  {` in the status bar. Click on it to open the TweakSync
                  Hub.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle">Command Palette:</span>
              <ul className="listSquare">
                <li>
                  {`-> Press `}
                  <strong className="bg-[#ffffffd6] rounded-md px-1">Ctrl+Shift+P</strong>
                  {` to open the Command Palette.`}
                </li>
                <li>
                  {`-> Type `}
                  <strong className="bg-[#ffffffd6] rounded-md px-1">
                    TweakSync: Open TweakSync Hub
                  </strong>
                  {` and select it to open the TweakSync Hub.`}
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <span className="tutorialTitle">Working with HTML Files</span>
          <ul className="listDisc">
            <li>
              <span className="tutorialSubTitle"> Select HTML Files:</span>
              <ul className="listSquare">
                <li>
                  {`-> Click on the `}
                  <strong className="bg-[#0055d491] rounded-md px-1">Select HTML Files</strong>
                  {` button to choose an HTML file.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Watch All:</span>
              <ul className="listSquare">
                <li>
                  {`-> Click the `}
                  <strong className="bg-[#ff7f2ae5] rounded-md px-1">Watch All</strong>
                  {` button to start monitoring all elements in the selected HTML
                  files.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Watch Specific File:</span>
              <ul className="listSquare">
                <li>
                  {`-> If you change a particular file and want to monitor it again, use the `}
                  <strong className="bg-[#ff7f2ae5] rounded-md px-1">Watch</strong>
                  {`
                  button to re-watch that specific file.`}
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <span className="tutorialTitle"> Working with CSS File</span>
          <ul className="listDisc">
            <li>
              <span className="tutorialSubTitle">Select CSS File:</span>
              <ul className="listSquare">
                <li>
                  {`-> Click on the `}
                  <strong className="bg-[#0055d491] rounded-md px-1">Select CSS File</strong>
                  {` button to choose a CSS file. Note that only one CSS
                  file can be selected at a time.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle">No Need to Watch:</span>
              <ul className="listSquare">
                <li>
                  {`-> You do not need to use the `}
                  <strong className="bg-[#ff7f2ae5] rounded-md px-1">Watch</strong>
                  {` functionality for CSS files. Simply selecting
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
                <li>
                  {`-> Click the `}
                  <strong className="bg-[#00808091] rounded-md px-1">Start</strong>
                  {` button to begin the TweakSync process.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Remove All Files:</span>
              <ul className="listSquare">
                <li>
                  {`-> If you want to remove all tracked files, click the `}
                  <strong className="bg-[#ff4141e5] rounded-md px-1">Remove All</strong>
                  {` button.`}
                </li>
              </ul>
            </li>
            <li>
              <span className="tutorialSubTitle"> Remove Single File:</span>
              <ul className="listSquare">
                <li>
                  {`-> To remove a specific file from tracking, click the `}
                  <strong className="bg-[#ff4141e5] rounded-md px-1">Remove</strong>
                  {` button for that file.`}
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
