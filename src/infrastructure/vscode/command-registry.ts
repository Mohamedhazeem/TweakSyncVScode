import * as vscode from "vscode";
import { CommandsPort } from "./interfaces";

/**
 * Collects command registrations into a single disposable unit. Lets the
 * composition root register many commands while exposing one lifecycle object
 * to `context.subscriptions` (User Story 2: modules can be torn down together
 * without leaking one-off registrations).
 */
export class CommandRegistry implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];

  constructor(private readonly commands: CommandsPort) {}

  register(command: string, callback: (...args: unknown[]) => unknown): void {
    this.disposables.push(this.commands.registerCommand(command, callback));
  }

  dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.disposables = [];
  }
}
