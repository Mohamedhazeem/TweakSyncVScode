import * as vscode from "vscode";

let currentPanel: vscode.WebviewPanel | undefined;

export function setCurrentPanel(panel: vscode.WebviewPanel | undefined) {
  console.log("Setting current panel:", panel ? panel.title : "undefined");
  currentPanel = panel;
}

export function getCurrentPanel(): vscode.WebviewPanel | undefined {
  return currentPanel;
}
