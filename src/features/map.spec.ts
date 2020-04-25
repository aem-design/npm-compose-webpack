import FeatureMap from './map'
import TypeScript from './typescript'
import Vue from './vue'

describe('feature map', () => {
  test('typescript feature should create TypeScript instance', () => {
    // @ts-ignore
    expect(FeatureMap.typescript()).toBeInstanceOf(TypeScript)
  })

  test('vue feature should create Vue instance', () => {
    // @ts-ignore
    expect(FeatureMap.vue()).toBeInstanceOf(Vue)
  })
})
