import { readFileSync } from 'fs'
import { resolve } from 'path'

import { get } from 'lodash'
import xml2js from 'xml2js'

import { getIfUtils } from 'webpack-config-utils'

import * as Types from './ast'

import { environment } from './config'

// Internal
const mavenConfigs: Types.SavedMavenConfig = {}
const xmlParser: xml2js.Parser = new xml2js.Parser()

/**
 * Retrieve the Maven configuration using the given `filePath`.
 *
 * @private
 * @param {string} filePath Path to load the Maven configuration
 * @return {string}
 */
function getMavenConfigurationFromFile(filePath: string): string {
  if (mavenConfigs[filePath]) {
    return mavenConfigs[filePath]
  }

  return (mavenConfigs[filePath] = readFileSync(resolve(__dirname, filePath), 'utf-8'))
}

/**
 * Gets the Maven configuration from the file system and returns the value requested.
 *
 * @param {MavenConfig} config Maven configuration
 * @return {string} Found value or the given `fallback`
 */
export function getMavenConfigurationValueByPath<R>({ fallback, parser, path: propPath, pom }: Types.MavenConfig<R>): R {
  let value!: R

  xmlParser.parseString(getMavenConfigurationFromFile(pom), (_: any, { project }: any) => {
    const properties = project.properties[0]

    value = get(properties, propPath, fallback)

    if (parser) {
      value = parser(value)
    }
  })

  return value
}

/**
 * Determines if the current mode is for development.
 *
 * @param {*} obj Value to pass back
 * @return {*}
 */
export function ifDev(obj: any): any {
  return getIfUtils(environment).ifDevelopment(obj)
}

/**
 * Determines if the current mode is for production.
 *
 * @param {*} obj Value to pass back
 * @return {*}
 */
export function ifProd(obj: any): any {
  return getIfUtils(environment).ifProduction(obj)
}
