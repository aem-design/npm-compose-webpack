import * as Types from './ast'

/**
 * Default projects map for core and styleguide (DLS).
 * @var {ProjectMap}
 */
export const defaultProjects: Types.ProjectMap = {
  core: {
    outputName: 'app',

    fileMap: {
      header: [
        '../../clientlibs-header/js/vendorlib/common',
      ],
    },

    entryFile: {
      js   : 'app.ts',
      sass : 'app.scss',
    },

    additionalEntries: {
      '../../clientlibs-header/js/vendorlib/common': [
        './core/js/vendor.ts',
        'es6-promise/auto',
        'classlist.js',
        'picturefill',
        'bootstrap/js/dist/util',
        'bootstrap/js/dist/collapse',
        'bootstrap/js/dist/dropdown',
      ],
    },
  },

  styleguide: {
    outputName: 'styleguide',

    entryFile: {
      js   : 'styleguide.ts',
      sass : 'styleguide.scss',
    },
  },
}
