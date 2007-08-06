function WebDriverServer() {
    this.wrappedJSObject = this;
    this.serverSocket = Components.classes["@mozilla.org/network/server-socket;1"].createInstance(Components.interfaces.nsIServerSocket);
	this.nextId = 0;
}

WebDriverServer.prototype.newDriver = function(window) {
	window.fxdriver = new FirefoxDriver(this, this.getNextId());
	// Yuck. But it allows us to refer to it later.
	window.fxdriver.window = window;
	return window.fxdriver;
};

WebDriverServer.prototype.getNextId = function() {
	this.nextId++;
	return this.nextId;
}

WebDriverServer.prototype.onSocketAccepted = function(socket, transport) {
    try {
		var rawOutStream = outstream = transport.openOutputStream(0, 0, 0);
		
		var charset = "UTF-8"; 
		this.outstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
		this.outstream.init(rawOutStream, charset, 0, 0x0000);

        this.stream = transport.openInputStream(0, 0, 0);
	    this.instream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
        this.instream.init(this.stream);

        var socketListener = new SocketListener(this.instream);
	    var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
        pump.init(this.stream, -1, -1, 0, 0, false);
        pump.asyncRead(socketListener, null);
    } catch(e) {
        dump(e);
    }
}

WebDriverServer.prototype.startListening = function(port) {
    if (!this.isListening) {
        var listenOn = port || 7055;
        this.serverSocket.init(listenOn, true, -1);
        this.serverSocket.asyncListen(this);
        this.isListening = true;
    }
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

    if (response == undefined) {
        output += "1\n" + context + "\n";
    } else {
        var length = response["split"] ? response.split("\n").length + 1 : 2;
        output += length + "\n" + context + "\n" + response + "\n";
    }

    this.outstream.writeString(output, output.length);
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