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
    var header = "";

    for (var i = 0; i < count; i++) {
        if (this.isReadingHeaders()) {
            if (incoming[i] != '\n') {
                header += incoming[i];
            } else {
                if (header == "") {
                    this.step++;
                    continue;
                }

                var head = header.split(": ", 2);
                if (head[0] == "Length") {
                    this.linesLeft = head[1] - 0;
                    header = "";
                }
            }
        } else {
            if (this.linesLeft == 0 && incoming[i] == "\n") {
                this.executeCommand();
            } else {
                this.data += incoming[i];
                if (incoming[i] == "\n") {
                    this.linesLeft--;
                }
            }
        }
    }

    if (this.linesLeft == 0 && this.data) {
        this.executeCommand();
    }
}

SocketListener.prototype.executeCommand = function() {
    var fxbrowser, fxdocument;
    var self = this;

    var command = JSON.parse(this.data);

    var sendBack = {
        commandName : command.commandName,
        isError : false,
        response : "",
        elementId : command.elementId
    };

    var respond = {
        send : function() {
            var output = "Length: ";

            sendBack.context = "" + sendBack.context;
            var remainder = JSON.stringify(sendBack) + "\n";
            var lines = remainder.split("\n").length - 1;
            output += lines + "\n\n" + remainder;

            var slices = output.length / 256 + 1;

            // Fail on powers of 2 :)
            for (var i = 0; i < slices; i++) {
                var slice = output.slice(i * 256, (i + 1) * 256);
                self.outstream.writeString(slice, slice.length);
                self.outstream.flush();
            }
        },

        set commandName(name) { sendBack.commandName = name; },
        get commandName()     { return sendBack.commandName; },
        set elementId(id)     { sendBack.elementId = id; },
        get elementId()       { return sendBack.elementId; },
        set isError(error)    { sendBack.isError = error; },
        get isError()         { return sendBack.isError; },
        set response(res)     { sendBack.response = res; },
        get response()        { return sendBack.response; },
        set context(c)        { sendBack.context = c; },
        get context()         { return sendBack.context; }
    };

    respond.context = command.context;

    if (!this.driverPrototype)
        this.driverPrototype = FirefoxDriver.prototype;

    // These are used to locate a new driver, and so not having one is a fine thing to do
    if (command.commandName == "findActiveDriver" ||
        command.commandName == "switchToWindow" ||
        command.commandName == "quit") {

        this.data = "";
        this.linesLeft = 0;
        this.step = 0;

        respond.commandName = command.commandName;
        this[command.commandName](respond, command.parameters);
    } else if (this.driverPrototype[command.commandName]) {
        var driver;

        var res = command.context.split(" ", 2);
        var context = new Context(res[0], res[1]);

        command.context = command.context.toString();

        var allWindows = this.wm.getEnumerator(null);
        while (allWindows.hasMoreElements()) {
            var win = allWindows.getNext();
            if (win["fxdriver"] && win.fxdriver.id == context.windowId) {
                fxbrowser = win.getBrowser();
                driver = win.fxdriver;
                break;
            }
        }

        if (!fxbrowser) {
            dump("Unable to find browser with id " + context.windowId + "\n");
        }
        if (!driver) {
            dump("Unable to find the driver\n");
        }

        driver.context = context;
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

        if (driver.context.frameId !== undefined) {
            fxdocument = Utils.findDocumentInFrame(fxbrowser, driver.context.frameId);
        } else {
            fxdocument = fxbrowser.contentDocument;
        }

        driver.context.fxdocument = fxdocument;

        var info = {
            webProgress: fxbrowser.webProgress,
            command: command,
            driver: driver
        };

        this.data = "";
        this.linesLeft = 0;
        this.step = 0;

        var wait = function(info) {
            if (info.webProgress.isLoadingDocument) {
                info.driver.window.setTimeout(wait, 10, info);
            } else {
                try {
                    respond.commandName = info.command.commandName;
                    info.driver[info.command.commandName](respond, info.command.parameters);
                } catch (e) {
                    info.driver.window.dump("Exception caught: " + info.command.commandName + "(" + info.command.parameters + ")\n");
                    info.driver.window.dump(e + "\n");
                    respond.isError = true;
                    respond.context = info.driver.context;
                    respond.send();
                }
            }
        }
        driver.window.setTimeout(wait, 0, info);
    } else {
        dump("Unrecognised command: " + this.command + "\n");
        this.linesLeft = 0;
        this.step = 0;
        respond.isError = true;
        respond.response = "Unrecognised command: " + command.commandName;
        respond.context = new Context(driver.window);
        respond.send();
    }
};

SocketListener.prototype.isReadingHeaders = function() {
    return this.step == 0;
};

SocketListener.prototype.isReadingLineCount = function() {
    return this.step == 1;
};

SocketListener.prototype.switchToWindow = function(respond, windowId) {
    var lookFor = windowId[0];
    var wm = Utils.getService("@mozilla.org/appshell/window-mediator;1", "nsIWindowMediator");
    var allWindows = wm.getEnumerator(null);

    while (allWindows.hasMoreElements()) {
        var win = allWindows.getNext();
        if (win.content.name == lookFor) {
            win.focus();
            var driver = win.top.fxdriver;
            if (!driver) {
                respond.isError = true;
                respond.response = "No driver found attached to top window!";
                respond.send();
            }

            respond.response = new Context(win.fxdriver.id).toString();
            respond.send();
            return;
        }
    }

    respond.context = this.context;
    respond.isError = true;
    respond.response = "No window found";
    respond.send();
};


SocketListener.prototype.findActiveDriver = function(respond) {
    var win = this.wm.getMostRecentWindow("navigator:browser");
    var driver = win.fxdriver;

    if (!driver) {
        respond.isError = true;
        respond.response = "No drivers associated with the window\n";
    }

    respond.context = this.context;
    respond.response = driver.id;

    respond.send();
};

SocketListener.prototype.quit = function(respond) {
  var appService = Utils.getService("@mozilla.org/toolkit/app-startup;1", "nsIAppStartup");
  appService.quit(Components.interfaces.nsIAppStartup.eForceQuit);
};