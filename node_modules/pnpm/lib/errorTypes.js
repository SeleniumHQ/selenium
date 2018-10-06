"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PnpmError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
exports.PnpmError = PnpmError;
//# sourceMappingURL=errorTypes.js.map