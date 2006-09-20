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
    branch: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide."),
    
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
    }
}

