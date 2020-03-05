import webpack from 'webpack'

import { Hook, HookType } from './enum'

import {
  WebpackEnvironment,
} from './types'

export interface HookExecutor {
  after?(env?: webpack.ParserOptions | WebpackEnvironment): void;
  before?(env?: webpack.ParserOptions | WebpackEnvironment): void;
}

export type RegisteredHooks = {
  [hook: string]: HookExecutor[];
}

// Internal
const registeredHooks: RegisteredHooks = {
  [Hook.POST_INIT] : [],
  [Hook.PRE_INIT]  : [],
}

export function registerHook(hook: Hook, executor: HookExecutor) {
  const registeredHook: HookExecutor[] = registeredHooks[hook]

  if (!registeredHook) {
    throw new Error(`Unable to register hook '${hook}' as it is invalid, please use: ${Object.values(Hook).join(', ')}`)
  }

  registeredHook.push(executor)
}

export function executeHook(hook: Hook, type: HookType, env?: Partial<webpack.ParserOptions & WebpackEnvironment>) {
  const registeredHook: HookExecutor[] = registeredHooks[hook]

  if (!registeredHook) {
    throw new Error(`Unable to execute hook '${hook}' as it is invalid, please use: ${Object.values(Hook).join(', ')}`)
  }

  for (const executor of registeredHook) {
    if (type === HookType.AFTER && executor.after) {
      executor.after(env)
    }

    if (type === HookType.BEFORE && executor.before) {
      executor.before(env)
    }
  }
}
