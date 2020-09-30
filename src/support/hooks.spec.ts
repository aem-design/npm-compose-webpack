import { enableFetchMocks } from 'jest-fetch-mock'

import { Hook, HookType } from '../types/enums'

import { executeHook, registerHook } from './hooks'

describe('hooks', () => {
  describe('compiler:ready', () => {
    const MockAfterCallback = jest.fn(() => 'compiler:ready.after')
    const MockBeforeCallback = jest.fn(() => 'compiler:ready.before')

    registerHook(Hook.COMPILER_READY, {
      after  : MockAfterCallback,
      before : MockBeforeCallback,
    })

    test('before hook executes', () => {
      executeHook(Hook.COMPILER_READY, HookType.BEFORE, {})
      executeHook(Hook.COMPILER_READY, HookType.BEFORE, {})

      expect(MockBeforeCallback).toHaveBeenCalledTimes(2)
    })

    test('after hook executes', () => {
      executeHook(Hook.COMPILER_READY, HookType.AFTER, {})
      executeHook(Hook.COMPILER_READY, HookType.AFTER, {})

      expect(MockAfterCallback).toHaveBeenCalledTimes(2)
    })
  })

  describe('before pre:init', () => {
    const MockBeforeCallback = jest.fn(() => 'pre:init.before')

    registerHook(Hook.PRE_INIT, {
      before: MockBeforeCallback,
    })

    test('before hook executes', () => {
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
