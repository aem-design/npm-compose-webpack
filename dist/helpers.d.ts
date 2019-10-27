import * as Types from './ast';
/**
 * Gets the Maven configuration from the file system and returns the value requested.
 *
 * @param {MavenConfig} config Maven configuration
 * @return {string} Found value or the given `fallback`
 */
export declare function getMavenConfigurationValueByPath<R>({ fallback, parser, path: propPath, pom }: Types.MavenConfig<R>): R;
/**
 * Determines if the current mode is for development.
 *
 * @param {*} obj Value to pass back
 * @return {*}
 */
export declare function ifDev(obj: any): any;
/**
 * Determines if the current mode is for production.
 *
 * @param {*} obj Value to pass back
 * @return {*}
 */
export declare function ifProd(obj: any): any;
//# sourceMappingURL=helpers.d.ts.map