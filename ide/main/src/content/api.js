function API() {
  this.version = 0.5;
  this.preferences = SeleniumIDE.Preferences;
  this.id = null;
  this.code = {
    ideExtensions: [],
    userExtensions: [],
    formatters: []
  };
}

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

// add our plugin to the main list of selenium plugins
API.prototype.addPlugin = function (id) {
  this.id = id;
  this._save();
};

//add the provided chrome url to the list of IDE extensions provided through plugins
//-- or not if it already exists
API.prototype.addPluginProvidedIdeExtension = function (url) {
  this.code.ideExtensions.push(url);
  this._save();
};

// add the provided chrome url to the list of user extensions provided through plugins
// -- or not if it already exists
API.prototype.addPluginProvidedUserExtension = function (js_url, xml_url) {
  this.code.userExtensions.push(js_url + ';' + xml_url);
  this._save();
};

// add the formatter at the provided chrome url to the list of other formatters provided by plugins
API.prototype.addPluginProvidedFormatter = function (id, name, url) {
  this.code.formatters.push(id + ";" + name + ";" + url);
  this._save();
};

// cleanup after ourselves
//
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
