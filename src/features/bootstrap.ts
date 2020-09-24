import webpack from 'webpack'

import type {
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
        'bootstrap@^4.5.0',
        'jquery@^3.5.1',
        'popper.js@^1.16.1',
      ],
    }
  }

  public plugins(): webpack.WebpackPluginInstance[] {
    return [
      /**
       * @see https://webpack.js.org/plugins/provide-plugin
       * @see https://github.com/shakacode/bootstrap-loader#bootstrap-4-internal-dependency-solution
       */
      new webpack.ProvidePlugin({
        Alert     : 'exports-loader?exports=Alert!bootstrap/js/dist/alert',
        Button    : 'exports-loader?exports=Button!bootstrap/js/dist/button',
        Carousel  : 'exports-loader?exports=Carousel!bootstrap/js/dist/carousel',
        Collapse  : 'exports-loader?exports=Collapse!bootstrap/js/dist/collapse',
        Dropdown  : 'exports-loader?exports=Dropdown!bootstrap/js/dist/dropdown',
        Modal     : 'exports-loader?exports=Modal!bootstrap/js/dist/modal',
        Popover   : 'exports-loader?exports=Popover!bootstrap/js/dist/popover',
        Popper    : ['popper.js', 'default'],
        Scrollspy : 'exports-loader?exports=Scrollspy!bootstrap/js/dist/scrollspy',
        Tab       : 'exports-loader?exports=Tab!bootstrap/js/dist/tab',
        Tooltip   : 'exports-loader?exports=Tooltip!bootstrap/js/dist/tooltip',
        Util      : 'exports-loader?exports=Util!bootstrap/js/dist/util',
      }),
    ]
  }
}
