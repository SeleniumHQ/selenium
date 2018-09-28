"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalize = require("normalize-path");
const path = require("path");
function pkgIdToFilename(pkgId, prefix) {
    if (pkgId.indexOf('file:') !== 0)
        return pkgId;
    const absolutePath = path.join(prefix, pkgId.slice(5));
    return `local/${encodeURIComponent(normalize(absolutePath))}`;
}
exports.default = pkgIdToFilename;
//# sourceMappingURL=index.js.map