export interface ProjectMap {
  [project: string]: Project;
}

export interface Project {
  additionalEntries?: {
    [entry: string]: string[];
  };

  entryFile: {
    js: string;
    sass: string;
  };

  fileMap?: {
    [key: string]: string[];
  };

  outputName: string;
}
