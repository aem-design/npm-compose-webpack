import FeatureMap from '@/map'
import Bootstrap from '@/bootstrap'
import TypeScript from '@/typescript'
import Vue from '@/vue'

describe('feature map', () => {
  test('bootstrap feature should create Bootstrap instance', () => {
    // @ts-expect-error feature constructors expect an env object
    expect(FeatureMap.bootstrap()).toBeInstanceOf(Bootstrap)
  })

  test('typescript feature should create TypeScript instance', () => {
    // @ts-expect-error feature constructors expect an env object
    expect(FeatureMap.typescript()).toBeInstanceOf(TypeScript)
  })

  test('vue feature should create Vue instance', () => {
    // @ts-expect-error feature constructors expect an env object
    expect(FeatureMap.vue()).toBeInstanceOf(Vue)
  })
})
