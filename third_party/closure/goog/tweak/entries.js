// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definitions for all tweak entries.
 * The class hierarchy is as follows (abstract entries are denoted with a *):
 * BaseEntry(id, description) *
 *   -> ButtonAction(buttons in the UI)
 *   -> BaseSetting(query parameter) *
 *     -> BooleanGroup(child booleans)
 *     -> BasePrimitiveSetting(value, defaultValue) *
 *       -> BooleanSetting
 *       -> StringSetting
 *       -> NumericSetting
 *       -> BooleanInGroupSetting(token)
 * Most clients should not use these classes directly, but instead use the API
 * defined in tweak.js. One possible use case for directly using them is to
 * register tweaks that are not known at compile time.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.tweak.BaseEntry');
goog.provide('goog.tweak.BasePrimitiveSetting');
goog.provide('goog.tweak.BaseSetting');
goog.provide('goog.tweak.BooleanGroup');
goog.provide('goog.tweak.BooleanInGroupSetting');
goog.provide('goog.tweak.BooleanSetting');
goog.provide('goog.tweak.ButtonAction');
goog.provide('goog.tweak.NumericSetting');
goog.provide('goog.tweak.StringSetting');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.log');
goog.require('goog.object');



/**
 * Base class for all Registry entries.
 * @param {string} id The ID for the entry. Must contain only letters,
 *     numbers, underscores and periods.
 * @param {string} description A description of what the entry does.
 * @constructor
 */
goog.tweak.BaseEntry = function(id, description) {
  /**
   * An ID to uniquely identify the entry.
   * @type {string}
   * @private
   */
  this.id_ = id;

  /**
   * A descriptive label for the entry.
   * @type {string}
   */
  this.label = id;

  /**
   * A description of what this entry does.
   * @type {string}
   */
  this.description = description;

  /**
   * Functions to be called whenever a setting is changed or a button is
   * clicked.
   * @type {!Array<!Function>}
   * @private
   */
  this.callbacks_ = [];
};


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 */
goog.tweak.BaseEntry.prototype.logger =
    goog.log.getLogger('goog.tweak.BaseEntry');


/**
 * Whether a restart is required for changes to the setting to take effect.
 * @type {boolean}
 * @private
 */
goog.tweak.BaseEntry.prototype.restartRequired_ = true;


/**
 * @return {string} Returns the entry's ID.
 */
goog.tweak.BaseEntry.prototype.getId = function() {
  return this.id_;
};


/**
 * Returns whether a restart is required for changes to the setting to take
 * effect.
 * @return {boolean} The value.
 */
goog.tweak.BaseEntry.prototype.isRestartRequired = function() {
  return this.restartRequired_;
};


/**
 * Sets whether a restart is required for changes to the setting to take
 * effect.
 * @param {boolean} value The new value.
 */
goog.tweak.BaseEntry.prototype.setRestartRequired = function(value) {
  this.restartRequired_ = value;
};


/**
 * Adds a callback that should be called when the setting has changed (or when
 * an action has been clicked).
 * @param {!Function} callback The callback to add.
 */
goog.tweak.BaseEntry.prototype.addCallback = function(callback) {
  this.callbacks_.push(callback);
};


/**
 * Removes a callback that was added by addCallback.
 * @param {!Function} callback The callback to add.
 */
goog.tweak.BaseEntry.prototype.removeCallback = function(callback) {
  goog.array.remove(this.callbacks_, callback);
};


/**
 * Calls all registered callbacks.
 */
goog.tweak.BaseEntry.prototype.fireCallbacks = function() {
  for (var i = 0, callback; callback = this.callbacks_[i]; ++i) {
    callback(this);
  }
};



/**
 * Base class for all tweak entries that are settings. Settings are entries
 * that are associated with a query parameter.
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @constructor
 * @extends {goog.tweak.BaseEntry}
 */
goog.tweak.BaseSetting = function(id, description) {
  goog.tweak.BaseEntry.call(this, id, description);
  // Apply this restriction for settings since they turn in to query
  // parameters. For buttons, it's not really important.
  goog.asserts.assert(
      !/[^A-Za-z0-9._]/.test(id), 'Tweak id contains illegal characters: ', id);

  /**
   * The value of this setting's query parameter.
   * @type {string|undefined}
   * @protected
   */
  this.initialQueryParamValue;

  /**
   * The query parameter that controls this setting.
   * @type {?string}
   * @private
   */
  this.paramName_ = this.getId().toLowerCase();
};
goog.inherits(goog.tweak.BaseSetting, goog.tweak.BaseEntry);


/**
 * States of initialization. Entries are initialized lazily in order to allow
 * their initialization to happen in multiple statements.
 * @enum {number}
 * @private
 */
goog.tweak.BaseSetting.InitializeState_ = {
  // The start state for all settings.
  NOT_INITIALIZED: 0,
  // This is used to allow concrete classes to call assertNotInitialized()
  // during their initialize() function.
  INITIALIZING: 1,
  // One a setting is initialized, it may no longer change its configuration
  // settings (associated query parameter, token, etc).
  INITIALIZED: 2
};


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.BaseSetting.prototype.logger =
    goog.log.getLogger('goog.tweak.BaseSetting');


/**
 * Whether initialize() has been called (or is in the middle of being called).
 * @type {goog.tweak.BaseSetting.InitializeState_}
 * @private
 */
goog.tweak.BaseSetting.prototype.initializeState_ =
    goog.tweak.BaseSetting.InitializeState_.NOT_INITIALIZED;


/**
 * Sets the value of the entry based on the value of the query parameter. Once
 * this is called, configuration settings (associated query parameter, token,
 * etc) may not be changed.
 * @param {?string} value The part of the query param for this setting after
 *     the '='. Null if it is not present.
 * @protected
 */
goog.tweak.BaseSetting.prototype.initialize = goog.abstractMethod;


/**
 * Returns the value to be used in the query parameter for this tweak.
 * @return {?string} The encoded value. Null if the value is set to its
 *     default.
 */
goog.tweak.BaseSetting.prototype.getNewValueEncoded = goog.abstractMethod;


/**
 * Asserts that this tweak has not been initialized yet.
 * @param {string} funcName Function name to use in the assertion message.
 * @protected
 */
goog.tweak.BaseSetting.prototype.assertNotInitialized = function(funcName) {
  goog.asserts.assert(
      this.initializeState_ !=
          goog.tweak.BaseSetting.InitializeState_.INITIALIZED,
      'Cannot call ' + funcName + ' after the tweak as been initialized.');
};


/**
 * Returns whether the setting is currently being initialized.
 * @return {boolean} Whether the setting is currently being initialized.
 * @protected
 */
goog.tweak.BaseSetting.prototype.isInitializing = function() {
  return this.initializeState_ ==
      goog.tweak.BaseSetting.InitializeState_.INITIALIZING;
};


/**
 * Sets the initial query parameter value for this setting. May not be called
 * after the setting has been initialized.
 * @param {string} value The inital query parameter value for this setting.
 */
goog.tweak.BaseSetting.prototype.setInitialQueryParamValue = function(value) {
  this.assertNotInitialized('setInitialQueryParamValue');
  this.initialQueryParamValue = value;
};


/**
 * Returns the name of the query parameter used for this setting.
 * @return {?string} The param name. Null if no query parameter is directly
 *     associated with the setting.
 */
goog.tweak.BaseSetting.prototype.getParamName = function() {
  return this.paramName_;
};


/**
 * Sets the name of the query parameter used for this setting. If null is
 * passed the the setting will not appear in the top-level query string.
 * @param {?string} value The new value.
 */
goog.tweak.BaseSetting.prototype.setParamName = function(value) {
  this.assertNotInitialized('setParamName');
  this.paramName_ = value;
};


/**
 * Applies the default value or query param value if this is the first time
 * that the function has been called.
 * @protected
 */
goog.tweak.BaseSetting.prototype.ensureInitialized = function() {
  if (this.initializeState_ ==
      goog.tweak.BaseSetting.InitializeState_.NOT_INITIALIZED) {
    // Instead of having only initialized / not initialized, there is a
    // separate in-between state so that functions that call
    // assertNotInitialized() will not fail when called inside of the
    // initialize().
    this.initializeState_ =
        goog.tweak.BaseSetting.InitializeState_.INITIALIZING;
    var value = this.initialQueryParamValue == undefined ?
        null :
        this.initialQueryParamValue;
    this.initialize(value);
    this.initializeState_ = goog.tweak.BaseSetting.InitializeState_.INITIALIZED;
  }
};



/**
 * Base class for all settings that wrap primitive values.
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @param {*} defaultValue The default value for this setting.
 * @constructor
 * @extends {goog.tweak.BaseSetting}
 */
goog.tweak.BasePrimitiveSetting = function(id, description, defaultValue) {
  goog.tweak.BaseSetting.call(this, id, description);
  /**
   * The default value of the setting.
   * @type {*}
   * @private
   */
  this.defaultValue_ = defaultValue;

  /**
   * The value of the tweak.
   * @type {*}
   * @private
   */
  this.value_;

  /**
   * The value of the tweak once "Apply Tweaks" is pressed.
   * @type {*}
   * @private
   */
  this.newValue_;
};
goog.inherits(goog.tweak.BasePrimitiveSetting, goog.tweak.BaseSetting);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.BasePrimitiveSetting.prototype.logger =
    goog.log.getLogger('goog.tweak.BasePrimitiveSetting');


/**
 * Returns the query param encoded representation of the setting's value.
 * @return {string} The encoded value.
 * @protected
 */
goog.tweak.BasePrimitiveSetting.prototype.encodeNewValue = goog.abstractMethod;


/**
 * If the setting has the restartRequired option, then returns its inital
 * value. Otherwise, returns its current value.
 * @return {*} The value.
 */
goog.tweak.BasePrimitiveSetting.prototype.getValue = function() {
  this.ensureInitialized();
  return this.value_;
};


/**
 * Returns the value of the setting to use once "Apply Tweaks" is clicked.
 * @return {*} The value.
 */
goog.tweak.BasePrimitiveSetting.prototype.getNewValue = function() {
  this.ensureInitialized();
  return this.newValue_;
};


/**
 * Sets the value of the setting. If the setting has the restartRequired
 * option, then the value will not be changed until the "Apply Tweaks" button
 * is clicked. If it does not have the option, the value will be update
 * immediately and all registered callbacks will be called.
 * @param {*} value The value.
 */
goog.tweak.BasePrimitiveSetting.prototype.setValue = function(value) {
  this.ensureInitialized();
  var changed = this.newValue_ != value;
  this.newValue_ = value;
  // Don't fire callbacks if we are currently in the initialize() method.
  if (this.isInitializing()) {
    this.value_ = value;
  } else {
    if (!this.isRestartRequired()) {
      // Update the current value only if the tweak has been marked as not
      // needing a restart.
      this.value_ = value;
    }
    if (changed) {
      this.fireCallbacks();
    }
  }
};


/**
 * Returns the default value for this setting.
 * @return {*} The default value.
 */
goog.tweak.BasePrimitiveSetting.prototype.getDefaultValue = function() {
  return this.defaultValue_;
};


/**
 * Sets the default value for the tweak.
 * @param {*} value The new value.
 */
goog.tweak.BasePrimitiveSetting.prototype.setDefaultValue = function(value) {
  this.assertNotInitialized('setDefaultValue');
  this.defaultValue_ = value;
};


/**
 * @override
 */
goog.tweak.BasePrimitiveSetting.prototype.getNewValueEncoded = function() {
  this.ensureInitialized();
  return this.newValue_ == this.defaultValue_ ? null : this.encodeNewValue();
};



/**
 * A registry setting for string values.
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @constructor
 * @extends {goog.tweak.BasePrimitiveSetting}
 * @final
 */
goog.tweak.StringSetting = function(id, description) {
  goog.tweak.BasePrimitiveSetting.call(this, id, description, '');
  /**
   * Valid values for the setting.
   * @type {Array<string>|undefined}
   */
  this.validValues_;
};
goog.inherits(goog.tweak.StringSetting, goog.tweak.BasePrimitiveSetting);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.StringSetting.prototype.logger =
    goog.log.getLogger('goog.tweak.StringSetting');


/**
 * @override
 * @return {string} The tweaks's value.
 */
goog.tweak.StringSetting.prototype.getValue;


/**
 * @override
 * @return {string} The tweaks's new value.
 */
goog.tweak.StringSetting.prototype.getNewValue;


/**
 * @override
 * @param {string} value The tweaks's value.
 */
goog.tweak.StringSetting.prototype.setValue;


/**
 * @override
 * @param {string} value The default value.
 */
goog.tweak.StringSetting.prototype.setDefaultValue;


/**
 * @override
 * @return {string} The default value.
 */
goog.tweak.StringSetting.prototype.getDefaultValue;


/**
 * @override
 */
goog.tweak.StringSetting.prototype.encodeNewValue = function() {
  return this.getNewValue();
};


/**
 * Sets the valid values for the setting.
 * @param {Array<string>|undefined} values Valid values.
 */
goog.tweak.StringSetting.prototype.setValidValues = function(values) {
  this.assertNotInitialized('setValidValues');
  this.validValues_ = values;
  // Set the default value to the first value in the list if the current
  // default value is not within it.
  if (values && !goog.array.contains(values, this.getDefaultValue())) {
    this.setDefaultValue(values[0]);
  }
};


/**
 * Returns the valid values for the setting.
 * @return {Array<string>|undefined} Valid values.
 */
goog.tweak.StringSetting.prototype.getValidValues = function() {
  return this.validValues_;
};


/**
 * @override
 */
goog.tweak.StringSetting.prototype.initialize = function(value) {
  if (value == null) {
    this.setValue(this.getDefaultValue());
  } else {
    var validValues = this.validValues_;
    if (validValues) {
      // Make the query parameter values case-insensitive since users might
      // type them by hand. Make the capitalization that is actual used come
      // from the list of valid values.
      value = value.toLowerCase();
      for (var i = 0, il = validValues.length; i < il; ++i) {
        if (value == validValues[i].toLowerCase()) {
          this.setValue(validValues[i]);
          return;
        }
      }
      // Warn if the value is not in the list of allowed values.
      goog.log.warning(
          this.logger, 'Tweak ' + this.getId() +
              ' has value outside of expected range:' + value);
    }
    this.setValue(value);
  }
};



/**
 * A registry setting for numeric values.
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @constructor
 * @extends {goog.tweak.BasePrimitiveSetting}
 * @final
 */
goog.tweak.NumericSetting = function(id, description) {
  goog.tweak.BasePrimitiveSetting.call(this, id, description, 0);
  /**
   * Valid values for the setting.
   * @type {Array<number>|undefined}
   */
  this.validValues_;
};
goog.inherits(goog.tweak.NumericSetting, goog.tweak.BasePrimitiveSetting);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.NumericSetting.prototype.logger =
    goog.log.getLogger('goog.tweak.NumericSetting');


/**
 * @override
 * @return {number} The tweaks's value.
 */
goog.tweak.NumericSetting.prototype.getValue;


/**
 * @override
 * @return {number} The tweaks's new value.
 */
goog.tweak.NumericSetting.prototype.getNewValue;


/**
 * @override
 * @param {number} value The tweaks's value.
 */
goog.tweak.NumericSetting.prototype.setValue;


/**
 * @override
 * @param {number} value The default value.
 */
goog.tweak.NumericSetting.prototype.setDefaultValue;


/**
 * @override
 * @return {number} The default value.
 */
goog.tweak.NumericSetting.prototype.getDefaultValue;


/**
 * @override
 */
goog.tweak.NumericSetting.prototype.encodeNewValue = function() {
  return '' + this.getNewValue();
};


/**
 * Sets the valid values for the setting.
 * @param {Array<number>|undefined} values Valid values.
 */
goog.tweak.NumericSetting.prototype.setValidValues = function(values) {
  this.assertNotInitialized('setValidValues');
  this.validValues_ = values;
  // Set the default value to the first value in the list if the current
  // default value is not within it.
  if (values && !goog.array.contains(values, this.getDefaultValue())) {
    this.setDefaultValue(values[0]);
  }
};


/**
 * Returns the valid values for the setting.
 * @return {Array<number>|undefined} Valid values.
 */
goog.tweak.NumericSetting.prototype.getValidValues = function() {
  return this.validValues_;
};


/**
 * @override
 */
goog.tweak.NumericSetting.prototype.initialize = function(value) {
  if (value == null) {
    this.setValue(this.getDefaultValue());
  } else {
    var coercedValue = +value;
    // Warn if the value is not in the list of allowed values.
    if (this.validValues_ &&
        !goog.array.contains(this.validValues_, coercedValue)) {
      goog.log.warning(
          this.logger, 'Tweak ' + this.getId() +
              ' has value outside of expected range: ' + value);
    }

    if (isNaN(coercedValue)) {
      goog.log.warning(
          this.logger, 'Tweak ' + this.getId() +
              ' has value of NaN, resetting to ' + this.getDefaultValue());
      this.setValue(this.getDefaultValue());
    } else {
      this.setValue(coercedValue);
    }
  }
};



/**
 * A registry setting that can be either true of false.
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @constructor
 * @extends {goog.tweak.BasePrimitiveSetting}
 */
goog.tweak.BooleanSetting = function(id, description) {
  goog.tweak.BasePrimitiveSetting.call(this, id, description, false);
};
goog.inherits(goog.tweak.BooleanSetting, goog.tweak.BasePrimitiveSetting);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.BooleanSetting.prototype.logger =
    goog.log.getLogger('goog.tweak.BooleanSetting');


/**
 * @override
 * @return {boolean} The tweaks's value.
 */
goog.tweak.BooleanSetting.prototype.getValue;


/**
 * @override
 * @return {boolean} The tweaks's new value.
 */
goog.tweak.BooleanSetting.prototype.getNewValue;


/**
 * @override
 * @param {boolean} value The tweaks's value.
 */
goog.tweak.BooleanSetting.prototype.setValue;


/**
 * @override
 * @param {boolean} value The default value.
 */
goog.tweak.BooleanSetting.prototype.setDefaultValue;


/**
 * @override
 * @return {boolean} The default value.
 */
goog.tweak.BooleanSetting.prototype.getDefaultValue;


/**
 * @override
 */
goog.tweak.BooleanSetting.prototype.encodeNewValue = function() {
  return this.getNewValue() ? '1' : '0';
};


/**
 * @override
 */
goog.tweak.BooleanSetting.prototype.initialize = function(value) {
  if (value == null) {
    this.setValue(this.getDefaultValue());
  } else {
    value = value.toLowerCase();
    this.setValue(value == 'true' || value == '1');
  }
};



/**
 * An entry in a BooleanGroup.
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @param {!goog.tweak.BooleanGroup} group The group that this entry belongs
 *     to.
 * @constructor
 * @extends {goog.tweak.BooleanSetting}
 * @final
 */
goog.tweak.BooleanInGroupSetting = function(id, description, group) {
  goog.tweak.BooleanSetting.call(this, id, description);

  /**
   * The token to use in the query parameter.
   * @type {string}
   * @private
   */
  this.token_ = this.getId().toLowerCase();

  /**
   * The BooleanGroup that this setting belongs to.
   * @type {!goog.tweak.BooleanGroup}
   * @private
   */
  this.group_ = group;

  // Take setting out of top-level query parameter list.
  goog.tweak.BooleanInGroupSetting.superClass_.setParamName.call(this, null);
};
goog.inherits(goog.tweak.BooleanInGroupSetting, goog.tweak.BooleanSetting);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.BooleanInGroupSetting.prototype.logger =
    goog.log.getLogger('goog.tweak.BooleanInGroupSetting');


/**
 * @override
 */
goog.tweak.BooleanInGroupSetting.prototype.setParamName = function(value) {
  goog.asserts.fail('Use setToken() for BooleanInGroupSetting.');
};


/**
 * Sets the token to use in the query parameter.
 * @param {string} value The value.
 */
goog.tweak.BooleanInGroupSetting.prototype.setToken = function(value) {
  this.token_ = value;
};


/**
 * Returns the token to use in the query parameter.
 * @return {string} The value.
 */
goog.tweak.BooleanInGroupSetting.prototype.getToken = function() {
  return this.token_;
};


/**
 * Returns the BooleanGroup that this setting belongs to.
 * @return {!goog.tweak.BooleanGroup} The BooleanGroup that this setting
 *     belongs to.
 */
goog.tweak.BooleanInGroupSetting.prototype.getGroup = function() {
  return this.group_;
};



/**
 * A registry setting that contains a group of boolean subfield, where all
 * entries modify the same query parameter. For example:
 *     ?foo=setting1,-setting2
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @constructor
 * @extends {goog.tweak.BaseSetting}
 * @final
 */
goog.tweak.BooleanGroup = function(id, description) {
  goog.tweak.BaseSetting.call(this, id, description);

  /**
   * A map of token->child entry.
   * @type {!Object<!goog.tweak.BooleanSetting>}
   * @private
   */
  this.entriesByToken_ = {};


  /**
   * A map of token->true/false for all tokens that appeared in the query
   * parameter.
   * @type {!Object<boolean>}
   * @private
   */
  this.queryParamValues_ = {};

};
goog.inherits(goog.tweak.BooleanGroup, goog.tweak.BaseSetting);


/**
 * The logger for this class.
 * @type {goog.log.Logger}
 * @protected
 * @override
 */
goog.tweak.BooleanGroup.prototype.logger =
    goog.log.getLogger('goog.tweak.BooleanGroup');


/**
 * Returns the map of token->boolean settings.
 * @return {!Object<!goog.tweak.BooleanSetting>} The child settings.
 */
goog.tweak.BooleanGroup.prototype.getChildEntries = function() {
  return this.entriesByToken_;
};


/**
 * Adds the given BooleanSetting to the group.
 * @param {goog.tweak.BooleanInGroupSetting} boolEntry The entry.
 */
goog.tweak.BooleanGroup.prototype.addChild = function(boolEntry) {
  this.ensureInitialized();

  var token = boolEntry.getToken();
  var lcToken = token.toLowerCase();
  goog.asserts.assert(
      !this.entriesByToken_[lcToken],
      'Multiple bools registered with token "%s" in group: %s', token,
      this.getId());
  this.entriesByToken_[lcToken] = boolEntry;

  // Initialize from query param.
  var value = this.queryParamValues_[lcToken];
  if (value != undefined) {
    boolEntry.initialQueryParamValue = value ? '1' : '0';
  }
};


/**
 * @override
 */
goog.tweak.BooleanGroup.prototype.initialize = function(value) {
  var queryParamValues = {};

  if (value) {
    var tokens = value.split(/\s*,\s*/);
    for (var i = 0; i < tokens.length; ++i) {
      var token = tokens[i].toLowerCase();
      var negative = token.charAt(0) == '-';
      if (negative) {
        token = token.substr(1);
      }
      queryParamValues[token] = !negative;
    }
  }
  this.queryParamValues_ = queryParamValues;
};


/**
 * @override
 */
goog.tweak.BooleanGroup.prototype.getNewValueEncoded = function() {
  this.ensureInitialized();
  var nonDefaultValues = [];
  // Sort the keys so that the generate value is stable.
  var keys = goog.object.getKeys(this.entriesByToken_);
  keys.sort();
  for (var i = 0, entry; entry = this.entriesByToken_[keys[i]]; ++i) {
    var encodedValue = entry.getNewValueEncoded();
    if (encodedValue != null) {
      nonDefaultValues.push(
          (entry.getNewValue() ? '' : '-') + entry.getToken());
    }
  }
  return nonDefaultValues.length ? nonDefaultValues.join(',') : null;
};



/**
 * A registry action (a button).
 * @param {string} id The ID for the setting.
 * @param {string} description A description of what the setting does.
 * @param {!Function} callback Function to call when the button is clicked.
 * @constructor
 * @extends {goog.tweak.BaseEntry}
 * @final
 */
goog.tweak.ButtonAction = function(id, description, callback) {
  goog.tweak.BaseEntry.call(this, id, description);
  this.addCallback(callback);
  this.setRestartRequired(false);
};
goog.inherits(goog.tweak.ButtonAction, goog.tweak.BaseEntry);
