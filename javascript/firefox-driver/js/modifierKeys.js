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

goog.provide('ModifierKeys');

goog.require('Utils');
goog.require('bot.Device');
goog.require('fxdriver.moz');

ModifierKeys = function() {
  this.wrappedJSObject = this;

  this.QueryInterface = fxdriver.moz.queryInterface(this, [CI.nsISupports, CI.wdIModifierKeys]);
  this.backingState_ = new bot.Device.ModifiersState();
};

ModifierKeys.prototype.isShiftPressed = function() {
  return this.backingState_.isShiftPressed();
};

ModifierKeys.prototype.isControlPressed = function() {
  return this.backingState_.isControlPressed();
};

ModifierKeys.prototype.isAltPressed = function() {
  return this.backingState_.isAltPressed();
};

ModifierKeys.prototype.isMetaPressed = function() {
  return this.backingState_.isMetaPressed();
};

ModifierKeys.prototype.setShiftPressed = function(isPressed) {
  this.backingState_.setPressed(bot.Device.Modifier.SHIFT, isPressed);
};

ModifierKeys.prototype.setControlPressed = function(isPressed) {
  this.backingState_.setPressed(bot.Device.Modifier.CONTROL, isPressed);
};

ModifierKeys.prototype.setAltPressed = function(isPressed) {
  this.backingState_.setPressed(bot.Device.Modifier.ALT, isPressed);
};
ModifierKeys.prototype.setMetaPressed = function(isPressed) {
  this.backingState_.setPressed(bot.Device.Modifier.META, isPressed);
};

ModifierKeys.prototype.classDescription = 'Keeps the state of the modifier keys (shift, alt, meta, ctrl)';
ModifierKeys.prototype.contractID = '@googlecode.com/webdriver/modifierkeys;1';
ModifierKeys.prototype.classID = Components.ID('{2E4B69B9-21FE-48ad-A2F6-AB355D6D2FCE}');

/** @const */ var components = [ModifierKeys];

fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');

if (XPCOMUtils.generateNSGetFactory) {
  NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
} else {
  NSGetModule = XPCOMUtils.generateNSGetModule(components);
}
