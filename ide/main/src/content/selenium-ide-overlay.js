/*
 * Copyright 2005 Shinya Kasatani
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//
// overlay functions for the browser.
//

SeleniumIDE.Overlay = {};

SeleniumIDE.Overlay.NUM_RECENT_COMMANDS = 8;

SeleniumIDE.Overlay.appendCheck = function(event) {
    var command = event.target._Selenium_IDE_command;
    if (command) {
        if (command.builder.commandType == 'util') {    //Samit: Enh: Added support for util command builders
            // The 'execute' function of the util command builder will return an array of commands to be added to the script
            // The array can be empty if no commands are to be added
            var topEditor = SeleniumIDE.Loader.getTopEditor(); 
            var commands = topEditor.window.CommandBuilders.callBuilderExecute(command.builder, command);
            if (commands) {
                for (var i=0; i< commands.length; i++) {
                    // Add commands to the script
                    topEditor.addCommand(commands[i].command, commands[i].target, commands[i].value, command.window);
                }
            }
            // add the util commands to the recent commands list
            SeleniumIDE.Overlay.addRecentCommand(command.command);
        } else {
            if (command.command.match(/^store/)) {
                command[command.valueProperty] = window.prompt(SeleniumIDE.Overlay.getString("askForVariableName"));
            }
            SeleniumIDE.Loader.getTopEditor().addCommand(command.command, command.target, command.value, command.window);
            SeleniumIDE.Overlay.addRecentCommand(command.command);
        }
    }
}

SeleniumIDE.Overlay.getRecentCommands = function() {
    if (SeleniumIDE.Preferences.branch.prefHasUserValue("recentCommands")) {
        var recentCommands = SeleniumIDE.Preferences.getString("recentCommands");
        return recentCommands.split(/,/);
    } else {
        return ['open', 'verifyTextPresent', 'verifyValue'];
    }
}

SeleniumIDE.Overlay.getString = function(key) {
    return window.document.getElementById("selenium-ide-strings").getString(key);
}

SeleniumIDE.Overlay.addRecentCommand = function(id) {
    var checks = this.getRecentCommands();
    var n = checks.indexOf(id);
    if (n >= 0) {
        checks.splice(n, 1);
    }
    checks.unshift(id);
    if (checks.length > this.NUM_RECENT_COMMANDS) {
        checks.pop();
    }
    SeleniumIDE.Preferences.setString('recentCommands', checks.join(','));
}

SeleniumIDE.Overlay.populateRecorderPopup = function(event) {   //Samit: Ref: Changed testRecorderPopup to populateRecorderPopup, it is not a test any more
    var showAll;
    if (event.target.id == "contentAreaContextMenu") {
        showAll = false;
    } else if (event.target.id == "selenium-ide-all-checks") {
        showAll = true;
    } else {
        return;
    }
    var contextMenu = event.target;
    var self = SeleniumIDE.Overlay;

    // remove old menu
    for (var i = contextMenu.childNodes.length - 1; i >= 0; i--) {
        var item = contextMenu.childNodes[i];
        if (item.id && /^selenium-ide-/.test(item.id)) {
            contextMenu.removeChild(item);
        }
    }

    var recorder = SeleniumIDE.Loader.getTopEditor();
    if (recorder) {
        if (!showAll) {
            contextMenu.appendChild(self.createMenuSeparator('recent'));
        }
        
        var recentCommands = self.getRecentCommands();
        var menuitems;
        var prefixList = ['action', 'util', 'assert', 'verify', 'waitFor', 'store']; //Samit: Enh: Added support for util command builders

        if (showAll) {
            menuitems = {};
            prefixList.forEach(function(prefix) {
                    menuitems[prefix] = [];
                });
        } else {
            menuitems = [];
        }

        function items(prefix) {
            return showAll ? menuitems[prefix] : menuitems;
        }

        var CommandBuilders = SeleniumIDE.Loader.getTopEditor().window.CommandBuilders;
        for (var i = 0; i < CommandBuilders.builders.length; i++) {
            var builder = CommandBuilders.builders[i];
            var focusedWindow = contextMenu.ownerDocument.commandDispatcher.focusedWindow;
            var command = CommandBuilders.callBuilder(builder, focusedWindow);

            if (builder.commandType == 'action' || builder.commandType == 'util') { //Samit: Enh: Added support for util command builders
                command.builder = builder;
                if (showAll || recentCommands.indexOf(command.command) >= 0) {
                    items(builder.commandType).push(self.createCheckMenuItem((showAll ? 'all-' : ''), command));
                }
            } else {
                prefixList.forEach(function(prefix) {
                        if ('action' == prefix || 'util' == prefix) return; //Samit: Enh: skip util command builders
                        var newCommand = {};
                        for (prop in command) {
                            newCommand[prop] = command[prop];
                        }
                        if (prefix == 'store') {
                            if (newCommand.booleanAccessor) {
                                if (newCommand.target == null) {
                                    newCommand.valueProperty = 'target';
                                } else {
                                    newCommand.valueProperty = 'value';
                                }
                            } else {
                                if (newCommand.value == null) {
                                    newCommand.valueProperty = 'target';
                                } else {
                                    newCommand.valueProperty = 'value';
                                }
                            }
                        }
                        var accessor = newCommand.accessor.replace(/^[a-z]/, function(str) { return str.toUpperCase() });
                        newCommand.command = prefix + accessor;
                        newCommand.builder = builder;
                        if (showAll || recentCommands.indexOf(newCommand.command) >= 0) {
                            items(prefix).push(self.createCheckMenuItem((showAll ? 'all-' : ''), newCommand));
                        }
                    });
            }
        }
        if (showAll) {
            var first = true;
            prefixList.forEach(function(prefix) {
                    if (!first && menuitems[prefix].length > 0) {   //Samit: Enh: Suppress separators for empty util command types
                        contextMenu.appendChild(self.createMenuSeparator(prefix));
                    }
                    menuitems[prefix].forEach(function(item) {
                            contextMenu.appendChild(item);
                    });
                    first = false;
                });
        } else {
            menuitems.forEach(function(item) {
                    contextMenu.appendChild(item);
                });
            var menu = document.createElement("menu");
            menu.setAttribute("id", "selenium-ide-all-checks-menu");
            menu.setAttribute("label", self.getString("showAllChecks.label"));
            var popup = document.createElement("menupopup");
            popup.setAttribute("id", "selenium-ide-all-checks");
            contextMenu.appendChild(menu);
            menu.appendChild(popup);
        }
    }
}

SeleniumIDE.Overlay.createMenuSeparator = function(id) {
    var menuitem = document.createElement("menuseparator");
    menuitem.setAttribute("id", "selenium-ide-separator-" + id);
    return menuitem;
}

SeleniumIDE.Overlay.createMenuSeparator = function(id) {
    var menuitem = document.createElement("menuseparator");
    menuitem.setAttribute("id", "selenium-ide-separator-" + id);
    return menuitem;
}

SeleniumIDE.Overlay.createCheckMenuItem = function(idPrefix, command) {
    var menuitem = document.createElement("menuitem");
    menuitem.setAttribute("id", "selenium-ide-check-" + idPrefix + command.command);
    menuitem.setAttribute("disabled", command.disabled ? 'true' : 'false');
    menuitem.setAttribute("label", command.command + ' ' + this._firstTarget(command.target) + ' ' + command.value);
    menuitem._Selenium_IDE_command = command;
    return menuitem;
}

SeleniumIDE.Overlay._firstTarget = function(target) {
    if (target == null) {
        return null;
    // } else if (target instanceof Array) {
    } else if (!target.substring) { // "instanceof Array" doesn't work because target is derived from another window
        return target[0][0];
    } else {
        return target;
    }
}

SeleniumIDE.Overlay.onContentLoaded = function(event) {
    //this.debug("onContentLoaded: target=" + event.target);
    var isRootDocument = false;
    var browsers = window.getBrowser().browsers;
    for (var i = 0; i < browsers.length; i++) {
        var cw = browsers[i].contentWindow;
        if (cw && cw.document == event.target) {
            isRootDocument = true;
        }
    }
    //SeleniumIDE.Loader.reloadRecorder(window.getBrowser().contentWindow, isRootDocument);
    SeleniumIDE.Loader.reloadRecorder(event.target.defaultView, isRootDocument);
    
    var contextMenu = window.document.getElementById("contentAreaContextMenu");
    if (contextMenu) {
        contextMenu.addEventListener("popupshowing", SeleniumIDE.Overlay.populateRecorderPopup, false);
        contextMenu.addEventListener("command", SeleniumIDE.Overlay.appendCheck, false);
    }
}

SeleniumIDE.Overlay.onLoad = function(event) {
    //this.debug("onLoad: target=" + event.target);
    var doc = event.originalTarget;
    if (doc.defaultView && !doc.readyState) {
        doc.defaultView.setTimeout(function() {
                if (doc.wrappedJSObject) {
                    doc = doc.wrappedJSObject;
                }
                doc.readyState = "complete";
            }, 0);
    }
}

SeleniumIDE.Overlay.debug = function(msg) {
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("Selenium IDE Overlay [DEBUG] " + msg);
}

SeleniumIDE.Overlay.init = function() {
    var appcontent = window.document.getElementById("appcontent");
    var self = this;
    if (appcontent) {
        appcontent.addEventListener("DOMContentLoaded", function(event) {
                SeleniumIDE.Overlay.onContentLoaded(event);
            }, false);
        appcontent.addEventListener("load", function(event) {
                SeleniumIDE.Overlay.onLoad(event);
            }, true);
    }
}

SeleniumIDE.Overlay.init();
