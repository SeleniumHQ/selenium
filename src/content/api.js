function API() {
    this.verison = 0.1;	
    this.preferences = SeleniumIDE.Preferences;
};

// add the provided chrome url to the list of user extensions provided through plugins
// -- or not if it already exists
API.prototype.addPluginProvidedUserExtension = function(url) {
    var options = {};
    current = this.preferences.getString("pluginProvidedUserExtensions");
    if (typeof current == 'undefined'){
        options["pluginProvidedUserExtensions"] = url;
        this.preferences.save(options, "pluginProvidedUserExtensions");
    } else {
        if (current.search(url) == -1) {
            options["pluginProvidedUserExtensions"] = current + ' ' + url;
            this.preferences.save(options, "pluginProvidedUserExtensions");
        }
    }
};