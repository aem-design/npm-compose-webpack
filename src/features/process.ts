import chalk from 'chalk'
import merge from 'webpack-merge'

import { logger } from '@aem-design/compose-support'

import {
  Environment,
  FeatureList,
  RuntimeConfiguration,
  RuntimePaths,
} from '../types'

import {
  InstallStatus,
} from '../types/enums'

import {
  mergeStrategy,
} from '../config'

import installDependencies from '../support/dependencies'

import {
  exit,
} from '../support/helpers'

import FeatureMap from './map'

export default function processFeatures({ environment, features, paths, webpackConfig }: {
  environment: Environment;
  features: FeatureList;
  paths: RuntimePaths;
  webpackConfig: RuntimeConfiguration;
}): RuntimeConfiguration {
  const skippedFeatures: string[] = []

  let status!: InstallStatus
  let updatedConfig = webpackConfig

  for (const feature of features) {
    try {
      const featureInstance = FeatureMap[feature]({
        ...environment,
        paths,
        webpack: webpackConfig,
      })

      const featureStatus = installDependencies(featureInstance.getFeatureDependencies())

      status = status === InstallStatus.RESTART ? status : featureStatus

      if (featureStatus === InstallStatus.SKIPPED) {
        skippedFeatures.push(feature)
      }

      updatedConfig = merge.smartStrategy(mergeStrategy)(
        updatedConfig,
        featureInstance.defineWebpackConfiguration(),
      )
    } catch (ex) {
      console.log()
      logger.error('Failed to install dependencies:', ex.message)

      exit(1)
    }
  }

  if (skippedFeatures.length) {
    logger.info('No required dependencies are missing for', chalk.bold(skippedFeatures.join(', ')))
  }

  if (status === InstallStatus.RESTART) {
    console.log()
    logger.info('It appears some dependencies were just installed, please re-run the same command again to continue!')

    exit(0)
  }

  return updatedConfig
}
