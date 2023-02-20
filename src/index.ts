type STATUS = 'pending' | 'fulfilled' | 'rejected';

class LilyPromise {
  private _child: LilyPromise | null;
  private _deferred: any[];
  private _status: STATUS;
  private _value: any;

  constructor(executor) {
    this._child = null; // 下一个 Promise 实例
    this._deferred = []; // 存储 then 的回调
    this._status = 'pending'; // promise 状态
    this._value = null; // promise value/reason

    try {
      // executor 执行是同步的，防止回调绑定 this
      executor(this._onfulfilled.bind(this), this._onrejected.bind(this));
    } catch (error) {
      this._onrejected(error);
    }
  }

  then(onFulfilled?, onRejected?) {
    const child = new LilyPromise(() => { });
    this._child = child;

    this._deferred.push({
      fulfill: onFulfilled || null,
      reject: onRejected || null,
    })

    if (this._status !== 'pending') {
      this._handle();
    }

    return child;
  }

  private _onfulfilled(value) {
    if (this._status !== 'pending') return;

    if (value && value.then) {
      value.then((val) => { this._onfulfilled(val) }, (err) => { this._onrejected(err) });
      return;
    }

    this._status = 'fulfilled';
    this._value = value;
    asap(() => {
      this._handle();
    });
  }

  // private _dofulfilled(value) {
  //   this._status = 'fulfilled';
  //   this._value = value;
  //   asap(() => {
  //     this._handle();
  //   });
  // }

  private _onrejected(error: any): void {
    if (this._status !== 'pending') return;

    this._status = 'rejected';
    this._value = error;
    asap(() => {
      this._handle();
    });
  }

  // private _dorejected(error) {
  //   this._status = 'rejected';
  //   this._value = error;
  //   asap(() => {
  //     this._handle();
  //   });
  // }

  private _handle(): void {
    const value = this._value;

    if (this._deferred.length === 0 && this._status === 'rejected') {
      console.warn('Unhandled promise rejection', value);
      return;
    }

    for (let i = 0, len = this._deferred.length; i < len; i++) {
      const current = this._deferred[i];
      const cb = this._status === 'fulfilled' ? current.fulfill : current.reject;

      // 如果没有回调，直接传递给下一个 promise
      if (!cb) {
        this._status === 'fulfilled' ? this._resolve(value) : this._reject(value);
      } else {
        try {
          const ret = cb(value);

          if (ret === this._child) {
            throw new TypeError('Chaining cycle detected for promise');
          }

          // 假如这样可以判断是不是 promise
          if (ret && ret.then && typeof ret.then === 'function') {
            try {
              // 如果回调返回的是一个 promise，那么就等待这个 promise 执行完毕，再执行下一个 promise
              // ret.then((val) => { this._child._dofulfilled(val) }, (err) => { this._child._dorejected(err) });
              ret.then(this._onfulfilled.bind(this._child), this._onrejected.bind(this._child));
            } catch (error) {
              this._reject(error)
            }
          }
        } catch (error) {
          this._reject(error);
        }
      }
    }
  }

  _reject(error) {
    if (this._child) {
      this._child._onrejected(error);
    }
  }

  _resolve(value) {
    if (this._child) {
      this._child._onfulfilled(value);
    }
  }
}

const asap = (typeof process !== 'undefined' && process.nextTick) || setImmediate || setTimeout; // 还有个MutationObserver，但还未了解

export default LilyPromise;