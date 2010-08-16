/* -*- Mode: JavaScript; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim:set ts=2 sw=2 sts=2 et: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the httpd.js server.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Darin Fisher (v1, netwerk/test/TestServ.js)
 *   Christian Biesinger (v2, netwerk/test/unit/head_http_server.js)
 *   Jeff Walden <jwalden+code@mit.edu> (v3, netwerk/test/httpserver/httpd.js)
 *   Robert Sayre <sayrer@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * An implementation of an HTTP server both as a loadable script and as an XPCOM
 * component.  See the accompanying README file for user documentation on
 * httpd.js.
 */

var EXPORTED_SYMBOLS = ['getServer'];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;
const CC = Components.Constructor;

const PR_UINT32_MAX = Math.pow(2, 32) - 1;

/** True if debugging output is enabled, false otherwise. */
var DEBUG = false; // non-const *only* so tweakable in server tests

/** True if debugging output should be timestamped. */
var DEBUG_TIMESTAMP = false; // non-const so tweakable in server tests

var gGlobalObject = this;

/**
 * Asserts that the given condition holds.  If it doesn't, the given message is
 * dumped, a stack trace is printed, and an exception is thrown to attempt to
 * stop execution (which unfortunately must rely upon the exception not being
 * accidentally swallowed by the code that uses it).
 */
function NS_ASSERT(cond, msg)
{
  if (DEBUG && !cond)
  {
    dumpn("###!!!");
    dumpn("###!!! ASSERTION" + (msg ? ": " + msg : "!"));
    dumpn("###!!! Stack follows:");

    var stack = new Error().stack.split(/\n/);
    dumpn(stack.map(function(val) { return "###!!!   " + val; }).join("\n"));

    throw Cr.NS_ERROR_ABORT;
  }
}

/** Constructs an HTTP error object. */
function HttpError(code, description)
{
  this.code = code;
  this.description = description;
}
HttpError.prototype =
{
  toString: function()
  {
    return this.code + " " + this.description;
  }
};

/**
 * Errors thrown to trigger specific HTTP server responses.
 */
const HTTP_400 = new HttpError(400, "Bad Request");
const HTTP_401 = new HttpError(401, "Unauthorized");
const HTTP_402 = new HttpError(402, "Payment Required");
const HTTP_403 = new HttpError(403, "Forbidden");
const HTTP_404 = new HttpError(404, "Not Found");
const HTTP_405 = new HttpError(405, "Method Not Allowed");
const HTTP_406 = new HttpError(406, "Not Acceptable");
const HTTP_407 = new HttpError(407, "Proxy Authentication Required");
const HTTP_408 = new HttpError(408, "Request Timeout");
const HTTP_409 = new HttpError(409, "Conflict");
const HTTP_410 = new HttpError(410, "Gone");
const HTTP_411 = new HttpError(411, "Length Required");
const HTTP_412 = new HttpError(412, "Precondition Failed");
const HTTP_413 = new HttpError(413, "Request Entity Too Large");
const HTTP_414 = new HttpError(414, "Request-URI Too Long");
const HTTP_415 = new HttpError(415, "Unsupported Media Type");
const HTTP_417 = new HttpError(417, "Expectation Failed");

const HTTP_500 = new HttpError(500, "Internal Server Error");
const HTTP_501 = new HttpError(501, "Not Implemented");
const HTTP_502 = new HttpError(502, "Bad Gateway");
const HTTP_503 = new HttpError(503, "Service Unavailable");
const HTTP_504 = new HttpError(504, "Gateway Timeout");
const HTTP_505 = new HttpError(505, "HTTP Version Not Supported");

/** Creates a hash with fields corresponding to the values in arr. */
function array2obj(arr)
{
  var obj = {};
  for (var i = 0; i < arr.length; i++)
    obj[arr[i]] = arr[i];
  return obj;
}

/** Returns an array of the integers x through y, inclusive. */
function range(x, y)
{
  var arr = [];
  for (var i = x; i <= y; i++)
    arr.push(i);
  return arr;
}

/** An object (hash) whose fields are the numbers of all HTTP error codes. */
const HTTP_ERROR_CODES = array2obj(range(400, 417).concat(range(500, 505)));


/**
 * The character used to distinguish hidden files from non-hidden files, a la
 * the leading dot in Apache.  Since that mechanism also hides files from
 * easy display in LXR, ls output, etc. however, we choose instead to use a
 * suffix character.  If a requested file ends with it, we append another
 * when getting the file on the server.  If it doesn't, we just look up that
 * file.  Therefore, any file whose name ends with exactly one of the character
 * is "hidden" and available for use by the server.
 */
const HIDDEN_CHAR = "^";

/**
 * The file name suffix indicating the file containing overridden headers for
 * a requested file.
 */
const HEADERS_SUFFIX = HIDDEN_CHAR + "headers" + HIDDEN_CHAR;

/** Type used to denote SJS scripts for CGI-like functionality. */
const SJS_TYPE = "sjs";

/** Base for relative timestamps produced by dumpn(). */
var firstStamp = 0;

/** dump(str) with a trailing "\n" -- only outputs if DEBUG. */
function dumpn(str)
{
  if (DEBUG)
  {
    var prefix = "HTTPD-INFO | ";
    if (DEBUG_TIMESTAMP)
    {
      if (firstStamp === 0)
        firstStamp = Date.now();

      var elapsed = Date.now() - firstStamp; // milliseconds
      var min = Math.floor(elapsed / 60000);
      var sec = (elapsed % 60000) / 1000;

      if (sec < 10)
        prefix += min + ":0" + sec.toFixed(3) + " | ";
      else
        prefix += min + ":" + sec.toFixed(3) + " | ";
    }

    dump(prefix + str + "\n");
  }
}

/** Dumps the current JS stack if DEBUG. */
function dumpStack()
{
  // peel off the frames for dumpStack() and Error()
  var stack = new Error().stack.split(/\n/).slice(2);
  stack.forEach(dumpn);
}


/** The XPCOM thread manager. */
var gThreadManager = null;

/** The XPCOM prefs service. */
var gRootPrefBranch = null;
function getRootPrefBranch()
{
  if (!gRootPrefBranch)
  {
    gRootPrefBranch = Cc["@mozilla.org/preferences-service;1"]
                        .getService(Ci.nsIPrefBranch);
  }
  return gRootPrefBranch;
}

/**
 * JavaScript constructors for commonly-used classes; precreating these is a
 * speedup over doing the same from base principles.  See the docs at
 * http://developer.mozilla.org/en/docs/Components.Constructor for details.
 */
const ServerSocket = CC("@mozilla.org/network/server-socket;1",
                        "nsIServerSocket",
                        "init");
const ScriptableInputStream = CC("@mozilla.org/scriptableinputstream;1",
                                 "nsIScriptableInputStream",
                                 "init");
const Pipe = CC("@mozilla.org/pipe;1",
                "nsIPipe",
                "init");
const FileInputStream = CC("@mozilla.org/network/file-input-stream;1",
                           "nsIFileInputStream",
                           "init");
const ConverterInputStream = CC("@mozilla.org/intl/converter-input-stream;1",
                                "nsIConverterInputStream",
                                "init");
const WritablePropertyBag = CC("@mozilla.org/hash-property-bag;1",
                               "nsIWritablePropertyBag2");
const SupportsString = CC("@mozilla.org/supports-string;1",
                          "nsISupportsString");

/* These two are non-const only so a test can overwrite them. */
var BinaryInputStream = CC("@mozilla.org/binaryinputstream;1",
                           "nsIBinaryInputStream",
                           "setInputStream");
var BinaryOutputStream = CC("@mozilla.org/binaryoutputstream;1",
                            "nsIBinaryOutputStream",
                            "setOutputStream");

/**
 * Returns the RFC 822/1123 representation of a date.
 *
 * @param date : Number
 *   the date, in milliseconds from midnight (00:00:00), January 1, 1970 GMT
 * @returns string
 *   the representation of the given date
 */
function toDateString(date)
{
  //
  // rfc1123-date = wkday "," SP date1 SP time SP "GMT"
  // date1        = 2DIGIT SP month SP 4DIGIT
  //                ; day month year (e.g., 02 Jun 1982)
  // time         = 2DIGIT ":" 2DIGIT ":" 2DIGIT
  //                ; 00:00:00 - 23:59:59
  // wkday        = "Mon" | "Tue" | "Wed"
  //              | "Thu" | "Fri" | "Sat" | "Sun"
  // month        = "Jan" | "Feb" | "Mar" | "Apr"
  //              | "May" | "Jun" | "Jul" | "Aug"
  //              | "Sep" | "Oct" | "Nov" | "Dec"
  //

  const wkdayStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /**
   * Processes a date and returns the encoded UTC time as a string according to
   * the format specified in RFC 2616.
   *
   * @param date : Date
   *   the date to process
   * @returns string
   *   a string of the form "HH:MM:SS", ranging from "00:00:00" to "23:59:59"
   */
  function toTime(date)
  {
    var hrs = date.getUTCHours();
    var rv  = (hrs < 10) ? "0" + hrs : hrs;
    
    var mins = date.getUTCMinutes();
    rv += ":";
    rv += (mins < 10) ? "0" + mins : mins;

    var secs = date.getUTCSeconds();
    rv += ":";
    rv += (secs < 10) ? "0" + secs : secs;

    return rv;
  }

  /**
   * Processes a date and returns the encoded UTC date as a string according to
   * the date1 format specified in RFC 2616.
   *
   * @param date : Date
   *   the date to process
   * @returns string
   *   a string of the form "HH:MM:SS", ranging from "00:00:00" to "23:59:59"
   */
  function toDate1(date)
  {
    var day = date.getUTCDate();
    var month = date.getUTCMonth();
    var year = date.getUTCFullYear();

    var rv = (day < 10) ? "0" + day : day;
    rv += " " + monthStrings[month];
    rv += " " + year;

    return rv;
  }

  date = new Date(date);

  const fmtString = "%wkday%, %date1% %time% GMT";
  var rv = fmtString.replace("%wkday%", wkdayStrings[date.getUTCDay()]);
  rv = rv.replace("%time%", toTime(date));
  return rv.replace("%date1%", toDate1(date));
}

/**
 * Prints out a human-readable representation of the object o and its fields,
 * omitting those whose names begin with "_" if showMembers != true (to ignore
 * "private" properties exposed via getters/setters).
 */
function printObj(o, showMembers)
{
  var s = "******************************\n";
  s +=    "o = {\n";
  for (var i in o)
  {
    if (typeof(i) != "string" ||
        (showMembers || (i.length > 0 && i[0] != "_")))
      s+= "      " + i + ": " + o[i] + ",\n";
  }
  s +=    "    };\n";
  s +=    "******************************";
  dumpn(s);
}

/**
 * Instantiates a new HTTP server.
 */
function nsHttpServer()
{
  if (!gThreadManager)
    gThreadManager = Cc["@mozilla.org/thread-manager;1"].getService();

  /** The port on which this server listens. */
  this._port = undefined;

  /** The socket associated with this. */
  this._socket = null;

  /** The handler used to process requests to this server. */
  this._handler = new ServerHandler(this);

  /** Naming information for this server. */
  this._identity = new ServerIdentity();

  /**
   * Indicates when the server is to be shut down at the end of the request.
   */
  this._doQuit = false;

  /**
   * True if the socket in this is closed (and closure notifications have been
   * sent and processed if the socket was ever opened), false otherwise.
   */
  this._socketClosed = true;

  /**
   * Used for tracking existing connections and ensuring that all connections
   * are properly cleaned up before server shutdown; increases by 1 for every
   * new incoming connection.
   */
  this._connectionGen = 0;

  /**
   * Hash of all open connections, indexed by connection number at time of
   * creation.
   */
  this._connections = {};
}
nsHttpServer.prototype =
{
  // NSISERVERSOCKETLISTENER

  /**
   * Processes an incoming request coming in on the given socket and contained
   * in the given transport.
   *
   * @param socket : nsIServerSocket
   *   the socket through which the request was served
   * @param trans : nsISocketTransport
   *   the transport for the request/response
   * @see nsIServerSocketListener.onSocketAccepted
   */
  onSocketAccepted: function(socket, trans)
  {
    dumpn("*** onSocketAccepted(socket=" + socket + ", trans=" + trans + ")");

    dumpn(">>> new connection on " + trans.host + ":" + trans.port);

    const SEGMENT_SIZE = 8192;
    const SEGMENT_COUNT = 1024;
    try
    {
      var input = trans.openInputStream(0, SEGMENT_SIZE, SEGMENT_COUNT)
                       .QueryInterface(Ci.nsIAsyncInputStream);
      var output = trans.openOutputStream(0, 0, 0);
    }
    catch (e)
    {
      dumpn("*** error opening transport streams: " + e);
      trans.close(Cr.NS_BINDING_ABORTED);
      return;
    }

    var connectionNumber = ++this._connectionGen;

    try
    {
      var conn = new Connection(input, output, this, socket.port, trans.port,
                                connectionNumber);
      var reader = new RequestReader(conn);

      // XXX add request timeout functionality here!

      // Note: must use main thread here, or we might get a GC that will cause
      //       threadsafety assertions.  We really need to fix XPConnect so that
      //       you can actually do things in multi-threaded JS.  :-(
      input.asyncWait(reader, 0, 0, gThreadManager.mainThread);
    }
    catch (e)
    {
      // Assume this connection can't be salvaged and bail on it completely;
      // don't attempt to close it so that we can assert that any connection
      // being closed is in this._connections.
      dumpn("*** error in initial request-processing stages: " + e);
      trans.close(Cr.NS_BINDING_ABORTED);
      return;
    }

    this._connections[connectionNumber] = conn;
    dumpn("*** starting connection " + connectionNumber);
  },

  /**
   * Called when the socket associated with this is closed.
   *
   * @param socket : nsIServerSocket
   *   the socket being closed
   * @param status : nsresult
   *   the reason the socket stopped listening (NS_BINDING_ABORTED if the server
   *   was stopped using nsIHttpServer.stop)
   * @see nsIServerSocketListener.onStopListening
   */
  onStopListening: function(socket, status)
  {
    dumpn(">>> shutting down server on port " + socket.port);
    this._socketClosed = true;
    if (!this._hasOpenConnections())
    {
      dumpn("*** no open connections, notifying async from onStopListening");

      // Notify asynchronously so that any pending teardown in stop() has a
      // chance to run first.
      var self = this;
      var stopEvent =
        {
          run: function()
          {
            dumpn("*** _notifyStopped async callback");
            self._notifyStopped();
          }
        };
      gThreadManager.currentThread
                    .dispatch(stopEvent, Ci.nsIThread.DISPATCH_NORMAL);
    }
  },

  // NSIHTTPSERVER

  //
  // see nsIHttpServer.start
  //
  start: function(port)
  {
    this._start(port, "localhost")
  },

  _start: function(port, host)
  {
    if (this._socket)
      throw Cr.NS_ERROR_ALREADY_INITIALIZED;

    this._port = port;
    this._doQuit = this._socketClosed = false;

    this._host = host;

    // The listen queue needs to be long enough to handle
    // network.http.max-connections-per-server concurrent connections,
    // plus a safety margin in case some other process is talking to
    // the server as well.
    var prefs = getRootPrefBranch();
    var maxConnections =
      prefs.getIntPref("network.http.max-connections-per-server") + 5;

    try
    {
      var loopback = true;
      if (this._host != "127.0.0.1" && this._host != "localhost") {
        var loopback = false;
      }

      var socket = new ServerSocket(this._port,
                                    loopback, // true = localhost, false = everybody
                                    maxConnections);
      dumpn(">>> listening on port " + socket.port + ", " + maxConnections +
            " pending connections");
      socket.asyncListen(this);
      this._identity._initialize(port, host, true);
      this._socket = socket;
    }
    catch (e)
    {
      dumpn("!!! could not start server on port " + port + ": " + e);
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    }
  },

  //
  // see nsIHttpServer.stop
  //
  stop: function(callback)
  {
    if (!callback)
      throw Cr.NS_ERROR_NULL_POINTER;
    if (!this._socket)
      throw Cr.NS_ERROR_UNEXPECTED;

    this._stopCallback = typeof callback === "function"
                       ? callback
                       : function() { callback.onStopped(); };

    dumpn(">>> stopping listening on port " + this._socket.port);
    this._socket.close();
    this._socket = null;

    // We can't have this identity any more, and the port on which we're running
    // this server now could be meaningless the next time around.
    this._identity._teardown();

    this._doQuit = false;

    // socket-close notification and pending request completion happen async
  },

  //
  // see nsIHttpServer.registerFile
  //
  registerFile: function(path, file)
  {
    if (file && (!file.exists() || file.isDirectory()))
      throw Cr.NS_ERROR_INVALID_ARG;

    this._handler.registerFile(path, file);
  },

  //
  // see nsIHttpServer.registerDirectory
  //
  registerDirectory: function(path, directory)
  {
    // XXX true path validation!
    if (path.charAt(0) != "/" ||
        path.charAt(path.length - 1) != "/" ||
        (directory &&
         (!directory.exists() || !directory.isDirectory())))
      throw Cr.NS_ERROR_INVALID_ARG;

    // XXX determine behavior of non-existent /foo/bar when a /foo/bar/ mapping
    //     exists!

    this._handler.registerDirectory(path, directory);
  },

  //
  // see nsIHttpServer.registerPathHandler
  //
  registerPathHandler: function(path, handler)
  {
    this._handler.registerPathHandler(path, handler);
  },

  registerGlobHandler: function(re, handler)
  {
    this._handler.registerGlobHandler(re, handler);
  },

  //
  // see nsIHttpServer.registerErrorHandler
  //
  registerErrorHandler: function(code, handler)
  {
    this._handler.registerErrorHandler(code, handler);
  },

  //
  // see nsIHttpServer.setIndexHandler
  //
  setIndexHandler: function(handler)
  {
    this._handler.setIndexHandler(handler);
  },

  //
  // see nsIHttpServer.registerContentType
  //
  registerContentType: function(ext, type)
  {
    this._handler.registerContentType(ext, type);
  },

  //
  // see nsIHttpServer.serverIdentity
  //
  get identity()
  {
    return this._identity;
  },

  //
  // see nsIHttpServer.getState
  //
  getState: function(path, k)
  {
    return this._handler._getState(path, k);
  },

  //
  // see nsIHttpServer.setState
  //
  setState: function(path, k, v)
  {
    return this._handler._setState(path, k, v);
  },

  //
  // see nsIHttpServer.getSharedState
  //
  getSharedState: function(k)
  {
    return this._handler._getSharedState(k);
  },

  //
  // see nsIHttpServer.setSharedState
  //
  setSharedState: function(k, v)
  {
    return this._handler._setSharedState(k, v);
  },

  //
  // see nsIHttpServer.getObjectState
  //
  getObjectState: function(k)
  {
    return this._handler._getObjectState(k);
  },

  //
  // see nsIHttpServer.setObjectState
  //
  setObjectState: function(k, v)
  {
    return this._handler._setObjectState(k, v);
  },


  // NSISUPPORTS

  //
  // see nsISupports.QueryInterface
  //
  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIHttpServer) ||
        iid.equals(Ci.nsIServerSocketListener) ||
        iid.equals(Ci.nsISupports))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },


  // NON-XPCOM PUBLIC API

  /**
   * Returns true iff this server is not running (and is not in the process of
   * serving any requests still to be processed when the server was last
   * stopped after being run).
   */
  isStopped: function()
  {
    return this._socketClosed && !this._hasOpenConnections();
  },

  // PRIVATE IMPLEMENTATION

  /** True if this server has any open connections to it, false otherwise. */
  _hasOpenConnections: function()
  {
    //
    // If we have any open connections, they're tracked as numeric properties on
    // |this._connections|.  The non-standard __count__ property could be used
    // to check whether there are any properties, but standard-wise, even
    // looking forward to ES5, there's no less ugly yet still O(1) way to do
    // this.
    //
    for (var n in this._connections)
      return true;
    return false;
  },

  /** Calls the server-stopped callback provided when stop() was called. */
  _notifyStopped: function()
  {
    NS_ASSERT(this._stopCallback !== null, "double-notifying?");
    NS_ASSERT(!this._hasOpenConnections(), "should be done serving by now");

    //
    // NB: We have to grab this now, null out the member, *then* call the
    //     callback here, or otherwise the callback could (indirectly) futz with
    //     this._stopCallback by starting and immediately stopping this, at
    //     which point we'd be nulling out a field we no longer have a right to
    //     modify.
    //
    var callback = this._stopCallback;
    this._stopCallback = null;
    try
    {
      callback();
    }
    catch (e)
    {
      // not throwing because this is specified as being usually (but not
      // always) asynchronous
      dump("!!! error running onStopped callback: " + e + "\n");
    }
  },

  /**
   * Notifies this server that the given connection has been closed.
   *
   * @param connection : Connection
   *   the connection that was closed
   */
  _connectionClosed: function(connection)
  {
    NS_ASSERT(connection.number in this._connections,
              "closing a connection " + this + " that we never added to the " +
              "set of open connections?");
    NS_ASSERT(this._connections[connection.number] === connection,
              "connection number mismatch?  " +
              this._connections[connection.number]);
    delete this._connections[connection.number];

    // Fire a pending server-stopped notification if it's our responsibility.
    if (!this._hasOpenConnections() && this._socketClosed)
      this._notifyStopped();
  },

  /**
   * Requests that the server be shut down when possible.
   */
  _requestQuit: function()
  {
    dumpn(">>> requesting a quit");
    dumpStack();
    this._doQuit = true;
  }
};


//
// RFC 2396 section 3.2.2:
//
// host        = hostname | IPv4address
// hostname    = *( domainlabel "." ) toplabel [ "." ]
// domainlabel = alphanum | alphanum *( alphanum | "-" ) alphanum
// toplabel    = alpha | alpha *( alphanum | "-" ) alphanum
// IPv4address = 1*digit "." 1*digit "." 1*digit "." 1*digit
//

const HOST_REGEX =
  new RegExp("^(?:" +
               // *( domainlabel "." )
               "(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)*" +
               // toplabel
               "[a-z](?:[a-z0-9-]*[a-z0-9])?" +
             "|" +
               // IPv4 address 
               "\\d+\\.\\d+\\.\\d+\\.\\d+" +
             ")$",
             "i");


/**
 * Represents the identity of a server.  An identity consists of a set of
 * (scheme, host, port) tuples denoted as locations (allowing a single server to
 * serve multiple sites or to be used behind both HTTP and HTTPS proxies for any
 * host/port).  Any incoming request must be to one of these locations, or it
 * will be rejected with an HTTP 400 error.  One location, denoted as the
 * primary location, is the location assigned in contexts where a location
 * cannot otherwise be endogenously derived, such as for HTTP/1.0 requests.
 *
 * A single identity may contain at most one location per unique host/port pair;
 * other than that, no restrictions are placed upon what locations may
 * constitute an identity.
 */
function ServerIdentity()
{
  /** The scheme of the primary location. */
  this._primaryScheme = "http";

  /** The hostname of the primary location. */
  this._primaryHost = "127.0.0.1"

  /** The port number of the primary location. */
  this._primaryPort = -1;

  /**
   * The current port number for the corresponding server, stored so that a new
   * primary location can always be set if the current one is removed.
   */
  this._defaultPort = -1;

  /**
   * Maps hosts to maps of ports to schemes, e.g. the following would represent
   * https://example.com:789/ and http://example.org/:
   *
   *   {
   *     "xexample.com": { 789: "https" },
   *     "xexample.org": { 80: "http" }
   *   }
   *
   * Note the "x" prefix on hostnames, which prevents collisions with special
   * JS names like "prototype".
   */
  this._locations = { "xlocalhost": {} };
}
ServerIdentity.prototype =
{
  // NSIHTTPSERVERIDENTITY

  //
  // see nsIHttpServerIdentity.primaryScheme
  //
  get primaryScheme()
  {
    if (this._primaryPort === -1)
      throw Cr.NS_ERROR_NOT_INITIALIZED;
    return this._primaryScheme;
  },

  //
  // see nsIHttpServerIdentity.primaryHost
  //
  get primaryHost()
  {
    if (this._primaryPort === -1)
      throw Cr.NS_ERROR_NOT_INITIALIZED;
    return this._primaryHost;
  },

  //
  // see nsIHttpServerIdentity.primaryPort
  //
  get primaryPort()
  {
    if (this._primaryPort === -1)
      throw Cr.NS_ERROR_NOT_INITIALIZED;
    return this._primaryPort;
  },

  //
  // see nsIHttpServerIdentity.add
  //
  add: function(scheme, host, port)
  {
    this._validate(scheme, host, port);

    var entry = this._locations["x" + host];
    if (!entry)
      this._locations["x" + host] = entry = {};

    entry[port] = scheme;
  },

  //
  // see nsIHttpServerIdentity.remove
  //
  remove: function(scheme, host, port)
  {
    this._validate(scheme, host, port);

    var entry = this._locations["x" + host];
    if (!entry)
      return false;

    var present = port in entry;
    delete entry[port];

    if (this._primaryScheme == scheme &&
        this._primaryHost == host &&
        this._primaryPort == port &&
        this._defaultPort !== -1)
    {
      // Always keep at least one identity in existence at any time, unless
      // we're in the process of shutting down (the last condition above).
      this._primaryPort = -1;
      this._initialize(this._defaultPort, host, false);
    }

    return present;
  },

  //
  // see nsIHttpServerIdentity.has
  //
  has: function(scheme, host, port)
  {
    this._validate(scheme, host, port);

    return "x" + host in this._locations &&
           scheme === this._locations["x" + host][port];
  },

  //
  // see nsIHttpServerIdentity.has
  //
  getScheme: function(host, port)
  {
    this._validate("http", host, port);

    var entry = this._locations["x" + host];
    if (!entry)
      return "";

    return entry[port] || "";
  },

  //
  // see nsIHttpServerIdentity.setPrimary
  //
  setPrimary: function(scheme, host, port)
  {
    this._validate(scheme, host, port);

    this.add(scheme, host, port);

    this._primaryScheme = scheme;
    this._primaryHost = host;
    this._primaryPort = port;
  },


  // NSISUPPORTS

  //
  // see nsISupports.QueryInterface
  //
  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIHttpServerIdentity) || iid.equals(Ci.nsISupports))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },


  // PRIVATE IMPLEMENTATION

  /**
   * Initializes the primary name for the corresponding server, based on the
   * provided port number.
   */
  _initialize: function(port, host, addSecondaryDefault)
  {
    this._host = host;
    if (this._primaryPort !== -1)
      this.add("http", host, port);
    else
      this.setPrimary("http", "localhost", port);
    this._defaultPort = port;

    // Only add this if we're being called at server startup
    if (addSecondaryDefault && host != "127.0.0.1")
      this.add("http", "127.0.0.1", port);
  },

  /**
   * Called at server shutdown time, unsets the primary location only if it was
   * the default-assigned location and removes the default location from the
   * set of locations used.
   */
  _teardown: function()
  {
    if (this._host != "127.0.0.1") {
      // Not the default primary location, nothing special to do here
      this.remove("http", "127.0.0.1", this._defaultPort);
    }
    
    // This is a *very* tricky bit of reasoning here; make absolutely sure the
    // tests for this code pass before you commit changes to it.
    if (this._primaryScheme == "http" &&
        this._primaryHost == this._host &&
        this._primaryPort == this._defaultPort)
    {
      // Make sure we don't trigger the readding logic in .remove(), then remove
      // the default location.
      var port = this._defaultPort;
      this._defaultPort = -1;
      this.remove("http", this._host, port);

      // Ensure a server start triggers the setPrimary() path in ._initialize()
      this._primaryPort = -1;
    }
    else
    {
      // No reason not to remove directly as it's not our primary location
      this.remove("http", this._host, this._defaultPort);
    }
  },

  /**
   * Ensures scheme, host, and port are all valid with respect to RFC 2396.
   *
   * @throws NS_ERROR_ILLEGAL_VALUE
   *   if any argument doesn't match the corresponding production
   */
  _validate: function(scheme, host, port)
  {
    if (scheme !== "http" && scheme !== "https")
    {
      dumpn("*** server only supports http/https schemes: '" + scheme + "'");
      dumpStack();
      throw Cr.NS_ERROR_ILLEGAL_VALUE;
    }
    if (!HOST_REGEX.test(host))
    {
      dumpn("*** unexpected host: '" + host + "'");
      throw Cr.NS_ERROR_ILLEGAL_VALUE;
    }
    if (port < 0 || port > 65535)
    {
      dumpn("*** unexpected port: '" + port + "'");
      throw Cr.NS_ERROR_ILLEGAL_VALUE;
    }
  }
};


/**
 * Represents a connection to the server (and possibly in the future the thread
 * on which the connection is processed).
 *
 * @param input : nsIInputStream
 *   stream from which incoming data on the connection is read
 * @param output : nsIOutputStream
 *   stream to write data out the connection
 * @param server : nsHttpServer
 *   the server handling the connection
 * @param port : int
 *   the port on which the server is running
 * @param outgoingPort : int
 *   the outgoing port used by this connection
 * @param number : uint
 *   a serial number used to uniquely identify this connection
 */
function Connection(input, output, server, port, outgoingPort, number)
{
  dumpn("*** opening new connection " + number + " on port " + outgoingPort);

  /** Stream of incoming data. */
  this.input = input;

  /** Stream for outgoing data. */
  this.output = output;

  /** The server associated with this request. */
  this.server = server;

  /** The port on which the server is running. */
  this.port = port;

  /** The outgoing poort used by this connection. */
  this._outgoingPort = outgoingPort;

  /** The serial number of this connection. */
  this.number = number;

  /**
   * The request for which a response is being generated, null if the
   * incoming request has not been fully received or if it had errors.
   */
  this.request = null;

  /** State variables for debugging. */
  this._closed = this._processed = false;
}
Connection.prototype =
{
  /** Closes this connection's input/output streams. */
  close: function()
  {
    dumpn("*** closing connection " + this.number +
          " on port " + this._outgoingPort);

    this.input.close();
    this.output.close();
    this._closed = true;

    var server = this.server;
    server._connectionClosed(this);

    // If an error triggered a server shutdown, act on it now
    if (server._doQuit)
      server.stop(function() { /* not like we can do anything better */ });
  },

  /**
   * Initiates processing of this connection, using the data in the given
   * request.
   *
   * @param request : Request
   *   the request which should be processed
   */
  process: function(request)
  {
    NS_ASSERT(!this._closed && !this._processed);

    this._processed = true;

    this.request = request;
    this.server._handler.handleResponse(this);
  },

  /**
   * Initiates processing of this connection, generating a response with the
   * given HTTP error code.
   *
   * @param code : uint
   *   an HTTP code, so in the range [0, 1000)
   * @param request : Request
   *   incomplete data about the incoming request (since there were errors
   *   during its processing
   */
  processError: function(code, request)
  {
    NS_ASSERT(!this._closed && !this._processed);

    this._processed = true;
    this.request = request;
    this.server._handler.handleError(code, this);
  },

  /** Converts this to a string for debugging purposes. */
  toString: function()
  {
    return "<Connection(" + this.number +
           (this.request ? ", " + this.request.path : "") +"): " +
           (this._closed ? "closed" : "open") + ">";
  }
};



/** Returns an array of count bytes from the given input stream. */
function readBytes(inputStream, count)
{
  return new BinaryInputStream(inputStream).readByteArray(count);
}



/** Request reader processing states; see RequestReader for details. */
const READER_IN_REQUEST_LINE = 0;
const READER_IN_HEADERS      = 1;
const READER_IN_BODY         = 2;
const READER_FINISHED        = 3;


/**
 * Reads incoming request data asynchronously, does any necessary preprocessing,
 * and forwards it to the request handler.  Processing occurs in three states:
 *
 *   READER_IN_REQUEST_LINE     Reading the request's status line
 *   READER_IN_HEADERS          Reading headers in the request
 *   READER_IN_BODY             Reading the body of the request
 *   READER_FINISHED            Entire request has been read and processed
 *
 * During the first two stages, initial metadata about the request is gathered
 * into a Request object.  Once the status line and headers have been processed,
 * we start processing the body of the request into the Request.  Finally, when
 * the entire body has been read, we create a Response and hand it off to the
 * ServerHandler to be given to the appropriate request handler.
 *
 * @param connection : Connection
 *   the connection for the request being read
 */
function RequestReader(connection)
{
  /** Connection metadata for this request. */
  this._connection = connection;

  /**
   * A container providing line-by-line access to the raw bytes that make up the
   * data which has been read from the connection but has not yet been acted
   * upon (by passing it to the request handler or by extracting request
   * metadata from it).
   */
  this._data = new LineData();

  /**
   * The amount of data remaining to be read from the body of this request.
   * After all headers in the request have been read this is the value in the
   * Content-Length header, but as the body is read its value decreases to zero.
   */
  this._contentLength = 0;

  /** The current state of parsing the incoming request. */
  this._state = READER_IN_REQUEST_LINE;

  /** Metadata constructed from the incoming request for the request handler. */
  this._metadata = new Request(connection.port);

  /**
   * Used to preserve state if we run out of line data midway through a
   * multi-line header.  _lastHeaderName stores the name of the header, while
   * _lastHeaderValue stores the value we've seen so far for the header.
   *
   * These fields are always either both undefined or both strings.
   */
  this._lastHeaderName = this._lastHeaderValue = undefined;
}
RequestReader.prototype =
{
  // NSIINPUTSTREAMCALLBACK

  /**
   * Called when more data from the incoming request is available.  This method
   * then reads the available data from input and deals with that data as
   * necessary, depending upon the syntax of already-downloaded data.
   *
   * @param input : nsIAsyncInputStream
   *   the stream of incoming data from the connection
   */
  onInputStreamReady: function(input)
  {
    dumpn("*** onInputStreamReady(input=" + input + ") on thread " +
          gThreadManager.currentThread + " (main is " +
          gThreadManager.mainThread + ")");
    dumpn("*** this._state == " + this._state);

    // Handle cases where we get more data after a request error has been
    // discovered but *before* we can close the connection.
    var data = this._data;
    if (!data)
      return;

    try
    {
      data.appendBytes(readBytes(input, input.available()));
    }
    catch (e)
    {
      if (streamClosed(e))
      {
        dumpn("*** WARNING: unexpected error when reading from socket; will " +
              "be treated as if the input stream had been closed");
        dumpn("*** WARNING: actual error was: " + e);
      }

      // We've lost a race -- input has been closed, but we're still expecting
      // to read more data.  available() will throw in this case, and since
      // we're dead in the water now, destroy the connection.
      dumpn("*** onInputStreamReady called on a closed input, destroying " +
            "connection");
      this._connection.close();
      return;
    }

    switch (this._state)
    {
      default:
        NS_ASSERT(false, "invalid state: " + this._state);
        break;

      case READER_IN_REQUEST_LINE:
        if (!this._processRequestLine())
          break;
        /* fall through */

      case READER_IN_HEADERS:
        if (!this._processHeaders())
          break;
        /* fall through */

      case READER_IN_BODY:
        this._processBody();
    }

    if (this._state != READER_FINISHED)
      input.asyncWait(this, 0, 0, gThreadManager.currentThread);
  },

  //
  // see nsISupports.QueryInterface
  //
  QueryInterface: function(aIID)
  {
    if (aIID.equals(Ci.nsIInputStreamCallback) ||
        aIID.equals(Ci.nsISupports))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },


  // PRIVATE API

  /**
   * Processes unprocessed, downloaded data as a request line.
   *
   * @returns boolean
   *   true iff the request line has been fully processed
   */
  _processRequestLine: function()
  {
    NS_ASSERT(this._state == READER_IN_REQUEST_LINE);

    // Servers SHOULD ignore any empty line(s) received where a Request-Line
    // is expected (section 4.1).
    var data = this._data;
    var line = {};
    var readSuccess;
    while ((readSuccess = data.readLine(line)) && line.value == "")
      dumpn("*** ignoring beginning blank line...");

    // if we don't have a full line, wait until we do
    if (!readSuccess)
      return false;

    // we have the first non-blank line
    try
    {
      this._parseRequestLine(line.value);
      this._state = READER_IN_HEADERS;
      return true;
    }
    catch (e)
    {
      this._handleError(e);
      return false;
    }
  },

  /**
   * Processes stored data, assuming it is either at the beginning or in
   * the middle of processing request headers.
   *
   * @returns boolean
   *   true iff header data in the request has been fully processed
   */
  _processHeaders: function()
  {
    NS_ASSERT(this._state == READER_IN_HEADERS);

    // XXX things to fix here:
    //
    // - need to support RFC 2047-encoded non-US-ASCII characters

    try
    {
      var done = this._parseHeaders();
      if (done)
      {
        var request = this._metadata;

        // XXX this is wrong for requests with transfer-encodings applied to
        //     them, particularly chunked (which by its nature can have no
        //     meaningful Content-Length header)!
        this._contentLength = request.hasHeader("Content-Length")
                            ? parseInt(request.getHeader("Content-Length"), 10)
                            : 0;
        dumpn("_processHeaders, Content-length=" + this._contentLength);

        this._state = READER_IN_BODY;
      }
      return done;
    }
    catch (e)
    {
      this._handleError(e);
      return false;
    }
  },

  /**
   * Processes stored data, assuming it is either at the beginning or in
   * the middle of processing the request body.
   *
   * @returns boolean
   *   true iff the request body has been fully processed
   */
  _processBody: function()
  {
    NS_ASSERT(this._state == READER_IN_BODY);

    // XXX handle chunked transfer-coding request bodies!

    try
    {
      if (this._contentLength > 0)
      {
        var data = this._data.purge();
        var count = Math.min(data.length, this._contentLength);
        dumpn("*** loading data=" + data + " len=" + data.length +
              " excess=" + (data.length - count));

        var bos = new BinaryOutputStream(this._metadata._bodyOutputStream);
        bos.writeByteArray(data, count);
        this._contentLength -= count;
      }

      dumpn("*** remaining body data len=" + this._contentLength);
      if (this._contentLength == 0)
      {
        this._validateRequest();
        this._state = READER_FINISHED;
        this._handleResponse();
        return true;
      }
      
      return false;
    }
    catch (e)
    {
      this._handleError(e);
      return false;
    }
  },

  /**
   * Does various post-header checks on the data in this request.
   *
   * @throws : HttpError
   *   if the request was malformed in some way
   */
  _validateRequest: function()
  {
    NS_ASSERT(this._state == READER_IN_BODY);

    dumpn("*** _validateRequest");

    var metadata = this._metadata;
    var headers = metadata._headers;

    // 19.6.1.1 -- servers MUST report 400 to HTTP/1.1 requests w/o Host header
    var identity = this._connection.server.identity;
    if (metadata._httpVersion.atLeast(nsHttpVersion.HTTP_1_1))
    {
      if (!headers.hasHeader("Host"))
      {
        dumpn("*** malformed HTTP/1.1 or greater request with no Host header!");
        throw HTTP_400;
      }

      // If the Request-URI wasn't absolute, then we need to determine our host.
      // We have to determine what scheme was used to access us based on the
      // server identity data at this point, because the request just doesn't
      // contain enough data on its own to do this, sadly.
      if (!metadata._host)
      {
        var host, port;
        var hostPort = headers.getHeader("Host");
        var colon = hostPort.indexOf(":");
        if (colon < 0)
        {
          host = hostPort;
          port = "";
        }
        else
        {
          host = hostPort.substring(0, colon);
          port = hostPort.substring(colon + 1);
        }

        // NB: We allow an empty port here because, oddly, a colon may be
        //     present even without a port number, e.g. "example.com:"; in this
        //     case the default port applies.
        if (!HOST_REGEX.test(host) || !/^\d*$/.test(port))
        {
          dumpn("*** malformed hostname (" + hostPort + ") in Host " +
                "header, 400 time");
          throw HTTP_400;
        }

        // If we're not given a port, we're stuck, because we don't know what
        // scheme to use to look up the correct port here, in general.  Since
        // the HTTPS case requires a tunnel/proxy and thus requires that the
        // requested URI be absolute (and thus contain the necessary
        // information), let's assume HTTP will prevail and use that.
        port = +port || 80;

        var scheme = identity.getScheme(host, port);
        if (!scheme)
        {
          dumpn("*** unrecognized hostname (" + hostPort + ") in Host " +
                "header, 400 time");
          throw HTTP_400;
        }

        metadata._scheme = scheme;
        metadata._host = host;
        metadata._port = port;
      }
    }
    else
    {
      NS_ASSERT(metadata._host === undefined,
                "HTTP/1.0 doesn't allow absolute paths in the request line!");

      metadata._scheme = identity.primaryScheme;
      metadata._host = identity.primaryHost;
      metadata._port = identity.primaryPort;
    }

    NS_ASSERT(identity.has(metadata._scheme, metadata._host, metadata._port),
              "must have a location we recognize by now!");
  },

  /**
   * Handles responses in case of error, either in the server or in the request.
   *
   * @param e
   *   the specific error encountered, which is an HttpError in the case where
   *   the request is in some way invalid or cannot be fulfilled; if this isn't
   *   an HttpError we're going to be paranoid and shut down, because that
   *   shouldn't happen, ever
   */
  _handleError: function(e)
  {
    // Don't fall back into normal processing!
    this._state = READER_FINISHED;

    var server = this._connection.server;
    if (e instanceof HttpError)
    {
      var code = e.code;
    }
    else
    {
      dumpn("!!! UNEXPECTED ERROR: " + e +
            (e.lineNumber ? ", line " + e.lineNumber : ""));

      // no idea what happened -- be paranoid and shut down
      code = 500;
      server._requestQuit();
    }

    // make attempted reuse of data an error
    this._data = null;

    this._connection.processError(code, this._metadata);
  },

  /**
   * Now that we've read the request line and headers, we can actually hand off
   * the request to be handled.
   *
   * This method is called once per request, after the request line and all
   * headers and the body, if any, have been received.
   */
  _handleResponse: function()
  {
    NS_ASSERT(this._state == READER_FINISHED);

    // We don't need the line-based data any more, so make attempted reuse an
    // error.
    this._data = null;

    this._connection.process(this._metadata);
  },


  // PARSING

  /**
   * Parses the request line for the HTTP request associated with this.
   *
   * @param line : string
   *   the request line
   */
  _parseRequestLine: function(line)
  {
    NS_ASSERT(this._state == READER_IN_REQUEST_LINE);

    dumpn("*** _parseRequestLine('" + line + "')");

    var metadata = this._metadata;

    // clients and servers SHOULD accept any amount of SP or HT characters
    // between fields, even though only a single SP is required (section 19.3)
    var request = line.split(/[ \t]+/);
    if (!request || request.length != 3)
      throw HTTP_400;

    metadata._method = request[0];

    // get the HTTP version
    var ver = request[2];
    var match = ver.match(/^HTTP\/(\d+\.\d+)$/);
    if (!match)
      throw HTTP_400;

    // determine HTTP version
    try
    {
      metadata._httpVersion = new nsHttpVersion(match[1]);
      if (!metadata._httpVersion.atLeast(nsHttpVersion.HTTP_1_0))
        throw "unsupported HTTP version";
    }
    catch (e)
    {
      // we support HTTP/1.0 and HTTP/1.1 only
      throw HTTP_501;
    }


    var fullPath = request[1];
    var serverIdentity = this._connection.server.identity;

    var scheme, host, port;

    if (fullPath.charAt(0) != "/")
    {
      // No absolute paths in the request line in HTTP prior to 1.1
      if (!metadata._httpVersion.atLeast(nsHttpVersion.HTTP_1_1))
        throw HTTP_400;

      try
      {
        var uri = Cc["@mozilla.org/network/io-service;1"]
                    .getService(Ci.nsIIOService)
                    .newURI(fullPath, null, null);
        fullPath = uri.path;
        scheme = uri.scheme;
        host = metadata._host = uri.asciiHost;
        port = uri.port;
        if (port === -1)
        {
          if (scheme === "http")
            port = 80;
          else if (scheme === "https")
            port = 443;
          else
            throw HTTP_400;
        }
      }
      catch (e)
      {
        // If the host is not a valid host on the server, the response MUST be a
        // 400 (Bad Request) error message (section 5.2).  Alternately, the URI
        // is malformed.
        throw HTTP_400;
      }

      if (!serverIdentity.has(scheme, host, port) || fullPath.charAt(0) != "/")
        throw HTTP_400;
    }

    var splitter = fullPath.indexOf("?");
    if (splitter < 0)
    {
      // _queryString already set in ctor
      metadata._path = fullPath;
    }
    else
    {
      metadata._path = fullPath.substring(0, splitter);
      metadata._queryString = fullPath.substring(splitter + 1);
    }

    metadata._scheme = scheme;
    metadata._host = host;
    metadata._port = port;
  },

  /**
   * Parses all available HTTP headers in this until the header-ending CRLFCRLF,
   * adding them to the store of headers in the request.
   *
   * @throws
   *   HTTP_400 if the headers are malformed
   * @returns boolean
   *   true if all headers have now been processed, false otherwise
   */
  _parseHeaders: function()
  {
    NS_ASSERT(this._state == READER_IN_HEADERS);

    dumpn("*** _parseHeaders");

    var data = this._data;

    var headers = this._metadata._headers;
    var lastName = this._lastHeaderName;
    var lastVal = this._lastHeaderValue;

    var line = {};
    while (true)
    {
      NS_ASSERT(!((lastVal === undefined) ^ (lastName === undefined)),
                lastName === undefined ?
                  "lastVal without lastName?  lastVal: '" + lastVal + "'" :
                  "lastName without lastVal?  lastName: '" + lastName + "'");

      if (!data.readLine(line))
      {
        // save any data we have from the header we might still be processing
        this._lastHeaderName = lastName;
        this._lastHeaderValue = lastVal;
        return false;
      }

      var lineText = line.value;
      var firstChar = lineText.charAt(0);

      // blank line means end of headers
      if (lineText == "")
      {
        // we're finished with the previous header
        if (lastName)
        {
          try
          {
            headers.setHeader(lastName, lastVal, true);
          }
          catch (e)
          {
            dumpn("*** e == " + e);
            throw HTTP_400;
          }
        }
        else
        {
          // no headers in request -- valid for HTTP/1.0 requests
        }

        // either way, we're done processing headers
        this._state = READER_IN_BODY;
        return true;
      }
      else if (firstChar == " " || firstChar == "\t")
      {
        // multi-line header if we've already seen a header line
        if (!lastName)
        {
          // we don't have a header to continue!
          throw HTTP_400;
        }

        // append this line's text to the value; starts with SP/HT, so no need
        // for separating whitespace
        lastVal += lineText;
      }
      else
      {
        // we have a new header, so set the old one (if one existed)
        if (lastName)
        {
          try
          {
            headers.setHeader(lastName, lastVal, true);
          }
          catch (e)
          {
            dumpn("*** e == " + e);
            throw HTTP_400;
          }
        }

        var colon = lineText.indexOf(":"); // first colon must be splitter
        if (colon < 1)
        {
          // no colon or missing header field-name
          throw HTTP_400;
        }

        // set header name, value (to be set in the next loop, usually)
        lastName = lineText.substring(0, colon);
        lastVal = lineText.substring(colon + 1);
      } // empty, continuation, start of header
    } // while (true)
  }
};


/** The character codes for CR and LF. */
const CR = 0x0D, LF = 0x0A;

/**
 * Calculates the number of characters before the first CRLF pair in array, or
 * -1 if the array contains no CRLF pair.
 *
 * @param array : Array
 *   an array of numbers in the range [0, 256), each representing a single
 *   character; the first CRLF is the lowest index i where
 *   |array[i] == "\r".charCodeAt(0)| and |array[i+1] == "\n".charCodeAt(0)|,
 *   if such an |i| exists, and -1 otherwise
 * @returns int
 *   the index of the first CRLF if any were present, -1 otherwise
 */
function findCRLF(array)
{
  for (var i = array.indexOf(CR); i >= 0; i = array.indexOf(CR, i + 1))
  {
    if (array[i + 1] == LF)
      return i;
  }
  return -1;
}


/**
 * A container which provides line-by-line access to the arrays of bytes with
 * which it is seeded.
 */
function LineData()
{
  /** An array of queued bytes from which to get line-based characters. */
  this._data = [];
}
LineData.prototype =
{
  /**
   * Appends the bytes in the given array to the internal data cache maintained
   * by this.
   */
  appendBytes: function(bytes)
  {
    Array.prototype.push.apply(this._data, bytes);
  },

  /**
   * Removes and returns a line of data, delimited by CRLF, from this.
   *
   * @param out
   *   an object whose "value" property will be set to the first line of text
   *   present in this, sans CRLF, if this contains a full CRLF-delimited line
   *   of text; if this doesn't contain enough data, the value of the property
   *   is undefined
   * @returns boolean
   *   true if a full line of data could be read from the data in this, false
   *   otherwise
   */
  readLine: function(out)
  {
    var data = this._data;
    var length = findCRLF(data);
    if (length < 0)
      return false;

    //
    // We have the index of the CR, so remove all the characters, including
    // CRLF, from the array with splice, and convert the removed array into the
    // corresponding string, from which we then strip the trailing CRLF.
    //
    // Getting the line in this matter acknowledges that substring is an O(1)
    // operation in SpiderMonkey because strings are immutable, whereas two
    // splices, both from the beginning of the data, are less likely to be as
    // cheap as a single splice plus two extra character conversions.
    //
    var line = String.fromCharCode.apply(null, data.splice(0, length + 2));
    out.value = line.substring(0, length);

    return true;
  },

  /**
   * Removes the bytes currently within this and returns them in an array.
   *
   * @returns Array
   *   the bytes within this when this method is called
   */
  purge: function()
  {
    var data = this._data;
    this._data = [];
    return data;
  }
};



/**
 * Creates a request-handling function for an nsIHttpRequestHandler object.
 */
function createHandlerFunc(handler)
{
  return function(metadata, response) { handler.handle(metadata, response); };
}


/**
 * The default handler for directories; writes an HTML response containing a
 * slightly-formatted directory listing.
 */
function defaultIndexHandler(metadata, response)
{
  response.setHeader("Content-Type", "text/html", false);

  var path = htmlEscape(decodeURI(metadata.path));

  //
  // Just do a very basic bit of directory listings -- no need for too much
  // fanciness, especially since we don't have a style sheet in which we can
  // stick rules (don't want to pollute the default path-space).
  //

  var body = '<html>\
                <head>\
                  <title>' + path + '</title>\
                </head>\
                <body>\
                  <h1>' + path + '</h1>\
                  <ol style="list-style-type: none">';

  var directory = metadata.getProperty("directory");
  NS_ASSERT(directory && directory.isDirectory());

  var fileList = [];
  var files = directory.directoryEntries;
  while (files.hasMoreElements())
  {
    var f = files.getNext().QueryInterface(Ci.nsIFile);
    var name = f.leafName;
    if (!f.isHidden() &&
        (name.charAt(name.length - 1) != HIDDEN_CHAR ||
         name.charAt(name.length - 2) == HIDDEN_CHAR))
      fileList.push(f);
  }

  fileList.sort(fileSort);

  for (var i = 0; i < fileList.length; i++)
  {
    var file = fileList[i];
    try
    {
      var name = file.leafName;
      if (name.charAt(name.length - 1) == HIDDEN_CHAR)
        name = name.substring(0, name.length - 1);
      var sep = file.isDirectory() ? "/" : "";

      // Note: using " to delimit the attribute here because encodeURIComponent
      //       passes through '.
      var item = '<li><a href="' + encodeURIComponent(name) + sep + '">' +
                   htmlEscape(name) + sep +
                 '</a></li>';

      body += item;
    }
    catch (e) { /* some file system error, ignore the file */ }
  }

  body    += '    </ol>\
                </body>\
              </html>';

  response.bodyOutputStream.write(body, body.length);
}

/**
 * Sorts a and b (nsIFile objects) into an aesthetically pleasing order.
 */
function fileSort(a, b)
{
  var dira = a.isDirectory(), dirb = b.isDirectory();

  if (dira && !dirb)
    return -1;
  if (dirb && !dira)
    return 1;

  var namea = a.leafName.toLowerCase(), nameb = b.leafName.toLowerCase();
  return nameb > namea ? -1 : 1;
}


/**
 * Converts an externally-provided path into an internal path for use in
 * determining file mappings.
 *
 * @param path
 *   the path to convert
 * @param encoded
 *   true if the given path should be passed through decodeURI prior to
 *   conversion
 * @throws URIError
 *   if path is incorrectly encoded
 */
function toInternalPath(path, encoded)
{
  if (encoded)
    path = decodeURI(path);

  var comps = path.split("/");
  for (var i = 0, sz = comps.length; i < sz; i++)
  {
    var comp = comps[i];
    if (comp.charAt(comp.length - 1) == HIDDEN_CHAR)
      comps[i] = comp + HIDDEN_CHAR;
  }
  return comps.join("/");
}


/**
 * Adds custom-specified headers for the given file to the given response, if
 * any such headers are specified.
 *
 * @param file
 *   the file on the disk which is to be written
 * @param metadata
 *   metadata about the incoming request
 * @param response
 *   the Response to which any specified headers/data should be written
 * @throws HTTP_500
 *   if an error occurred while processing custom-specified headers
 */
function maybeAddHeaders(file, metadata, response)
{
  var name = file.leafName;
  if (name.charAt(name.length - 1) == HIDDEN_CHAR)
    name = name.substring(0, name.length - 1);

  var headerFile = file.parent;
  headerFile.append(name + HEADERS_SUFFIX);

  if (!headerFile.exists())
    return;

  const PR_RDONLY = 0x01;
  var fis = new FileInputStream(headerFile, PR_RDONLY, 0444,
                                Ci.nsIFileInputStream.CLOSE_ON_EOF);

  try
  {
    var lis = new ConverterInputStream(fis, "UTF-8", 1024, 0x0);
    lis.QueryInterface(Ci.nsIUnicharLineInputStream);

    var line = {value: ""};
    var more = lis.readLine(line);

    if (!more && line.value == "")
      return;


    // request line

    var status = line.value;
    if (status.indexOf("HTTP ") == 0)
    {
      status = status.substring(5);
      var space = status.indexOf(" ");
      var code, description;
      if (space < 0)
      {
        code = status;
        description = "";
      }
      else
      {
        code = status.substring(0, space);
        description = status.substring(space + 1, status.length);
      }
    
      response.setStatusLine(metadata.httpVersion, parseInt(code, 10), description);

      line.value = "";
      more = lis.readLine(line);
    }

    // headers
    while (more || line.value != "")
    {
      var header = line.value;
      var colon = header.indexOf(":");

      response.setHeader(header.substring(0, colon),
                         header.substring(colon + 1, header.length),
                         false); // allow overriding server-set headers

      line.value = "";
      more = lis.readLine(line);
    }
  }
  catch (e)
  {
    dumpn("WARNING: error in headers for " + metadata.path + ": " + e);
    throw HTTP_500;
  }
  finally
  {
    fis.close();
  }
}


/**
 * An object which handles requests for a server, executing default and
 * overridden behaviors as instructed by the code which uses and manipulates it.
 * Default behavior includes the paths / and /trace (diagnostics), with some
 * support for HTTP error pages for various codes and fallback to HTTP 500 if
 * those codes fail for any reason.
 *
 * @param server : nsHttpServer
 *   the server in which this handler is being used
 */
function ServerHandler(server)
{
  // FIELDS

  /**
   * The nsHttpServer instance associated with this handler.
   */
  this._server = server;

  /**
   * A FileMap object containing the set of path->nsILocalFile mappings for
   * all directory mappings set in the server (e.g., "/" for /var/www/html/,
   * "/foo/bar/" for /local/path/, and "/foo/bar/baz/" for /local/path2).
   *
   * Note carefully: the leading and trailing "/" in each path (not file) are
   * removed before insertion to simplify the code which uses this.  You have
   * been warned!
   */
  this._pathDirectoryMap = new FileMap();

  /**
   * Custom request handlers for the server in which this resides.  Path-handler
   * pairs are stored as property-value pairs in this property.
   *
   * @see ServerHandler.prototype._defaultPaths
   */
  this._overridePaths = {};

  /**
     * Custom request handlers for globbed paths for the server. Path-handlers
     * pairs are stored in an object with two keys "re" and "handler",
     * representing the regular expression to use to see if a path matches and
     * the handler to be called when a match is made.
     */
  this._globbedPaths = {};

  /**
   * Custom request handlers for the error handlers in the server in which this
   * resides.  Path-handler pairs are stored as property-value pairs in this
   * property.
   *
   * @see ServerHandler.prototype._defaultErrors
   */
  this._overrideErrors = {};

  /**
   * Maps file extensions to their MIME types in the server, overriding any
   * mapping that might or might not exist in the MIME service.
   */
  this._mimeMappings = {};

  /**
   * The default handler for requests for directories, used to serve directories
   * when no index file is present.
   */
  this._indexHandler = defaultIndexHandler;

  /** Per-path state storage for the server. */
  this._state = {};

  /** Entire-server state storage. */
  this._sharedState = {};

  /** Entire-server state storage for nsISupports values. */
  this._objectState = {};
}
ServerHandler.prototype =
{
  // PUBLIC API

  /**
   * Handles a request to this server, responding to the request appropriately
   * and initiating server shutdown if necessary.
   *
   * This method never throws an exception.
   *
   * @param connection : Connection
   *   the connection for this request
   */
  handleResponse: function(connection)
  {
    var request = connection.request;
    var response = new Response(connection);

    var path = request.path;
    dumpn("*** path == " + path);

    try
    {
      try
      {
        if (path in this._overridePaths)
        {
          // explicit paths first, then files based on existing directory mappings,
          // then (if the file doesn't exist) built-in server default paths
          this._overridePaths[path](request, response);
        }
        else
        {
          var handled = false;
          for (var re in this._globbedPaths)
          {
            if (new RegExp(re).test(path))
            {
              handled = true;
              dumpn(this._globbedPaths[re]);
              this._globbedPaths[re](request, response);
            }
          }

          if (!handled)
          {
            this._handleDefault(request, response);
          }
        }
      }
      catch (e)
      {
        if (response.partiallySent())
        {
          response.abort(e);
          return;
        }

        if (!(e instanceof HttpError))
        {
          dumpn("*** unexpected error: e == " + e);
          throw HTTP_500;
        }
        if (e.code !== 404)
          throw e;

        dumpn("*** default: " + (path in this._defaultPaths));

        response = new Response(connection);
        if (path in this._defaultPaths)
          this._defaultPaths[path](request, response);
        else
          throw HTTP_404;
      }
    }
    catch (e)
    {
      if (response.partiallySent())
      {
        response.abort(e);
        return;
      }

      var errorCode = "internal";

      try
      {
        if (!(e instanceof HttpError))
          throw e;

        errorCode = e.code;
        dumpn("*** errorCode == " + errorCode);

        response = new Response(connection);
        if (e.customErrorHandling)
          e.customErrorHandling(response);
        this._handleError(errorCode, request, response);
        return;
      }
      catch (e2)
      {
        dumpn("*** error handling " + errorCode + " error: " +
              "e2 == " + e2 + ", shutting down server");

        connection.server._requestQuit();
        response.abort(e2);
        return;
      }
    }

    response.complete();
  },

  //
  // see nsIHttpServer.registerFile
  //
  registerFile: function(path, file)
  {
    if (!file)
    {
      dumpn("*** unregistering '" + path + "' mapping");
      delete this._overridePaths[path];
      return;
    }

    dumpn("*** registering '" + path + "' as mapping to " + file.path);
    file = file.clone();

    var self = this;
    this._overridePaths[path] =
      function(request, response)
      {
        if (!file.exists())
          throw HTTP_404;

        response.setStatusLine(request.httpVersion, 200, "OK");
        self._writeFileResponse(request, file, response, 0, file.fileSize);
      };
  },

  //
  // see nsIHttpServer.registerPathHandler
  //
  registerPathHandler: function(path, handler)
  {
    // XXX true path validation!
    if (path.charAt(0) != "/")
      throw Cr.NS_ERROR_INVALID_ARG;

    this._handlerToField(handler, this._overridePaths, path);
  },

  registerGlobHandler: function(re, handler)
  {
    if (typeof(handler) == "function")
      this._globbedPaths[re] = handler;
    else if (handler)
      this._globbedPaths[re] = createHandlerFunc(handler);
  },

  //
  // see nsIHttpServer.registerDirectory
  //
  registerDirectory: function(path, directory)
  {
    // strip off leading and trailing '/' so that we can use lastIndexOf when
    // determining exactly how a path maps onto a mapped directory --
    // conditional is required here to deal with "/".substring(1, 0) being
    // converted to "/".substring(0, 1) per the JS specification
    var key = path.length == 1 ? "" : path.substring(1, path.length - 1);

    // the path-to-directory mapping code requires that the first character not
    // be "/", or it will go into an infinite loop
    if (key.charAt(0) == "/")
      throw Cr.NS_ERROR_INVALID_ARG;

    key = toInternalPath(key, false);

    if (directory)
    {
      dumpn("*** mapping '" + path + "' to the location " + directory.path);
      this._pathDirectoryMap.put(key, directory);
    }
    else
    {
      dumpn("*** removing mapping for '" + path + "'");
      this._pathDirectoryMap.put(key, null);
    }
  },

  //
  // see nsIHttpServer.registerErrorHandler
  //
  registerErrorHandler: function(err, handler)
  {
    if (!(err in HTTP_ERROR_CODES))
      dumpn("*** WARNING: registering non-HTTP/1.1 error code " +
            "(" + err + ") handler -- was this intentional?");

    this._handlerToField(handler, this._overrideErrors, err);
  },

  //
  // see nsIHttpServer.setIndexHandler
  //
  setIndexHandler: function(handler)
  {
    if (!handler)
      handler = defaultIndexHandler;
    else if (typeof(handler) != "function")
      handler = createHandlerFunc(handler);

    this._indexHandler = handler;
  },

  //
  // see nsIHttpServer.registerContentType
  //
  registerContentType: function(ext, type)
  {
    if (!type)
      delete this._mimeMappings[ext];
    else
      this._mimeMappings[ext] = headerUtils.normalizeFieldValue(type);
  },

  // PRIVATE API

  /**
   * Sets or remove (if handler is null) a handler in an object with a key.
   *
   * @param handler
   *   a handler, either function or an nsIHttpRequestHandler
   * @param dict
   *   The object to attach the handler to.
   * @param key
   *   The field name of the handler.
   */
  _handlerToField: function(handler, dict, key)
  {
    // for convenience, handler can be a function if this is run from xpcshell
    if (typeof(handler) == "function")
      dict[key] = handler;
    else if (handler)
      dict[key] = createHandlerFunc(handler);
    else
      delete dict[key];
  },

  /**
   * Handles a request which maps to a file in the local filesystem (if a base
   * path has already been set; otherwise the 404 error is thrown).
   *
   * @param metadata : Request
   *   metadata for the incoming request
   * @param response : Response
   *   an uninitialized Response to the given request, to be initialized by a
   *   request handler
   * @throws HTTP_###
   *   if an HTTP error occurred (usually HTTP_404); note that in this case the
   *   calling code must handle post-processing of the response
   */
  _handleDefault: function(metadata, response)
  {
    dumpn("*** _handleDefault()");

    response.setStatusLine(metadata.httpVersion, 200, "OK");

    var path = metadata.path;
    NS_ASSERT(path.charAt(0) == "/", "invalid path: <" + path + ">");

    // determine the actual on-disk file; this requires finding the deepest
    // path-to-directory mapping in the requested URL
    var file = this._getFileForPath(path);

    // the "file" might be a directory, in which case we either serve the
    // contained index.html or make the index handler write the response
    if (file.exists() && file.isDirectory())
    {
      file.append("index.html"); // make configurable?
      if (!file.exists() || file.isDirectory())
      {
        metadata._ensurePropertyBag();
        metadata._bag.setPropertyAsInterface("directory", file.parent);
        this._indexHandler(metadata, response);
        return;
      }
    }

    // alternately, the file might not exist
    if (!file.exists())
      throw HTTP_404;

    var start, end;
    if (metadata._httpVersion.atLeast(nsHttpVersion.HTTP_1_1) &&
        metadata.hasHeader("Range") &&
        this._getTypeFromFile(file) !== SJS_TYPE)
    {
      var rangeMatch = metadata.getHeader("Range").match(/^bytes=(\d+)?-(\d+)?$/);
      if (!rangeMatch)
        throw HTTP_400;

      if (rangeMatch[1] !== undefined)
        start = parseInt(rangeMatch[1], 10);

      if (rangeMatch[2] !== undefined)
        end = parseInt(rangeMatch[2], 10);

      if (start === undefined && end === undefined)
        throw HTTP_400;

      // No start given, so the end is really the count of bytes from the
      // end of the file.
      if (start === undefined)
      {
        start = Math.max(0, file.fileSize - end);
        end   = file.fileSize - 1;
      }

      // start and end are inclusive
      if (end === undefined || end >= file.fileSize)
        end = file.fileSize - 1;

      if (start !== undefined && start >= file.fileSize) {
        var HTTP_416 = new HttpError(416, "Requested Range Not Satisfiable");
        HTTP_416.customErrorHandling = function(errorResponse)
        {
          maybeAddHeaders(file, metadata, errorResponse);
        };
        throw HTTP_416;
      }

      if (end < start)
      {
        response.setStatusLine(metadata.httpVersion, 200, "OK");
        start = 0;
        end = file.fileSize - 1;
      }
      else
      {
        response.setStatusLine(metadata.httpVersion, 206, "Partial Content");
        var contentRange = "bytes " + start + "-" + end + "/" + file.fileSize;
        response.setHeader("Content-Range", contentRange);
      }
    }
    else
    {
      start = 0;
      end = file.fileSize - 1;
    }

    // finally...
    dumpn("*** handling '" + path + "' as mapping to " + file.path + " from " +
          start + " to " + end + " inclusive");
    this._writeFileResponse(metadata, file, response, start, end - start + 1);
  },

  /**
   * Writes an HTTP response for the given file, including setting headers for
   * file metadata.
   *
   * @param metadata : Request
   *   the Request for which a response is being generated
   * @param file : nsILocalFile
   *   the file which is to be sent in the response
   * @param response : Response
   *   the response to which the file should be written
   * @param offset: uint
   *   the byte offset to skip to when writing
   * @param count: uint
   *   the number of bytes to write
   */
  _writeFileResponse: function(metadata, file, response, offset, count)
  {
    const PR_RDONLY = 0x01;

    var type = this._getTypeFromFile(file);
    if (type === SJS_TYPE)
    {
      var fis = new FileInputStream(file, PR_RDONLY, 0444,
                                    Ci.nsIFileInputStream.CLOSE_ON_EOF);

      try
      {
        var sis = new ScriptableInputStream(fis);
        var s = Cu.Sandbox(gGlobalObject);
        s.importFunction(dump, "dump");

        // Define a basic key-value state-preservation API across requests, with
        // keys initially corresponding to the empty string.
        var self = this;
        var path = metadata.path;
        s.importFunction(function getState(k)
        {
          return self._getState(path, k);
        });
        s.importFunction(function setState(k, v)
        {
          self._setState(path, k, v);
        });
        s.importFunction(function getSharedState(k)
        {
          return self._getSharedState(k);
        });
        s.importFunction(function setSharedState(k, v)
        {
          self._setSharedState(k, v);
        });
        s.importFunction(function getObjectState(k, callback)
        {
          callback(self._getObjectState(k));
        });
        s.importFunction(function setObjectState(k, v)
        {
          self._setObjectState(k, v);
        });

        // Make it possible for sjs files to access their location
        this._setState(path, "__LOCATION__", file.path);

        try
        {
          // Alas, the line number in errors dumped to console when calling the
          // request handler is simply an offset from where we load the SJS file.
          // Work around this in a reasonably non-fragile way by dynamically
          // getting the line number where we evaluate the SJS file.  Don't
          // separate these two lines!
          var line = new Error().lineNumber;
          Cu.evalInSandbox(sis.read(file.fileSize), s);
        }
        catch (e)
        {
          dumpn("*** syntax error in SJS at " + file.path + ": " + e);
          throw HTTP_500;
        }

        try
        {
          s.handleRequest(metadata, response);
        }
        catch (e)
        {
          dump("*** error running SJS at " + file.path + ": " +
               e + " on line " +
               (e instanceof Error
               ? e.lineNumber + " in httpd.js"
               : (e.lineNumber - line)) + "\n");
          throw HTTP_500;
        }
      }
      finally
      {
        fis.close();
      }
    }
    else
    {
      try
      {
        response.setHeader("Last-Modified",
                           toDateString(file.lastModifiedTime),
                           false);
      }
      catch (e) { /* lastModifiedTime threw, ignore */ }

      response.setHeader("Content-Type", type, false);
      maybeAddHeaders(file, metadata, response);
      response.setHeader("Content-Length", "" + count, false);

      var fis = new FileInputStream(file, PR_RDONLY, 0444,
                                    Ci.nsIFileInputStream.CLOSE_ON_EOF);

      offset = offset || 0;
      count  = count || file.fileSize;
      NS_ASSERT(offset === 0 || offset < file.fileSize, "bad offset");
      NS_ASSERT(count >= 0, "bad count");
      NS_ASSERT(offset + count <= file.fileSize, "bad total data size");

      try
      {
        if (offset !== 0)
        {
          // Seek (or read, if seeking isn't supported) to the correct offset so
          // the data sent to the client matches the requested range.
          if (fis instanceof Ci.nsISeekableStream)
            fis.seek(Ci.nsISeekableStream.NS_SEEK_SET, offset);
          else
            new ScriptableInputStream(fis).read(offset);
        }
      }
      catch (e)
      {
        fis.close();
        throw e;
      }

      function writeMore()
      {
        gThreadManager.currentThread
                      .dispatch(writeData, Ci.nsIThread.DISPATCH_NORMAL);
      }

      var input = new BinaryInputStream(fis);
      var output = new BinaryOutputStream(response.bodyOutputStream);
      var writeData =
        {
          run: function()
          {
            var chunkSize = Math.min(65536, count);
            count -= chunkSize;
            NS_ASSERT(count >= 0, "underflow");

            try
            {
              var data = input.readByteArray(chunkSize);
              NS_ASSERT(data.length === chunkSize,
                        "incorrect data returned?  got " + data.length +
                        ", expected " + chunkSize);
              output.writeByteArray(data, data.length);
              if (count === 0)
              {
                fis.close();
                response.finish();
              }
              else
              {
                writeMore();
              }
            }
            catch (e)
            {
              try
              {
                fis.close();
              }
              finally
              {
                response.finish();
              }
              throw e;
            }
          }
        };

      writeMore();

      // Now that we know copying will start, flag the response as async.
      response.processAsync();
    }
  },

  /**
   * Get the value corresponding to a given key for the given path for SJS state
   * preservation across requests.
   *
   * @param path : string
   *   the path from which the given state is to be retrieved
   * @param k : string
   *   the key whose corresponding value is to be returned
   * @returns string
   *   the corresponding value, which is initially the empty string
   */
  _getState: function(path, k)
  {
    var state = this._state;
    if (path in state && k in state[path])
      return state[path][k];
    return "";
  },

  /**
   * Set the value corresponding to a given key for the given path for SJS state
   * preservation across requests.
   *
   * @param path : string
   *   the path from which the given state is to be retrieved
   * @param k : string
   *   the key whose corresponding value is to be set
   * @param v : string
   *   the value to be set
   */
  _setState: function(path, k, v)
  {
    if (typeof v !== "string")
      throw new Error("non-string value passed");
    var state = this._state;
    if (!(path in state))
      state[path] = {};
    state[path][k] = v;
  },

  /**
   * Get the value corresponding to a given key for SJS state preservation
   * across requests.
   *
   * @param k : string
   *   the key whose corresponding value is to be returned
   * @returns string
   *   the corresponding value, which is initially the empty string
   */
  _getSharedState: function(k)
  {
    var state = this._sharedState;
    if (k in state)
      return state[k];
    return "";
  },

  /**
   * Set the value corresponding to a given key for SJS state preservation
   * across requests.
   *
   * @param k : string
   *   the key whose corresponding value is to be set
   * @param v : string
   *   the value to be set
   */
  _setSharedState: function(k, v)
  {
    if (typeof v !== "string")
      throw new Error("non-string value passed");
    this._sharedState[k] = v;
  },

  /**
   * Returns the object associated with the given key in the server for SJS
   * state preservation across requests.
   *
   * @param k : string
   *  the key whose corresponding object is to be returned
   * @returns nsISupports
   *  the corresponding object, or null if none was present
   */
  _getObjectState: function(k)
  {
    if (typeof k !== "string")
      throw new Error("non-string key passed");
    return this._objectState[k] || null;
  },

  /**
   * Sets the object associated with the given key in the server for SJS
   * state preservation across requests.
   *
   * @param k : string
   *  the key whose corresponding object is to be set
   * @param v : nsISupports
   *  the object to be associated with the given key; may be null
   */
  _setObjectState: function(k, v)
  {
    if (typeof k !== "string")
      throw new Error("non-string key passed");
    if (typeof v !== "object")
      throw new Error("non-object value passed");
    if (v && !("QueryInterface" in v))
    {
      throw new Error("must pass an nsISupports; use wrappedJSObject to ease " +
                      "pain when using the server from JS");
    }

    this._objectState[k] = v;
  },

  /**
   * Gets a content-type for the given file, first by checking for any custom
   * MIME-types registered with this handler for the file's extension, second by
   * asking the global MIME service for a content-type, and finally by failing
   * over to application/octet-stream.
   *
   * @param file : nsIFile
   *   the nsIFile for which to get a file type
   * @returns string
   *   the best content-type which can be determined for the file
   */
  _getTypeFromFile: function(file)
  {
    try
    {
      var name = file.leafName;
      var dot = name.lastIndexOf(".");
      if (dot > 0)
      {
        var ext = name.slice(dot + 1);
        if (ext in this._mimeMappings)
          return this._mimeMappings[ext];
      }
      return Cc["@mozilla.org/uriloader/external-helper-app-service;1"]
               .getService(Ci.nsIMIMEService)
               .getTypeFromFile(file);
    }
    catch (e)
    {
      return "application/octet-stream";
    }
  },

  /**
   * Returns the nsILocalFile which corresponds to the path, as determined using
   * all registered path->directory mappings and any paths which are explicitly
   * overridden.
   *
   * @param path : string
   *   the server path for which a file should be retrieved, e.g. "/foo/bar"
   * @throws HttpError
   *   when the correct action is the corresponding HTTP error (i.e., because no
   *   mapping was found for a directory in path, the referenced file doesn't
   *   exist, etc.)
   * @returns nsILocalFile
   *   the file to be sent as the response to a request for the path
   */
  _getFileForPath: function(path)
  {
    // decode and add underscores as necessary
    try
    {
      path = toInternalPath(path, true);
    }
    catch (e)
    {
      throw HTTP_400; // malformed path
    }

    // next, get the directory which contains this path
    var pathMap = this._pathDirectoryMap;

    // An example progression of tmp for a path "/foo/bar/baz/" might be:
    // "foo/bar/baz/", "foo/bar/baz", "foo/bar", "foo", ""
    var tmp = path.substring(1);
    while (true)
    {
      // do we have a match for current head of the path?
      var file = pathMap.get(tmp);
      if (file)
      {
        // XXX hack; basically disable showing mapping for /foo/bar/ when the
        //     requested path was /foo/bar, because relative links on the page
        //     will all be incorrect -- we really need the ability to easily
        //     redirect here instead
        if (tmp == path.substring(1) &&
            tmp.length != 0 &&
            tmp.charAt(tmp.length - 1) != "/")
          file = null;
        else
          break;
      }

      // if we've finished trying all prefixes, exit
      if (tmp == "")
        break;

      tmp = tmp.substring(0, tmp.lastIndexOf("/"));
    }

    // no mapping applies, so 404
    if (!file)
      throw HTTP_404;


    // last, get the file for the path within the determined directory
    var parentFolder = file.parent;
    var dirIsRoot = (parentFolder == null);

    // Strategy here is to append components individually, making sure we
    // never move above the given directory; this allows paths such as
    // "<file>/foo/../bar" but prevents paths such as "<file>/../base-sibling";
    // this component-wise approach also means the code works even on platforms
    // which don't use "/" as the directory separator, such as Windows
    var leafPath = path.substring(tmp.length + 1);
    var comps = leafPath.split("/");
    for (var i = 0, sz = comps.length; i < sz; i++)
    {
      var comp = comps[i];

      if (comp == "..")
        file = file.parent;
      else if (comp == "." || comp == "")
        continue;
      else
        file.append(comp);

      if (!dirIsRoot && file.equals(parentFolder))
        throw HTTP_403;
    }

    return file;
  },

  /**
   * Writes the error page for the given HTTP error code over the given
   * connection.
   *
   * @param errorCode : uint
   *   the HTTP error code to be used
   * @param connection : Connection
   *   the connection on which the error occurred
   */
  handleError: function(errorCode, connection)
  {
    var response = new Response(connection);

    dumpn("*** error in request: " + errorCode);

    this._handleError(errorCode, new Request(connection.port), response);
  }, 

  /**
   * Handles a request which generates the given error code, using the
   * user-defined error handler if one has been set, gracefully falling back to
   * the x00 status code if the code has no handler, and failing to status code
   * 500 if all else fails.
   *
   * @param errorCode : uint
   *   the HTTP error which is to be returned
   * @param metadata : Request
   *   metadata for the request, which will often be incomplete since this is an
   *   error
   * @param response : Response
   *   an uninitialized Response should be initialized when this method
   *   completes with information which represents the desired error code in the
   *   ideal case or a fallback code in abnormal circumstances (i.e., 500 is a
   *   fallback for 505, per HTTP specs)
   */
  _handleError: function(errorCode, metadata, response)
  {
    if (!metadata)
      throw Cr.NS_ERROR_NULL_POINTER;

    var errorX00 = errorCode - (errorCode % 100);

    try
    {
      if (!(errorCode in HTTP_ERROR_CODES))
        dumpn("*** WARNING: requested invalid error: " + errorCode);

      // RFC 2616 says that we should try to handle an error by its class if we
      // can't otherwise handle it -- if that fails, we revert to handling it as
      // a 500 internal server error, and if that fails we throw and shut down
      // the server

      // actually handle the error
      try
      {
        if (errorCode in this._overrideErrors)
          this._overrideErrors[errorCode](metadata, response);
        else
          this._defaultErrors[errorCode](metadata, response);
      }
      catch (e)
      {
        if (response.partiallySent())
        {
          response.abort(e);
          return;
        }

        // don't retry the handler that threw
        if (errorX00 == errorCode)
          throw HTTP_500;

        dumpn("*** error in handling for error code " + errorCode + ", " +
              "falling back to " + errorX00 + "...");
        response = new Response(response._connection);
        if (errorX00 in this._overrideErrors)
          this._overrideErrors[errorX00](metadata, response);
        else if (errorX00 in this._defaultErrors)
          this._defaultErrors[errorX00](metadata, response);
        else
          throw HTTP_500;
      }
    }
    catch (e)
    {
      if (response.partiallySent())
      {
        response.abort();
        return;
      }

      // we've tried everything possible for a meaningful error -- now try 500
      dumpn("*** error in handling for error code " + errorX00 + ", falling " +
            "back to 500...");

      try
      {
        response = new Response(response._connection);
        if (500 in this._overrideErrors)
          this._overrideErrors[500](metadata, response);
        else
          this._defaultErrors[500](metadata, response);
      }
      catch (e2)
      {
        dumpn("*** multiple errors in default error handlers!");
        dumpn("*** e == " + e + ", e2 == " + e2);
        response.abort(e2);
        return;
      }
    }

    response.complete();
  },

  // FIELDS

  /**
   * This object contains the default handlers for the various HTTP error codes.
   */
  _defaultErrors:
  {
    400: function(metadata, response)
    {
      // none of the data in metadata is reliable, so hard-code everything here
      response.setStatusLine("1.1", 400, "Bad Request");
      response.setHeader("Content-Type", "text/plain", false);

      var body = "Bad request\n";
      response.bodyOutputStream.write(body, body.length);
    },
    403: function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion, 403, "Forbidden");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                    <head><title>403 Forbidden</title></head>\
                    <body>\
                      <h1>403 Forbidden</h1>\
                    </body>\
                  </html>";
      response.bodyOutputStream.write(body, body.length);
    },
    404: function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion, 404, "Not Found");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                    <head><title>404 Not Found</title></head>\
                    <body>\
                      <h1>404 Not Found</h1>\
                      <p>\
                        <span style='font-family: monospace;'>" +
                          htmlEscape(metadata.path) +
                       "</span> was not found.\
                      </p>\
                    </body>\
                  </html>";
      response.bodyOutputStream.write(body, body.length);
    },
    416: function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion,
                            416,
                            "Requested Range Not Satisfiable");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                   <head>\
                    <title>416 Requested Range Not Satisfiable</title></head>\
                    <body>\
                     <h1>416 Requested Range Not Satisfiable</h1>\
                     <p>The byte range was not valid for the\
                        requested resource.\
                     </p>\
                    </body>\
                  </html>";
      response.bodyOutputStream.write(body, body.length);
    },
    500: function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion,
                             500,
                             "Internal Server Error");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                    <head><title>500 Internal Server Error</title></head>\
                    <body>\
                      <h1>500 Internal Server Error</h1>\
                      <p>Something's broken in this server and\
                        needs to be fixed.</p>\
                    </body>\
                  </html>";
      response.bodyOutputStream.write(body, body.length);
    },
    501: function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion, 501, "Not Implemented");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                    <head><title>501 Not Implemented</title></head>\
                    <body>\
                      <h1>501 Not Implemented</h1>\
                      <p>This server is not (yet) Apache.</p>\
                    </body>\
                  </html>";
      response.bodyOutputStream.write(body, body.length);
    },
    505: function(metadata, response)
    {
      response.setStatusLine("1.1", 505, "HTTP Version Not Supported");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                    <head><title>505 HTTP Version Not Supported</title></head>\
                    <body>\
                      <h1>505 HTTP Version Not Supported</h1>\
                      <p>This server only supports HTTP/1.0 and HTTP/1.1\
                        connections.</p>\
                    </body>\
                  </html>";
      response.bodyOutputStream.write(body, body.length);
    }
  },

  /**
   * Contains handlers for the default set of URIs contained in this server.
   */
  _defaultPaths:
  {
    "/": function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion, 200, "OK");
      response.setHeader("Content-Type", "text/html", false);

      var body = "<html>\
                    <head><title>httpd.js</title></head>\
                    <body>\
                      <h1>httpd.js</h1>\
                      <p>If you're seeing this page, httpd.js is up and\
                        serving requests!  Now set a base path and serve some\
                        files!</p>\
                    </body>\
                  </html>";

      response.bodyOutputStream.write(body, body.length);
    },

    "/trace": function(metadata, response)
    {
      response.setStatusLine(metadata.httpVersion, 200, "OK");
      response.setHeader("Content-Type", "text/plain", false);

      var body = "Request-URI: " +
                 metadata.scheme + "://" + metadata.host + ":" + metadata.port +
                 metadata.path + "\n\n";
      body += "Request (semantically equivalent, slightly reformatted):\n\n";
      body += metadata.method + " " + metadata.path;

      if (metadata.queryString)
        body +=  "?" + metadata.queryString;
        
      body += " HTTP/" + metadata.httpVersion + "\r\n";

      var headEnum = metadata.headers;
      while (headEnum.hasMoreElements())
      {
        var fieldName = headEnum.getNext()
                                .QueryInterface(Ci.nsISupportsString)
                                .data;
        body += fieldName + ": " + metadata.getHeader(fieldName) + "\r\n";
      }

      response.bodyOutputStream.write(body, body.length);
    }
  }
};


/**
 * Maps absolute paths to files on the local file system (as nsILocalFiles).
 */
function FileMap()
{
  /** Hash which will map paths to nsILocalFiles. */
  this._map = {};
}
FileMap.prototype =
{
  // PUBLIC API

  /**
   * Maps key to a clone of the nsILocalFile value if value is non-null;
   * otherwise, removes any extant mapping for key.
   *
   * @param key : string
   *   string to which a clone of value is mapped
   * @param value : nsILocalFile
   *   the file to map to key, or null to remove a mapping
   */
  put: function(key, value)
  {
    if (value)
      this._map[key] = value.clone();
    else
      delete this._map[key];
  },

  /**
   * Returns a clone of the nsILocalFile mapped to key, or null if no such
   * mapping exists.
   *
   * @param key : string
   *   key to which the returned file maps
   * @returns nsILocalFile
   *   a clone of the mapped file, or null if no mapping exists
   */
  get: function(key)
  {
    var val = this._map[key];
    return val ? val.clone() : null;
  }
};


// Response CONSTANTS

// token       = *<any CHAR except CTLs or separators>
// CHAR        = <any US-ASCII character (0-127)>
// CTL         = <any US-ASCII control character (0-31) and DEL (127)>
// separators  = "(" | ")" | "<" | ">" | "@"
//             | "," | ";" | ":" | "\" | <">
//             | "/" | "[" | "]" | "?" | "="
//             | "{" | "}" | SP  | HT
const IS_TOKEN_ARRAY =
  [0, 0, 0, 0, 0, 0, 0, 0, //   0
   0, 0, 0, 0, 0, 0, 0, 0, //   8
   0, 0, 0, 0, 0, 0, 0, 0, //  16
   0, 0, 0, 0, 0, 0, 0, 0, //  24

   0, 1, 0, 1, 1, 1, 1, 1, //  32
   0, 0, 1, 1, 0, 1, 1, 0, //  40
   1, 1, 1, 1, 1, 1, 1, 1, //  48
   1, 1, 0, 0, 0, 0, 0, 0, //  56

   0, 1, 1, 1, 1, 1, 1, 1, //  64
   1, 1, 1, 1, 1, 1, 1, 1, //  72
   1, 1, 1, 1, 1, 1, 1, 1, //  80
   1, 1, 1, 0, 0, 0, 1, 1, //  88

   1, 1, 1, 1, 1, 1, 1, 1, //  96
   1, 1, 1, 1, 1, 1, 1, 1, // 104
   1, 1, 1, 1, 1, 1, 1, 1, // 112
   1, 1, 1, 0, 1, 0, 1];   // 120


/**
 * Determines whether the given character code is a CTL.
 *
 * @param code : uint
 *   the character code
 * @returns boolean
 *   true if code is a CTL, false otherwise
 */
function isCTL(code)
{
  return (code >= 0 && code <= 31) || (code == 127);
}

/**
 * Represents a response to an HTTP request, encapsulating all details of that
 * response.  This includes all headers, the HTTP version, status code and
 * explanation, and the entity itself.
 *
 * @param connection : Connection
 *   the connection over which this response is to be written
 */
function Response(connection)
{
  /** The connection over which this response will be written. */
  this._connection = connection;

  /**
   * The HTTP version of this response; defaults to 1.1 if not set by the
   * handler.
   */
  this._httpVersion = nsHttpVersion.HTTP_1_1;

  /**
   * The HTTP code of this response; defaults to 200.
   */
  this._httpCode = 200;

  /**
   * The description of the HTTP code in this response; defaults to "OK".
   */
  this._httpDescription = "OK";

  /**
   * An nsIHttpHeaders object in which the headers in this response should be
   * stored.  This property is null after the status line and headers have been
   * written to the network, and it may be modified up until it is cleared,
   * except if this._finished is set first (in which case headers are written
   * asynchronously in response to a finish() call not preceded by
   * flushHeaders()).
   */
  this._headers = new nsHttpHeaders();

  /**
   * Set to true when this response is ended (completely constructed if possible
   * and the connection closed); further actions on this will then fail.
   */
  this._ended = false;

  /**
   * A stream used to hold data written to the body of this response.
   */
  this._bodyOutputStream = null;

  /**
   * A stream containing all data that has been written to the body of this
   * response so far.  (Async handlers make the data contained in this
   * unreliable as a way of determining content length in general, but auxiliary
   * saved information can sometimes be used to guarantee reliability.)
   */
  this._bodyInputStream = null;

  /**
   * A stream copier which copies data to the network.  It is initially null
   * until replaced with a copier for response headers; when headers have been
   * fully sent it is replaced with a copier for the response body, remaining
   * so for the duration of response processing.
   */
  this._asyncCopier = null;

  /**
   * True if this response has been designated as being processed
   * asynchronously rather than for the duration of a single call to
   * nsIHttpRequestHandler.handle.
   */
  this._processAsync = false;

  /**
   * True iff finish() has been called on this, signaling that no more changes
   * to this may be made.
   */
  this._finished = false;

  /**
   * True iff powerSeized() has been called on this, signaling that this
   * response is to be handled manually by the response handler (which may then
   * send arbitrary data in response, even non-HTTP responses).
   */
  this._powerSeized = false;
}
Response.prototype =
{
  // PUBLIC CONSTRUCTION API

  //
  // see nsIHttpResponse.bodyOutputStream
  //
  get bodyOutputStream()
  {
    if (this._finished)
      throw Cr.NS_ERROR_NOT_AVAILABLE;

    if (!this._bodyOutputStream)
    {
      var pipe = new Pipe(true, false, Response.SEGMENT_SIZE, PR_UINT32_MAX,
                          null);
      this._bodyOutputStream = pipe.outputStream;
      this._bodyInputStream = pipe.inputStream;
      if (this._processAsync || this._powerSeized)
        this._startAsyncProcessor();
    }

    return this._bodyOutputStream;
  },

  //
  // see nsIHttpResponse.write
  //
  write: function(data)
  {
    if (this._finished)
      throw Cr.NS_ERROR_NOT_AVAILABLE;

    var dataAsString = String(data);
    this.bodyOutputStream.write(dataAsString, dataAsString.length);
  },

  //
  // see nsIHttpResponse.setStatusLine
  //
  setStatusLine: function(httpVersion, code, description)
  {
    if (!this._headers || this._finished || this._powerSeized)
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    this._ensureAlive();

    if (!(code >= 0 && code < 1000))
      throw Cr.NS_ERROR_INVALID_ARG;

    try
    {
      var httpVer;
      // avoid version construction for the most common cases
      if (!httpVersion || httpVersion == "1.1")
        httpVer = nsHttpVersion.HTTP_1_1;
      else if (httpVersion == "1.0")
        httpVer = nsHttpVersion.HTTP_1_0;
      else
        httpVer = new nsHttpVersion(httpVersion);
    }
    catch (e)
    {
      throw Cr.NS_ERROR_INVALID_ARG;
    }

    // Reason-Phrase = *<TEXT, excluding CR, LF>
    // TEXT          = <any OCTET except CTLs, but including LWS>
    //
    // XXX this ends up disallowing octets which aren't Unicode, I think -- not
    //     much to do if description is IDL'd as string
    if (!description)
      description = "";
    for (var i = 0; i < description.length; i++)
      if (isCTL(description.charCodeAt(i)) && description.charAt(i) != "\t")
        throw Cr.NS_ERROR_INVALID_ARG;

    // set the values only after validation to preserve atomicity
    this._httpDescription = description;
    this._httpCode = code;
    this._httpVersion = httpVer;
  },

  //
  // see nsIHttpResponse.setHeader
  //
  setHeader: function(name, value, merge)
  {
    if (!this._headers || this._finished || this._powerSeized)
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    this._ensureAlive();

    this._headers.setHeader(name, value, merge);
  },

  //
  // see nsIHttpResponse.processAsync
  //
  processAsync: function()
  {
    if (this._finished)
      throw Cr.NS_ERROR_UNEXPECTED;
    if (this._powerSeized)
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    if (this._processAsync)
      return;
    this._ensureAlive();

    dumpn("*** processing connection " + this._connection.number + " async");
    this._processAsync = true;

    /*
     * Either the bodyOutputStream getter or this method is responsible for
     * starting the asynchronous processor and catching writes of data to the
     * response body of async responses as they happen, for the purpose of
     * forwarding those writes to the actual connection's output stream.
     * If bodyOutputStream is accessed first, calling this method will create
     * the processor (when it first is clear that body data is to be written
     * immediately, not buffered).  If this method is called first, accessing
     * bodyOutputStream will create the processor.  If only this method is
     * called, we'll write nothing, neither headers nor the non-existent body,
     * until finish() is called.  Since that delay is easily avoided by simply
     * getting bodyOutputStream or calling write(""), we don't worry about it.
     */
    if (this._bodyOutputStream && !this._asyncCopier)
      this._startAsyncProcessor();
  },

  //
  // see nsIHttpResponse.seizePower
  //
  seizePower: function()
  {
    if (this._processAsync)
      throw Cr.NS_ERROR_NOT_AVAILABLE;
    if (this._finished)
      throw Cr.NS_ERROR_UNEXPECTED;
    if (this._powerSeized)
      return;
    this._ensureAlive();

    dumpn("*** forcefully seizing power over connection " +
          this._connection.number + "...");

    // Purge any already-written data without sending it.  We could as easily
    // swap out the streams entirely, but that makes it possible to acquire and
    // unknowingly use a stale reference, so we require there only be one of
    // each stream ever for any response to avoid this complication.
    if (this._asyncCopier)
      this._asyncCopier.cancel(Cr.NS_BINDING_ABORTED);
    this._asyncCopier = null;
    if (this._bodyOutputStream)
    {
      var input = new BinaryInputStream(this._bodyInputStream);
      var avail;
      while ((avail = input.available()) > 0)
        input.readByteArray(avail);
    }

    this._powerSeized = true;
    if (this._bodyOutputStream)
      this._startAsyncProcessor();
  },

  //
  // see nsIHttpResponse.finish
  //
  finish: function()
  {
    if (!this._processAsync && !this._powerSeized)
      throw Cr.NS_ERROR_UNEXPECTED;
    if (this._finished)
      return;

    dumpn("*** finishing connection " + this._connection.number);
    this._startAsyncProcessor(); // in case bodyOutputStream was never accessed
    if (this._bodyOutputStream)
      this._bodyOutputStream.close();
    this._finished = true;
  },


  // NSISUPPORTS

  //
  // see nsISupports.QueryInterface
  //
  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIHttpResponse) || iid.equals(Ci.nsISupports))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },


  // POST-CONSTRUCTION API (not exposed externally)

  /**
   * The HTTP version number of this, as a string (e.g. "1.1").
   */
  get httpVersion()
  {
    this._ensureAlive();
    return this._httpVersion.toString();
  },

  /**
   * The HTTP status code of this response, as a string of three characters per
   * RFC 2616.
   */
  get httpCode()
  {
    this._ensureAlive();

    var codeString = (this._httpCode < 10 ? "0" : "") +
                     (this._httpCode < 100 ? "0" : "") +
                     this._httpCode;
    return codeString;
  },

  /**
   * The description of the HTTP status code of this response, or "" if none is
   * set.
   */
  get httpDescription()
  {
    this._ensureAlive();

    return this._httpDescription;
  },

  /**
   * The headers in this response, as an nsHttpHeaders object.
   */
  get headers()
  {
    this._ensureAlive();

    return this._headers;
  },

  //
  // see nsHttpHeaders.getHeader
  //
  getHeader: function(name)
  {
    this._ensureAlive();

    return this._headers.getHeader(name);
  },

  /**
   * Determines whether this response may be abandoned in favor of a newly
   * constructed response.  A response may be abandoned only if it is not being
   * sent asynchronously and if raw control over it has not been taken from the
   * server.
   *
   * @returns boolean
   *   true iff no data has been written to the network
   */
  partiallySent: function()
  {
    dumpn("*** partiallySent()");
    return this._processAsync || this._powerSeized;
  },

  /**
   * If necessary, kicks off the remaining request processing needed to be done
   * after a request handler performs its initial work upon this response.
   */
  complete: function()
  {
    dumpn("*** complete()");
    if (this._processAsync || this._powerSeized)
    {
      NS_ASSERT(this._processAsync ^ this._powerSeized,
                "can't both send async and relinquish power");
      return;
    }

    NS_ASSERT(!this.partiallySent(), "completing a partially-sent response?");

    this._startAsyncProcessor();

    // Now make sure we finish processing this request!
    if (this._bodyOutputStream)
      this._bodyOutputStream.close();
  },

  /**
   * Abruptly ends processing of this response, usually due to an error in an
   * incoming request but potentially due to a bad error handler.  Since we
   * cannot handle the error in the usual way (giving an HTTP error page in
   * response) because data may already have been sent (or because the response
   * might be expected to have been generated asynchronously or completely from
   * scratch by the handler), we stop processing this response and abruptly
   * close the connection.
   *
   * @param e : Error
   *   the exception which precipitated this abort, or null if no such exception
   *   was generated
   */
  abort: function(e)
  {
    dumpn("*** abort(<" + e + ">)");

    // This response will be ended by the processor if one was created.
    var copier = this._asyncCopier;
    if (copier)
    {
      // We dispatch asynchronously here so that any pending writes of data to
      // the connection will be deterministically written.  This makes it easier
      // to specify exact behavior, and it makes observable behavior more
      // predictable for clients.  Note that the correctness of this depends on
      // callbacks in response to _waitToReadData in WriteThroughCopier
      // happening asynchronously with respect to the actual writing of data to
      // bodyOutputStream, as they currently do; if they happened synchronously,
      // an event which ran before this one could write more data to the
      // response body before we get around to canceling the copier.  We have
      // tests for this in test_seizepower.js, however, and I can't think of a
      // way to handle both cases without removing bodyOutputStream access and
      // moving its effective write(data, length) method onto Response, which
      // would be slower and require more code than this anyway.
      gThreadManager.currentThread.dispatch({
        run: function()
        {
          dumpn("*** canceling copy asynchronously...");
          copier.cancel(Cr.NS_ERROR_UNEXPECTED);
        }
      }, Ci.nsIThread.DISPATCH_NORMAL);
    }
    else
    {
      this.end();
    }
  },

  /**
   * Closes this response's network connection, marks the response as finished,
   * and notifies the server handler that the request is done being processed.
   */
  end: function()
  {
    NS_ASSERT(!this._ended, "ending this response twice?!?!");

    this._connection.close();
    if (this._bodyOutputStream)
      this._bodyOutputStream.close();

    this._finished = true;
    this._ended = true;
  },

  // PRIVATE IMPLEMENTATION

  /**
   * Sends the status line and headers of this response if they haven't been
   * sent and initiates the process of copying data written to this response's
   * body to the network.
   */
  _startAsyncProcessor: function()
  {
    dumpn("*** _startAsyncProcessor()");

    // Handle cases where we're being called a second time.  The former case
    // happens when this is triggered both by complete() and by processAsync(),
    // while the latter happens when processAsync() in conjunction with sent
    // data causes abort() to be called.
    if (this._asyncCopier || this._ended)
    {
      dumpn("*** ignoring second call to _startAsyncProcessor");
      return;
    }

    // Send headers if they haven't been sent already and should be sent, then
    // asynchronously continue to send the body.
    if (this._headers && !this._powerSeized)
    {
      this._sendHeaders();
      return;
    }

    this._headers = null;
    this._sendBody();
  },

  /**
   * Signals that all modifications to the response status line and headers are
   * complete and then sends that data over the network to the client.  Once
   * this method completes, a different response to the request that resulted
   * in this response cannot be sent -- the only possible action in case of
   * error is to abort the response and close the connection.
   */
  _sendHeaders: function()
  {
    dumpn("*** _sendHeaders()");

    NS_ASSERT(this._headers);
    NS_ASSERT(!this._powerSeized);

    // request-line
    var statusLine = "HTTP/" + this.httpVersion + " " +
                     this.httpCode + " " +
                     this.httpDescription + "\r\n";

    // header post-processing

    var headers = this._headers;
    headers.setHeader("Connection", "close", false);
    headers.setHeader("Server", "httpd.js", false);
    if (!headers.hasHeader("Date"))
      headers.setHeader("Date", toDateString(Date.now()), false);

    // Any response not being processed asynchronously must have an associated
    // Content-Length header for reasons of backwards compatibility with the
    // initial server, which fully buffered every response before sending it.
    // Beyond that, however, it's good to do this anyway because otherwise it's
    // impossible to test behaviors that depend on the presence or absence of a
    // Content-Length header.
    if (!this._processAsync)
    {
      dumpn("*** non-async response, set Content-Length");

      var bodyStream = this._bodyInputStream;
      var avail = bodyStream ? bodyStream.available() : 0;

      // XXX assumes stream will always report the full amount of data available
      headers.setHeader("Content-Length", "" + avail, false);
    }


    // construct and send response
    dumpn("*** header post-processing completed, sending response head...");

    // request-line
    var preambleData = [statusLine];

    // headers
    var headEnum = headers.enumerator;
    while (headEnum.hasMoreElements())
    {
      var fieldName = headEnum.getNext()
                              .QueryInterface(Ci.nsISupportsString)
                              .data;
      var values = headers.getHeaderValues(fieldName);
      for (var i = 0, sz = values.length; i < sz; i++)
        preambleData.push(fieldName + ": " + values[i] + "\r\n");
    }

    // end request-line/headers
    preambleData.push("\r\n");

    var preamble = preambleData.join("");

    var responseHeadPipe = new Pipe(true, false, 0, PR_UINT32_MAX, null);
    responseHeadPipe.outputStream.write(preamble, preamble.length);

    var response = this;
    var copyObserver =
      {
        onStartRequest: function(request, cx)
        {
          dumpn("*** preamble copying started");
        },

        onStopRequest: function(request, cx, statusCode)
        {
          dumpn("*** preamble copying complete " +
                "[status=0x" + statusCode.toString(16) + "]");

          if (!Components.isSuccessCode(statusCode))
          {
            dumpn("!!! header copying problems: non-success statusCode, " +
                  "ending response");

            response.end();
          }
          else
          {
            response._sendBody();
          }
        },

        QueryInterface: function(aIID)
        {
          if (aIID.equals(Ci.nsIRequestObserver) || aIID.equals(Ci.nsISupports))
            return this;

          throw Cr.NS_ERROR_NO_INTERFACE;
        }
      };

    var headerCopier = this._asyncCopier =
      new WriteThroughCopier(responseHeadPipe.inputStream,
                             this._connection.output,
                             copyObserver, null);

    responseHeadPipe.outputStream.close();

    // Forbid setting any more headers or modifying the request line.
    this._headers = null;
  },

  /**
   * Asynchronously writes the body of the response (or the entire response, if
   * seizePower() has been called) to the network.
   */
  _sendBody: function()
  {
    dumpn("*** _sendBody");

    NS_ASSERT(!this._headers, "still have headers around but sending body?");

    // If no body data was written, we're done
    if (!this._bodyInputStream)
    {
      dumpn("*** empty body, response finished");
      this.end();
      return;
    }

    var response = this;
    var copyObserver =
      {
        onStartRequest: function(request, context)
        {
          dumpn("*** onStartRequest");
        },

        onStopRequest: function(request, cx, statusCode)
        {
          dumpn("*** onStopRequest [status=0x" + statusCode.toString(16) + "]");

          if (statusCode === Cr.NS_BINDING_ABORTED)
          {
            dumpn("*** terminating copy observer without ending the response");
          }
          else
          {
            if (!Components.isSuccessCode(statusCode))
              dumpn("*** WARNING: non-success statusCode in onStopRequest");

            response.end();
          }
        },

        QueryInterface: function(aIID)
        {
          if (aIID.equals(Ci.nsIRequestObserver) || aIID.equals(Ci.nsISupports))
            return this;

          throw Cr.NS_ERROR_NO_INTERFACE;
        }
      };

    dumpn("*** starting async copier of body data...");
    this._asyncCopier =
      new WriteThroughCopier(this._bodyInputStream, this._connection.output,
                            copyObserver, null);
  },

  /** Ensures that this hasn't been ended. */
  _ensureAlive: function()
  {
    NS_ASSERT(!this._ended, "not handling response lifetime correctly");
  }
};

/**
 * Size of the segments in the buffer used in storing response data and writing
 * it to the socket.
 */
Response.SEGMENT_SIZE = 8192;

/** Serves double duty in WriteThroughCopier implementation. */
function notImplemented()
{
  throw Cr.NS_ERROR_NOT_IMPLEMENTED;
}

/** Returns true iff the given exception represents stream closure. */
function streamClosed(e)
{
  return e === Cr.NS_BASE_STREAM_CLOSED ||
         (typeof e === "object" && e.result === Cr.NS_BASE_STREAM_CLOSED);
}

/** Returns true iff the given exception represents a blocked stream. */
function wouldBlock(e)
{
  return e === Cr.NS_BASE_STREAM_WOULD_BLOCK ||
         (typeof e === "object" && e.result === Cr.NS_BASE_STREAM_WOULD_BLOCK);
}

/**
 * Copies data from source to sink as it becomes available, when that data can
 * be written to sink without blocking.
 *
 * @param source : nsIAsyncInputStream
 *   the stream from which data is to be read
 * @param sink : nsIAsyncOutputStream
 *   the stream to which data is to be copied
 * @param observer : nsIRequestObserver
 *   an observer which will be notified when the copy starts and finishes
 * @param context : nsISupports
 *   context passed to observer when notified of start/stop
 * @throws NS_ERROR_NULL_POINTER
 *   if source, sink, or observer are null
 */
function WriteThroughCopier(source, sink, observer, context)
{
  if (!source || !sink || !observer)
    throw Cr.NS_ERROR_NULL_POINTER;

  /** Stream from which data is being read. */
  this._source = source;

  /** Stream to which data is being written. */
  this._sink = sink;

  /** Observer watching this copy. */
  this._observer = observer;

  /** Context for the observer watching this. */
  this._context = context;

  /**
   * True iff this is currently being canceled (cancel has been called, the
   * callback may not yet have been made).
   */
  this._canceled = false;

  /**
   * False until all data has been read from input and written to output, at
   * which point this copy is completed and cancel() is asynchronously called.
   */
  this._completed = false;

  /** Required by nsIRequest, meaningless. */
  this.loadFlags = 0;
  /** Required by nsIRequest, meaningless. */
  this.loadGroup = null;
  /** Required by nsIRequest, meaningless. */
  this.name = "response-body-copy";

  /** Status of this request. */
  this.status = Cr.NS_OK;

  /** Arrays of byte strings waiting to be written to output. */
  this._pendingData = [];

  // start copying
  try
  {
    observer.onStartRequest(this, context);
    this._waitToReadData();
    this._waitForSinkClosure();
  }
  catch (e)
  {
    dumpn("!!! error starting copy: " + e +
          ("lineNumber" in e ? ", line " + e.lineNumber : ""));
    dumpn(e.stack);
    this.cancel(Cr.NS_ERROR_UNEXPECTED);
  }
}
WriteThroughCopier.prototype =
{
  /* nsISupports implementation */

  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIInputStreamCallback) ||
        iid.equals(Ci.nsIOutputStreamCallback) ||
        iid.equals(Ci.nsIRequest) ||
        iid.equals(Ci.nsISupports))
    {
      return this;
    }

    throw Cr.NS_ERROR_NO_INTERFACE;
  },


  // NSIINPUTSTREAMCALLBACK

  /**
   * Receives a more-data-in-input notification and writes the corresponding
   * data to the output.
   *
   * @param input : nsIAsyncInputStream
   *   the input stream on whose data we have been waiting
   */
  onInputStreamReady: function(input)
  {
    if (this._source === null)
      return;

    dumpn("*** onInputStreamReady");

    //
    // Ordinarily we'll read a non-zero amount of data from input, queue it up
    // to be written and then wait for further callbacks.  The complications in
    // this method are the cases where we deviate from that behavior when errors
    // occur or when copying is drawing to a finish.
    //
    // The edge cases when reading data are:
    //
    //   Zero data is read
    //     If zero data was read, we're at the end of available data, so we can
    //     should stop reading and move on to writing out what we have (or, if
    //     we've already done that, onto notifying of completion).
    //   A stream-closed exception is thrown
    //     This is effectively a less kind version of zero data being read; the
    //     only difference is that we notify of completion with that result
    //     rather than with NS_OK.
    //   Some other exception is thrown
    //     This is the least kind result.  We don't know what happened, so we
    //     act as though the stream closed except that we notify of completion
    //     with the result NS_ERROR_UNEXPECTED.
    //

    var bytesWanted = 0, bytesConsumed = -1;
    try
    {
      input = new BinaryInputStream(input);

      bytesWanted = Math.min(input.available(), Response.SEGMENT_SIZE);
      dumpn("*** input wanted: " + bytesWanted);

      if (bytesWanted > 0)
      {
        var data = input.readByteArray(bytesWanted);
        bytesConsumed = data.length;
        this._pendingData.push(String.fromCharCode.apply(String, data));
      }

      dumpn("*** " + bytesConsumed + " bytes read");

      // Handle the zero-data edge case in the same place as all other edge
      // cases are handled.
      if (bytesWanted === 0)
        throw Cr.NS_BASE_STREAM_CLOSED;
    }
    catch (e)
    {
      if (streamClosed(e))
      {
        dumpn("*** input stream closed");
        e = bytesWanted === 0 ? Cr.NS_OK : Cr.NS_ERROR_UNEXPECTED;
      }
      else
      {
        dumpn("!!! unexpected error reading from input, canceling: " + e);
        e = Cr.NS_ERROR_UNEXPECTED;
      }

      this._doneReadingSource(e);
      return;
    }

    var pendingData = this._pendingData;

    NS_ASSERT(bytesConsumed > 0);
    NS_ASSERT(pendingData.length > 0, "no pending data somehow?");
    NS_ASSERT(pendingData[pendingData.length - 1].length > 0,
              "buffered zero bytes of data?");

    NS_ASSERT(this._source !== null);

    // Reading has gone great, and we've gotten data to write now.  What if we
    // don't have a place to write that data, because output went away just
    // before this read?  Drop everything on the floor, including new data, and
    // cancel at this point.
    if (this._sink === null)
    {
      pendingData.length = 0;
      this._doneReadingSource(Cr.NS_ERROR_UNEXPECTED);
      return;
    }

    // Okay, we've read the data, and we know we have a place to write it.  We
    // need to queue up the data to be written, but *only* if none is queued
    // already -- if data's already queued, the code that actually writes the
    // data will make sure to wait on unconsumed pending data.
    try
    {
      if (pendingData.length === 1)
        this._waitToWriteData();
    }
    catch (e)
    {
      dumpn("!!! error waiting to write data just read, swallowing and " +
            "writing only what we already have: " + e);
      this._doneWritingToSink(Cr.NS_ERROR_UNEXPECTED);
      return;
    }

    // Whee!  We successfully read some data, and it's successfully queued up to
    // be written.  All that remains now is to wait for more data to read.
    try
    {
      this._waitToReadData();
    }
    catch (e)
    {
      dumpn("!!! error waiting to read more data: " + e);
      this._doneReadingSource(Cr.NS_ERROR_UNEXPECTED);
    }
  },


  // NSIOUTPUTSTREAMCALLBACK

  /**
   * Callback when data may be written to the output stream without blocking, or
   * when the output stream has been closed.
   *
   * @param output : nsIAsyncOutputStream
   *   the output stream on whose writability we've been waiting, also known as
   *   this._sink
   */
  onOutputStreamReady: function(output)
  {
    if (this._sink === null)
      return;

    dumpn("*** onOutputStreamReady");

    var pendingData = this._pendingData;
    if (pendingData.length === 0)
    {
      // There's no pending data to write.  The only way this can happen is if
      // we're waiting on the output stream's closure, so we can respond to a
      // copying failure as quickly as possible (rather than waiting for data to
      // be available to read and then fail to be copied).  Therefore, we must
      // be done now -- don't bother to attempt to write anything and wrap
      // things up.
      dumpn("!!! output stream closed prematurely, ending copy");

      this._doneWritingToSink(Cr.NS_ERROR_UNEXPECTED);
      return;
    }


    NS_ASSERT(pendingData[0].length > 0, "queued up an empty quantum?");

    //
    // Write out the first pending quantum of data.  The possible errors here
    // are:
    //
    //   The write might fail because we can't write that much data
    //     Okay, we've written what we can now, so re-queue what's left and
    //     finish writing it out later.
    //   The write failed because the stream was closed
    //     Discard pending data that we can no longer write, stop reading, and
    //     signal that copying finished.
    //   Some other error occurred.
    //     Same as if the stream were closed, but notify with the status
    //     NS_ERROR_UNEXPECTED so the observer knows something was wonky.
    //

    try
    {
      var quantum = pendingData[0];

      // XXX |quantum| isn't guaranteed to be ASCII, so we're relying on
      //     undefined behavior!  We're only using this because writeByteArray
      //     is unusably broken for asynchronous output streams; see bug 532834
      //     for details.
      var bytesWritten = output.write(quantum, quantum.length);
      if (bytesWritten === quantum.length)
        pendingData.shift();
      else
        pendingData[0] = quantum.substring(bytesWritten);

      dumpn("*** wrote " + bytesWritten + " bytes of data");
    }
    catch (e)
    {
      if (wouldBlock(e))
      {
        NS_ASSERT(pendingData.length > 0,
                  "stream-blocking exception with no data to write?");
        NS_ASSERT(pendingData[0].length > 0,
                  "stream-blocking exception with empty quantum?");
        this._waitToWriteData();
        return;
      }

      if (streamClosed(e))
        dumpn("!!! output stream prematurely closed, signaling error...");
      else
        dumpn("!!! unknown error: " + e + ", quantum=" + quantum);

      this._doneWritingToSink(Cr.NS_ERROR_UNEXPECTED);
      return;
    }

    // The day is ours!  Quantum written, now let's see if we have more data
    // still to write.
    try
    {
      if (pendingData.length > 0)
      {
        this._waitToWriteData();
        return;
      }
    }
    catch (e)
    {
      dumpn("!!! unexpected error waiting to write pending data: " + e);
      this._doneWritingToSink(Cr.NS_ERROR_UNEXPECTED);
      return;
    }

    // Okay, we have no more pending data to write -- but might we get more in
    // the future?
    if (this._source !== null)
    {
      /*
       * If we might, then wait for the output stream to be closed.  (We wait
       * only for closure because we have no data to write -- and if we waited
       * for a specific amount of data, we would get repeatedly notified for no
       * reason if over time the output stream permitted more and more data to
       * be written to it without blocking.)
       */
       this._waitForSinkClosure();
    }
    else
    {
      /*
       * On the other hand, if we can't have more data because the input
       * stream's gone away, then it's time to notify of copy completion.
       * Victory!
       */
      this._sink = null;
      this._cancelOrDispatchCancelCallback(Cr.NS_OK);
    }
  },


  // NSIREQUEST

  /** Returns true if the cancel observer hasn't been notified yet. */
  isPending: function()
  {
    return !this._completed;
  },

  /** Not implemented, don't use! */
  suspend: notImplemented,
  /** Not implemented, don't use! */
  resume: notImplemented,

  /**
   * Cancels data reading from input, asynchronously writes out any pending
   * data, and causes the observer to be notified with the given error code when
   * all writing has finished.
   *
   * @param status : nsresult
   *   the status to pass to the observer when data copying has been canceled
   */
  cancel: function(status)
  {
    dumpn("*** cancel(" + status.toString(16) + ")");

    if (this._canceled)
    {
      dumpn("*** suppressing a late cancel");
      return;
    }

    this._canceled = true;
    this.status = status;

    // We could be in the middle of absolutely anything at this point.  Both
    // input and output might still be around, we might have pending data to
    // write, and in general we know nothing about the state of the world.  We
    // therefore must assume everything's in progress and take everything to its
    // final steady state (or so far as it can go before we need to finish
    // writing out remaining data).

    this._doneReadingSource(status);
  },


  // PRIVATE IMPLEMENTATION

  /**
   * Stop reading input if we haven't already done so, passing e as the status
   * when closing the stream, and kick off a copy-completion notice if no more
   * data remains to be written.
   *
   * @param e : nsresult
   *   the status to be used when closing the input stream
   */
  _doneReadingSource: function(e)
  {
    dumpn("*** _doneReadingSource(0x" + e.toString(16) + ")");

    this._finishSource(e);
    if (this._pendingData.length === 0)
      this._sink = null;
    else
      NS_ASSERT(this._sink !== null, "null output?");

    // If we've written out all data read up to this point, then it's time to
    // signal completion.
    if (this._sink === null)
    {
      NS_ASSERT(this._pendingData.length === 0, "pending data still?");
      this._cancelOrDispatchCancelCallback(e);
    }
  },

  /**
   * Stop writing output if we haven't already done so, discard any data that
   * remained to be sent, close off input if it wasn't already closed, and kick
   * off a copy-completion notice.
   *
   * @param e : nsresult
   *   the status to be used when closing input if it wasn't already closed
   */
  _doneWritingToSink: function(e)
  {
    dumpn("*** _doneWritingToSink(0x" + e.toString(16) + ")");

    this._pendingData.length = 0;
    this._sink = null;
    this._doneReadingSource(e);
  },

  /**
   * Completes processing of this copy: either by canceling the copy if it
   * hasn't already been canceled using the provided status, or by dispatching
   * the cancel callback event (with the originally provided status, of course)
   * if it already has been canceled.
   *
   * @param status : nsresult
   *   the status code to use to cancel this, if this hasn't already been
   *   canceled
   */
  _cancelOrDispatchCancelCallback: function(status)
  {
    dumpn("*** _cancelOrDispatchCancelCallback(" + status + ")");

    NS_ASSERT(this._source === null, "should have finished input");
    NS_ASSERT(this._sink === null, "should have finished output");
    NS_ASSERT(this._pendingData.length === 0, "should have no pending data");

    if (!this._canceled)
    {
      this.cancel(status);
      return;
    }

    var self = this;
    var event =
      {
        run: function()
        {
          dumpn("*** onStopRequest async callback");

          self._completed = true;
          try
          {
            self._observer.onStopRequest(self, self._context, self.status);
          }
          catch (e)
          {
            NS_ASSERT(false,
                      "how are we throwing an exception here?  we control " +
                      "all the callers!  " + e);
          }
        }
      };

    gThreadManager.currentThread.dispatch(event, Ci.nsIThread.DISPATCH_NORMAL);
  },

  /**
   * Kicks off another wait for more data to be available from the input stream.
   */
  _waitToReadData: function()
  {
    dumpn("*** _waitToReadData");
    this._source.asyncWait(this, 0, Response.SEGMENT_SIZE,
                           gThreadManager.mainThread);
  },

  /**
   * Kicks off another wait until data can be written to the output stream.
   */
  _waitToWriteData: function()
  {
    dumpn("*** _waitToWriteData");

    var pendingData = this._pendingData;
    NS_ASSERT(pendingData.length > 0, "no pending data to write?");
    NS_ASSERT(pendingData[0].length > 0, "buffered an empty write?");

    this._sink.asyncWait(this, 0, pendingData[0].length,
                         gThreadManager.mainThread);
  },

  /**
   * Kicks off a wait for the sink to which data is being copied to be closed.
   * We wait for stream closure when we don't have any data to be copied, rather
   * than waiting to write a specific amount of data.  We can't wait to write
   * data because the sink might be infinitely writable, and if no data appears
   * in the source for a long time we might have to spin quite a bit waiting to
   * write, waiting to write again, &c.  Waiting on stream closure instead means
   * we'll get just one notification if the sink dies.  Note that when data
   * starts arriving from the sink we'll resume waiting for data to be written,
   * dropping this closure-only callback entirely.
   */
  _waitForSinkClosure: function()
  {
    dumpn("*** _waitForSinkClosure");

    this._sink.asyncWait(this, Ci.nsIAsyncOutputStream.WAIT_CLOSURE_ONLY, 0,
                         gThreadManager.mainThread);
  },

  /**
   * Closes input with the given status, if it hasn't already been closed;
   * otherwise a no-op.
   *
   * @param status : nsresult
   *   status code use to close the source stream if necessary
   */
  _finishSource: function(status)
  {
    dumpn("*** _finishSource(" + status.toString(16) + ")");

    if (this._source !== null)
    {
      this._source.closeWithStatus(status);
      this._source = null;
    }
  }
};


/**
 * A container for utility functions used with HTTP headers.
 */
const headerUtils =
{
  /**
   * Normalizes fieldName (by converting it to lowercase) and ensures it is a
   * valid header field name (although not necessarily one specified in RFC
   * 2616).
   *
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldName does not match the field-name production in RFC 2616
   * @returns string
   *   fieldName converted to lowercase if it is a valid header, for characters
   *   where case conversion is possible
   */
  normalizeFieldName: function(fieldName)
  {
    if (fieldName == "")
      throw Cr.NS_ERROR_INVALID_ARG;

    for (var i = 0, sz = fieldName.length; i < sz; i++)
    {
      if (!IS_TOKEN_ARRAY[fieldName.charCodeAt(i)])
      {
        dumpn(fieldName + " is not a valid header field name!");
        throw Cr.NS_ERROR_INVALID_ARG;
      }
    }

    return fieldName.toLowerCase();
  },

  /**
   * Ensures that fieldValue is a valid header field value (although not
   * necessarily as specified in RFC 2616 if the corresponding field name is
   * part of the HTTP protocol), normalizes the value if it is, and
   * returns the normalized value.
   *
   * @param fieldValue : string
   *   a value to be normalized as an HTTP header field value
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldValue does not match the field-value production in RFC 2616
   * @returns string
   *   fieldValue as a normalized HTTP header field value
   */
  normalizeFieldValue: function(fieldValue)
  {
    // field-value    = *( field-content | LWS )
    // field-content  = <the OCTETs making up the field-value
    //                  and consisting of either *TEXT or combinations
    //                  of token, separators, and quoted-string>
    // TEXT           = <any OCTET except CTLs,
    //                  but including LWS>
    // LWS            = [CRLF] 1*( SP | HT )
    //
    // quoted-string  = ( <"> *(qdtext | quoted-pair ) <"> )
    // qdtext         = <any TEXT except <">>
    // quoted-pair    = "\" CHAR
    // CHAR           = <any US-ASCII character (octets 0 - 127)>

    // Any LWS that occurs between field-content MAY be replaced with a single
    // SP before interpreting the field value or forwarding the message
    // downstream (section 4.2); we replace 1*LWS with a single SP
    var val = fieldValue.replace(/(?:(?:\r\n)?[ \t]+)+/g, " ");

    // remove leading/trailing LWS (which has been converted to SP)
    val = val.replace(/^ +/, "").replace(/ +$/, "");

    // that should have taken care of all CTLs, so val should contain no CTLs
    for (var i = 0, len = val.length; i < len; i++)
      if (isCTL(val.charCodeAt(i)))
        throw Cr.NS_ERROR_INVALID_ARG;

    // XXX disallows quoted-pair where CHAR is a CTL -- will not invalidly
    //     normalize, however, so this can be construed as a tightening of the
    //     spec and not entirely as a bug
    return val;
  }
};



/**
 * Converts the given string into a string which is safe for use in an HTML
 * context.
 *
 * @param str : string
 *   the string to make HTML-safe
 * @returns string
 *   an HTML-safe version of str
 */
function htmlEscape(str)
{
  // this is naive, but it'll work
  var s = "";
  for (var i = 0; i < str.length; i++)
    s += "&#" + str.charCodeAt(i) + ";";
  return s;
}


/**
 * Constructs an object representing an HTTP version (see section 3.1).
 *
 * @param versionString
 *   a string of the form "#.#", where # is an non-negative decimal integer with
 *   or without leading zeros
 * @throws
 *   if versionString does not specify a valid HTTP version number
 */
function nsHttpVersion(versionString)
{
  var matches = /^(\d+)\.(\d+)$/.exec(versionString);
  if (!matches)
    throw "Not a valid HTTP version!";

  /** The major version number of this, as a number. */
  this.major = parseInt(matches[1], 10);

  /** The minor version number of this, as a number. */
  this.minor = parseInt(matches[2], 10);

  if (isNaN(this.major) || isNaN(this.minor) ||
      this.major < 0    || this.minor < 0)
    throw "Not a valid HTTP version!";
}
nsHttpVersion.prototype =
{
  /**
   * Returns the standard string representation of the HTTP version represented
   * by this (e.g., "1.1").
   */
  toString: function ()
  {
    return this.major + "." + this.minor;
  },

  /**
   * Returns true if this represents the same HTTP version as otherVersion,
   * false otherwise.
   *
   * @param otherVersion : nsHttpVersion
   *   the version to compare against this
   */
  equals: function (otherVersion)
  {
    return this.major == otherVersion.major &&
           this.minor == otherVersion.minor;
  },

  /** True if this >= otherVersion, false otherwise. */
  atLeast: function(otherVersion)
  {
    return this.major > otherVersion.major ||
           (this.major == otherVersion.major &&
            this.minor >= otherVersion.minor);
  }
};

nsHttpVersion.HTTP_1_0 = new nsHttpVersion("1.0");
nsHttpVersion.HTTP_1_1 = new nsHttpVersion("1.1");


/**
 * An object which stores HTTP headers for a request or response.
 *
 * Note that since headers are case-insensitive, this object converts headers to
 * lowercase before storing them.  This allows the getHeader and hasHeader
 * methods to work correctly for any case of a header, but it means that the
 * values returned by .enumerator may not be equal case-sensitively to the
 * values passed to setHeader when adding headers to this.
 */
function nsHttpHeaders()
{
  /**
   * A hash of headers, with header field names as the keys and header field
   * values as the values.  Header field names are case-insensitive, but upon
   * insertion here they are converted to lowercase.  Header field values are
   * normalized upon insertion to contain no leading or trailing whitespace.
   *
   * Note also that per RFC 2616, section 4.2, two headers with the same name in
   * a message may be treated as one header with the same field name and a field
   * value consisting of the separate field values joined together with a "," in
   * their original order.  This hash stores multiple headers with the same name
   * in this manner.
   */
  this._headers = {};
}
nsHttpHeaders.prototype =
{
  /**
   * Sets the header represented by name and value in this.
   *
   * @param name : string
   *   the header name
   * @param value : string
   *   the header value
   * @throws NS_ERROR_INVALID_ARG
   *   if name or value is not a valid header component
   */
  setHeader: function(fieldName, fieldValue, merge)
  {
    var name = headerUtils.normalizeFieldName(fieldName);
    var value = headerUtils.normalizeFieldValue(fieldValue);

    // The following three headers are stored as arrays because their real-world
    // syntax prevents joining individual headers into a single header using 
    // ",".  See also <http://hg.mozilla.org/mozilla-central/diff/9b2a99adc05e/netwerk/protocol/http/src/nsHttpHeaderArray.cpp#l77>
    if (merge && name in this._headers)
    {
      if (name === "www-authenticate" ||
          name === "proxy-authenticate" ||
          name === "set-cookie") 
      {
        this._headers[name].push(value);
      }
      else 
      {
        this._headers[name][0] += "," + value;
        NS_ASSERT(this._headers[name].length === 1,
            "how'd a non-special header have multiple values?")
      }
    }
    else
    {
      this._headers[name] = [value];
    }
  },

  /**
   * Returns the value for the header specified by this.
   *
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldName does not constitute a valid header field name
   * @throws NS_ERROR_NOT_AVAILABLE
   *   if the given header does not exist in this
   * @returns string
   *   the field value for the given header, possibly with non-semantic changes
   *   (i.e., leading/trailing whitespace stripped, whitespace runs replaced
   *   with spaces, etc.) at the option of the implementation; multiple 
   *   instances of the header will be combined with a comma, except for 
   *   the three headers noted in the description of getHeaderValues
   */
  getHeader: function(fieldName)
  {
    return this.getHeaderValues(fieldName).join("\n");
  },

  /**
   * Returns the value for the header specified by fieldName as an array.
   *
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldName does not constitute a valid header field name
   * @throws NS_ERROR_NOT_AVAILABLE
   *   if the given header does not exist in this
   * @returns [string]
   *   an array of all the header values in this for the given
   *   header name.  Header values will generally be collapsed
   *   into a single header by joining all header values together
   *   with commas, but certain headers (Proxy-Authenticate,
   *   WWW-Authenticate, and Set-Cookie) violate the HTTP spec
   *   and cannot be collapsed in this manner.  For these headers
   *   only, the returned array may contain multiple elements if
   *   that header has been added more than once.
   */
  getHeaderValues: function(fieldName)
  {
    var name = headerUtils.normalizeFieldName(fieldName);

    if (name in this._headers)
      return this._headers[name];
    else
      throw Cr.NS_ERROR_NOT_AVAILABLE;
  },

  /**
   * Returns true if a header with the given field name exists in this, false
   * otherwise.
   *
   * @param fieldName : string
   *   the field name whose existence is to be determined in this
   * @throws NS_ERROR_INVALID_ARG
   *   if fieldName does not constitute a valid header field name
   * @returns boolean
   *   true if the header's present, false otherwise
   */
  hasHeader: function(fieldName)
  {
    var name = headerUtils.normalizeFieldName(fieldName);
    return (name in this._headers);
  },

  /**
   * Returns a new enumerator over the field names of the headers in this, as
   * nsISupportsStrings.  The names returned will be in lowercase, regardless of
   * how they were input using setHeader (header names are case-insensitive per
   * RFC 2616).
   */
  get enumerator()
  {
    var headers = [];
    for (var i in this._headers)
    {
      var supports = new SupportsString();
      supports.data = i;
      headers.push(supports);
    }

    return new nsSimpleEnumerator(headers);
  }
};


/**
 * Constructs an nsISimpleEnumerator for the given array of items.
 *
 * @param items : Array
 *   the items, which must all implement nsISupports
 */
function nsSimpleEnumerator(items)
{
  this._items = items;
  this._nextIndex = 0;
}
nsSimpleEnumerator.prototype =
{
  hasMoreElements: function()
  {
    return this._nextIndex < this._items.length;
  },
  getNext: function()
  {
    if (!this.hasMoreElements())
      throw Cr.NS_ERROR_NOT_AVAILABLE;

    return this._items[this._nextIndex++];
  },
  QueryInterface: function(aIID)
  {
    if (Ci.nsISimpleEnumerator.equals(aIID) ||
        Ci.nsISupports.equals(aIID))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  }
};


/**
 * A representation of the data in an HTTP request.
 *
 * @param port : uint
 *   the port on which the server receiving this request runs
 */
function Request(port)
{
  /** Method of this request, e.g. GET or POST. */
  this._method = "";

  /** Path of the requested resource; empty paths are converted to '/'. */
  this._path = "";

  /** Query string, if any, associated with this request (not including '?'). */
  this._queryString = "";

  /** Scheme of requested resource, usually http, always lowercase. */
  this._scheme = "http";

  /** Hostname on which the requested resource resides. */
  this._host = undefined;

  /** Port number over which the request was received. */
  this._port = port;

  var bodyPipe = new Pipe(false, false, 0, PR_UINT32_MAX, null);

  /** Stream from which data in this request's body may be read. */
  this._bodyInputStream = bodyPipe.inputStream;

  /** Stream to which data in this request's body is written. */
  this._bodyOutputStream = bodyPipe.outputStream;

  /**
   * The headers in this request.
   */
  this._headers = new nsHttpHeaders();

  /**
   * For the addition of ad-hoc properties and new functionality without having
   * to change nsIHttpRequest every time; currently lazily created, as its only
   * use is in directory listings.
   */
  this._bag = null;
}
Request.prototype =
{
  // SERVER METADATA

  //
  // see nsIHttpRequest.scheme
  //
  get scheme()
  {
    return this._scheme;
  },

  //
  // see nsIHttpRequest.host
  //
  get host()
  {
    return this._host;
  },

  //
  // see nsIHttpRequest.port
  //
  get port()
  {
    return this._port;
  },

  // REQUEST LINE

  //
  // see nsIHttpRequest.method
  //
  get method()
  {
    return this._method;
  },

  //
  // see nsIHttpRequest.httpVersion
  //
  get httpVersion()
  {
    return this._httpVersion.toString();
  },

  //
  // see nsIHttpRequest.path
  //
  get path()
  {
    return this._path;
  },

  //
  // see nsIHttpRequest.queryString
  //
  get queryString()
  {
    return this._queryString;
  },

  // HEADERS

  //
  // see nsIHttpRequest.getHeader
  //
  getHeader: function(name)
  {
    return this._headers.getHeader(name);
  },

  //
  // see nsIHttpRequest.hasHeader
  //
  hasHeader: function(name)
  {
    return this._headers.hasHeader(name);
  },

  //
  // see nsIHttpRequest.headers
  //
  get headers()
  {
    return this._headers.enumerator;
  },

  //
  // see nsIPropertyBag.enumerator
  //
  get enumerator()
  {
    this._ensurePropertyBag();
    return this._bag.enumerator;
  },

  //
  // see nsIHttpRequest.headers
  //
  get bodyInputStream()
  {
    return this._bodyInputStream;
  },

  //
  // see nsIPropertyBag.getProperty
  //
  getProperty: function(name) 
  {
    this._ensurePropertyBag();
    return this._bag.getProperty(name);
  },


  // NSISUPPORTS

  //
  // see nsISupports.QueryInterface
  //
  QueryInterface: function(iid)
  {
    if (iid.equals(Ci.nsIHttpRequest) || iid.equals(Ci.nsISupports))
      return this;

    throw Cr.NS_ERROR_NO_INTERFACE;
  },


  // PRIVATE IMPLEMENTATION
  
  /** Ensures a property bag has been created for ad-hoc behaviors. */
  _ensurePropertyBag: function()
  {
    if (!this._bag)
      this._bag = new WritablePropertyBag();
  }
};


// XPCOM trappings

/**
 * Creates a factory for instances of an object created using the passed-in
 * constructor.
 */
function makeFactory(ctor)
{
  function ci(outer, iid)
  {
    if (outer != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new ctor()).QueryInterface(iid);
  } 

  return {
           createInstance: ci,
           lockFactory: function(lock) { },
           QueryInterface: function(aIID)
           {
             if (Ci.nsIFactory.equals(aIID) ||
                 Ci.nsISupports.equals(aIID))
               return this;
             throw Cr.NS_ERROR_NO_INTERFACE;
           }
         };
}

/** The XPCOM module containing the HTTP server. */
const module =
{
  // nsISupports
  QueryInterface: function(aIID)
  {
    if (Ci.nsIModule.equals(aIID) ||
        Ci.nsISupports.equals(aIID))
      return this;
    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  // nsIModule
  registerSelf: function(compMgr, fileSpec, location, type)
  {
    compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);
    
    for (var key in this._objects)
    {
      var obj = this._objects[key];
      compMgr.registerFactoryLocation(obj.CID, obj.className, obj.contractID,
                                               fileSpec, location, type);
    }
  },
  unregisterSelf: function (compMgr, location, type)
  {
    compMgr = compMgr.QueryInterface(Ci.nsIComponentRegistrar);

    for (var key in this._objects)
    {
      var obj = this._objects[key];
      compMgr.unregisterFactoryLocation(obj.CID, location);
    }
  },
  getClassObject: function(compMgr, cid, iid)
  {
    if (!iid.equals(Ci.nsIFactory))
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;

    for (var key in this._objects)
    {
      if (cid.equals(this._objects[key].CID))
        return this._objects[key].factory;
    }
    
    throw Cr.NS_ERROR_NO_INTERFACE;
  },
  canUnload: function(compMgr)
  {
    return true;
  },

  // private implementation
  _objects:
  {
    server:
    {
      CID:         Components.ID("{54ef6f81-30af-4b1d-ac55-8ba811293e41}"),
      contractID:  "@mozilla.org/server/jshttp;1",
      className:   "httpd.js server",
      factory:     makeFactory(nsHttpServer)
    }
  }
};


/** NSGetModule, so this code can be used as a JS component. */
function NSGetModule(compMgr, fileSpec)
{
  return module;
}

nsHttpServer.prototype.classID = Components.ID("{54ef6f81-30af-4b1d-ac55-8ba811293e41}");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
if (XPCOMUtils.generateNSGetFactory) {
  const NSGetFactory = XPCOMUtils.generateNSGetFactory([nsHttpServer]);
}



/**
 * Creates a new HTTP server listening for loopback traffic on the given port,
 * starts it, and runs the server until the server processes a shutdown request,
 * spinning an event loop so that events posted by the server's socket are
 * processed.
 *
 * This method is primarily intended for use in running this script from within
 * xpcshell and running a functional HTTP server without having to deal with
 * non-essential details.
 *
 * Note that running multiple servers using variants of this method probably
 * doesn't work, simply due to how the internal event loop is spun and stopped.
 *
 * @note
 *   This method only works with Mozilla 1.9 (i.e., Firefox 3 or trunk code);
 *   you should use this server as a component in Mozilla 1.8.
 * @param port
 *   the port on which the server will run, or -1 if there exists no preference
 *   for a specific port; note that attempting to use some values for this
 *   parameter (particularly those below 1024) may cause this method to throw or
 *   may result in the server being prematurely shut down
 * @param basePath
 *   a local directory from which requests will be served (i.e., if this is
 *   "/home/jwalden/" then a request to /index.html will load
 *   /home/jwalden/index.html); if this is omitted, only the default URLs in
 *   this server implementation will be functional
 */
function server(port, basePath)
{
  if (basePath)
  {
    var lp = Cc["@mozilla.org/file/local;1"]
               .createInstance(Ci.nsILocalFile);
    lp.initWithPath(basePath);
  }

  // if you're running this, you probably want to see debugging info
  DEBUG = true;

  var srv = new nsHttpServer();
  if (lp)
    srv.registerDirectory("/", lp);
  srv.registerContentType("sjs", SJS_TYPE);
  srv.identity.setPrimary("http", "localhost", port);
  srv.start(port);

  var thread = gThreadManager.currentThread;
  while (!srv.isStopped())
    thread.processNextEvent(true);

  // get rid of any pending requests
  while (thread.hasPendingEvents())
    thread.processNextEvent(true);

//  DEBUG = false;
}

function getServer (port, basePath) {
  if (basePath) {
    var lp = Cc["@mozilla.org/file/local;1"]
               .createInstance(Ci.nsILocalFile);
    lp.initWithPath(basePath);
   }

   var srv = new nsHttpServer();
   if (lp)
     srv.registerDirectory("/", lp);
   srv.registerContentType("sjs", SJS_TYPE);
   srv.identity.setPrimary("http", "localhost", port);
   srv._port = port;

   return srv;
}
