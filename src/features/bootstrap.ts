import webpack from 'webpack'

import {
  DependenciesMap,
} from '../types'

import { DependencyType } from '../types/enums'

import Feature from './feature'

export default class Bootstrap extends Feature {
  public getFeatureDependencies(): DependenciesMap {
    return {
      [DependencyType.DEV]: [
        'exports-loader@^0.7.0',
      ],

      [DependencyType.NON_DEV]: [
        'bootstrap@^4.4.1',
        'popper.js@^1.16.1',
      ],
    }
  }

  public plugins(): webpack.Plugin[] {
    return [
      /**
       * @see https://webpack.js.org/plugins/provide-plugin
       * @see https://github.com/shakacode/bootstrap-loader#bootstrap-4-internal-dependency-solution
       */
      new webpack.ProvidePlugin({
        Alert     : 'exports-loader?Alert!bootstrap/js/dist/alert',
        Button    : 'exports-loader?Button!bootstrap/js/dist/button',
        Carousel  : 'exports-loader?Carousel!bootstrap/js/dist/carousel',
        Collapse  : 'exports-loader?Collapse!bootstrap/js/dist/collapse',
        Dropdown  : 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
        Modal     : 'exports-loader?Modal!bootstrap/js/dist/modal',
        Popover   : 'exports-loader?Popover!bootstrap/js/dist/popover',
        Popper    : ['popper.js', 'default'],
        Scrollspy : 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
        Tab       : 'exports-loader?Tab!bootstrap/js/dist/tab',
        Tooltip   : 'exports-loader?Tooltip!bootstrap/js/dist/tooltip',
        Util      : 'exports-loader?Util!bootstrap/js/dist/util',
      }),
    ]
  }
}
