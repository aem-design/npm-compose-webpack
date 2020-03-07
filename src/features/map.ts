import Feature, { FeatureEnvironment } from './feature'

import Vue from './vue'

const featureMap: Record<string, (env: FeatureEnvironment) => InstanceType<typeof Feature>> = {
  vue: (env: FeatureEnvironment) => new Vue(env),
}

export default featureMap
