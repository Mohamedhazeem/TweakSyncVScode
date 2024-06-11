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
      const parsedMessage = JSON.parse(message.toString());
      console.log(parsedMessage);
      await handleWebSocketMessage(parsedMessage);
    });
    socket.on("close", () => {
      const index = connectedClients.findIndex(
        (client) => client.socket === socket
      );
      if (index !== -1) {
        connectedClients.splice(index, 1);
      }
    });
  });
};

export const stopServer = () => {
  ws.close();
};
