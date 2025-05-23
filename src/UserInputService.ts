import * as vscode from 'vscode';
import { RepoIdentifiers } from './AzureDevOpsService';

export default class UserInputService {

  static async askForOrganization(): Promise<string> {
    const organization = await vscode.window.showInputBox({
      prompt: 'The name of the Azure DevOps organization',
      placeHolder: 'organization',
      validateInput: (text) => {
        if (!text) {
          return 'Please enter a valid organization';
        }
        return null;
      },
    });

    if (organization === undefined) {
      throw new Error('No organization provided');
    }

    return organization;
  }

  static async askForProject(): Promise<string> {
    const project = await vscode.window.showInputBox({
      prompt: 'Project ID or project name',
      placeHolder: 'project',
      validateInput: (text) => {
        if (!text) {
          return 'Please enter a valid project';
        }
        return null;
      },
    });

    if (project === undefined) {
      throw new Error('No project provided');
    }

    return project;
  }

  static async askForRepositoryId(): Promise<string> {
    const repositoryId = await vscode.window.showInputBox({
      prompt: "The repository ID of the pull request's target branch",
      placeHolder: 'repositoryId',
      validateInput: (text) => {
        if (!text) {
          return 'Please enter a valid repository ID';
        }
        return null;
      },
    });

    if (repositoryId === undefined) {
      throw new Error('No repositoryId provided');
    }

    return repositoryId;
  }

  static async askRepoIdentifiers(): Promise<RepoIdentifiers> {
    const organization = await UserInputService.askForOrganization();
    const project = await UserInputService.askForProject();
    const repositoryId = await UserInputService.askForRepositoryId();

    return { organization, project, repositoryId };
  }

  static async askForDate(): Promise<Date> {
    const dateString = await vscode.window.showInputBox({
      prompt: 'Release starting date in dd-MM-yyyy format',
      placeHolder: '31-12-2024',
      validateInput: (text) => {
        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
        if (!dateRegex.test(text)) {
          return 'Please enter a valid date in the format dd-MM-yyyy.';
        }
        return null;
      },
    });

    if (dateString === undefined) {
      throw new Error('No date provided');
    }

    const [day, month, year] = dateString.split('-').map(Number);
    if (!UserInputService.isValidDate(day, month, year)) {
      throw new Error('Invalid date provided');
    }

    return new Date(year, month - 1, day);
  }

  private static isValidDate(day: number, month: number, year: number): boolean {
    if (month < 1 || month > 12) { return false; }
    if (year < 1000 || year > 9999) { return false; }

    const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (UserInputService.isLeapYear(year)) {
      daysInMonth[2] += 1;
    }

    return 1 <= day && day <= daysInMonth[month];
  }

  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
}
