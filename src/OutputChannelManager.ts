import * as vscode from 'vscode';

interface SerializableError {
  name: string;
  message: string;
  stack?: string[];
  cause?: SerializableError;
}

export default class OutputChannelManager {
  private errorChannel: vscode.OutputChannel | null;
  private componentsListChannel: vscode.OutputChannel | null;

  constructor() {
    this.errorChannel = null;
    this.componentsListChannel = null;
  }

  showJson(output: any): void {
    if (this.componentsListChannel == null) {
      const name = 'Release Components List';
      this.componentsListChannel = vscode.window.createOutputChannel(name, 'json');
    } else {
      this.componentsListChannel.clear();
    }

    this.componentsListChannel.show();
    this.componentsListChannel.appendLine(JSON.stringify(output, null, 2));
  }

  showError(error: Error): void {
    if (this.errorChannel == null) {
      const name = 'List Release Components Errors';
      this.errorChannel = vscode.window.createOutputChannel(name, 'json');
    }

    const serializable = this.serializableError(error);
    const json = JSON.stringify(serializable, null, 2);
    this.errorChannel.show();
    this.errorChannel.appendLine(json);
  }

  private serializableError(error: Error | undefined): SerializableError | undefined {
    if (error === undefined) {
      return undefined;
    }

    const cause = (error?.cause instanceof Error) ? error.cause : undefined;

    return {
      name: error.name,
      message: error.message,
      stack: error?.stack?.split('\n\t'),
      cause: this.serializableError(cause),
    };
  }
}
