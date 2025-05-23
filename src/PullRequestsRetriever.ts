import * as api from './azureDevOpsRestApi';
import AzureDevOpsService from './AzureDevOpsService';

export interface PullRequest {
  pullRequestId: number;
  title: string;
  changes: { path: string, changeType: api.VersionControlChangeType }[];
}

export default class PullRequestsRetriever {
  public static async retrievePullRequests(date: Date, azureService: AzureDevOpsService): Promise<PullRequest[]> {
    const pullRequests =
      await azureService.getPullRequests(date) as PullRequest[];
    await this.populateFileNames(pullRequests, azureService);

    return pullRequests;
  }

  private static async populateFileNames(pullRequests: PullRequest[], azureService: AzureDevOpsService): Promise<void> {
    const promises = pullRequests.map((pr) =>
      azureService
        .getCommitIds(pr.pullRequestId)
        .then(async (commitIds) =>
          await this.populateFileNamesFromCommitIds(pr, commitIds, azureService)));

    await Promise.all(promises);
  }

  private static async populateFileNamesFromCommitIds(pr: PullRequest, commitIds: string[], azureService: AzureDevOpsService): Promise<void> {
    const p_pathss = commitIds.map((commitId) =>
      azureService.getCommitPaths(commitId));
    const pathss = await Promise.all(p_pathss);
    const paths = pathss.flat();
    const uniquePaths = Array.from(new Set(paths));

    pr.changes = uniquePaths.sort();
  }
}