function API() {
  this.version = 0.7;
  this.preferences = SeleniumIDE.Preferences;
  this.id = null;
  this.code = {
    ideExtensions: [],
    userExtensions: [],
    formatters: []
  };
}

/**
 * Registers a Selenium IDE plugin so that it can be managed by Selenium IDE
 * Calling this is mandatory or the plugin will not be loaded by Selenium IDE
 *
 * @param id - this is the plugin id (not the name) that you specify in install.rdf of your plugin
 */
API.prototype.addPlugin = function (id) {
  this.id = id;
  this._save();
};

/**
 * Request Selenium IDE to load the IDE extension provided by your plugin through its chrome url of
 * the IDE extensions
 * Don't forget to call the addPlugin function once for your plugin
 *
 * @param url - url to your bundled extension in the form of chrome://
 */
API.prototype.addPluginProvidedIdeExtension = function (url) {
  this.code.ideExtensions.push(url);
  this._save();
};

/**
 * Request Selenium IDE to load the user extension provided by your plugin through its chrome url of
 * the user extensions.
 * Don't forget to call the addPlugin function once for your plugin!
 *
 * @param js_url - url to your bundled extension in the form of chrome://
 * @param xml_url - url to your bundled companion xml in the form of chrome://
 * @param canHandleWebdriverPlayback - true/false if the extension can handle Webdriver playback. Default false.
 */
API.prototype.addPluginProvidedUserExtension = function (js_url, xml_url, canHandleWebdriverPlayback) {
  this.code.userExtensions.push(js_url + ';' + xml_url + ';' + (canHandleWebdriverPlayback ? "1" : "0"));
  this._save();
};

/**
 * Request Selenium IDE to load the formatter provided by your plugin through its chrome url of
 * the formatter.
 * Don't forget to call the addPlugin function once for your plugin!
 *
 * @param id - an id for your formatter, used internally, a combination of numbers, letters, underscores and atleast one letter
 * @param name - the name shown to the users. It should have three parts like "language / test-framework / WebDriver or Remote Control"
 * @param url - url to your bundled formatter in the form of chrome://
 * @param type - optional, can be "webdriver" or "remotecontrol". Specifying the type
 * automatically provides the given formatter type so it does not have to be
 * loaded with subScriptLoader.loadSubScript() in your formatter.
 */
API.prototype.addPluginProvidedFormatter = function (id, name, url, type) {
  this.code.formatters.push(id + ";" + name + ";" + url + ";" + type);
  this._save();
};


//--------------------------------------------------------------------------
// End of Selenium IDE Public API.
// The following provides internal and cleanup stuff for the plugin system
//--------------------------------------------------------------------------

/**
 * Internal function. Do not use.
 *
 * @private
 */
API.prototype._save = function () {
  if (this.id) { //Save only if ID has been set
    var found = false;
    var id = this.id;
    var plugins = JSON.parse(this.preferences.getString('pluginsData', '[]'));
    for (var i = 0; i < plugins.length; i++) {
      if (plugins[i].id == id) {
        plugins[i].installed = true;
        plugins[i].code = this.code;
        found = true;
        break;
      }
    }
    if (!found) {
      plugins.push({
                     id: this.id,
                     installed: true,
                     code: this.code,
                     options: {
                       disabled: false,
                       autoDisabled: false
                     }
                   });
    }
    this.preferences.save({pluginsData: JSON.stringify(plugins)}, 'pluginsData');
  }
};


// this works because plugins re-register every time the browser restarts
function initializeSeIDEAPIObserver() {
  seIDEAPIObserver.register();
}

var seIDEAPIObserver = {
  _uninstall: false,
  observe: function (subject, topic, data) {
    if (topic == "quit-application-granted") {
      var branch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide.");
      branch.clearUserPref("pluginProvidedIDEExtensions");
      branch.clearUserPref("pluginProvidedUserExtensions");
      branch.clearUserPref("pluginProvidedFormatters");
      branch.clearUserPref("plugins");
      //Clear the plugin code and leave the options intact as we want to honour it on next load
      if (branch.prefHasUserValue('pluginsData')) {
        var plugins = JSON.parse(branch.getCharPref('pluginsData'));
        for (var i = 0; i < plugins.length; i++) {
          plugins[i].installed = false;
          plugins[i].code = {
            ideExtensions: [],
            userExtensions: [],
            formatters: []
          };
        }
        branch.setCharPref('pluginsData', JSON.stringify(plugins));
      }
      this.unregister();
    }
  },
  register: function () {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.addObserver(this, "quit-application-granted", false);
  },
  unregister: function () {
    var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
    observerService.removeObserver(this, "quit-application-granted");
  }
};

//Make the cleanup run one time for each window instead of once for every plugin for every window
if (!window.registeredSEIDEAPIObserver) {
  window.addEventListener("load", initializeSeIDEAPIObserver, false);
  window.registeredSEIDEAPIObserver = true;
}
