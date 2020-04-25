import { enableFetchMocks } from 'jest-fetch-mock'

import { Hook, HookType } from './types/enums'

import { executeHook, registerHook } from './hooks'

describe('hooks', () => {
  describe('before pre:init', () => {
    const MockBeforeCallback = jest.fn(() => 'pre:init.before')

    registerHook(Hook.PRE_INIT, {
      before: MockBeforeCallback,
    })

    test('before hook executes', () => {
      // @ts-ignore
      executeHook(Hook.PRE_INIT, HookType.BEFORE, {})
      executeHook(Hook.PRE_INIT, HookType.BEFORE, {})

      expect(MockBeforeCallback).toHaveBeenCalledTimes(2)
    })
  })

  describe('after post:init', () => {
    const MockAfterCallback = jest.fn(() => 'post:init.after')

    registerHook(Hook.POST_INIT, {
      after: MockAfterCallback,
    })

    test('after hook executes', () => {
      // @ts-ignore
      executeHook(Hook.POST_INIT, HookType.AFTER, {})
      executeHook(Hook.POST_INIT, HookType.AFTER, {})

      expect(MockAfterCallback).toHaveBeenCalledTimes(2)
    })
  })

  describe('async after pre:init', () => {
    enableFetchMocks()

    const MockAsyncCallback = jest.fn(async () => {
      await fetch('https://webpack.aem.design')
    })

    registerHook(Hook.PRE_INIT, {
      after: MockAsyncCallback,
    })

    test('async callback succeeds', () => {
      // @ts-ignore
      executeHook(Hook.PRE_INIT, HookType.AFTER, {})

      expect(MockAsyncCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe('non-existent hooks', () => {
    test('pre:non-exist register should throw an error', () => {
      expect(registerHook).toThrow(/Unable to register hook/)
    })

    test('pre:non-exist execute should throw an error', () => {
      expect(executeHook).toThrow(/Unable to execute hook/)
    })
  })
})
