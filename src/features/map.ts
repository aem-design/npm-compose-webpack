import {
  Features,
} from '@/types/enums'

import {
  FeatureOptions,
} from '@/types/feature'

import Feature, {
  FeatureEnvironment,
} from '@/features/feature'

import Bootstrap from '@/features/bootstrap'
import TypeScript from '@/features/typescript'
import Vue from '@/features/vue'

type FeatureCallback<T extends Features> = (env: FeatureEnvironment, options: FeatureOptions[T]) => Feature<T>

function generateFeatureCallback<T extends Features>(callback: FeatureCallback<T>): FeatureCallback<T> {
  return (env, options) => callback(env, options)
}

export default {
  [Features.bootstrap]  : generateFeatureCallback<Features.bootstrap>((env, options) => new Bootstrap(env, options)),
  [Features.typescript] : generateFeatureCallback<Features.typescript>((env, options) => new TypeScript(env, options)),
  [Features.vue]        : generateFeatureCallback<Features.vue>((env, options) => new Vue(env, options)),
}
