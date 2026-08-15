import { WorkspaceStatePort, WorkspaceFsPort, WindowPort } from "../../infrastructure/vscode/interfaces";
import { WebviewMessageBus } from "../../infrastructure/webview/message-bus";

/**
 * Shared dependencies required by the application-layer command handlers.
 * Everything is an abstraction so the handlers stay testable in isolation.
 */
export interface CommandDeps {
  workspaceState: WorkspaceStatePort;
  fs: WorkspaceFsPort;
  window: WindowPort;
  bus: WebviewMessageBus;
}
