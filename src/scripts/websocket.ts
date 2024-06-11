import WebSocket from "ws";
import { handleWebSocketMessage } from "./server";
import { PORT } from "../utils/constant";

const ws = new WebSocket.Server({ port: PORT });
interface ConnectedClient {
  socket: WebSocket;
}
export let connectedClients: ConnectedClient[] = [];

export const startServer = () => {
  console.log("WebSocket Function");
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
      const index = connectedClients.findIndex(
        (client) => client.socket === socket
      );
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
  });

  ws.on("close", () => {
    console.log("WebSocket server closed");
  });
};

export const stopServer = () => {
  ws.close((err) => {
    if (err) {
      console.error("Error closing WebSocket server:", err);
    } else {
      console.log("WebSocket server stopped");
    }
  });
};
