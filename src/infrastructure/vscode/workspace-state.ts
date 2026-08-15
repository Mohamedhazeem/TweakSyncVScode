import * as vscode from "vscode";
import { WorkspaceStatePort } from "./interfaces";

/**
 * Concrete {@link WorkspaceStatePort} backed by `vscode.ExtensionContext`.
 * Wraps reading/writing the extension's persisted workspace state so the rest
 * of the system can remain ignorant of the editor API.
 */
export class WorkspaceState implements WorkspaceStatePort {
  constructor(private readonly context: vscode.ExtensionContext) {}

  get<T>(key: string, defaultValue: T): T {
    return this.context.workspaceState.get<T>(key, defaultValue);
  }

  update(key: string, value: unknown): Thenable<void> {
    return this.context.workspaceState.update(key, value);
  }
}
