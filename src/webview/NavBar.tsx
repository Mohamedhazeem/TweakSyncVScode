import React from "react";
import { TweakSyncIcon } from "./components/icons/TweakSyncIcon";
function NavBar() {
  return (
    <div className="NavBar">
      <span className="tweakSyncNavbarText">
        <TweakSyncIcon />
        TweakSync
      </span>
    </div>
  );
}

export default NavBar;
