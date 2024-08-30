import * as React from "react";
import { SVGProps } from "react";
export const RemoveIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || "1.2em"}
    height={props.height || "1.2em"}
    viewBox="0 -960 960 960"
    {...props}
  >
    <path
      d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
      style={{
        fill: "#3d0000",
        fillOpacity: 0.85,
        strokeWidth: 0.5,
        strokeDasharray: "none",
        paintOrder: "stroke fill markers",
      }}
    />
  </svg>
);
