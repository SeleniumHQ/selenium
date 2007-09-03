function SocketListener(server, transport)
{
	var rawOutStream = transport.openOutputStream(0, 0, 0);
	
	var charset = "UTF-8"; 
	this.outstream = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
	this.outstream.init(rawOutStream, charset, 0, 0x0000);

    this.stream = transport.openInputStream(0, 0, 0);
    this.inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    this.inputStream.init(this.stream);

	var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(this.stream, -1, -1, 0, 0, false);
    pump.asyncRead(this, null);
	
    this.linesLeft = "";
    this.data = "";
    this.command = "";
    this.step = 0;
	this.wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
	this.server = server;
}

SocketListener.prototype.onStartRequest = function(request, context)
{
}

SocketListener.prototype.onStopRequest = function(request, context, status)
{
}

SocketListener.prototype.onDataAvailable = function(request, context, inputStream, offset, count)
{
    var incoming = this.inputStream.read(count);

    for (var i = 0; i < count; i++) {
        if (this.isReadingCommand()) {
            if (incoming[i] != ' ') {
                this.command += incoming[i];
            } else {
                this.step++;
            }
        } else if (this.isReadingLineCount()) {
            if (incoming[i] != "\n") {
                this.linesLeft += incoming[i];
            } else {
                this.step++;
                // Convert it to a number
                this.linesLeft = this.linesLeft - 0;

                if (this.linesLeft == 0) {
                    this.executeCommand();
                }
            }
        } else {
            if (this.linesLeft == 1 && incoming[i] == "\n") {
                this.executeCommand();
            } else {
                this.data += incoming[i];
                if (incoming[i] == "\n") {
                    this.linesLeft--;
                }
            }
        }
    }
}

SocketListener.prototype.executeCommand = function() {
	var fxbrowser, fxdocument;
	var self = this;
	
	var respond = function(context, method, response) {
	    var output = method + " ";

	    if (response == undefined) {
	        output += "1\n" + context + "\n";
	    } else {
	        var length = response["split"] ? response.split("\n").length + 1 : 2;
	        output += length + "\n" + context + "\n" + response + "\n";
	    }
	
		var slices = output.length / 256 + 1;  // Fail on powers of 2 :)
		for (var i = 0; i < slices; i++) {
			var slice = output.slice(i * 256, (i+1) * 256);
	    	self.outstream.writeString(slice, slice.length);
	    	self.outstream.flush();
		}
	};
	
	if (!this.driverPrototype) 
		this.driverPrototype = FirefoxDriver.prototype;
	
	// These are used to locate a new driver, and so not having one is a fine thing to do
	if (this.command == "findActiveDriver" || this.command == "switchToWindow") {
		var bits = this.data.split("\n", 2);
		var command = this.command;
		
		this.command = "";
		this.data = "";
		this.linesLeft = 0;
		this.step = 0;
		          
		this[command](respond, bits[1]);
	} else if (this.driverPrototype[this.command]) {
        var bits = this.data.split("\n");
		var id = bits.shift() - 0;
		var remainder = bits.join("\n");
		var driver;

        var allWindows = this.wm.getEnumerator(null);
        while (allWindows.hasMoreElements()) {
            var win = allWindows.getNext();
            if (win["fxdriver"] && win.fxdriver.id == id) {
                fxbrowser = win.getBrowser();
				driver = win.fxdriver;
                break;
			}
        }

		if (!fxbrowser) {
			dump("Unable to find browser with id " + id + "\n");
		}
		if (!driver) {
			dump("Unable to find the driver\n");
		}

		driver.context.fxbrowser = fxbrowser;

		// Determine whether or not we need to care about frames.
		var frames = fxbrowser.contentWindow.frames;
		if ("?" == driver.context.frameId) {
		 	if (frames && frames.length) {
		 		if ("FRAME" == frames[0].frameElement.tagName) {
		 			driver.context.frameId = 0;
		 		} else {
		 			driver.context.frameId = undefined;
		 		}
		 	} else {
		 		driver.context.frameId = undefined;
		 	}
		 }

        if (driver.context.frameId !== undefined && frames[driver.context.frameId]) {
            fxdocument = frames[driver.context.frameId].document;
        } else {
            fxdocument = fxbrowser.contentDocument;
        }

		driver.context.fxdocument = fxdocument;

        var info = {
            webProgress: fxbrowser.webProgress,
            command: this.command,
            data: this.data,
            driver: driver,
            bits: remainder
        };

        this.command = "";
        this.data = "";
        this.linesLeft = 0;
        this.step = 0;

        var wait = function(info) {
            if (info.webProgress.isLoadingDocument) {
                info.driver.window.setTimeout(wait, 10, info);
            } else {
                try {
                    info.driver[info.command](respond, info.bits);
                } catch (e) {
                    info.driver.window.dump("Exception caught: " + info.command + "(" + info.data + ")\n");
                    info.driver.window.dump(e + "\n");
                    respond(info.driver.context, info.command);
                }
            }
        }
        driver.window.setTimeout(wait, 0, info);        
    } else {
        dump("Unrecognised command: " + this.command + "\n");
		this.command = "";
		this.data = "";
		this.linesLeft = 0;
		this.step = 0;
        respond(new Context(), this.command);
    }
};

SocketListener.prototype.isReadingCommand = function() {
    return this.step == 0;
};

SocketListener.prototype.isReadingLineCount = function() {
    return this.step == 1;
};

SocketListener.prototype.switchToWindow = function(respond, windowId) {
	var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
	var allWindows = wm.getEnumerator(null);

	while (allWindows.hasMoreElements()) {
		var win = allWindows.getNext();
		if (win.content.name == windowId) {
			win.focus();
			var driver = win.top.fxdriver;
			if (!driver)
				respond(this.context, "switchToWindow", "No driver found attached to top window!");
			respond(this.context, "switchToWindow", driver.id);
			return;
		}
	}

	respond(this.context, "switchToWindow", "No window found");
}


SocketListener.prototype.findActiveDriver = function(respond) {
	var win = this.wm.getMostRecentWindow("navigator:browser");

	var driver = win.fxdriver;
	
	if (!driver)
		dump("No drivers associated with the window\n");  // What else can we do?

	respond(this.context, "findActiveDriver", driver.id);
}