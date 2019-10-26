import webpack from 'webpack'

import { ConfigurationType } from '@type/enum'

declare global {
  interface Configuration {
    [ConfigurationType.MAVEN_PARENT]: string;
    [ConfigurationType.MAVEN_PROJECT]: string;
    [ConfigurationType.PATH_CLIENTLIBS]: string | false;
    [ConfigurationType.PATH_PUBLIC]: string;
    [ConfigurationType.PATH_PUBLIC_AEM]: string;
    [ConfigurationType.PATH_SOURCE]: string;
  }
  
  interface Environment extends webpack.ParserOptions {
    mode: 'development' | 'production';
    project: string;
  }
  
  interface MavenConfigMap {
    authorPort: number;
    appsPath: string;
    sharedAppsPath: string;
  }

  interface MavenConfig<R> {
    fallback?: R;
    parser?: (value: any) => R;
    path: string;
    pom: string;
  }
  
  interface SavedMavenConfig {
    [key: string]: string;
  }
  
  interface ProjectMap {
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

  interface WebpackConfiguration {
    projects?: ProjectMap;
  }
}