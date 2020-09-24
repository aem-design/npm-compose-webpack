import FeatureMap from './map'
import Bootstrap from './bootstrap'
import TypeScript from './typescript'
import Vue from './vue'

describe('feature map', () => {
  test('bootstrap feature should create Bootstrap instance', () => {
    // @ts-ignore
    expect(FeatureMap.bootstrap()).toBeInstanceOf(Bootstrap)
  })

  test('typescript feature should create TypeScript instance', () => {
    // @ts-ignore
    expect(FeatureMap.typescript()).toBeInstanceOf(TypeScript)
  })

  test('vue feature should create Vue instance', () => {
    // @ts-ignore
    expect(FeatureMap.vue()).toBeInstanceOf(Vue)
  })
})
