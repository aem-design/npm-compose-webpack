import Feature, { FeatureEnvironment } from '@/features/feature'

import Bootstrap from '@/features/bootstrap'
import TypeScript from '@/features/typescript'
import Vue from '@/features/vue'

const featureMap: Record<string, (env: FeatureEnvironment) => InstanceType<typeof Feature>> = {
  bootstrap  : (env) => new Bootstrap(env),
  typescript : (env) => new TypeScript(env),
  vue        : (env) => new Vue(env),
}

export default featureMap
