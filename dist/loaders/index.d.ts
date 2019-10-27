/// <reference types="webpack" />
/// <reference types="webpack-dev-server" />
declare const _default: {
    css: (env: import("webpack").ParserOptions, options?: {
        sassLoader?: {
            [key: string]: any;
        } | undefined;
        sassOptions?: import("sass").Options | undefined;
    }) => import("webpack").RuleSetUseItem[];
    js: (env: import("webpack").ParserOptions, options?: {
        configFile?: string | undefined;
    }) => import("webpack").RuleSetRule[];
};
export default _default;
//# sourceMappingURL=index.d.ts.map