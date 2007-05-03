var driver = false;

window.addEventListener("load", function(e) {
    var server = Utils.getServer();

    server.onSocketAccepted = function(socket, transport) {
        try {
            this.outstream = transport.openOutputStream(0, 0, 0);
            this.stream = transport.openInputStream(0, 0, 0);
            this.instream = Utils.newInstance("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream");
            this.instream.init(this.stream);

            var socketListener = new SocketListener(this.instream, driver);
            var pump = Utils.newInstance("@mozilla.org/network/input-stream-pump;1", "nsIInputStreamPump");
            pump.init(this.stream, -1, -1, 0, 0, false);
            pump.asyncRead(socketListener, null);
        } catch(e) {
            dump(e);
        }
    }

    server.startListening();

    if (!driver) {
        driver = new FirefoxDriver(server);
        window.fxdriver = driver;
        server.drivers.push(driver);
    } else {
        driver.context.frameId = 0;
    }
}, true);

window.addEventListener("focus", function(e) {
    if (driver) {
        driver.refreshContext = true;
    }
}, true);
