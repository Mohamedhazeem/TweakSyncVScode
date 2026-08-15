import WebSocket from "ws";
import { handleWebSocketMessage } from "./server";
import { LOCAL_HOST, PORT } from "../utils/constant";
import * as vscode from "vscode";

let ws: WebSocket.Server | undefined;
interface ConnectedClient {
  socket: WebSocket;
}
export let connectedClients: ConnectedClient[] = [];
export let isServerRunning = false;
export let isConnected = false;

export const startServer = (
  currentPanel: vscode.WebviewPanel | undefined,
  context: vscode.ExtensionContext
) => {
  if (isServerRunning) {
    console.log("server is already running.");
    if (currentPanel) {
      currentPanel.webview.postMessage({
        command: "serverStarted",
        value: isServerRunning,
      });
    }
    return; // Prevents trying to start the server again.
  }

  try {
    ws = new WebSocket.Server({ port: PORT, host: LOCAL_HOST });
    console.log("server is Created.");
    isServerRunning = true;

    if (currentPanel) {
      currentPanel.webview.postMessage({
        command: "serverStarted",
        value: isServerRunning,
      });
    }

    ws.on("connection", function (socket) {
      connectedClients.push({ socket });
      console.log("Connection established from VS Code extension");
      isConnected = true;
      if (currentPanel) {
        currentPanel.webview.postMessage({
          command: "serverConnected",
          value: isConnected,
        });
      }

      socket.on("message", async (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          console.log(parsedMessage);
          await handleWebSocketMessage(parsedMessage, context);
        } catch (error) {
          console.error("Error handling message:", error);
        }
      });

      socket.on("close", () => {
        const index = connectedClients.findIndex((client) => client.socket === socket);
        if (index !== -1) {
          connectedClients.splice(index, 1);
        }
        currentPanel?.webview.postMessage({
          command: "serverConnected",
          value: false,
        });
      });

      socket.on("error", (error) => {
        console.error("WebSocket client error:", error);
        currentPanel?.webview.postMessage({
          command: "serverConnected",
          value: false,
        });
      });
    });

    ws.on("error", (error) => {
      console.log("server error:", error);
      stopServer(currentPanel); // Stop the server if there is an error to avoid leaking resources.
    });

    ws.on("close", () => {
      console.log("server closed");
      isServerRunning = false;
      isConnected = false;
      ws = undefined; // Reset the WebSocket server instance
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

export const stopServer = (currentPanel: vscode.WebviewPanel | undefined) => {
  if (!isServerRunning || !ws) {
    console.log("Server is not running.");
    return;
  }

  // Optionally send a disconnect message to all connected clients before closing the server
  connectedClients.forEach((client) => {
    client.socket.close();
  });

  // Close the WebSocket server
  ws.close(() => {
    console.log("server stopped");
    ws = undefined;
    isServerRunning = false;
    isConnected = false;
    if (currentPanel) {
      currentPanel.webview.postMessage({
        command: "serverStarted",
        value: isServerRunning,
      });
      currentPanel.webview.postMessage({
        command: "serverConnected",
        value: isConnected,
      });
    }
  });
};

export const sendMessageToClient = (message: any) => {
  const clientSocket = connectedClients[0].socket;
  if (clientSocket.readyState === WebSocket.OPEN) {
    clientSocket.send(JSON.stringify(message));
  }
};
