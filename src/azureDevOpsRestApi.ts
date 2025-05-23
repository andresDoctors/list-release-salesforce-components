export interface GitPullRequest {
  _links: any;
  artifactId: string;
  autoCompleteSetBy?: any;
  closedBy?: any;
  closedDate?: string;
  codeReviewId: number;
  commits: any[];
  completionOptions?: any;
  completionQueueTime?: string;
  createdBy: IdentityRef;
  creationDate: string;
  description?: string;
  forkSource?: any;
  hasMultipleMergeBases: boolean;
  isDraft: boolean;
  labels: any[];
  lastMergeCommit?: any;
  lastMergeSourceCommit?: any;
  lastMergeTargetCommit?: any;
  mergeFailureMessage?: string;
  mergeFailureType?: any;
  mergeId: string;
  mergeOptions?: any;
  mergeStatus: any;
  pullRequestId: number;
  remoteUrl?: string;
  repository: any;
  reviewers: any[];
  sourceRefName: string;
  status: any;
  supportsIterations: boolean;
  targetRefName: string;
  title: string;
  url?: string;
  workItemRefs?: any[];
}

export interface IdentityRef {
  _links: any;
  descriptor: string;
  directoryAlias: string;
  displayName: string;
  id: string;
  imageUrl: string;
  inactive: boolean;
  isAadIdentity: boolean;
  isContainer: boolean;
  isDeletedInOrigin: boolean;
  profileUrl: string;
  uniqueName: string;
  url: string;
}

export interface GitCommitRef {
  _links: any;
  author: any;
  changeCounts: any;
  changes: any[];
  comment: string;
  commentTruncated: boolean;
  commitId: string;
  commitTooManyChanges: boolean;
  committer: any;
  parents: string[];
  push: any;
  remoteUrl: string;
  statuses: any[];
  url: string;
  workItems: any[];
}

export interface GitChange {
  changeId: number;
  changeType: VersionControlChangeType;
  item: GitItem;
  newContent: any;
  newContentTemplate: any;
  originalPath: string;
  sourceServerItem: string;
  url: string;
}

export interface GitItem {
  _links: any;
  commitId: string;
  content: string;
  contentMetadata: any;
  gitObjectType: GitObjectType;
  isFolder: boolean;
  isSymLink: boolean;
  latestProcessedChange: any;
  objectId: string;
  originalObjectId: string;
  path: string;
  url: string;
}

export enum GitObjectType {
  BAD = 'bad',
  BLOB = 'blob',
  COMMIT = 'commit',
  EXT2 = 'ext2',
  OFS_DELTA = 'ofsDelta',
  REF_DELTA = 'refDelta',
  TAG = 'tag',
  TREE = 'tree',
}

export enum VersionControlChangeType {
  ADD = 'add',
  ALL = 'all',
  BRANCH = 'branch',
  DELETE = 'delete',
  EDIT = 'edit',
  ENCODING = 'encoding',
  LOCK = 'lock',
  MERGE = 'merge',
  NONE = 'none',
  PROPERTY = 'property',
  RENAME = 'rename',
  ROLLBACK = 'rollback',
  SOURCE_RENAME = 'sourceRename',
  TARGET_RENAME = 'targetRename',
  UNDELETE = 'undelete',
}
