'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Promise;

if (require('node-version').major >= 4) {
    Promise = global.Promise;
} else {
    // Don't use the native Promise in Node.js <4 since it doesn't support subclassing
    Promise = require('promise-polyfill');
}

var ChildProcessPromise = function (_Promise) {
    _inherits(ChildProcessPromise, _Promise);

    function ChildProcessPromise(executor) {
        _classCallCheck(this, ChildProcessPromise);

        var resolve;
        var reject;

        var _this = _possibleConstructorReturn(this, (ChildProcessPromise.__proto__ || Object.getPrototypeOf(ChildProcessPromise)).call(this, function (_resolve, _reject) {
            resolve = _resolve;
            reject = _reject;

            if (executor) {
                executor(resolve, reject);
            }
        }));

        _this._cpResolve = resolve;
        _this._cpReject = reject;
        _this.childProcess = undefined;
        return _this;
    }

    _createClass(ChildProcessPromise, [{
        key: 'progress',
        value: function progress(callback) {
            var _this2 = this;

            process.nextTick(function () {
                callback(_this2.childProcess);
            });

            return this;
        }
    }, {
        key: 'then',
        value: function then(onFulfilled, onRejected) {
            var newPromise = _get(ChildProcessPromise.prototype.__proto__ || Object.getPrototypeOf(ChildProcessPromise.prototype), 'then', this).call(this, onFulfilled, onRejected);
            newPromise.childProcess = this.childProcess;
            return newPromise;
        }
    }, {
        key: 'catch',
        value: function _catch(onRejected) {
            var newPromise = _get(ChildProcessPromise.prototype.__proto__ || Object.getPrototypeOf(ChildProcessPromise.prototype), 'catch', this).call(this, onRejected);
            newPromise.childProcess = this.childProcess;
            return newPromise;
        }
    }, {
        key: 'done',
        value: function done() {
            this.catch(function (e) {
                process.nextTick(function () {
                    throw e;
                });
            });
        }
    }]);

    return ChildProcessPromise;
}(Promise);

ChildProcessPromise.prototype.fail = ChildProcessPromise.prototype.catch;

module.exports = ChildProcessPromise;