export enum ConfigurationType {
  MAVEN_PARENT = 'maven.parent',
  MAVEN_PROJECT = 'maven.project',
  PATH_PUBLIC = 'paths.public',
  PATH_PUBLIC_AEM = 'paths.public.aem',
  PATH_SOURCE = 'paths.source',
}

export enum Features {
  bootstrap = 'bootstrap',
  typescript = 'typescript',
  vue = 'vue',
}

export enum Hook {
  COMPILER_READY = 'compiler:ready',
  POST_INIT = 'init:post',
  PRE_INIT = 'init:pre',
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
  'devtool',
  'devServer.contentBase',
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
