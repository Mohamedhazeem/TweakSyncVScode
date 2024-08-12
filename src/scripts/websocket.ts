import WebSocket from "ws";
import { handleWebSocketMessage } from "./server";
import { PORT } from "../utils/constant";
import * as vscode from "vscode";

let ws: WebSocket.Server | undefined;
interface ConnectedClient {
  socket: WebSocket;
}
export let connectedClients: ConnectedClient[] = [];
let serverRunning = false;

export const startServer = (currentPanel: vscode.WebviewPanel | undefined) => {
  if (serverRunning) {
    console.log("WebSocket server is already running.");
    if (currentPanel) {
      currentPanel.webview.postMessage({
        command: "serverStarted",
        value: true,
      });
    }
    return; // Prevents trying to start the server again.
  }

  try {
    ws = new WebSocket.Server({ port: PORT });
    console.log("WebSocket server is Created.");
    serverRunning = true;

    if (currentPanel) {
      currentPanel.webview.postMessage({
        command: "serverStarted",
        value: true,
      });
    }

    ws.on("connection", function (socket) {
      connectedClients.push({ socket });
      console.log("WebSocket connection established from VS Code extension");

      socket.on("message", async (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          console.log(parsedMessage);
          await handleWebSocketMessage(parsedMessage);
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
        }
      });

      socket.on("close", () => {
        const index = connectedClients.findIndex((client) => client.socket === socket);
        if (index !== -1) {
          connectedClients.splice(index, 1);
        }
      });

      socket.on("error", (error) => {
        console.error("WebSocket client error:", error);
      });
    });

    ws.on("error", (error) => {
      console.error("WebSocket server error:", error);
      stopServer(currentPanel); // Stop the server if there is an error to avoid leaking resources.
    });

    ws.on("close", () => {
      console.log("WebSocket server closed");
      serverRunning = false;
      ws = undefined; // Reset the WebSocket server instance
    });
  } catch (error) {
    console.error("Error starting WebSocket server:", error);
  }
};

export const stopServer = (currentPanel: vscode.WebviewPanel | undefined) => {
  if (!serverRunning || !ws) {
    console.log("Server is not running.");
    return;
  }

  ws.close((err) => {
    if (err) {
      console.error("Error closing WebSocket server:", err);
    } else {
      console.log("WebSocket server stopped");
      ws = undefined;
      serverRunning = false;

      if (currentPanel) {
        currentPanel.webview.postMessage({
          command: "serverStarted",
          value: false,
        });
      }
    }
  });
};
