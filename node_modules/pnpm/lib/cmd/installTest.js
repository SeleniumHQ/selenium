"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const install_1 = require("./install");
const runNpm_1 = require("./runNpm");
function default_1(input, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        yield install_1.default(input, opts);
        runNpm_1.default(['test']);
    });
}
exports.default = default_1;
//# sourceMappingURL=installTest.js.map