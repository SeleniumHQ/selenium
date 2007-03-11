function WebDriverServer() {
    this.serverSocket = Utils.newInstance("@mozilla.org/network/server-socket;1", "nsIServerSocket");
}

WebDriverServer.prototype.startListening = function(port) {
    var listenOn = port || 7055;
    this.serverSocket.init(listenOn, true, -1);
    this.serverSocket.asyncListen(this);
}

WebDriverServer.prototype.onSocketAccepted = function(socket, transport)
{
    try
    {
        this.outstream = transport.openOutputStream(0, 0, 0);
        this.stream = transport.openInputStream(0, 0, 0);
        this.instream = Utils.newInstance("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
        this.instream.init(this.stream);

        var socketListener = new SocketListener(this.instream, new FirefoxDriver(this));
        var pump = Utils.newInstance("@mozilla.org/network/input-stream-pump;1", "nsIInputStreamPump");
        pump.init(this.stream, -1, -1, 0, 0, false);
        pump.asyncRead(socketListener, null);
    } catch(ex2) {
        dump("::" + ex2);
    }
};

WebDriverServer.prototype.onStopListening = function(socket, status)
{
    this.stream.close();
};


WebDriverServer.prototype.close = function()
{
    this.instream.close();
};

WebDriverServer.prototype.respond = function(method, response) {
    var output = method + " ";

    if (response == undefined) {
        output += "0\n";
    } else {
        var length = response["split"] ? response.split("\n").length : 1;
        output += length + "\n" + response + "\n";
    }

//    dump("Response: " + output);
    this.outstream.write(output, output.length);
    this.outstream.flush();
};

window.addEventListener("load", function(e) {
    new WebDriverServer().startListening();
}, false); 
