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
