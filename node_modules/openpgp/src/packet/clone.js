// OpenPGP.js - An OpenPGP implementation in javascript
// Copyright (C) 2015 Tankred Hase
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
 * @fileoverview This module implements packet list cloning required to
 * pass certain object types beteen the web worker and main thread using
 * the structured cloning algorithm.
 */

'use strict';

import * as key from '../key.js';
import * as message from '../message.js';
import * as cleartext from '../cleartext.js';
import * as signature from '../signature.js'
import Packetlist from './packetlist.js';
import type_keyid from '../type/keyid.js';


//////////////////////////////
//                          //
//   Packetlist --> Clone   //
//                          //
//////////////////////////////


/**
 * Create a packetlist from the correspoding object types.
 * @param  {Object} options   the object passed to and from the web worker
 * @return {Object}           a mutated version of the options optject
 */
export function clonePackets(options) {
  if(options.publicKeys) {
    options.publicKeys = options.publicKeys.map(key => key.toPacketlist());
  }
  if(options.privateKeys) {
    options.privateKeys = options.privateKeys.map(key => key.toPacketlist());
  }
  if(options.privateKey) {
    options.privateKey = options.privateKey.toPacketlist();
  }
  if (options.key) {
    options.key = options.key.toPacketlist();
  }
  if (options.message) {
    //could be either a Message or CleartextMessage object
    if (options.message instanceof message.Message) {
      options.message = options.message.packets;
    } else if (options.message instanceof cleartext.CleartextMessage) {
      options.message.signature = options.message.signature.packets;
    }
  }
  if (options.signature && (options.signature instanceof signature.Signature)) {
    options.signature = options.signature.packets;
  }
  if (options.signatures) {
    options.signatures = options.signatures.map(sig => verificationObjectToClone(sig));
  }
  return options;
}

function verificationObjectToClone(verObject) {
  verObject.signature = verObject.signature.packets;
  return verObject;
}

//////////////////////////////
//                          //
//   Clone --> Packetlist   //
//                          //
//////////////////////////////


/**
 * Creates an object with the correct prototype from a corresponding packetlist.
 * @param  {Object} options   the object passed to and from the web worker
 * @param  {String} method    the public api function name to be delegated to the worker
 * @return {Object}           a mutated version of the options optject
 */
export function parseClonedPackets(options, method) {
  if(options.publicKeys) {
    options.publicKeys = options.publicKeys.map(packetlistCloneToKey);
  }
  if(options.privateKeys) {
    options.privateKeys = options.privateKeys.map(packetlistCloneToKey);
  }
  if(options.privateKey) {
    options.privateKey = packetlistCloneToKey(options.privateKey);
  }
  if (options.key) {
    options.key = packetlistCloneToKey(options.key);
  }
  if (options.message && options.message.signature) {
    options.message = packetlistCloneToCleartextMessage(options.message);
  } else if (options.message) {
    options.message = packetlistCloneToMessage(options.message);
  }
  if (options.signatures) {
    options.signatures = options.signatures.map(packetlistCloneToSignatures);
  }
  if (options.signature) {
    options.signature = packetlistCloneToSignature(options.signature);
  }
  return options;
}

function packetlistCloneToKey(clone) {
  const packetlist = Packetlist.fromStructuredClone(clone);
  return new key.Key(packetlist);
}

function packetlistCloneToMessage(clone) {
  const packetlist = Packetlist.fromStructuredClone(clone);
  return new message.Message(packetlist);
}

function packetlistCloneToCleartextMessage(clone) {
  var packetlist = Packetlist.fromStructuredClone(clone.signature);
  return new cleartext.CleartextMessage(clone.text, new signature.Signature(packetlist));
}

//verification objects
function packetlistCloneToSignatures(clone) {
  clone.keyid = type_keyid.fromClone(clone.keyid);
  clone.signature = new signature.Signature(clone.signature);
  return clone;
}

function packetlistCloneToSignature(clone) {
  if (typeof clone === "string") {
    //signature is armored
    return clone;
  }
  var packetlist = Packetlist.fromStructuredClone(clone);
  return new signature.Signature(packetlist);
}
