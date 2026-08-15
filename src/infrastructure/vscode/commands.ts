import * as vscode from "vscode";
import { CommandsPort } from "./interfaces";

/**
 * Concrete {@link CommandsPort} backed by `vscode.commands`. Encapsulates
 * command registration and execution so the rest of the system depends on the
 * abstraction rather than the global `vscode.commands` object.
 */
export class VscodeCommands implements CommandsPort {
  registerCommand(
    command: string,
    callback: (...args: unknown[]) => unknown
  ): vscode.Disposable {
    return vscode.commands.registerCommand(command, callback);
  }

  executeCommand(command: string, ...args: unknown[]): Thenable<unknown> {
    return vscode.commands.executeCommand(command, ...args);
  }
}
