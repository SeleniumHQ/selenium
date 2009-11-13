// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2006 Google Inc. All Rights Reserved.

/**
 * @fileoverview Definition of goog.gears.BaseStore which
 * is a base class for the various database stores. It provides
 * the basic structure for creating, updating and removing the store, as well
 * as versioning. It also provides ways to interconnect stores.
 *
 */

goog.provide('goog.gears.BaseStore');
goog.provide('goog.gears.BaseStore.SchemaType');

goog.require('goog.Disposable');


/**
 * This class implements the common store functionality
 *
 * @param {goog.gears.Database} database The data base to store the data in.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.gears.BaseStore = function(database) {
  goog.Disposable.call(this);

  /**
   * The underlying database that holds the message store.
   * @private
   * @type {goog.gears.Database}
   */
  this.database_ = database;
};
goog.inherits(goog.gears.BaseStore, goog.Disposable);


/**
 * Schema definition types
 * @enum {number}
 */
goog.gears.BaseStore.SchemaType = {
  TABLE: 1,
  VIRTUAL_TABLE: 2,
  INDEX: 3,
  BEFORE_INSERT_TRIGGER: 4,
  AFTER_INSERT_TRIGGER: 5,
  BEFORE_UPDATE_TRIGGER: 6,
  AFTER_UPDATE_TRIGGER: 7,
  BEFORE_DELETE_TRIGGER: 8,
  AFTER_DELETE_TRIGGER: 9
};


/**
 * The name of the store. Subclasses should override and choose their own
 * name. That name is used for the maintaining the version string
 * @protected
 * @type {string}
 */
goog.gears.BaseStore.prototype.name = 'Base';


/**
 * The version number of the database schema. It is used to determine whether
 * the store's portion of the database needs to be updated. Subclassses should
 * override this value.
 * @protected
 * @type {number}
 */
goog.gears.BaseStore.prototype.version = 1;


/**
 * The database schema for the store. This is an array of objects, where each
 * object describes a database object (table, index, trigger). Documentation
 * about the object's fields can be found in the #createSchema documentation.
 * This is in the prototype so that it can be overriden by the subclass. This
 * field is read only.
 * @protected
 * @type {Array.<Object>}
 */
goog.gears.BaseStore.prototype.schema = [];


/**
 * Updates the tables for the message store in the case where
 * they are out of date.
 *
 * @protected
 * @param {number} persistedVersion the current version of the tables in the
 * database.
 */
goog.gears.BaseStore.prototype.updateStore = function(persistedVersion) {
  // TODO: Need to figure out how to handle updates
  // where to store the version number and is it globale or per unit.
};


/**
 * Preloads any applicable data into the tables.
 *
 * @protected
 */
goog.gears.BaseStore.prototype.loadData = function() {
};


/**
 * Creates in memory cache of data that is stored in the tables.
 *
 * @protected
 */
goog.gears.BaseStore.prototype.getCachedData = function() {
};


/**
 * Informs other stores that this store exists .
 *
 * @protected
 */
goog.gears.BaseStore.prototype.informOtherStores = function() {
};


/**
 * Makes sure that tables needed for the store exist and are up to date.
 */
goog.gears.BaseStore.prototype.ensureStoreExists = function() {
  var persistedVersion = this.getStoreVersion();

  if (persistedVersion) {
    if (persistedVersion != this.version) {
      // update
      this.database_.begin();
      try {
        this.updateStore(persistedVersion);
        this.setStoreVersion_(this.version);
        this.database_.commit();
      } catch (ex) {
        this.database_.rollback(ex);
        throw Error('Could not update the ' + this.name + ' schema ' +
            ' from version ' + persistedVersion + ' to ' + this.version +
            ': ' + (ex.message || 'unknown exception'));
      }
    }
  } else {
    // create
    this.database_.begin();
    try {
      // This is rarely necessary, but it's possible if we rolled back a
      // release and dropped the schema on version n-1 before installing
      // again on version n.
      this.dropSchema(this.schema);

      this.createSchema(this.schema);

      // Ensure that the version info schema exists.
      this.createSchema([{
        type: goog.gears.BaseStore.SchemaType.TABLE,
        name: 'StoreVersionInfo',
        columns: [
          'StoreName TEXT NOT NULL PRIMARY KEY',
          'Version INTEGER NOT NULL'
        ]}], true);
      this.loadData();
      this.setStoreVersion_(this.version);
      this.database_.commit();
    } catch (ex) {
      this.database_.rollback(ex);
      throw Error('Could not create the ' + this.name + ' schema' +
            ': ' + (ex.message || 'unknown exception'));
    }
  }
  this.getCachedData();
  this.informOtherStores();
};


/**
 * Removes the tables for the MessageStore
 */
goog.gears.BaseStore.prototype.removeStore = function() {
  this.database_.begin();
  try {
    this.removeStoreVersion();
    this.dropSchema(this.schema);
    this.database_.commit();
  } catch (ex) {
    this.database_.rollback(ex);
    throw Error('Could not remove the ' + this.name + ' schema' +
            ': ' + (ex.message || 'unknown exception'));
  }
};


/**
 * Returns the name of the store.
 *
 * @return {string} The name of the store.
 */
goog.gears.BaseStore.prototype.getName = function() {
  return this.name;
};


/**
 * Returns the version number for the specified store
 *
 * @return {number} The version number of the store. Returns 0 if the
 *     store does not exist.
 */
goog.gears.BaseStore.prototype.getStoreVersion = function() {
  try {
    return /** @type {number} */ (this.database_.queryValue(
        'SELECT Version FROM StoreVersionInfo WHERE StoreName=?',
        this.name)) || 0;
  } catch (ex) {
    return 0;
  }
};


/**
 * Sets the version number for the specified store
 *
 * @param {number} version The version number for the store.
 * @private
 */
goog.gears.BaseStore.prototype.setStoreVersion_ = function(version) {
  // TODO: Need to determine if we should enforce the fact
  // that store versions are monotonically increasing.
  this.database_.execute(
      'INSERT OR REPLACE INTO StoreVersionInfo ' +
      '(StoreName, Version) VALUES(?,?)',
      this.name,
      version);
};


/**
 * Removes the version number for the specified store
 */
goog.gears.BaseStore.prototype.removeStoreVersion = function() {
  try {
    this.database_.execute(
        'DELETE FROM StoreVersionInfo WHERE StoreName=?',
        this.name);
  } catch (ex) {
    // Ignore error - part of bootstrap process.
  }
};


/**
 * Generates an SQLITE CREATE TRIGGER statement from a definition array.
 * @param {string} onStr the type of trigger to create.
 * @param {Object} def  a schema statement definition.
 * @param {string} notExistsStr string to be included in the create
 *     indicating what to do.
 * @return {string} the statement.
 * @private
 */
goog.gears.BaseStore.prototype.getCreateTriggerStatement_ =
    function(onStr, def, notExistsStr) {
  return 'CREATE TRIGGER ' + notExistsStr + def.name + ' ' +
          onStr + ' ON ' + def.tableName +
          (def.when ? (' WHEN ' + def.when) : '') +
          ' BEGIN ' + def.actions.join('; ') + '; END';
};


/**
 * Generates an SQLITE CREATE statement from a definition object.
 * @param {Object} def  a schema statement definition.
 * @param {boolean} opt_ifNotExists true if the table or index should be
 *     created only if it does not exist. Otherwise trying to create a table
 *     or index that already exists will result in an exception being thrown.
 * @return {string} the statement.
 * @private
 */
goog.gears.BaseStore.prototype.getCreateStatement_ =
    function(def, opt_ifNotExists) {
  var notExists = opt_ifNotExists ? 'IF NOT EXISTS ' : '';
  switch (def.type) {
    case goog.gears.BaseStore.SchemaType.TABLE:
      return 'CREATE TABLE ' + notExists + def.name + ' (\n' +
             def.columns.join(',\n  ') +
             ')';
    case goog.gears.BaseStore.SchemaType.VIRTUAL_TABLE:
      return 'CREATE VIRTUAL TABLE ' + notExists + def.name +
             ' USING FTS2 (\n' + def.columns.join(',\n  ') + ')';
    case goog.gears.BaseStore.SchemaType.INDEX:
      return 'CREATE' + (def.isUnique ? ' UNIQUE' : '') +
             ' INDEX ' + notExists + def.name + ' ON ' +
             def.tableName + ' (\n' + def.columns.join(',\n  ') + ')';
    case goog.gears.BaseStore.SchemaType.BEFORE_INSERT_TRIGGER:
      return this.getCreateTriggerStatement_('BEFORE INSERT', def, notExists);
    case goog.gears.BaseStore.SchemaType.AFTER_INSERT_TRIGGER:
      return this.getCreateTriggerStatement_('AFTER INSERT', def, notExists);
    case goog.gears.BaseStore.SchemaType.BEFORE_UPDATE_TRIGGER:
      return this.getCreateTriggerStatement_('BEFORE UPDATE', def, notExists);
    case goog.gears.BaseStore.SchemaType.AFTER_UPDATE_TRIGGER:
      return this.getCreateTriggerStatement_('AFTER UPDATE', def, notExists);
    case goog.gears.BaseStore.SchemaType.BEFORE_DELETE_TRIGGER:
      return this.getCreateTriggerStatement_('BEFORE DELETE', def, notExists);
    case goog.gears.BaseStore.SchemaType.AFTER_DELETE_TRIGGER:
      return this.getCreateTriggerStatement_('AFTER DELETE', def, notExists);
  }
  return '';
};


/**
 * Generates an SQLITE DROP statement from a definition array.
 * @param {Object} def  a schema statement definition.
 * @return {string} the statement.
 * @private
 */
goog.gears.BaseStore.prototype.getDropStatement_ = function(def) {
  switch (def.type) {
    case goog.gears.BaseStore.SchemaType.TABLE:
    case goog.gears.BaseStore.SchemaType.VIRTUAL_TABLE:
      return 'DROP TABLE IF EXISTS ' + def.name;
    case goog.gears.BaseStore.SchemaType.INDEX:
      return 'DROP INDEX IF EXISTS ' + def.name;
    case goog.gears.BaseStore.SchemaType.BEFORE_INSERT_TRIGGER:
    case goog.gears.BaseStore.SchemaType.AFTER_INSERT_TRIGGER:
    case goog.gears.BaseStore.SchemaType.BEFORE_UPDATE_TRIGGER:
    case goog.gears.BaseStore.SchemaType.AFTER_UPDATE_TRIGGER:
    case goog.gears.BaseStore.SchemaType.BEFORE_DELETE_TRIGGER:
    case goog.gears.BaseStore.SchemaType.AFTER_DELETE_TRIGGER:
      return 'DROP TRIGGER IF EXISTS ' + def.name;
  }
  return '';
};


/**
 * Creates tables and indicies in the target database.
 *
 * @param {Array} defs  definition arrays. This is an array of objects
 *    where each object describes a database object to create and drop.
 *    each object contains a 'type' field which of type
 *    goog.gears.BaseStore.SchemaType. Each object also contains a
 *    'name' which contains the name of the object to create.
 *    A table object contains a 'columns' field which is an array
 *       that contains the column definitions for the table.
 *    A virtual table object contains c 'columns' field which contains
 *       the name of the columns. They are assumed to be of type text.
 *    An index object contains a 'tableName' field which is the name
 *       of the table that the index is on. It contains an 'isUnique'
 *       field which is a boolean indicating whether the index is
 *       unqiue or not. It also contains a 'columns' field which is
 *       an array that contains the columns names (possibly along with the
 *       ordering) that form the index.
 *    The trigger objects contain a 'tableName' field indicating the
 *       table the trigger is on. The type indicates the type of trigger.
 *       The trigger object may include a 'when' field which contains
 *       the when clause for the trigger. The trigger object also contains
 *       an 'actions' field which is an array of strings containing
 *       the actions for this trigger.
 * @param {boolean} opt_ifNotExists true if the table or index should be
 *     created only if it does not exist. Otherwise trying to create a table
 *     or index that already exists will result in an exception being thrown.
 */
goog.gears.BaseStore.prototype.createSchema = function(defs, opt_ifNotExists) {
  this.database_.begin();
  try {
    for (var i = 0; i < defs.length; ++i) {
      var sql = this.getCreateStatement_(defs[i], opt_ifNotExists);
      this.database_.execute(sql);
    }
    this.database_.commit();
  } catch (ex) {
    this.database_.rollback(ex);
  }
};


/**
 * Drops tables and indicies in a target database.
 *
 * @param {Array} defs Definition arrays.
 */
goog.gears.BaseStore.prototype.dropSchema = function(defs) {
  this.database_.begin();
  try {
    for (var i = defs.length - 1; i >= 0; --i) {
      this.database_.execute(this.getDropStatement_(defs[i]));
    }
    this.database_.commit();
  } catch (ex) {
    this.database_.rollback(ex);
  }
};


/**
 * Creates triggers specified in definitions. Will first attempt
 * to drop the trigger with this name first.
 *
 * @param {Array} defs Definition arrays.
 */
goog.gears.BaseStore.prototype.createTriggers = function(defs) {
  this.database_.begin();
  try {
    for (var i = 0; i < defs.length; i++) {
      var def = defs[i];
      switch (def.type) {
        case goog.gears.BaseStore.SchemaType.BEFORE_INSERT_TRIGGER:
        case goog.gears.BaseStore.SchemaType.AFTER_INSERT_TRIGGER:
        case goog.gears.BaseStore.SchemaType.BEFORE_UPDATE_TRIGGER:
        case goog.gears.BaseStore.SchemaType.AFTER_UPDATE_TRIGGER:
        case goog.gears.BaseStore.SchemaType.BEFORE_DELETE_TRIGGER:
        case goog.gears.BaseStore.SchemaType.AFTER_DELETE_TRIGGER:
          this.database_.execute('DROP TRIGGER IF EXISTS ' + def.name);
          this.database_.execute(this.getCreateStatement_(def));
          break;
      }
    }
    this.database_.commit();
  } catch (ex) {
    this.database_.rollback(ex);
  }
};


/**
 * Returns true if the table exists in the database
 *
 * @param {string} name The table name.
 * @return {boolean} Whether the table exists in the database.
 */
goog.gears.BaseStore.prototype.hasTable = function(name) {
  return this.hasInSchema_('table', name);
};


/**
 * Returns true if the index exists in the database
 *
 * @param {string} name The index name.
 * @return {boolean} Whether the index exists in the database.
 */
goog.gears.BaseStore.prototype.hasIndex = function(name) {
  return this.hasInSchema_('index', name);
};


/**
 * @param {string} name The name of the trigger.
 * @return {boolean} Whether the schema contains a trigger with the given name.
 */
goog.gears.BaseStore.prototype.hasTrigger = function(name) {
  return this.hasInSchema_('trigger', name);
};


/**
 * Returns true if the database contains the index or table
 *
 * @private
 * @param {string} type The type of object to test for, 'table' or 'index'.
 * @param {string} name The table or index name.
 * @return {boolean} Whether the database contains the index or table.
 */
goog.gears.BaseStore.prototype.hasInSchema_ = function(type, name) {
  return this.database_.queryValue('SELECT 1 FROM SQLITE_MASTER ' +
      'WHERE TYPE=? AND NAME=?',
      type,
      name) != null;
};


/**
 * Disposes of the object.
 */
goog.gears.BaseStore.prototype.disposeInternal = function() {
  goog.gears.BaseStore.superClass_.disposeInternal.call(this);
  this.database_ = null;
};



/**
 * HACK: The JSCompiler check for undefined properties sees that these
 * fields are never set and raises warnings.
 * @type {Array.<Object>}
 * @private
 */
goog.gears.schemaDefDummy_ = [
  {
    type: '',
    name: '',
    when: '',
    tableName: '',
    actions: [],
    isUnique: false
  }
];
