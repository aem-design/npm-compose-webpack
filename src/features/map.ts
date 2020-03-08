import Feature, { FeatureEnvironment } from './feature'

import TypeScript from './typescript'
import Vue from './vue'

const featureMap: Record<string, (env: FeatureEnvironment) => InstanceType<typeof Feature>> = {
  typescript : (env) => new TypeScript(env),
  vue        : (env) => new Vue(env),
}

export default featureMap
