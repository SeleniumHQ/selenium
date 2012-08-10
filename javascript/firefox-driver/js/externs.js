/*
 Copyright 2011 WebDriver committers
 Copyright 2011 Software Freedom Conservancy

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

/**
 * @fileoverview Mozilla JS specific externs.
 */

// Misc
var JSON;
var __LOCATION__;

// Modules and built-ins
var Components;
Components.classes;
Components.interfaces;
Components.resources;
Components.results;
Components.stack;
Components.utils;
Components.utils['import'];

var NetUtil;
var NSGetFactory;
var NSGetModule;

var XPCNativeWrapper;

var XPCOMUtils;
XPCOMUtils.generateNSGetFactory;
XPCOMUtils.generateNSGetModule;


var nsIPrefBranch;
nsIPrefBranch.prototype.getBoolPref;
nsIPrefBranch.prototype.getCharPref;
nsIPrefBranch.prototype.getIntPref;



// Constants on constants
Components.resources.NS_ERROR_NO_INTERFACE;
Components.resources.NS_NOINTERFACE;


// Classes we use
Components.interfaces.nsIDOMChromeWindow;
Components.interfaces.nsIDOMHTMLButtonElement;
Components.interfaces.nsIDOMHTMLInputElement;
Components.interfaces.nsIDOMKeyEvent;
Components.interfaces.nsIDOMWindow;
Components.interfaces.nsIDOMWindowUtils;
Components.interfaces.nsIDocShellTreeItem;
Components.interfaces.nsIDocShellTreeItem.rootTreeItem;
Components.interfaces.nsIFile;
Components.interfaces.nsIFile.NORMAL_FILE_TYPE;
Components.interfaces.nsIFile.initWithPath;
Components.interfaces.nsIFile.createUnique;
Components.interfaces.nsIInterfaceRequestor;
Components.interfaces.nsISupports;
Components.interfaces.nsISupportsCString;
Components.interfaces.nsIWebNavigation;

// WebDriver constants
Components.interfaces.wdICoordinate;
Components.interfaces.wdIModifierKeys;
Components.interfaces.wdIMouse;
Components.interfaces.wdIStatus;

// The million keyboard constants
Components.interfaces.nsIDOMKeyEvent.DOM_VK_ADD;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_ALT;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_SLASH;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_BACK_SPACE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_CANCEL;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLEAR;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_COMMA;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_CLOSE_BRACKET;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_CONTROL;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_DECIMAL;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_DELETE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_DIVIDE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_DOWN;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_END;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_ENTER;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_EQUALS;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_ESCAPE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F1;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F2;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F3;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F4;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F5;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F6;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F7;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F8;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F9;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F10;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F11;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_F12;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_HELP;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_HOME;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_INSERT;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_LEFT;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_META;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_MULTIPLY;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD0;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD1;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD2;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD3;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD4;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD5;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD6;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD7;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD8;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_NUMPAD9;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_OPEN_BRACKET;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAGE_DOWN;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAGE_UP;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_PAUSE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_PERIOD;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_RETURN;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_RIGHT;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_QUOTE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_SEMICOLON;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_SEPARATOR;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_SHIFT;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_SLASH;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_SPACE;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_SUBTRACT;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_TAB;
Components.interfaces.nsIDOMKeyEvent.DOM_VK_UP;
