const PEDNING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

const resolvePromise = (promise2, x, resolve, reject) => {
  if (promise2 === x) {
    return reject(new TypeError("循环引用"));
  }
  let called;
  if ((typeof x === "object" && x) || typeof x === "function") {
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          value => {
            if (called) return;
            called = true;
            resolvePromise(promise2, value, resolve, reject);
          },
          reason => {
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (called) return;
      called = true;
      reject(error);
    }
  } else {
    resolve(x);
  }
};

class Promise {
  constructor(executor) {
    this.status = PEDNING;
    this.value = null;
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = value => {
      if (this.status === PEDNING) {
        this.status = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(callback => callback());
      }
    };

    let reject = reason => {
      if (this.status === PEDNING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(callback => callback());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : reason => {
            throw reason;
          };
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === PEDNING) {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });

        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }

      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      }
    });
    return promise2;
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      if (value instanceof Promise) {
        value.then(resolve, reject);
      } else {
        resolve(value);
      }
    });
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }

  static all(promises) {
    if (!Array.isArray(promises)) {
      return new TypeError("类型错误");
    }
    let resolveCount = 0;
    let resolveValues = new Array(promises.length);
    return new Promise((resolve, reject) => {
      promises.forEach((p, index) => {
        Promise.resolve(p).then(
          value => {
            resolveCount++;
            resolveValues[index] = value;
            if (resolveCount === promises.length) {
              resolve(resolveValues);
            }
          },
          reason => {
            reject(reason);
          }
        );
      });
    });
  }

  static race(promises) {
    if (!Array.isArray(promises)) {
      return new TypeError("类型错误");
    }
    return new Promise((resolve, reject) => {
      promises.forEach(p => {
        Promise.resolve(p).then(
          value => {
            resolve(value);
          },
          reason => {
            reject(reason);
          }
        );
      });
    });
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
