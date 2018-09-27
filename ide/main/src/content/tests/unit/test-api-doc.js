this.seleniumAPI = {};
const subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/selenium-core/scripts/selenium-api.js', this.seleniumAPI);
var parser = new DOMParser();
Command.apiDocument = parser.parseFromString(FileUtils.readURL("chrome://selenium-ide/content/selenium-core/iedoc-core.xml"), "text/xml");

Command.prototype.getAPI = function() {
	return seleniumAPI;
}
