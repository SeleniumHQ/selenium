function API() {
    this.verison = 0.4;	
    this.preferences = SeleniumIDE.Preferences;
};

// add our plugin to the main list of selenium plugins
API.prototype.addPlugin = function(id) {
    var options = {};
    
    var current = this.preferences.getString("plugins");
    if (!current || current.length == 0) {
        options["plugins"] = id;
        this.preferences.save(options, "plugins");
    } else {
        if (current.search(id) == -1) {
            options["plugins"] = current + ',' + id;
            this.preferences.save(options, "plugins");
        }
    }
};

//add the provided chrome url to the list of IDE extensions provided through plugins
//-- or not if it already exists
API.prototype.addPluginProvidedIdeExtension = function(url) {
    var options = {};
    
    var current = this.preferences.getString("pluginProvidedIDEExtensions");
    if (!current || current.length == 0){
		options["pluginProvidedIDEExtensions"] = url;
		this.preferences.save(options, "pluginProvidedIDEExtensions");
    } else {
		if (current.search(url) == -1) {
		    options["pluginProvidedIDEExtensions"] = current + ',' + url;
		    this.preferences.save(options, "pluginProvidedIDEExtensions");
		}
    }
};


// add the provided chrome url to the list of user extensions provided through plugins
// -- or not if it already exists
API.prototype.addPluginProvidedUserExtension = function(js_url, xml_url) {
    var options = {};
    
    var current = this.preferences.getString("pluginProvidedUserExtensions");
    if (!current || current.length == 0){
        options["pluginProvidedUserExtensions"] = js_url + ';' + xml_url;
        this.preferences.save(options, "pluginProvidedUserExtensions");
    } else {
        if (current.search(js_url) == -1) {
            options["pluginProvidedUserExtensions"] = current + ',' + js_url + ';' + xml_url;
            this.preferences.save(options, "pluginProvidedUserExtensions");
        }
    }
};

// add the formatter at the provided chrome url to the list of other formatters provided by plugins
API.prototype.addPluginProvidedFormatter = function(id, name, url) {
    var options = {};
    
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
    		branch.setCharPref("pluginProvidedIDEExtensions", "");
            branch.setCharPref("pluginProvidedUserExtensions", "");
            branch.setCharPref("pluginProvidedFormatters", "");
            branch.setCharPref("plugins", "");
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
};

window.addEventListener("load", initializeSeIDEAPIObserver, false);
