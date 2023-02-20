"use strict";
exports.__esModule = true;
var LilyPromise = /** @class */ (function () {
    function LilyPromise(executor) {
        this._child = null; // 下一个 Promise 实例
        this._deferred = []; // 存储 then 的回调
        this._status = 'pending'; // promise 状态
        this._value = null; // promise value/reason
        try {
            // executor 执行是同步的，防止回调绑定 this
            executor(this._onfulfilled.bind(this), this._onrejected.bind(this));
        }
        catch (error) {
            this._onrejected(error);
        }
    }
    LilyPromise.prototype.then = function (onFulfilled, onRejected) {
        var child = new LilyPromise(function () { });
        this._child = child;
        this._deferred.push({
            fulfill: onFulfilled || null,
            reject: onRejected || null
        });
        if (this._status !== 'pending') {
            this._handle();
        }
        return child;
    };
    LilyPromise.prototype._onfulfilled = function (value) {
        var _this = this;
        if (this._status !== 'pending')
            return;
        if (value && value.then) {
            value.then(function (val) { _this._onfulfilled(val); }, function (err) { _this._onrejected(err); });
            return;
        }
        this._status = 'fulfilled';
        this._value = value;
        asap(function () {
            _this._handle();
        });
    };
    // private _dofulfilled(value) {
    //   this._status = 'fulfilled';
    //   this._value = value;
    //   asap(() => {
    //     this._handle();
    //   });
    // }
    LilyPromise.prototype._onrejected = function (error) {
        var _this = this;
        if (this._status !== 'pending')
            return;
        this._status = 'rejected';
        this._value = error;
        asap(function () {
            _this._handle();
        });
    };
    // private _dorejected(error) {
    //   this._status = 'rejected';
    //   this._value = error;
    //   asap(() => {
    //     this._handle();
    //   });
    // }
    LilyPromise.prototype._handle = function () {
        var value = this._value;
        if (this._deferred.length === 0 && this._status === 'rejected') {
            console.warn('Unhandled promise rejection', value);
            return;
        }
        for (var i = 0, len = this._deferred.length; i < len; i++) {
            var current = this._deferred[i];
            var cb = this._status === 'fulfilled' ? current.fulfill : current.reject;
            // 如果没有回调，直接传递给下一个 promise
            if (!cb) {
                this._status === 'fulfilled' ? this._resolve(value) : this._reject(value);
            }
            else {
                try {
                    var ret = cb(value);
                    if (ret === this._child) {
                        throw new TypeError('Chaining cycle detected for promise');
                    }
                    // 假如这样可以判断是不是 promise
                    if (ret && ret.then && typeof ret.then === 'function') {
                        try {
                            // 如果回调返回的是一个 promise，那么就等待这个 promise 执行完毕，再执行下一个 promise
                            // ret.then((val) => { this._child._dofulfilled(val) }, (err) => { this._child._dorejected(err) });
                            ret.then(this._onfulfilled.bind(this._child), this._onrejected.bind(this._child));
                        }
                        catch (error) {
                            this._reject(error);
                        }
                    }
                }
                catch (error) {
                    this._reject(error);
                }
            }
        }
    };
    LilyPromise.prototype._reject = function (error) {
        if (this._child) {
            this._child._onrejected(error);
        }
    };
    LilyPromise.prototype._resolve = function (value) {
        if (this._child) {
            this._child._onfulfilled(value);
        }
    };
    return LilyPromise;
}());
var asap = (typeof process !== 'undefined' && process.nextTick) || setImmediate || setTimeout; // 还有个MutationObserver，但还未了解
exports["default"] = LilyPromise;
