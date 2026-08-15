import { WebSocketServerPort } from "../../infrastructure/websocket/types";

export interface StartServerDeps {
  server: WebSocketServerPort;
}

/**
 * Application command: start the TweakSync WebSocket server. Panel/context are
 * owned by the composition root, so this handler only triggers the server via
 * its port.
 */
export function createStartServerHandler(deps: StartServerDeps) {
  return (): void => {
    deps.server.start();
  };
}
