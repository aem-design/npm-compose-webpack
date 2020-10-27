import _get from 'lodash/get'

import css from '@/support/css'

describe('css', () => {
  test('should return valid css loaders', () => {
    const spy = jest.spyOn(require, 'resolve')

    // @ts-expect-error only part of the 'env' object is given
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

    expect(_get(loaders, '[1].options.sourceMap')).toBeTruthy()

    spy.mockRestore()
  })

  test('should return have correct Sass additionalData', () => {
    // @ts-expect-error only part of the 'env' object is given
    const loaders = css({
      mode: 'development',
    }, {
      sass: {
        loader: {
          additionalData: '$mock: true;',
        },
      },
    })

    expect(loaders).toHaveProperty([2, 'options', 'additionalData'], '$mock: true;')
  })

  test('should throw destructure property error', () => {
    expect(css).toThrow(/Cannot destructure property/)
  })
})
