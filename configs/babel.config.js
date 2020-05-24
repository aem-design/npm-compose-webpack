const corejs = {
  proposals : true,
  version   : 3,
}

module.exports = {
  presets: [
    ['@babel/preset-env', {
      loose       : true,
      modules     : false,
      useBuiltIns : 'entry',

      corejs,
    }],
  ],

  plugins: [
    ['@babel/transform-runtime', {
      corejs,
    }],

    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/proposal-nullish-coalescing-operator',
    '@babel/syntax-dynamic-import',

    ['@babel/transform-regenerator', {
      'async'           : true,
      'asyncGenerators' : false,
      'generators'      : false,
    }],

    'lodash',
  ],
}
