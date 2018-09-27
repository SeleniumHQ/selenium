'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChildProcessError = function (_Error) {
    _inherits(ChildProcessError, _Error);

    function ChildProcessError(message, code, childProcess, stdout, stderr) {
        _classCallCheck(this, ChildProcessError);

        var _this = _possibleConstructorReturn(this, (ChildProcessError.__proto__ || Object.getPrototypeOf(ChildProcessError)).call(this, message));

        Error.captureStackTrace(_this, _this.constructor);
        _this.name = _this.constructor.name;
        _this.code = code;
        _this.childProcess = childProcess;
        _this.stdout = stdout;
        _this.stderr = stderr;
        return _this;
    }

    return ChildProcessError;
}(Error);

module.exports = ChildProcessError;