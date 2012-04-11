/**
 * @fileoverview None of the files in core.* depend on webdriver.atoms.*, which
 * prevents those files from being included in a final binary built by analyzing
 * goog.provide/require statements. This file creates such a dependency so these
 * files are available.
 */

goog.provide('core.atoms');

goog.require('webdriver.atoms.element');
goog.require('webdriver.atoms.storage.appcache');
goog.require('webdriver.atoms.storage.session');
