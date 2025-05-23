import * as api from './azureDevOpsRestApi';
import { PullRequest } from './PullRequestsRetriever';

export interface ProcessedPullRequest {
  taskType: "User Story" | "Bug";
  taskNumber: number;
  sprint: number;
  owner: string;
  changes: { path: string, createdModifiedDeleted: string, componentType: string }[];
};

const COMPONENT_TYPES: { [key: string]: string } = {
  analyticSnapshots: 'Analytic Snapshot',
  applications: 'App Menu',
  appMenus: 'App Menu',
  approvalProcesses: 'Approval Process',
  assignmentRules: 'Assignment Rule',
  aura: 'Aura Definition Bundle',
  classes: 'Apex Class',
  communities: 'Community',
  components: 'Apex Component',
  connectedApps: 'Connected App',
  contentassets: 'Content Asset',
  customHelpMenuSections: 'Custom Help Menu Section',
  customMetadata: 'Custom Metadata',
  customPermissions: 'Custom Permission',
  duplicateRules: 'Duplicate Rule',
  email: 'Email Template',
  flexipages: 'Flexi Page',
  flows: 'Flow',
  globalValueSets: 'Global Value Set',
  globalValueSetTranslations: 'Global Value Set Translation',
  groups: 'Group',
  homePageComponents: 'Home Page Component',
  homePageLayouts: 'Home Page Layout',
  labels: 'Label',
  layouts: 'Layout',
  LeadConvertSettings: 'Lead Convert Settings',
  letterhead: 'Letterhead',
  lwc: 'Lightning Component Bundle',
  matchingRules: 'Matching Rule',
  messageChannels: 'Message Channel',
  mutingpermissionsets: 'Muting Permission Set',
  objects: 'Custom Object',
  objectTranslations: 'Object Translation',
  pages: 'Apex Page',
  pathAssistants: 'Path Assistant',
  permissionsetgroups: 'Permission Set Group',
  permissionsets: 'Permission Set',
  platformEventChannelMembers: 'Platform Event Channel Member',
  platformEventChannels: 'Platform Event Channel',
  profiles: 'Profile',
  queues: 'Queue',
  quickActions: 'Quick Action',
  remoteSiteSettings: 'Remote Site Setting',
  reports: 'Report',
  reportTypes: 'Report Type',
  roles: 'Role',
  settings: 'Settings',
  sharingRules: 'Sharing Rules',
  standardValueSets: 'Standard Value Set',
  standardValueSetTranslations: 'Standard Value Set Translation',
  staticresources: 'Static Resource',
  surveySettings: 'Survey Settings',
  tabs: 'Custom Tab',
  translations: 'Translation',
  triggers: 'Apex Trigger',
  weblinks: 'Web Link',
  workflows: 'Workflow',
};

const CREATED_MODIFIED_DELETED = {
  [api.VersionControlChangeType.ADD]: 'Created',
  [api.VersionControlChangeType.EDIT]: 'Modified',
  [api.VersionControlChangeType.DELETE]: 'Deleted',

  [api.VersionControlChangeType.ALL]: 'Uknown',
  [api.VersionControlChangeType.BRANCH]: 'Uknown',
  [api.VersionControlChangeType.ENCODING]: 'Uknown',
  [api.VersionControlChangeType.LOCK]: 'Uknown',
  [api.VersionControlChangeType.MERGE]: 'Uknown',
  [api.VersionControlChangeType.NONE]: 'Uknown',
  [api.VersionControlChangeType.PROPERTY]: 'Uknown',
  [api.VersionControlChangeType.RENAME]: 'Uknown',
  [api.VersionControlChangeType.ROLLBACK]: 'Uknown',
  [api.VersionControlChangeType.SOURCE_RENAME]: 'Uknown',
  [api.VersionControlChangeType.TARGET_RENAME]: 'Uknown',
  [api.VersionControlChangeType.UNDELETE]: 'Uknown',
};

export default class PullRequestsProcessor {
  private static getComponentType(path: string): string {
    const match = path.match(/\/force-app\/main\/default\/(\w+)\//);
    if (match == null) return 'Unknown';

    return COMPONENT_TYPES[match[1]] ?? 'Unknown';
  }

  private static parseTaskNumber(title: string): number {
    const match = title.match(/#(\d+)/);
    if (match == null) throw new Error(`task number not found in title '${title}'`);

    return parseInt(match[1]);
  }

  private static parseTaskType(title: string): 'Bug' | 'User Story' {
    const match = title.match(/(Bug|User Story)/);
    if (match == null) throw new Error(`task type not found in title '${title}'`);

    return match[1] as ('Bug' | 'User Story');
  }

  public static processPullRequests(pullRequests: PullRequest[]): ProcessedPullRequest[] {
    const processedPrs: { [key: string]: ProcessedPullRequest } = {};

    for(const pr of pullRequests) {
      const taskType = this.parseTaskType(pr.title);
      const taskNumber = this.parseTaskNumber(pr.title);
      const changes =
        pr.changes.map(({ path, changeType }) => ({
          path,
          componentType: this.getComponentType(path),
          createdModifiedDeleted: CREATED_MODIFIED_DELETED[changeType],
        }));

      const processedPrKey = `${taskType}+${taskNumber}`;
      processedPrs[processedPrKey] ??=
        { taskNumber, taskType, changes: [], sprint: -1, owner: 'andres.doctors' };

      const processedPr = processedPrs[processedPrKey];
      processedPr.changes.push(...changes);
    }

    return Object.values(processedPrs);
  }
}
