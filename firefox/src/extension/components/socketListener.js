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
 * @param {Dispatcher} dispatcher The instance to send all parsed requests to.
 * @param {nsISocketTransport} transport The connected socket transport.
 * @constructor
 * @extends {nsIStreamListener}
 */
function SocketListener(dispatcher, transport) {

  /**
   * The instance to send all parsed requests to.
   * @type {Dispatcher}
   * @private
   */
  this.dispatcher_ = dispatcher;

  /**
   * Transport for the socket this instance will read/write to.
   * @type {nsISocketTransport}
   * @private
   */
  this.transport_ = transport;

  /**
   * Output stream for the socket transport.
   * @type {nsIOutputStream}
   * @private
   */
  this.outputStream_ = transport.openOutputStream(
      Components.interfaces.nsITransport.OPEN_BLOCKING,
      /*segmentSize=*/0,
      /*segmentCount=*/0);

  var socketInputStream = transport.openInputStream(
      /*flags=*/0,
      /*segmentSize=*/0,
      /*segmentCount=*/0).QueryInterface(Components.interfaces.nsIAsyncInputStream);

  /**
   * The converter used when writing data back to the socket.
   * @type {nsIScriptableUnicodeConverter}
   * @private
   */
  this.converter_ = Components.
      classes['@mozilla.org/intl/scriptableunicodeconverter'].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

  this.converter_.charset = SocketListener.CHARSET;

  /**
   * The HTTP request method.
   * @type {?Request.Method}
   * @private
   */
  this.method_ = null;

  /**
   * The HTTP request headers as a JSON object.
   * @type {object}
   * @private
   */
  this.headers_ = {};
  this.requestUrl_ = '';
  this.body_ = '';
  this.contentLengthRemaining_ = 0;

  /**
   * The raw UTF-8 request data that has been read so far.
   * @type {string}
   * @private
   */
  this.rawData_ = '';

  var threadManager = Components.classes['@mozilla.org/thread-manager;1'].
      getService(Components.interfaces.nsIThreadManager);

  /**
   * A reference to the main thread.
   * @type {nsIThread}
   * @private
   * @const
   */
  this.mainThread_ = threadManager.mainThread;

  socketInputStream.asyncWait(this, 0, 0, this.mainThread_);
}


/**
 * Enumeration of states for a SocketListener.
 * @enum {number}
 */
SocketListener.State = {
  READING_REQUEST_LINE: 0,
  READING_HEADERS: 1,
  READING_BODY: 2,
  FINISHED: 3
};


/**
 * Charset used for socket I/O.
 * @type {string}
 * @const
 */
SocketListener.CHARSET = 'UTF-8';


/**
 * HTTP message sent in response to requests with an Expect:100-continue header.
 * @type {string}
 * @const
 */
SocketListener.CONTINUE_MESSAGE = 'HTTP/1.1 100 Continue\r\n\r\n';


/**
 * This instance's current state.
 * @type {SocketListener.State}
 * @private
 */
SocketListener.prototype.state_ = SocketListener.State.READING_REQUEST_LINE;


/**
 * Whether this instance has sent a 100-continue resposne to the client.
 * @type {boolean}
 * @private
 */
SocketListener.prototype.continueSent_ = false;


/**
 * Called when the underlying input stream has additional data ready to be read.
 * @param {nsIAsyncInputStream} inputStream The stream with data ready.
 * @see {nsIInputStreamCallback#onInputStreamReady}
 */
SocketListener.prototype.onInputStreamReady = function(inputStream) {
  var binaryInputStream = Components.
      classes['@mozilla.org/binaryinputstream;1'].
      createInstance(Components.interfaces.nsIBinaryInputStream);
  binaryInputStream.setInputStream(inputStream);

//  Utils.dumpn('onInputStreamReady');
  var available;
  try {
    available = inputStream.available();
  } catch (ex) {
    // TODO: check for ex.result == Components.results.NS_BASE_STREAM_CLOSED?
    this.transport_.close(0);
    return;
  }

  var byteArray = binaryInputStream.readByteArray(available);
  var converted = this.converter_.convertFromByteArray(byteArray, available);
  this.rawData_ += converted;

//  Utils.dumpn('...converted:\n' + converted.replace(/\r\n/g, '\\r\\n\n'));
//  Utils.dumpn('...raw data:\n' + this.rawData_);

  try {
    switch (this.state_) {
      case SocketListener.State.READING_REQUEST_LINE:
        this.readRequestLine_();
        if (this.state_ != SocketListener.State.READING_HEADERS) {
          break;
        }
        // Read the request line, fall through to start reading headers.

      case SocketListener.State.READING_HEADERS:
        this.readHeaders_();
        if (this.state_ != SocketListener.State.READING_BODY) {
          break;
        }
        // Read all of the headers, fall through to start reading the body.

      case SocketListener.State.READING_BODY:
        this.readBody_();
        break;
    }

    if (this.state_ != SocketListener.State.FINISHED) {
//      Utils.dumpn('Waiting for more data...');
      inputStream.asyncWait(this, 0, 0, this.mainThread_);
    } else {
      inputStream.close();
      var clientRequest = new Request(
          this.method_, this.requestUrl_, this.headers_, this.rawData_);
      var clientResponse = new Response(
          clientRequest, this.outputStream_);
//      Utils.dumpn('Dispatching request:\n' + clientRequest.toDebugString());
      this.dispatcher_.dispatch(clientRequest, clientResponse);
    }
  } catch (ex) {
//    Utils.dumpn('Sending error:\n\t' + ex.toString());
    var status = ex.isBadRequest ? ex.status : Response.INTERNAL_ERROR;
    var response = new Response(null, this.outputStream_);
    response.sendError(status, ex.toString(), 'text/plain');
    this.transport_.close(0);
  }
};


/**
 * Reads a CRLF terminated line from the data that has been read from the socket
 * thus far.
 * @return {?string} The read line, minus the terminating CRLF, or null if none
 *     are yet available.
 */
SocketListener.prototype.readLine_ = function() {
  while (true) {
    var crlf = this.rawData_.search('\r\n');
    if (crlf == -1) {
      return null;  // Haven't read a full line yet.
    }

    // Strip out the line from the request data.
    var line = this.rawData_.substring(0, crlf).
        replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    this.rawData_ = this.rawData_.substring(crlf + '\r\n'.length);

    return line;
  }
};


/**
 * Attempt to parse the HTTP request line with the data that has been read from
 * the socket thus far.
 * @private
 */
SocketListener.prototype.readRequestLine_ = function() {
//  Utils.dumpn('Reading request line...');
  // Read the first non-blank line in the request. We skip blank lines
  // according to RFC 2616, section 4.1.
  var line = this.readLine_();
  while (line != null && line.length == 0) {
    line = this.readLine();
  }

  if (null == line) {
    return;  // Don't have a line to parse yet.
  }

  var parts = line.split(/\s+/);
  if (parts.length < 3) {
    throw new SocketListener.BadRequest('Invalid request line.');
  }

  this.method_ = parts.shift().toUpperCase();
  this.path_ = parts.shift();
  this.protocol_ = parts.shift().toUpperCase();

  // We only support HTTP/1.1 requests.
  if (this.protocol_ != 'HTTP/1.1') {
    throw new SocketListener.BadRequest(
        'Not an HTTP/1.1 request: <' + this.protocol_ + '>');
  }

  // Make sure we were given a valid HTTP method.
  if (typeof Request.Method[this.method_] == 'undefined') {
    throw new SocketListener.BadRequest(
        'Invalid HTTP method: <' + this.method_ + '>');
  }
//  Utils.dumpn('\t' + this.method_ + ' ' + this.path_ + ' ' + this.protocol_);
  this.state_ = SocketListener.State.READING_HEADERS;
};


/**
 * Read headers from the data that has been read from the socket.
 * @private
 */
SocketListener.prototype.readHeaders_ = function() {
//  Utils.dumpn('Reading headers...');
  while (true) {
    var line = this.readLine_(false);
    if (null == line) {
      return;  // No headers available yet.
    }

    if (!line.length) {
      // Blank line, end of headers.

      // Make sure the host was specified.
      if (typeof this.headers_['host'] == 'undefined') {
        throw new SocketListener.BadRequest('No "Host" header specified');
      }

      // Check the content-length.
      if (typeof this.headers_['content-length'] == 'undefined') {
        if (this.method_ == Request.Method.POST ||
            this.method_ == Request.Method.PUT) {
          throw new SocketListener.BadRequest(
              'No "Content-Length" header specified for POST or PUT request',
              '411 Length Required');
        }
      } else {
        var contentLength = parseInt(this.headers_['content-length']);
        if (isNaN(contentLength)) {
          throw new SocketListener.BadRequest(
              'Content-Length header is not a number: ' +
              this.headers_['content-length']);
        }
        this.headers_['content-length'] = contentLength;
      }

      // Reconstitute the original request URL.
      this.requestUrl_ = 'http://' + this.headers_['host'] + this.path_;
      try {
        this.requestUrl_ = Components.
            classes["@mozilla.org/network/io-service;1"].
            getService(Components.interfaces.nsIIOService).
            newURI(this.requestUrl_, null, null).
            QueryInterface(Components.interfaces.nsIURL);
      } catch (ex) {
        throw new SocketListener.BadRequest(
            'Error parsing request URL: ' + this.requestUrl_);
      }

      this.state_ = SocketListener.State.READING_BODY;
      return;
    }

    var parts = line.match(/([^:\s]*)\s*:\s*([^\s].*)/);
    if (!parts) {
      throw new SocketListener.BadRequest(
          'Error parsing header field <' + line + '>');
    }
    this.headers_[parts[1].toLowerCase()] = parts[2];
//    Utils.dumpn('\t' + parts[1] + ':' + parts[2]);
  }
};


/**
 * Read the request body from the data that has been read thus far.
 * @private
 */
SocketListener.prototype.readBody_ = function() {
//  Utils.dumpn('Reading body...');
  if (!this.continueSent_) {
    // Need to send a 100 Continue if it is expected.
    // For more info, see RFC 2616, section 8.2.3
    if (this.headers_['expect'] == '100-continue') {
//      Utils.dumpn('Sending 100-continue...');
      this.continueSent_ = true;
      var continueResp = new Response(null, this.outputStream_);
      continueResp.setStatus(Response.CONTINUE);
      continueResp.commit();
    }
  }

  if (this.method_ != Request.Method.POST &&
      this.method_ != Request.Method.PUT) {
    // No body to read. Technically, if the client sends a body (as indicated
    // by the Content-Length header, we should read it in, even if it's ignored
    // for the request method. But this can lead to indefinite blocking with
    // clients that specify a Content-Length on a GET request and then never
    // send the body.
    this.state_ = SocketListener.State.FINISHED;
    return;
  }

  // This rigmarole is needed so we know the number of bytes read so we can tell
  // if we've read the entire body.
  var escaped = encodeURIComponent(this.rawData_);
  var escapedCharCount = 0;
  if (escaped.indexOf('%', 0) != -1) {
    escapedCharCount = escaped.split('%').length - 1;
  }
  var bytesRead = escaped.length - (2 * escapedCharCount);
  var bytesRemaining = this.headers_['content-length'] - bytesRead;
  
  // If we read more data than the Content-Length header specified, then too
  // much data was sent by the client, and we consider this a malformed
  // request.
  if (bytesRemaining < 0) {
    throw new SocketListener.BadRequest(
        'Request body is longer than indicated "Content-Length" header;' +
        ' expected <' + this.headers_['content-length'] +'>, ' +
        ' but was <' + bytesRead + '>');
  } else if (bytesRemaining == 0) {
//    Utils.dumpn('Finished reading body!');
    this.state_ = SocketListener.State.FINISHED;
//  } else {
//    Utils.dumpn(
//        'Read ' + bytesRead + '; ' + bytesRemaining + ' bytes remaining');
  }
};


/**
 * Thrown when a bad request is parsed.
 * @param {string} message The error message to return to the client.
 * @param {number} opt_status The HTTP status code to use when returning the
 *     error to the client.  Defaults to 400.
 * @constructor
 */
SocketListener.BadRequest = function(message, opt_status) {
  this.message = message;
  this.status = opt_status || Response.BAD_REQUEST;
  this.isBadRequest = true;
};


/** @override */
SocketListener.BadRequest.prototype.toString = function() {
  return this.message;
};
