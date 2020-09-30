export enum ConfigurationType {
  MAVEN_PARENT = 'maven.parent',
  MAVEN_PROJECT = 'maven.project',
  PATH_PUBLIC = 'paths.public',
  PATH_PUBLIC_AEM = 'paths.public.aem',
  PATH_SOURCE = 'paths.source',
}

export enum Features {
  'bootstrap',
  'typescript',
  'vue',
}

export enum Hook {
  POST_INIT = 'init:post',
  PRE_INIT = 'init:pre',
  COMPILER_READY = 'compiler:ready',
}

export enum HookType {
  AFTER,
  BEFORE,
}

export enum DependencyType {
  DEV = 'dev',
  NON_DEV = 'nonDev',
}

export enum WebpackIgnoredProps {
  'context',
  'devtool',
  'devServer.contentBase',
  'entry',
  'mode',
  'name',
  'optimization.splitChunks.cacheGroups.vue',
  'performance',
  'performance.assetFilter',
  'performance.hints',
  'resolve.modules',
  'stats.colors',
}

export enum InstallStatus {
  RESTART,
  SKIPPED,
}
