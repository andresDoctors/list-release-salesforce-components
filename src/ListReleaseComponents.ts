import * as vscode from 'vscode';

import UserInputService from './UserInputService';
import OutputChannelManager from './OutputChannelManager';
import SpreadsheetManager from './SpreadsheetManager';
import PullRequestsProcessor from './PullRequestsProcessor';
import PullRequestsRetriever from './PullRequestsRetriever';
import AzureDevOpsService from './AzureDevOpsService';
import GitCredentialManager from './GitCredentialManager';

export default class ListReleaseComponents {
  private outputManager: OutputChannelManager;
  private azureService: AzureDevOpsService;
  private gitManager: GitCredentialManager;

  constructor(context: vscode.ExtensionContext) {
    this.outputManager = new OutputChannelManager();
    this.gitManager = new GitCredentialManager();
    this.azureService = new AzureDevOpsService(context);
  }

  async listReleaseComponents(): Promise<void> {
    try {
      if(!this.azureService.isSetRepoIdentifiers()) {
        const repoIdentifiers = await UserInputService.askRepoIdentifiers();
        this.azureService.setRepoIdentifiers(repoIdentifiers);
      }
  
      if(!this.azureService.isSetCredentials()) {
        const repoIdentifiers = this.azureService.getRepoIdentifiers();
        const credentials = await this.gitManager.getCredentials(repoIdentifiers);
        await this.azureService.setCredentials(credentials);
      }

      const date = await UserInputService.askForDate();
      const prs = await PullRequestsRetriever.retrievePullRequests(date, this.azureService);
      this.outputManager.showJson(prs);

      const processedPrs = PullRequestsProcessor.processPullRequests(prs);
      if(vscode.workspace.workspaceFolders == null || vscode.workspace.workspaceFolders.length === 0)
        throw new Error('No workspace folder found. Please open a workspace folder to save the file.');
      SpreadsheetManager.generateXlsx(processedPrs, vscode.workspace.workspaceFolders[0].uri.fsPath + '/releaseComponents.xlsx');

    } catch (error) {
      this.outputManager.showError(error as Error);
    }
  }

  async changeDefaultRepository(): Promise<void> {
    try {
      const repoIdentifiers = await UserInputService.askRepoIdentifiers();
      this.azureService.setRepoIdentifiers(repoIdentifiers);

      const credentials = await this.gitManager.getCredentials(repoIdentifiers);
      await this.azureService.setCredentials(credentials);

    } catch (error) {
      this.outputManager.showError(error as Error);
    }
  }
}
