import { DependencyType } from '../types/enums'

import Vue from './vue'

describe('vue feature', () => {
  let instance: Vue

  beforeEach(() => {
    // @ts-ignore
    instance = new Vue({})
  })

  test('should return the correct dev loaders', () => {
    expect(instance.getFeatureDependencies()).toEqual({
      [DependencyType.DEV]: [
        'vue-loader',
        'vue-style-loader',
        'vue-template-compiler',
      ],

      [DependencyType.NON_DEV]: [
        'vue-property-decorator',
        'vue',
      ],
    })
  })
})
