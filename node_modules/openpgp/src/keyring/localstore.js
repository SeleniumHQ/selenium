// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 3.0 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

/**
 * The class that deals with storage of the keyring. Currently the only option is to use HTML5 local storage.
 * @requires config
 * @module keyring/localstore
 * @param {String} prefix prefix for itemnames in localstore
 */

'use strict';

import config from '../config';
import * as keyModule from '../key.js';
import util from '../util.js';

export default function LocalStore(prefix) {
  prefix = prefix || 'openpgp-';
  this.publicKeysItem = prefix + this.publicKeysItem;
  this.privateKeysItem = prefix + this.privateKeysItem;
  if (typeof window !== 'undefined' && window.localStorage) {
    this.storage = window.localStorage;
  } else {
    this.storage = new (require('node-localstorage').LocalStorage)(config.node_store);
  }
}

/*
 * Declare the localstore itemnames
 */
LocalStore.prototype.publicKeysItem = 'public-keys';
LocalStore.prototype.privateKeysItem = 'private-keys';

/**
 * Load the public keys from HTML5 local storage.
 * @return {Array<module:key~Key>} array of keys retrieved from localstore
 */
LocalStore.prototype.loadPublic = function () {
  return loadKeys(this.storage, this.publicKeysItem);
};

/**
 * Load the private keys from HTML5 local storage.
 * @return {Array<module:key~Key>} array of keys retrieved from localstore
 */
LocalStore.prototype.loadPrivate = function () {
  return loadKeys(this.storage, this.privateKeysItem);
};

function loadKeys(storage, itemname) {
  var armoredKeys = JSON.parse(storage.getItem(itemname));
  var keys = [];
  if (armoredKeys !== null && armoredKeys.length !== 0) {
    var key;
    for (var i = 0; i < armoredKeys.length; i++) {
      key = keyModule.readArmored(armoredKeys[i]);
      if (!key.err) {
        keys.push(key.keys[0]);
      } else {
        util.print_debug("Error reading armored key from keyring index: " + i);
      }
    }
  }
  return keys;
}

/**
 * Saves the current state of the public keys to HTML5 local storage.
 * The key array gets stringified using JSON
 * @param {Array<module:key~Key>} keys array of keys to save in localstore
 */
LocalStore.prototype.storePublic = function (keys) {
  storeKeys(this.storage, this.publicKeysItem, keys);
};

/**
 * Saves the current state of the private keys to HTML5 local storage.
 * The key array gets stringified using JSON
 * @param {Array<module:key~Key>} keys array of keys to save in localstore
 */
LocalStore.prototype.storePrivate = function (keys) {
  storeKeys(this.storage, this.privateKeysItem, keys);
};

function storeKeys(storage, itemname, keys) {
  var armoredKeys = [];
  if (keys.length) {
    for (var i = 0; i < keys.length; i++) {
      armoredKeys.push(keys[i].armor());
    }
    storage.setItem(itemname, JSON.stringify(armoredKeys));
  } else {
    storage.removeItem(itemname);
  }
}
