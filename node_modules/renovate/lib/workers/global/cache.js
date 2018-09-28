const cacache = require('cacache/en');
const os = require('os');
const path = require('path');
const { DateTime } = require('luxon');

module.exports = {
  init,
};

function getKey(namespace, key) {
  return `${namespace}-${key}`;
}

const renovateCache = path.join(os.tmpdir(), '/renovate/renovate-cache-v1');

async function get(namespace, key) {
  try {
    const res = await cacache.get(renovateCache, getKey(namespace, key));
    const cachedValue = JSON.parse(res.data.toString());
    if (cachedValue) {
      if (DateTime.local() < DateTime.fromISO(cachedValue.expiry)) {
        logger.trace({ namespace, key }, 'Returning cached value');
        return cachedValue.value;
      }
      // istanbul ignore next
      await rm(namespace, key);
    }
  } catch (err) {
    logger.trace({ namespace, key }, 'Cache miss');
  }
  return null;
}

async function set(namespace, key, value, ttlMinutes = 5) {
  logger.trace({ namespace, key, ttlMinutes }, 'Saving cached value');
  await cacache.put(
    renovateCache,
    getKey(namespace, key),
    JSON.stringify({
      value,
      expiry: DateTime.local().plus({ minutes: ttlMinutes }),
    })
  );
}

// istanbul ignore next
async function rm(namespace, key) {
  logger.trace({ namespace, key }, 'Removing cache entry');
  await cacache.rm.entry(renovateCache, getKey(namespace, key));
}

async function rmAll() {
  await cacache.rm.all(renovateCache);
}

function init() {
  global.renovateCache = global.renovateCache || { get, set, rm, rmAll };
}
