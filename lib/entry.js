"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
function getHMRConfiguration(project) {
    const mappedEntries = {
        footer: [],
        header: [],
    };
    const additionalEntries = project.additionalEntries;
    const fileMap = project.fileMap;
    if (additionalEntries && fileMap) {
        for (const key of Object.keys(mappedEntries)) {
            const additionalEntryKeys = Object.keys(additionalEntries)
                .filter((x) => fileMap[key].indexOf(x) !== -1);
            for (const entryKey of additionalEntryKeys) {
                mappedEntries[key] = [
                    ...mappedEntries[key],
                    ...additionalEntries[entryKey],
                ];
            }
        }
    }
    return {
        'clientlibs-footer': [
            `./${config_1.environment.project}/js/${project.entryFile.js}`,
            `./${config_1.environment.project}/scss/${project.entryFile.sass}`,
            ...mappedEntries.footer,
        ],
        'clientlibs-header': [
            './hmr/empty.css',
            ...mappedEntries.header,
        ],
    };
}
exports.default = (flagHMR) => {
    const project = config_1.getProjectConfiguration();
    if (flagHMR) {
        return getHMRConfiguration(project);
    }
    return Object.assign({ [project.outputName]: [
            `./${config_1.environment.project}/js/${project.entryFile.js}`,
            `./${config_1.environment.project}/scss/${project.entryFile.sass}`,
        ] }, project.additionalEntries);
};
