/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2007 ThoughtWorks, Inc

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @fileoverview Defines a class that reads commands from a socket and
 * dispatches them to the nsICommandProcessor. When the response is ready, it is
 * serialized and sent back to the client through the socket.
 */


/**
 * Communicates with a client by reading and writing from a socket.
 * @param {nsISocketTransport} transport The connected socket transport.
 * @constructor
 * @extends {nsIStreamListener}
 */
function SocketListener(transport) {
  this.outstream = transport.
      openOutputStream(Components.interfaces.nsITransport.OPEN_BLOCKING, 0, 0);

  this.stream = transport.openInputStream(0, 0, 0);
  var cin = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
      createInstance(Components.interfaces.nsIConverterInputStream);
  cin.init(this.stream, SocketListener.CHARSET, 0, 0x0000);

  this.inputStream = cin;

  var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].
      createInstance(Components.interfaces.nsIInputStreamPump);
  pump.init(this.stream, -1, -1, 0, 0, false);
  pump.asyncRead(this, null);

  this.linesLeft = "";
  this.data = "";
  this.command = "";
  this.step = 0;
  this.readLength = false;

  /**
   * A reference to the command processor service. We grab the reference here
   * instead of on the prototype since the component may not be loaded yet.
   * @type {nsICommandProcessor}
   * @private
   */
  this.commandProcessor_ = Components.
      classes['@googlecode.com/webdriver/command-processor;1'].
      getService(Components.interfaces.nsICommandProcessor);

  /**
   * The converter used when writing data back to the socket.
   * @type {nsIScriptableUnicodeConverter}
   * @private
   */
  this.converter_ = Components.
      classes['@mozilla.org/intl/scriptableunicodeconverter'].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

  this.converter_.charset = SocketListener.CHARSET;
}


/**
 * Charset used for socket I/O.
 * @type {string}
 */
SocketListener.CHARSET = 'UTF-8';


/**
 * Signals the start of a request. Each request lasts for the life of the
 * underlying socket connection and represents a session with a FirefoxDriver
 * client. 
 * @see {nsIRequestObserver#onStartRequest}
 */
SocketListener.prototype.onStartRequest = function(request, context) {
};


/**
 * Signals the end of a request (e.g. the underlying socket connection was
 * closed).
 * @see {nsIRequestObserver#onStopRequest}
 */
SocketListener.prototype.onStopRequest = function(request, context, status) {
};


/**
 * Called whenever another chunk of data is ready to be read from the socket.
 * @param {nsIRequest} request The data's origin.
 * @param {nsISupports} context User defined context.
 * @param {nsIInputStream} inputStream The input stream containing the data
 *     chunk.
 * @param {number} offset The total number of bytes read by previous calls to
 *     {@code #onDataAvailable}.
 * @param {number} count The number of bytes available in the stream.
 * @see {nsIStreamListener#onDataAvailable}
 */
SocketListener.prototype.onDataAvailable = function(request, context,
                                                    inputStream, offset,
                                                    count) {
  var incoming = {};
  var read = this.inputStream.readString(count, incoming);

  var lines = incoming.value.split('\n');
  for (var j = 0; j < lines.length; j++) {
    if (0 == this.step) {
      var head = lines[j].split(": ", 2);
      if (head[0] == "Content-Length") {
        this.linesLeft = Number(head[1]);
        this.readLength = true;
      } else if (lines[j].length == 0 && this.readLength) {
        this.step++;
      }
    } else {
      this.data += lines[j];
      this.linesLeft -= read;

      if (this.linesLeft <= 0) {
        this.executeCommand_();
        j++;  // Consume the empty line
      }
    }
  }

  if (this.linesLeft <= 0 && this.data) {
    this.executeCommand_();
  }
};


/**
 * Parses the command data read from the socket into a JSON object and
 * dispatches it to the command processesor.
 * @private
 */
SocketListener.prototype.executeCommand_ = function() {
  var self = this;
  var command = this.data;
  var callback = function(response) {
    //Utils.dumpn('writing to socket:\n' + response);
    var data = self.converter_.convertToByteArray(response, {});
    var header = "Length: " + data.length + "\n\n";
    self.outstream.write(header, header.length);
    self.outstream.flush();

    var stream = self.converter_.convertToInputStream(response);
    self.outstream.writeFrom(stream, data.length);
    self.outstream.flush();
    stream.close();
  };

  // Clear data for the next read.
  this.data = '';
  this.linesLeft = 0;
  this.step = 0;
  this.readLength = 0;

  try {
    this.commandProcessor_.execute(command, callback);
  } catch (e) {
    Utils.dump(e);
    Utils.dumpn(command);

    // Something has gone seriously wrong. Quit the browser.
    this.commandProcessor_.execute(
        JSON.stringify({'commandName': 'quit'}),
        function() {});
  }
};
