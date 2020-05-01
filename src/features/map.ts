import Feature, { FeatureEnvironment } from './feature'

import Bootstrap from './bootstrap'
import TypeScript from './typescript'
import Vue from './vue'

const featureMap: Record<string, (env: FeatureEnvironment) => InstanceType<typeof Feature>> = {
  bootstrap  : (env) => new Bootstrap(env),
  typescript : (env) => new TypeScript(env),
  vue        : (env) => new Vue(env),
}

export default featureMap
