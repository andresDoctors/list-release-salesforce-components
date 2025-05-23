import { spawn } from 'child_process';
import * as azure from './AzureDevOpsService';

export interface Credentials {
  email: string;
  pat: string;
}

export class GitCredentialManager {
  private stdout: string;
  private stderr: string;

  constructor() {
    this.stdout = '';
    this.stderr = '';
  }

  async getCredentials(
    { organization, project, repositoryId }: azure.RepoIdentifiers
  ): Promise<Credentials> {

    return new Promise((resolve, reject) => {
      const command = 'git';
      const args = ['credential-manager', 'get'];
      const input = [
        'protocol=https',
        'host=dev.azure.com',
        `path=${organization}/${project}/_git/${repositoryId}`,
      ].join('\n') + '\n\n';

      const process = spawn(command, args);
      process.stdin.write(input);

      process.stdout.on('data', (data) => (this.stdout += data.toString()));
      process.stderr.on('data', (data) => (this.stderr += data.toString()));
      process.on('close', (exitCode) =>
        this.onProcessClose(exitCode, resolve, reject));
      process.on('error', (error) =>
        this.onProcessError(error, reject));
    });
  }

  private onProcessClose(
    exitCode: number | null,
    resolve: (value: Credentials) => void,
    reject: (reason?: Error) => void
  ): void {

    try {

      if (exitCode !== 0 || this.stderr) {
        throw new Error(`Process exited with code ${exitCode}: ${this.stderr}`);
      }

      const credentials = this.parseCredentials();
      if (!credentials.email || !credentials.pat) {
        throw new Error(`Error parsing credentials. stdout: '${this.stdout}'`);
      }

      resolve(credentials);

    } catch (error) {
      reject(error as Error);
    }
  }

  private onProcessError(error: Error, reject: (reason?: Error) => void): void {
    reject(new Error('Error spawning process', { cause: error }));
  }

  private parseCredentials(): Credentials {
    const credentials = { email: '', pat: '' };
    const lines = this.stdout.split('\n');

    for (const line of lines) {
      if (line.startsWith('username=')) {
        credentials.email = line.split('=')[1];
      } else if (line.startsWith('password=')) {
        credentials.pat = line.split('=')[1];
      }
    }

    return credentials;
  }
}

export default GitCredentialManager;
