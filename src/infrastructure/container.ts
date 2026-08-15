import * as vscode from "vscode";
import { WorkspaceState } from "./vscode/workspace-state";
import { VscodeWindow } from "./vscode/window";
import { VscodeCommands } from "./vscode/commands";
import { VscodeWorkspaceFs } from "./vscode/workspace-fs";
import { server as websocketServer } from "./websocket/server";
import { WebviewMessageBus } from "./webview/message-bus";
import { CommandRegistry } from "./vscode/command-registry";
import { SyncService } from "../application/services/sync-service";
import { createStartServerHandler } from "../application/commands/start-server";
import { createWatchFilesHandler } from "../application/commands/watch-files";
import { createRemoveFilesHandler } from "../application/commands/remove-files";
import { createTemporaryIdDisposables } from "./vscode/disposables/temporary-id";
import { createFileWatcherDisposable } from "./vscode/disposables/file-watcher";
import { createWebviewDisposable } from "./vscode/disposables/webview";
import { registerStatusBarCommands } from "../scripts/statusBar";

/**
 * Composition root (Dependency Injection container). Instantiates every port
 * implementation and application service, then wires them together and
 * registers all commands. This is the ONLY place that knows about concrete
 * implementations, keeping the rest of the codebase reliant on abstractions
 * (Dependency Inversion). Swapping a module for a stub/test double requires a
 * change in exactly one location (User Story 2).
 */
export class CompositionRoot {
  private readonly workspaceState: WorkspaceState;
  private readonly window: VscodeWindow;
  private readonly commands: VscodeCommands;
  private readonly fs: VscodeWorkspaceFs;
  private readonly bus: WebviewMessageBus;
  private readonly registry: CommandRegistry;
  private readonly sync: SyncService;
  private readonly panelSetter: (panel: vscode.WebviewPanel | undefined) => void;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.workspaceState = new WorkspaceState(context);
    this.window = new VscodeWindow();
    this.commands = new VscodeCommands();
    this.fs = new VscodeWorkspaceFs();
    this.bus = new WebviewMessageBus();
    this.registry = new CommandRegistry(this.commands);
    this.sync = new SyncService(websocketServer, context, this.bus);
    this.panelSetter = (panel) => {
      this.bus.setPanel(panel);
      websocketServer.setPanel(panel);
    };
    websocketServer.setContext(context);
  }

  activate(): void {
    this.sync.register();

    this.registry.register(
      "tweakSync.startserver",
      createStartServerHandler({ server: websocketServer })
    );
    this.registry.register(
      "tweakSync.watchFiles",
      createWatchFilesHandler({
        workspaceState: this.workspaceState,
        fs: this.fs,
        window: this.window,
        bus: this.bus,
      })
    );
    this.registry.register(
      "tweakSync.removeFiles",
      createRemoveFilesHandler({
        workspaceState: this.workspaceState,
        fs: this.fs,
        window: this.window,
        bus: this.bus,
      })
    );
    this.context.subscriptions.push(this.registry);

    this.context.subscriptions.push(
      createWebviewDisposable(this.panelSetter, this.context)
    );
    this.context.subscriptions.push(
      createFileWatcherDisposable({
        workspaceState: this.workspaceState,
        bus: this.bus,
        context: this.context,
      })
    );
    this.context.subscriptions.push(
      ...createTemporaryIdDisposables({
        commands: this.commands,
        workspaceState: this.workspaceState,
        fs: this.fs,
        window: this.window,
        bus: this.bus,
        context: this.context,
      })
    );

    registerStatusBarCommands(this.context);

    this.context.subscriptions.push(new vscode.Disposable(() => websocketServer.stop()));
  }
}
