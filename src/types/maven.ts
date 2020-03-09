export interface MavenConfigMap {
  authorPort: number;
  appsPath: string;
  sharedAppsPath: string;
}

export interface MavenConfig<R> {
  fallback?: R;
  parser?: (value: any) => R;
  path: string;
  pom?: string;
}

export type SavedMavenConfig = Record<string, string>
