'use strict';

const fs = require('graceful-fs');
const path = require('path');
const retry = require('retry');
const syncFs = require('./lib/syncFs');

const locks = {};

function getLockFile(file) {
    return `${file}.lock`;
}

function canonicalPath(file, options, callback) {
    if (!options.realpath) {
        return callback(null, path.resolve(file));
    }

    // Use realpath to resolve symlinks
    // It also resolves relative paths
    options.fs.realpath(file, callback);
}

function acquireLock(file, options, callback) {
    // Use mkdir to create the lockfile (atomic operation)
    options.fs.mkdir(getLockFile(file), (err) => {
        // If successful, we are done
        if (!err) {
            return callback();
        }

        // If error is not EEXIST then some other error occurred while locking
        if (err.code !== 'EEXIST') {
            return callback(err);
        }

        // Otherwise, check if lock is stale by analyzing the file mtime
        if (options.stale <= 0) {
            return callback(Object.assign(new Error('Lock file is already being hold'), { code: 'ELOCKED', file }));
        }

        options.fs.stat(getLockFile(file), (err, stat) => {
            if (err) {
                // Retry if the lockfile has been removed (meanwhile)
                // Skip stale check to avoid recursiveness
                if (err.code === 'ENOENT') {
                    return acquireLock(file, Object.assign({}, options, { stale: 0 }), callback);
                }

                return callback(err);
            }

            if (!isLockStale(stat, options)) {
                return callback(Object.assign(new Error('Lock file is already being hold'), { code: 'ELOCKED', file }));
            }

            // If it's stale, remove it and try again!
            // Skip stale check to avoid recursiveness
            removeLock(file, options, (err) => {
                if (err) {
                    return callback(err);
                }

                acquireLock(file, Object.assign({}, options, { stale: 0 }), callback);
            });
        });
    });
}

function isLockStale(stat, options) {
    return stat.mtime.getTime() < Date.now() - options.stale;
}

function removeLock(file, options, callback) {
    // Remove lockfile, ignoring ENOENT errors
    options.fs.rmdir(getLockFile(file), (err) => {
        if (err && err.code !== 'ENOENT') {
            return callback(err);
        }

        callback();
    });
}

function updateLock(file, options) {
    const lock = locks[file];

    /* istanbul ignore next */
    if (lock.updateTimeout) {
        return;
    }

    lock.updateDelay = lock.updateDelay || options.update;
    lock.updateTimeout = setTimeout(() => {
        const mtime = Date.now() / 1000;

        lock.updateTimeout = null;

        options.fs.utimes(getLockFile(file), mtime, mtime, (err) => {
            // Ignore if the lock was released
            if (lock.released) {
                return;
            }

            // Verify if we are within the stale threshold
            if (lock.lastUpdate <= Date.now() - options.stale &&
                lock.lastUpdate > Date.now() - options.stale * 2) {
                return compromisedLock(file, lock, Object.assign(new Error(lock.updateError || 'Unable to update lock within the stale \
threshold'), { code: 'ECOMPROMISED' }));
            }

            // If the file is older than (stale * 2), we assume the clock is moved manually,
            // which we consider a valid case

            // If it failed to update the lockfile, keep trying unless
            // the lockfile was deleted!
            if (err) {
                if (err.code === 'ENOENT') {
                    return compromisedLock(file, lock, Object.assign(err, { code: 'ECOMPROMISED' }));
                }

                lock.updateError = err;
                lock.updateDelay = 1000;
                return updateLock(file, options);
            }

            // All ok, keep updating..
            lock.lastUpdate = Date.now();
            lock.updateError = null;
            lock.updateDelay = null;
            updateLock(file, options);
        });
    }, lock.updateDelay);

    // Unref the timer so that the nodejs process can exit freely
    // This is safe because all acquired locks will be automatically released
    // on process exit

    // We first check that `lock.updateTimeout.unref` exists because some users
    // may be using this module outside of NodeJS (e.g., in an electron app), 
    // and in those cases `setTimeout` return an integer.
    if (lock.updateTimeout.unref) {
        lock.updateTimeout.unref();
    }
}

function compromisedLock(file, lock, err) {
    lock.released = true;                                    // Signal the lock has been released
    /* istanbul ignore next */
    lock.updateTimeout && clearTimeout(lock.updateTimeout);  // Cancel lock mtime update

    if (locks[file] === lock) {
        delete locks[file];
    }

    lock.compromised(err);
}

// -----------------------------------------

function lock(file, options, compromised, callback) {
    if (typeof options === 'function') {
        callback = compromised;
        compromised = options;
        options = null;
    }

    if (!callback) {
        callback = compromised;
        compromised = null;
    }

    options = Object.assign({
        stale: 10000,
        update: null,
        realpath: true,
        retries: 0,
        fs,
    }, options);

    options.retries = options.retries || 0;
    options.retries = typeof options.retries === 'number' ? { retries: options.retries } : options.retries;
    options.stale = Math.max(options.stale || 0, 2000);
    options.update = options.update == null ? options.stale / 2 : options.update || 0;
    options.update = Math.max(Math.min(options.update, options.stale / 2), 1000);
    compromised = compromised || function (err) { throw err; };

    // Resolve to a canonical file path
    canonicalPath(file, options, (err, file) => {
        if (err) {
            return callback(err);
        }

        // Attempt to acquire the lock
        const operation = retry.operation(options.retries);

        operation.attempt(() => {
            acquireLock(file, options, (err) => {
                if (operation.retry(err)) {
                    return;
                }

                if (err) {
                    return callback(operation.mainError());
                }

                // We now own the lock
                const lock = locks[file] = {
                    options,
                    compromised,
                    lastUpdate: Date.now(),
                };

                // We must keep the lock fresh to avoid staleness
                updateLock(file, options);

                callback(null, (releasedCallback) => {
                    if (lock.released) {
                        return releasedCallback &&
                            releasedCallback(Object.assign(new Error('Lock is already released'), { code: 'ERELEASED' }));
                    }

                    // Not necessary to use realpath twice when unlocking
                    unlock(file, Object.assign({}, options, { realpath: false }), releasedCallback);
                });
            });
        });
    });
}

function unlock(file, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = Object.assign({
        fs,
        realpath: true,
    }, options);

    callback = callback || function () {};

    // Resolve to a canonical file path
    canonicalPath(file, options, (err, file) => {
        if (err) {
            return callback(err);
        }

        // Skip if the lock is not acquired
        const lock = locks[file];

        if (!lock) {
            return callback(Object.assign(new Error('Lock is not acquired/owned by you'), { code: 'ENOTACQUIRED' }));
        }

        lock.updateTimeout && clearTimeout(lock.updateTimeout);  // Cancel lock mtime update
        lock.released = true;                                    // Signal the lock has been released
        delete locks[file];                                      // Delete from locks

        removeLock(file, options, callback);
    });
}

function lockSync(file, options, compromised) {
    if (typeof options === 'function') {
        compromised = options;
        options = null;
    }

    options = options || {};
    options.fs = syncFs(options.fs || fs);
    options.retries = options.retries || 0;
    options.retries = typeof options.retries === 'number' ? { retries: options.retries } : options.retries;

    // Retries are not allowed because it requires the flow to be sync
    if (options.retries.retries) {
        throw Object.assign(new Error('Cannot use retries with the sync api'), { code: 'ESYNC' });
    }

    let err;
    let release;

    lock(file, options, compromised, (_err, _release) => {
        err = _err;
        release = _release;
    });

    if (err) {
        throw err;
    }

    return release;
}

function unlockSync(file, options) {
    options = options || {};
    options.fs = syncFs(options.fs || fs);

    let err;

    unlock(file, options, (_err) => {
        err = _err;
    });

    if (err) {
        throw err;
    }
}

function check(file, options, callback) {
    if (typeof options === 'function') {
        callback = options;
        options = null;
    }

    options = Object.assign({
        stale: 10000,
        realpath: true,
        fs,
    }, options);

    options.stale = Math.max(options.stale || 0, 2000);

    // Resolve to a canonical file path
    canonicalPath(file, options, (err, file) => {
        if (err) {
            return callback(err);
        }

        // Check if lockfile exists
        options.fs.stat(getLockFile(file), (err, stat) => {
            if (err) {
                // if does not exist, file is not locked. Otherwise, callback with error
                return (err.code === 'ENOENT') ? callback(null, false) : callback(err);
            }

            if (options.stale <= 0) { return callback(null, true); }

            // Otherwise, check if lock is stale by analyzing the file mtime
            return callback(null, !isLockStale(stat, options));
        });
    });
}

function checkSync(file, options) {
    options = options || {};
    options.fs = syncFs(options.fs || fs);

    let err;
    let locked;

    check(file, options, (_err, _locked) => {
        err = _err;
        locked = _locked;
    });

    if (err) {
        throw err;
    }

    return locked;
}


// Remove acquired locks on exit
/* istanbul ignore next */
process.on('exit', () => {
    Object.keys(locks).forEach((file) => {
        try { locks[file].options.fs.rmdirSync(getLockFile(file)); } catch (e) { /* empty */ }
    });
});

module.exports = lock;
module.exports.lock = lock;
module.exports.unlock = unlock;
module.exports.lockSync = lockSync;
module.exports.unlockSync = unlockSync;
module.exports.check = check;
module.exports.checkSync = checkSync;
