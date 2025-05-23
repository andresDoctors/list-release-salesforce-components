import * as vscode from 'vscode';

import ListReleaseComponents from './ListReleaseComponents';

export function activate(context: vscode.ExtensionContext) {
  const commands = new ListReleaseComponents(context);

  const disposable1 = vscode.commands.registerCommand(
    'list-release-salesforce-components.listReleaseComponents',
    () => commands.listReleaseComponents()
  );

  const disposable2 = vscode.commands.registerCommand(
    'list-release-salesforce-components.changeDefaultRepository',
    () => commands.changeDefaultRepository()
  );

  context.subscriptions.push(disposable1, disposable2);
}

export function deactivate() {}
