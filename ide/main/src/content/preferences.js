/*
 * Copyright 2006 Shinya Kasatani
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

if (!this.SeleniumIDE) this.SeleniumIDE = {};

SeleniumIDE.Preferences = {
    TEST_BRANCH: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide.test."),
    branch: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide."),

    // use test branch for unit tests
    useTestBranch: function() {
        this.branch = this.TEST_BRANCH;
    },

    getString: function(name, defaultValue) {
        if (this.branch && this.branch.prefHasUserValue(name)) {
            return this.branch.getComplexValue(name, Components.interfaces.nsISupportsString).data;
        } else {
            return defaultValue;
        }
    },
    
    setString: function(name, value) {
        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
        str.data = value;
        this.branch.setComplexValue(name, Components.interfaces.nsISupportsString, str);
    },

    getBool: function(name, defaultValue) {
        if (this.branch && this.branch.prefHasUserValue(name)) {
            return this.branch.getBoolPref(name);
        } else {
            return defaultValue;
        }
    },
    
    setBool: function(name, value) {
        this.branch.setBoolPref(name, value);
    },

    getArray: function(name) {
        var length = this.getString(name + ".length");
        if (length == null) return [];
        var value = [];
        for (var i = 0; i < length; i++) {
            value.push(this.getString(name + "." + i));
        }
        return value;
    },

    setArray: function(name, value) {
        this.setString(name + ".length", value.length);
        for (var i = 0; i < value.length; i++) {
            this.setString(name + "." + i, value[i]);
        }
    },
    
    getType: function(name) {
        return this.branch.getPrefType(name);
    },
    
    load: function() {
        var options = {};
        var name;
        for (name in this.DEFAULT_OPTIONS) {
            options[name] = this.DEFAULT_OPTIONS[name];
        }
        var names = this.branch.getChildList('', []);
        for (var i = 0; i < names.length; i++) {
            name = names[i];
            if (this.getType(name) == this.branch.PREF_BOOL) {
                options[name] = this.getBool(name);
            } else {
                options[name] = this.getString(name, this.DEFAULT_OPTIONS[name] || '');
            }
        }
        return options;
    },

    save: function(options, prop_name) {
        if (prop_name) {
            if (this.getType(prop_name) == this.branch.PREF_BOOL) {
                this.setBool(prop_name, options[prop_name]);
            } else {
                this.setString(prop_name, options[prop_name]);
            }
        } else {
            this.branch.deleteBranch("formats");
            var name;
            for (name in options) {
              if (this.getType(name) == this.branch.PREF_BOOL) {
                  this.setBool(name, options[name]);
              } else {
                  this.setString(name, options[name]);
              }
            }
        }
    }
};

SeleniumIDE.Preferences.DEFAULT_OPTIONS = {
    encoding: "UTF-8",

    // This should be called 'userExtensionsPaths', but it is left for backward compatibility.
    userExtensionsURL:
    "",

    ideExtensionsPaths:
    "",
    
    rememberBaseURL:
    "true",

    baseURL:
    "",

    recordAssertTitle:
    "false",

    timeout:
    "30000",

    recordAbsoluteURL:
    "false",

    pluginProvidedIDEExtensions:
    "",
        
    pluginProvidedUserExtensions:
    "",
    
    pluginProvidedFormatters:
    "",
    
    plugins:
    "",
    
    showDeveloperTools:
    "false",

    selectedFormat:
    "default",

    enableExperimentalFeatures:
    "false",

    disableFormatChangeMsg:
    "false",

    currentVersion:
    "",

  locatorBuildersOrder:
  "ui,id,link,name,css,dom:name,xpath:link,xpath:img,xpath:attributes,xpath:idRelative,xpath:href,dom:index,xpath:position",

    recordOnOpen:
    "true"
};

