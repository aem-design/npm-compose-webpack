import _get from 'lodash/get'

import css from './css'

describe('css', () => {
  test('should return valid css loaders', () => {
    const spy = jest.spyOn(require, 'resolve')

    // @ts-ignore
    const loaders = css({
      mode: 'development',
    }, {
      sass: {
        options: {
          sourceMap: true,
        },
      },
    })

    expect(loaders).toHaveProperty([2, 'options', 'sassOptions', 'sourceMap'], true)

    expect(_get(loaders, '[1].options.config.path', null)).toContain('postcss.config.js')

    spy.mockRestore()
  })

  test('should return fallback PostCSS config path', () => {
    // @ts-ignore
    const loaders = css({ mode: 'development' })

    expect(_get(loaders, '[1].options.config.path', null)).toContain('configs/postcss.config.js')
  })

  test('should return have correct Sass prependData', () => {
    // @ts-ignore
    const loaders = css({
      mode: 'development',
    }, {
      sass: {
        loader: {
          prependData: '$mock: true;',
        },
      },
    })

    expect(loaders).toHaveProperty([2, 'options', 'prependData'], '$mock: true;')
  })

  test('should throw property read error', () => {
    expect(css).toThrow(/Cannot read property/)
  })
})
