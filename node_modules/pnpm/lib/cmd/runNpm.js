"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const runScript_1 = require("../runScript");
function runNpm(args) {
    const result = runScript_1.sync('npm', args, {
        cwd: process.cwd(),
        stdio: 'inherit',
        userAgent: undefined,
    });
    process.exit(result.status);
}
exports.default = runNpm;
//# sourceMappingURL=runNpm.js.map