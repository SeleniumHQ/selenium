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

var Components;
Components.classes;
Components.interfaces;
Components.resources;
Components.results;
Components.stack;
Components.utils;
Components.utils['import'];

var XPCNativeWrapper;

var XPCOMUtils;
XPCOMUtils.generateNSGetFactory;
XPCOMUtils.generateNSGetModule;


// Constants on constants
Components.resources.NS_ERROR_NO_INTERFACE;
Components.resources.NS_NOINTERFACE;


// Classes we use
Components.interfaces.nsIDOMChromeWindow;
Components.interfaces.nsIDOMWindow;
Components.interfaces.nsIDocShellTreeItem;
Components.interfaces.nsIDocShellTreeItem.rootTreeItem;
Components.interfaces.nsIFile;
Components.interfaces.nsIFile.NORMAL_FILE_TYPE;
Components.interfaces.nsIFile.initWithPath;
Components.interfaces.nsIInterfaceRequestor;
Components.interfaces.nsISupports;
Components.interfaces.nsIWebNavigation;

// WebDriver constants
Components.interfaces.wdICoordinate;
Components.interfaces.wdIMouse;