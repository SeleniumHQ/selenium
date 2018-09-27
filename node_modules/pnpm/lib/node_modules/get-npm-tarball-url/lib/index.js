"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalizeRegistry = require("normalize-registry-url");
function default_1(pkgName, pkgVersion, opts) {
    const registry = normalizeRegistry(opts && opts.registry || 'https://registry.npmjs.org/');
    const scopelessName = getScopelessName(pkgName);
    return `${registry}${pkgName}/-/${scopelessName}-${pkgVersion}.tgz`;
}
exports.default = default_1;
function getScopelessName(name) {
    if (name[0] !== '@') {
        return name;
    }
    return name.split('/')[1];
}
//# sourceMappingURL=index.js.map