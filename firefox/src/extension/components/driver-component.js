// constants
const nsISupports = Components.interfaces.nsISupports;
const CLASS_ID = Components.ID("{1C0E8D86-B661-40d0-AE3D-CA012FADF170}");
const CLASS_NAME = "Firefox WebDriver";
const CONTRACT_ID = "@thoughtworks.com/webdriver/fxdriver;1";

function WebDriverServer() {
    this.wrappedJSObject = this;
    this.serverSocket = Components.classes["@mozilla.org/network/server-socket;1"].createInstance(Components.interfaces.nsIServerSocket);
    this.drivers = [];
}

WebDriverServer.prototype.startListening = function(port) {
    if (!this.isListening) {
        var listenOn = port || 7055;
        this.serverSocket.init(listenOn, true, -1);
        this.serverSocket.asyncListen(this);
        this.isListening = true;
    }
    return this.driver;
}

WebDriverServer.prototype.onStopListening = function(socket, status)
{
    this.stream.close();
};


WebDriverServer.prototype.close = function()
{
    this.instream.close();
};

WebDriverServer.prototype.respond = function(context, method, response) {
    var output = method + " ";

    if (this.driver && this.driver.refreshContext) {
        context = Context.fromString("? 0");
    }

    if (response == undefined) {
        output += "1\n" + context + "\n";
    } else {
        var length = response["split"] ? response.split("\n").length + 1: 2;
        output += length + "\n" + context + "\n" + response + "\n";
    }

    this.outstream.write(output, output.length);
    this.outstream.flush();
};

WebDriverServer.prototype.QueryInterface = function(aIID) {
    if (!aIID.equals(nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
};

WebDriverServer.prototype.createInstance = function(ignore1, ignore2, ignore3) {
    this.startListening();
}

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
    };
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

  canUnload: function(aCompMgr) { return true; }
};

//module initialization
function NSGetModule(aCompMgr, aFileSpec) { return ServerModule; }