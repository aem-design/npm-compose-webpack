export enum ConfigurationType {
  MAVEN_PARENT = 'maven.parent',
  MAVEN_PROJECT = 'maven.project',
  PATH_CLIENTLIBS = 'paths.clientlibs',
  PATH_PUBLIC = 'paths.public',
  PATH_PUBLIC_AEM = 'paths.public.aem',
  PATH_SOURCE = 'paths.source',
}

export enum Hook {
  POST_INIT = 'init:post',
  PRE_INIT = 'init:pre',
}

export enum HookType {
  AFTER,
  BEFORE,
}
