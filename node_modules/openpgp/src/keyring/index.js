'use strict';

/**
 * @see module:keyring/keyring
 * @module keyring
 */
import Keyring from './keyring.js';

import localstore from './localstore.js';
Keyring.localstore = localstore;

export default Keyring;
