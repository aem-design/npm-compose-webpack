import webpack from 'webpack'

import type {
  Features,
} from '@/types/enums'

import type {
  WebpackAliases,
  WebpackConfiguration,
} from '@/types/webpack'

import type {
  DependenciesMap,
  Environment,
  GenericOptions,
  RuntimePaths,
} from '@/types'

export interface FeatureEnvironment extends Environment {
  paths: RuntimePaths;
  webpack: WebpackConfiguration;
}

export interface FeatureOptions {
  [Features.bootstrap]: GenericOptions;
  [Features.typescript]: GenericOptions;

  [Features.vue]: {
    /**
     * Enable the developer tools which by default are enabled based on the webpack `mode`. Disabling
     * this will prevent webpack's tree shaking from removing all dead code.
     *
     * This option is only available when the Vue.js `version` is set to `3`.
     *
     * @default null
     */
    enableDevTools?: boolean | null;

    /**
     * TODO: Implement this option.
     *
     * @default false
     */
    extractStyles?: boolean;

    /**
     * Optimisations are npm modules that should be bundled as part of the Vue.js chunk group.
     *
     * @default []
     * @example
     * ['vue-plugin-name']
     */
    optimisations?: string[];

    /**
     * Should the runtime ESM bundle be used during builds?
     *
     * Runtime builds are only useful when don't plan on using slots outside of your compiled Vue
     * components. Full bundles are provided by default as the AEM Vue component within the
     * `aemdesign-aem-core` make use of slots.
     *
     * @default false
     */
    runtimeOnly?: boolean;

    /**
     * Enable the Vue 2 options API along side the Vue 3 Composition API.
     *
     * This option is only available when the Vue.js `version` is set to `3`.
     *
     * @default true
     */
    useOptionsAPI?: boolean;

    /**
     * Vue.js version to use during builds.
     *
     * @default 2
     */
    version?: 2 | 3;
  };
}

export abstract class FeatureContract<O> {
  public abstract getFeatureDependencies(): DependenciesMap;
  public abstract aliases(): WebpackAliases;
  public abstract arbitraryUpdates(): webpack.Configuration;
  public abstract plugins(): webpack.WebpackPluginInstance[];
  public abstract rules(): webpack.RuleSetRule[];

  protected abstract get defaultOptions(): Required<O>;
}
