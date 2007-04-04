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
        try {
            this.driver[this.command](this.data);
        } catch (e) {
            dump("Exception caught: " + this.command + "(" + this.data + ")\n");            
            dump(e + "\n");
            this.driver.server.respond(this.command);
        }
    } else {
        dump("Unrecognised command: " + this.command + "\n");
    }
    this.command = "";
    this.data = "";
    this.linesLeft = 0;
    this.step = 0;
}

SocketListener.prototype.isReadingCommand = function() {
    return this.step == 0;
}

SocketListener.prototype.isReadingLineCount = function() {
    return this.step == 1;
}