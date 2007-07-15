var fxbrowser, fxdocument;

function SocketListener(inputStream, driver)
{
    this.inputStream = inputStream;
    this.driver = driver;
    this.linesLeft = "";
    this.data = "";
    this.command = "";
    this.step = 0;
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
                this.linesLeft = this.linesLeft - 0;
                // Convert it to a number

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
    if (this.driver[this.command]) {
        var bits = this.data.split("\n", 2);
        this.driver.context = Context.fromString(bits[0]);

        var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");

        if (this.driver.refreshContext || this.driver.context.windowId == "?") {
            var win = wm.getMostRecentWindow(null);

            if (this.driver.server.drivers) {
                for (var i = 0; i < this.driver.server.drivers.length; i++) {
                    if (win.fxdriver == this.driver.server.drivers[i]) {
                        this.driver.context = new Context(i, "?");
                    }
                }
            } else {
                this.driver.context = new Context();
            }
            this.driver.refreshContext = false;
        }

        var drivers = Utils.getServer().drivers;
        var allWindows = wm.getEnumerator(null);
        while (allWindows.hasMoreElements()) {
            var win = allWindows.getNext();
            if (win.fxdriver == drivers[this.driver.context.windowId]) {
                fxbrowser = win.getBrowser();
                break;
            }
        }

		// Determine whether or not we need to care about frames.
		var frames = fxbrowser.contentWindow.frames;
		if ("?" == this.driver.context.frameId) {
			if (frames && frames.length) {
				if ("FRAME" == frames[0].frameElement.tagName) {
					this.driver.context.frameId = 0;
				} else {
					this.driver.context.frameId = null;
				}
			} else {
				this.driver.context.frameId = null;
			}
		}

        if (this.driver.context.frameId !== undefined && frames[this.driver.context.frameId]) {
            fxdocument = frames[this.driver.context.frameId].document;
        } else {
            fxdocument = fxbrowser.contentDocument;
        }

        var info = {
            webProgress: fxbrowser.webProgress,
            command: this.command,
            data: this.data,
            driver: this.driver,
            bits: bits
        };

        var wait = function(info) {
            if (info.webProgress.isLoadingDocument) {
                setTimeout(wait, 10, info);
            } else {
                try {
                    info.driver[info.command](info.bits[1] ? info.bits[1] : undefined);
                } catch (e) {
                    window.dump("Exception caught: " + info.command + "(" + info.data + ")\n");
                    window.dump(e + "\n");
                    info.driver.server.respond(info.driver.context, info.command);
                }
            }
        }
        setTimeout(wait, 0, info);
        
        this.command = "";
        this.data = "";
        this.linesLeft = 0;
        this.step = 0;
    } else {
        dump("Unrecognised command: " + this.command + "\n");
        this.driver.server.respond(this.driver.context, this.command);
    }
}

SocketListener.prototype.isReadingCommand = function() {
    return this.step == 0;
}

SocketListener.prototype.isReadingLineCount = function() {
    return this.step == 1;
}