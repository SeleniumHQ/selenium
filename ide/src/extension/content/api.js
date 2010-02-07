function API() {
    this.verison = 0.1;	
    this.preferences = SeleniumIDE.Preferences;
};

// add the provided chrome url to the list of user extensions provided through plugins
// -- or not if it already exists
API.prototype.addPluginProvidedUserExtension = function(url) {
    var options = {};
    
    var current = this.preferences.getString("pluginProvidedUserExtensions");
    if (!current || current.length == 0){
        options["pluginProvidedUserExtensions"] = url;
        this.preferences.save(options, "pluginProvidedUserExtensions");
    } else {
        if (current.search(url) == -1) {
            options["pluginProvidedUserExtensions"] = current + ',' + url;
            this.preferences.save(options, "pluginProvidedUserExtensions");
        }
    }
};

// add the formatter at the provided chrome url to the list of other formatters provided by plugins
API.prototype.addPluginProvidedFormatter = function(id, name, url) {
    var options = {}
    
    var current = this.preferences.getString("pluginProvidedFormatters");
    if (!current || current.length == 0)  {
        options["pluginProvidedFormatters"] = id + ";" + name + ";" + url;
        this.preferences.save(options, "pluginProvidedFormatters");
    } else {
        if (current.search(url) == -1) {
            options["pluginProvidedFormatters"] = current + ',' + id + ";" + name + ";" + url;
            this.preferences.save(options, "pluginProvidedFormatters");
        }
    }
};

// cleanup after outselves
//
// this works because plugins re-register every time the browser restarts
function initializeSeIDEAPIObserver() {
    seIDEAPIObserver.register();
}

var seIDEAPIObserver = {
    _uninstall : false,
    observe : function(subject, topic, data) {
        if (topic == "quit-application-granted") {
            var branch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.selenium-ide.");
branch.setCharPref("pluginProvidedUserExtensions", "");
            branch.setCharPref("pluginProvidedUserExtensions", "");
            branch.setCharPref("pluginProvidedFormatters", "");
            this.unregister();
        }
    },
    register : function() {
        var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        observerService.addObserver(this, "quit-application-granted", false);
    },
    unregister : function() {
        var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
        observerService.removeObserver(this, "quit-application-granted");
    }
}

window.addEventListener("load", initializeSeIDEAPIObserver, false);