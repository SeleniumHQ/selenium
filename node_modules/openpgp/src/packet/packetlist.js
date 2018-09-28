/**
 * This class represents a list of openpgp packets.
 * Take care when iterating over it - the packets themselves
 * are stored as numerical indices.
 * @requires util
 * @requires enums
 * @requires packet
 * @requires packet/packet
 * @module packet/packetlist
 */

'use strict';

import util from '../util';
import packetParser from './packet.js';
import * as packets from './all_packets.js';
import enums from '../enums.js';
import config from '../config';

/**
 * @constructor
 */
export default function Packetlist() {
  /** The number of packets contained within the list.
   * @readonly
   * @type {Integer} */
  this.length = 0;
}
/**
 * Reads a stream of binary data and interprents it as a list of packets.
 * @param {Uint8Array} A Uint8Array of bytes.
 */
Packetlist.prototype.read = function (bytes) {
  var i = 0;

  while (i < bytes.length) {
    var parsed = packetParser.read(bytes, i, bytes.length - i);
    i = parsed.offset;

    var pushed = false;
    try {
      var tag = enums.read(enums.packet, parsed.tag);
      var packet = packets.newPacketFromTag(tag);
      this.push(packet);
      pushed = true;
      packet.read(parsed.packet);
    } catch(e) {
      if (!config.tolerant || parsed.tag == enums.packet.symmetricallyEncrypted || parsed.tag == enums.packet.literal || parsed.tag == enums.packet.compressed) {
        throw e;
      }
      if (pushed) {
        this.pop(); // drop unsupported packet
      }
    }
  }
};

/**
 * Creates a binary representation of openpgp objects contained within the
 * class instance.
 * @returns {Uint8Array} A Uint8Array containing valid openpgp packets.
 */
Packetlist.prototype.write = function () {
  var arr = [];

  for (var i = 0; i < this.length; i++) {
    var packetbytes = this[i].write();
    arr.push(packetParser.writeHeader(this[i].tag, packetbytes.length));
    arr.push(packetbytes);
  }

  return util.concatUint8Array(arr);
};

/**
 * Adds a packet to the list. This is the only supported method of doing so;
 * writing to packetlist[i] directly will result in an error.
 */
Packetlist.prototype.push = function (packet) {
  if (!packet) {
    return;
  }

  packet.packets = packet.packets || new Packetlist();

  this[this.length] = packet;
  this.length++;
};

/**
 * Remove a packet from the list and return it.
 * @return {Object}   The packet that was removed
 */
Packetlist.prototype.pop = function() {
  if (this.length === 0) {
    return;
  }

  var packet = this[this.length - 1];
  delete this[this.length - 1];
  this.length--;

  return packet;
};

/**
* Creates a new PacketList with all packets that pass the test implemented by the provided function.
*/
Packetlist.prototype.filter = function (callback) {

  var filtered = new Packetlist();

  for (var i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      filtered.push(this[i]);
    }
  }

  return filtered;
};

/**
* Creates a new PacketList with all packets from the given types
*/
Packetlist.prototype.filterByTag = function () {
  var args = Array.prototype.slice.call(arguments);
  var filtered = new Packetlist();
  var that = this;

  function handle(packetType) {return that[i].tag === packetType;}
  for (var i = 0; i < this.length; i++) {
    if (args.some(handle)) {
      filtered.push(this[i]);
    }
  }

  return filtered;
};

/**
* Executes the provided callback once for each element
*/
Packetlist.prototype.forEach = function (callback) {
  for (var i = 0; i < this.length; i++) {
    callback(this[i]);
  }
};

/**
 * Traverses packet tree and returns first matching packet
 * @param  {module:enums.packet} type The packet type
 * @return {module:packet/packet|null}
 */
Packetlist.prototype.findPacket = function (type) {
  var packetlist = this.filterByTag(type);
  if (packetlist.length) {
    return packetlist[0];
  } else {
    var found = null;
    for (var i = 0; i < this.length; i++) {
      if (this[i].packets.length) {
        found = this[i].packets.findPacket(type);
        if (found) {
          return found;
        }
      }
    }
  }
  return null;
};

/**
 * Returns array of found indices by tag
 */
Packetlist.prototype.indexOfTag = function () {
  var args = Array.prototype.slice.call(arguments);
  var tagIndex = [];
  var that = this;

  function handle(packetType) {return that[i].tag === packetType;}
  for (var i = 0; i < this.length; i++) {
    if (args.some(handle)) {
      tagIndex.push(i);
    }
  }
  return tagIndex;
};

/**
 * Returns slice of packetlist
 */
Packetlist.prototype.slice = function (begin, end) {
  if (!end) {
    end = this.length;
  }
  var part = new Packetlist();
  for (var i = begin; i < end; i++) {
    part.push(this[i]);
  }
  return part;
};

/**
 * Concatenates packetlist or array of packets
 */
Packetlist.prototype.concat = function (packetlist) {
  if (packetlist) {
    for (var i = 0; i < packetlist.length; i++) {
      this.push(packetlist[i]);
    }
  }
};

/**
 * Allocate a new packetlist from structured packetlist clone
 * See {@link http://www.w3.org/html/wg/drafts/html/master/infrastructure.html#safe-passing-of-structured-data}
 * @param {Object} packetClone packetlist clone
 * @returns {Object} new packetlist object with data from packetlist clone
 */
Packetlist.fromStructuredClone = function(packetlistClone) {
  var packetlist = new Packetlist();
  for (var i = 0; i < packetlistClone.length; i++) {
    packetlist.push(packets.fromStructuredClone(packetlistClone[i]));
    if (packetlist[i].packets.length !== 0) {
      packetlist[i].packets = this.fromStructuredClone(packetlist[i].packets);
    } else {
      packetlist[i].packets = new Packetlist();
    }
  }
  return packetlist;
};