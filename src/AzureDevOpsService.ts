import * as vscode from 'vscode';

import * as api from './azureDevOpsRestApi';
import { Credentials } from './GitCredentialManager';

interface BaseResponse {
  value?: api.GitPullRequest[] | api.GitCommitRef[];
  changes?: api.GitChange[];
}

type ValidResponse = api.GitPullRequest[] | api.GitCommitRef[] | api.GitChange[];

export interface RepoIdentifiers {
  organization: string | null;
  project: string | null;
  repositoryId: string | null;
}

export default class AzureDevOpsService {
  private static apiVersion = 'api-version=7.1';

  private context: vscode.ExtensionContext;
  private organization: string | null;
  private project: string | null;
  private repositoryId: string | null;
  private pat: string | null;
  private userId: string | null;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.organization = context.workspaceState.get('organization', null);
    this.project = context.workspaceState.get('project', null);
    this.repositoryId = context.workspaceState.get('repositoryId', null);
    this.pat = context.workspaceState.get('pat', null);
    this.userId = context.workspaceState.get('userId', null);
  }

  setRepoIdentifiers({ organization, project, repositoryId }: RepoIdentifiers): void {
    this.context.workspaceState.update('organization', organization);
    this.context.workspaceState.update('project', project);
    this.context.workspaceState.update('repositoryId', repositoryId);

    this.organization = organization;
    this.project = project;
    this.repositoryId = repositoryId;
  }

  getRepoIdentifiers(): RepoIdentifiers {
    const { organization, project, repositoryId } = this;
    return { organization, project, repositoryId };
  }

  isSetRepoIdentifiers(): boolean {
    return Boolean(this.organization && this.project && this.repositoryId);
  }

  async setCredentials({ email, pat }: Credentials): Promise<void> {
    this.context.workspaceState.update('email', email);
    this.context.workspaceState.update('pat', pat);

    this.pat = pat;
    this.userId = await this.getUserId(email);
  }

  isSetCredentials(): boolean {
    return Boolean(this.pat && this.userId);
  }

  private async validateHttpResponse(response: Response): Promise<void> {
    if (response.ok) {
      return;
    }

    const serializable = {
      ok: response.ok,
      url: response.url,
      type: response.type,
      status: response.status,
      text: await response.text(),
      bodyUsed: response.bodyUsed,
      redirected: response.redirected,
      statusText: response.statusText,
    };

    const json = JSON.stringify(serializable, null, 2);
    throw new Error(`Http response is not ok: ${json}}`);
  }

  private validatedResponseData(data: unknown): ValidResponse {
    if (data == null) {
      throw new Error('Response data is null or undefined');
    } else if (typeof data !== 'object') {
      const message = `Response data must be an object, received: ${typeof data}`;
      throw new Error(message);
    }

    const response = data as BaseResponse;
    if (!('value' in data) && !('changes' in response)) {
      const message =
        'data must contain either "value" or "changes" property';
      throw new Error(message);
    }

    const gitEntities = response?.value ?? response.changes;
    if (!Array.isArray(gitEntities)) {
      const type = (gitEntities === null) ? 'null' : typeof gitEntities;
      const message = `Expected array but received: ${type}`;
      throw new Error(message);
    }

    return gitEntities;
  }

  private async GET(url: string): Promise<ValidResponse> {
    const encodedPat = Buffer.from(`:${this.pat}`).toString('base64');
    const headers = { Authorization: `Basic ${encodedPat}` };

    try {
      const response = await fetch(url, { headers });
      await this.validateHttpResponse(response);

      const data = await response.json();
      return this.validatedResponseData(data);

    } catch (error) {
      throw new Error('GET request failed', { cause: error });
    }
  }

  private buildUrl(endpoint: string, queryParams: string[]): string {
    const urlBase = `https://dev.azure.com/${this.organization}` +
      `/${this.project}/_apis/git/repositories/${this.repositoryId}`;

    const fullQueryString =
      [...queryParams, AzureDevOpsService.apiVersion].join('&');

    return `${urlBase}${endpoint}?${fullQueryString}`;
  }

  async getUserId(email: string): Promise<string> {
    const endpoint = '/pullrequests';
    const queryParams = ['searchCriteria.status=completed'];
    const url = this.buildUrl(endpoint, queryParams);

    const pullRequests =
      await this.GET(url) as api.GitPullRequest[];

    for (const pr of pullRequests) {
      if (pr.createdBy.uniqueName === email) {
        return pr.createdBy.id;
      }
    }

    throw new Error(`Creator with email '${email}' was not found`);
  }

  async getPullRequests(date: Date): Promise<{ title: string; pullRequestId: number }[]> {
    const endpoint = '/pullrequests';
    const queryParams = [
      `searchCriteria.creatorId=${this.userId}`,
      `searchCriteria.minTime=${date.toISOString()}`,
      'searchCriteria.status=completed',
    ];
    const url = this.buildUrl(endpoint, queryParams);

    const pullRequests = await this.GET(url) as api.GitPullRequest[];
    return pullRequests.map(({ title, pullRequestId }) =>
      ({ title,  pullRequestId }));
  }

  async getCommitIds(pullRequestId: number): Promise<string[]> {
    const endpoint = `/pullRequests/${pullRequestId}/commits`;
    const queryParams = [] as string[];
    const url = this.buildUrl(endpoint, queryParams);

    const commits = await this.GET(url) as api.GitCommitRef[];
    return commits.map((commit) => commit.commitId);
  }

  async getCommitPaths(commitId: string): Promise<{ path: string, changeType: api.VersionControlChangeType }[]> {
    const endpoint = `/commits/${commitId}/changes`;
    const queryParams = [] as string[];
    const url = this.buildUrl(endpoint, queryParams);

    const changes = await this.GET(url) as api.GitChange[];
    return changes
      .filter((change) => change.item.gitObjectType === api.GitObjectType.BLOB)
      .map((change) => ({ path: change.item.path, changeType: change.changeType }));
  }
}
