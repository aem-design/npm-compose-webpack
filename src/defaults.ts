import type {
  ProjectsConfiguration,
} from '@/types'

export const defaultProjects: ProjectsConfiguration = {
  core: {
    entryFile: 'app.ts',
    outputName: 'app',

    fileMap: {
      header: [
        'vendorlib/common',
      ],
    },

    additionalEntries: {
      'vendorlib/common': [
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
    entryFile: 'styleguide.ts',
    outputName: 'styleguide',
  },
}
