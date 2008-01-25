// constants
const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID("{1C0E8D86-B661-40d0-AE3D-CA012FADF170}");
const CLASS_NAME = "Firefox WebDriver";
const CONTRACT_ID = "@googlecode.com/webdriver/fxdriver;1";

// The following code is derived from https://addons.mozilla.org/en-US/firefox/files/browse/3682/
// Its copyrights belong to its original author.

var ExternalScripts = [
        "context.js",
        "firefoxDriver.js",
        "socketListener.js",
        "utils.js",
        "webdriverserver.js",
        "webLoadingListener.js",
        "wrappedElement.js"
        ];

(function() {
    var self;
    var fileProtocolHandler = Components.classes['@mozilla.org/network/protocol;1?name=file'].createInstance(Components.interfaces.nsIFileProtocolHandler);
    self = __LOCATION__;

    var parent = self.parent;
    // the directory this file is in
    var loader = Components.classes['@mozilla.org/moz/jssubscript-loader;1'].createInstance(Components.interfaces.mozIJSSubScriptLoader);

    for (var index in ExternalScripts) {
        var child = parent.clone();
        child.append(ExternalScripts[index]);
        // child is a nsILocalFile of the file we want to load
        var childname = fileProtocolHandler.getURLSpecFromFile(child);
        loader.loadSubScript(childname);
    }
})();


// This code has been derived from the example code at http://developer-stage.mozilla.org/en/docs/How_to_Build_an_XPCOM_Component_in_Javascript
// Its copyrights belong to the original author

var ServerFactory = {
    createInstance: function (aOuter, aIID) {
        if (aOuter != null)
            throw Components.results.NS_ERROR_NO_AGGREGATION;
        if (!this.server)
            this.server = new WebDriverServer();
        return (this.server).QueryInterface(aIID);
    }
};

//module definition (xpcom registration)
var ServerModule = {
    _firstTime: true,

    registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
        if (this._firstTime) {
            this._firstTime = false;
            throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
        }
        ;
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
    },

    unregisterSelf: function(aCompMgr, aLocation, aType) {
        aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
    },

    getClassObject: function(aCompMgr, aCID, aIID) {
        if (!aIID.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

        if (aCID.equals(CLASS_ID))
            return ServerFactory;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    canUnload: function(aCompMgr) {
        return true;
    }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) {
    return ServerModule;
}