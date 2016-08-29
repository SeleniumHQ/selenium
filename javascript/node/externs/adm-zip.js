// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * @fileoverview Extern definitions for https://www.npmjs.com/package/adm-zip
 */

/** @const */
var adm = {};


/** @constructor */
function EntryHeader() {}

/** @type {number} */
EntryHeader.prototype.method;


/**
 * @constructor
 */
function ZipEntry() {}

/**
 * @type {!EntryHeader}
 */
ZipEntry.prototype.header;


/**
 * @param {string=} path
 * @constructor
 */
adm.AdmZip = function(path) {};

/**
 * @param {string} localPath
 * @param {string=} zipPath
 * @return {void}
 */
adm.AdmZip.prototype.addLocalFolder = function(localPath, zipPath) {};

/**
 * @param {string} localPath
 * @param {string=} zipPath
 * @return {void}
 */
adm.AdmZip.prototype.addLocalFile = function(localPath, zipPath) {};

/**
 * @param {string} path
 * @param {boolean=} overwrite
 * @return {void}
 */
adm.AdmZip.prototype.extractAllTo = function(path, overwrite) {};

/**
 * @param {string} path
 * @return {ZipEntry}
 */
adm.AdmZip.prototype.getEntry = function(path) {};

/**
 * @return {!Array<!ZipEntry>}
 */
adm.AdmZip.prototype.getEntries = function() {};

/**
 * @param {string} entry
 * @param {function(string)} callback
 * @param {string=} encoding
 * @return {void}
 */
adm.AdmZip.prototype.readAsTextAsync = function(entry, callback, encoding) {};

/**
 * @param {string} path
 * @return {void}
 */
adm.AdmZip.prototype.writeZip = function(path) {};

/** @return {!Buffer} */
adm.AdmZip.prototype.toBuffer = function() {};


module.exports = adm.AdmZip;
