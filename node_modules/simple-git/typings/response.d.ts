
export interface BranchDeletionSummary {
   branch: string;
   hash: any;
   success: boolean;
}

 export interface BranchSummary {
   detached: boolean;
   current: string;
   all: string[];
   branches: {[key: string]: {
      current: string,
      name: string,
      commit: string,
      label: string
   }};
 }

export interface CommitSummary {
   author: null | {
      email: string;
      name: string;
   };
   branch: string;
   commit: string;
   summary: {
      changes: number;
      insertions: number;
      deletions: number;
   };
}

export interface DiffResultTextFile {
    file: string;
    changes: number,
    insertions: number;
    deletions: number;
    binary: boolean;
}

export interface DiffResultBinaryFile {
   file: string;
   before: number;
   after: number;
   binary: boolean;
}

export interface DiffResult {
   files: Array<DiffResultTextFile | DiffResultBinaryFile>;
   insertions: number;
   deletions: number;
}

export interface FetchResult {
   raw: string;
   remote: string | null;
   branches: {
      name: string;
      tracking: string;
   }[];
   tags: {
      name: string;
      tracking: string;
   }[];
}

export interface MoveSummary {
   moves: any[];
}

export interface PullResult {

   /** Array of all files that are referenced in the pull */
   files: string[];

   /** Map of file names to the number of insertions in that file */
   insertions: {[key: string]: number};

   /** Map of file names to the number of deletions in that file */
   deletions: any;

   summary: {
      changes: number;
      insertions: number;
      deletions: number;
   };

   /** Array of file names that have been created */
   created: string[];

   /** Array of file names that have been deleted */
   deleted: string[];
}

export interface RemoteWithoutRefs {
   name: string;
}

export interface RemoteWithRefs extends RemoteWithoutRefs {
   refs: {
      fetch: string;
      push: string;
   }
}

export interface StatusResult {
   not_added: string[];
   conflicted: string[];
   created: string[];
   deleted: string[];
   modified: string[];
   renamed: string[];
   staged: string[];
   files: {
      path: string;
      index: string;
      working_dir: string;
   }[];
   ahead: number;
   behind: number;
   current: string;
   tracking: string;

   /**
    * Gets whether this represents a clean working branch.
    */
   isClean(): boolean;
}

export interface TagResult {
   all: string[];
   latest: string;
}

export interface DefaultLogFields {
   hash: string;
   date: string;
   message: string;
   author_name: string;
   author_email: string;
}

export interface ListLogSummary<T = DefaultLogFields> {
   all: ReadonlyArray<T>;
   total: number;
   latest: T;
}
