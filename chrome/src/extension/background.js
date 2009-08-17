//Initialise globals
ChromeDriver = {};

//Array of ports to tabs we wish to use
//The name of each port is expected to be its JS window handle
ChromeDriver.ports = [];
//Port to the currently active tab
ChromeDriver.activePort = null;
ChromeDriver.activeTabId = null;
ChromeDriver.context = null;
ChromeDriver.agreedCapabilities = null;
//Number of folders from / we need to traverse to get to /session of our URL
//TODO(danielwh): Get this usefully somehow
ChromeDriver.pathOffset = 1;
//Whether the plugin has the OS-specific window handle for the active tab
//Called HWND rather than window handle to avoid confusion with the other
//use of window handle to mean 'name of window'
ChromeDriver.hasHwnd = false;
ChromeDriver.isCurrentlyLoadingUrl = false;
ChromeDriver.instanceUuid = null;
ChromeDriver.currentSpeed = 500; //TODO(danielwh): enum this? Oh, and actually do anything with it
ChromeDriver.xmlHttpRequest = null;
ChromeDriver.xmlHttpRequestUrl = "http://localhost:9701/chromeCommandExecutor"
ChromeDriver.requestSequenceNumber = 0;
ChromeDriver.retryRequestBuffer = [];
ChromeDriver.isOnBadPage = false; //Indicates we couldn't connect to the serer

chrome.self.onConnect.addListener(function(port) {
  console.log("Connected to " + port.name);
  pushPort(port);
  //If this is the only window (probably first, or we closed the others),
  //or we have changed URL in the same tab, treat this as the active page
  //Otherwise we have opened in the background, so we keep our current focus
  if (ChromeDriver.activePort == null ||
      port.tab.id == ChromeDriver.activePort.tab.id) {
    ChromeDriver.activePort = port;
    ChromeDriver.isOnBadPage = false;
  }
  port.onMessage.addListener(parsePortMessage);
  port.onDisconnect.addListener(disconnectPort);
});

sendXmlHttpGetRequest();

function sendXmlHttpGetRequest() {
  console.log("Sending GET request");
  ChromeDriver.xmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.xmlHttpRequest.onreadystatechange = handleXmlHttpGetRequestReadyStateChange;
  ChromeDriver.xmlHttpRequest.open("GET", ChromeDriver.xmlHttpRequestUrl, true);
  ChromeDriver.xmlHttpRequest.send(null);
}

function sendXmlHttpPostRequest(params) {
  console.log("Sending POST request");
  ChromeDriver.xmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.xmlHttpRequest.onreadystatechange = handleXmlHttpPostRequestReadyStateChange;
  ChromeDriver.xmlHttpRequest.open("POST", ChromeDriver.xmlHttpRequestUrl, true);
  ChromeDriver.xmlHttpRequest.setRequestHeader("Content-type", "application/json");
  ChromeDriver.xmlHttpRequest.send(params + "\nEOF\n");
}


function handleXmlHttpGetRequestReadyStateChange() {
  if (this.readyState == 4) {
    if (this.status != 200) {
      setTimeout("handleXmlHttpGetRequestReadyStateChange()", 500);
    } else {
      if (this.responseText == "quit") {
        sendXmlHttpPostRequest("");
      } else {
        parseRequest(JSON.parse(this.responseText));
      }
    }
  }
}

function handleXmlHttpPostRequestReadyStateChange() {
  if (this.readyState == 4) {
    if (this.status != 200) {
      setTimeout("handleXmlHttpPostRequestReadyStateChange()", 500);
    } else {
      if (this.responseText == "ACK") {
        sendXmlHttpGetRequest();
        if (ChromeDriver.activePort == null) {
          console.log("WARNING: No active port");
        }
      }
    }
  }
}

function disconnectPort(port) {
  console.log("Disconnected from " + port.name);
  removePort(port);
}

function parseRequest(request) {
  switch (request.request) {
  case "url":
    //TODO(danielwh): Fill in GUID
    getUrl(request.url, "GUID");
    break;
  default:
    ChromeDriver.retryRequestBuffer.push({request: request, sequenceNumber: ChromeDriver.requestSequenceNumber++});
    sendBufferedRequests();
    break;
  }
}

function sendBufferedRequests() {
  if (!ChromeDriver.activePort) {
    console.log("NO ACTIVE PORT");
    if (ChromeDriver.isOnBadPage) {
      ChromeDriver.retryRequestBuffer = [];
    }
  }
  for (var i = 0; i < ChromeDriver.retryRequestBuffer.length; i++) {
    console.log("Sending: " + ChromeDriver.retryRequestBuffer[i].sequenceNumber);
    ChromeDriver.activePort.postMessage(ChromeDriver.retryRequestBuffer[i]);
  }
  setTimeout(sendBufferedRequests, 1000);
}

/**
 * Handles GET requests made to/by the plugin.
 * @param uri String of full path of request,
 *            e.g. "/session/:session/:context/title"
 */
function HandleGet(uri) {
  if (typeof(uri) != "string") {
    console.log("HandleGet got non-string uri");
    return;
  }
  var path = uri.split("/").slice(ChromeDriver.pathOffset);
  //Check that path is /session/:session/:context/...
  if (path.length < 3 || path[0] != "session" || path[1] != ChromeDriver.sessionId) {
    sendNotFound({message: "An invalid session was set up: " + uri,
                  class: "java.lang.IllegalStateException"});
    return;
  }
  if (path.length == 3) {
    sendValue(ChromeDriver.capabilities);
    return;
  }
  //We should always have a port from now because
  //all following cases involve page interaction
  if (ChromeDriver.activePort == null) {
    sendNotFound({message: "Tried to interact with a page when no page was loaded",
                  class: "java.lang.IllegalStateException"});
    return;
  }
  var requestObject = null;
  switch (path.length) {
  case 4:
    var request = null;
    switch (path[3]) {
    case "cookie":
      request = "get cookies";
      break;
    case "source":
      request = "get source";
      break;
    case "title":
      request = "get title";
      break;
    case "url":
      request = "get url";
      break;
    case "window_handle":
      sendValue(ChromeDriver.activePort.name);
      break;
    case "window_handles":
      getWindowHandles();
      break;
    }
    if (request != null) {
      requestObject = {request: request};
    }
    break;
  case 6:
    var request = null;
    if (path[3] == "element") {
      switch (path[5]) {
      case "displayed":
        request = "is element displayed";
        break;
      case "enabled":
        request = "is element enabled";
        break;
      case "location":
        request = "get element location"
        break;
      case "name":
        request = "get element tag name";
        break;
      case "selected":
        request = "is element selected";
        break;
      case "size":
        request = "get element size";;
        break;
      case "text":
        request = "get element text";
        break;
      case "value":
        request = "get element value";
        break;
      }
      if (request != null) {
        requestObject = {request: request,
                         value: {elementId: path[4]}};
      }
    }
    break;
  case 7:
    if (path[3] == "element") {
      var elementId = path[4];
      switch(path[5]) {
      case "attribute":
        requestObject = {request: "get element attribute",
                         value: {elementId: elementId,
                                 attribute: path[6]}};
        break;
      case "css":
        requestObject = {request: "get element css",
                         value: {elementId: elementId,
                         css: path[6]}};
        break;
      }
    }
    break;
  }
  if (requestObject != null) {
    ChromeDriver.activePort.postMessage(requestObject);
  }
}

/**
 * Handles POST requests made to/by the plugin.
 * URL getting is dealt with by a special call to getUrl
 * directly from the plugin, NOT by this function
 *
 * @param uri String of full path of request,
 *            e.g. "/session/:session/:context/back"
 * @param postData The content of the post as a string,
 *                 may be empty of a JSON object
 * @param sessionId The ID of the session this request is for
 *                  (should be invariant)
 * @param context The context of the request (should be invariant)
 */
function HandlePost(uri, postData, sessionId, context) {
  if (typeof(uri) != "string") {
    console.log("HandleGet got non-string uri");
    return;
  }
  if (ChromeDriver.sessionId == null) {
    ChromeDriver.sessionId = sessionId;
  }
  if (ChromeDriver.context == null) {
    ChromeDriver.context = context;
  }
  var path = uri.split("/").slice(ChromeDriver.pathOffset);
  var value = JSON.parse(postData);
  if (path.length == 1 && path[0] == "session") {
    createSession(value);
    return;
  }
  //We should always have an activePort from here on because
  //all operations rely on having a page
  if (ChromeDriver.activePort == null) {
    sendNotFound({message: "Tried to interact with a page when no page was loaded",
                  class: "java.lang.IllegalStateException"});
    return;
  }
  var requestObject = null;
  switch (path.length) {
  case 4:
    var request = null;
    switch (path[3]) {
    case "back":
      request = "go back";
      break;
    case "cookie":
      request = "add cookie";
      break;
    case "element":
      request = "get element";
      break;
    case "elements":
      request = "get elements";
      break;
    case "execute":
      request = "execute";
      break;
    case "forward":
      request = "go forward";
      break;
    case "refresh":
      request = "refresh";
      break;
    case "speed":
      switch (value[0]) {
      //TODO(danielwh): Put in real values
      case "SLOW":
        ChromeDriver.currentSpeed = 15;
        break;
      case "MEDIUM":
        ChromeDriver.currentSpeed = 15;
        break;
      case "FAST":
        ChromeDriver.currentSpeed = 15;
        break;
      default:
        sendNotFound({message: "Tried to set speed to an unknown value",
                      class: "java.lang.IllegalArgumentException"});
        return;
      }
      sendNoContent();
    }
    if (request != null) {
      requestObject = {request: request, value: value};
    }
    break;
  case 5:
    switch (path[3]) {
    case "element":
      if (path[4] == "active") {
        requestObject = {request: "get active element"};
      }
      break;
    //TODO(danielwh): Frame switching
    //case "frame":
      //ChromeDriver.activePort.postMessage({request: "select frame", by: value});
      //break;
    case "window":
      setActivePortByWindowName(path[4]);
      break;
    }
    break;
  case 6:
    var request = null;
    if (path[3] == "element") {
      var value = {elementId: path[4], value: value};
      switch (path[5]) {
      case "clear":
        request = "clear element";
        break;
      case "click":
        requestObject = wrapInjectEmbedIfNecessary({request: "click element",
                                                    value: value});
        break;
      case "drag":
        requestObject = wrapInjectEmbedIfNecessary({request: "drag element",
                                                    value: value});
        break;
      case "selected":
        request = "select element";
        break;
      case "submit":
        request = "submit element";
        break;
      case "toggle":
        request = "toggle element";
        break;
      case "value":
        requestObject = wrapInjectEmbedIfNecessary({request: "send element keys",
                                                    value: {elementId: path[4],
                                                            value: value.value[0].value}});
        break;
      }
    }
    if (request != null) {
      requestObject = {request: request, value: value};
    }
    break;
  case 7:
    var request = null;
    if (path[3] == "element") {
      switch (path[5]) {
      case "element":
        request = "get element";
        break;
      case "elements":
        request = "get elements";
        break;
      }
    }
    if (request != null) {
      requestObject = {request: request, value: value};
    }
    break;
  }
  if (requestObject != null) {
    ChromeDriver.activePort.postMessage(requestObject);
  }
}

/**
 * Handles DELETE requests made to/by the plugin.
 * @param uri String of full path of request,
 *            e.g. "/session/:session/:context/cookie"
 */
function HandleDelete(uri) {
  if (typeof(uri) != "string") {
    console.log("HandleGet got non-string uri");
    return;
  }
  var path = uri.split("/").slice(ChromeDriver.pathOffset);
  if (path.length == 2 && path[0] == "session" &&
      path[1] == ChromeDriver.sessionId) {
    sendNoContent();
  }
  //We should always have an activePort from here on because
  //all operations rely on having a page
  if (ChromeDriver.activePort == null) {
    sendNotFound({message: "Tried to interact with a page when no page was loaded",
                  class: "java.lang.IllegalStateException"});
    return;
  }
  var requestObject = null;
  switch (path.length) {
  case 4:
    if (path[3] == "cookie") {
      requestObject = {request: "delete all cookies"};
    }
    break;
  case 5:
    if (path[3] == "cookie") {
      requestObject = {request: "delete cookie", value: {name: path[4]}};
    }
    break;
  }
  if (requestObject != null) {
    ChromeDriver.activePort.postMessage(requestObject);
  }
}

/**
 * Parse messages coming in on the port.
 * Sends HTTP according to the value passed.
 * @param message JSON message of format:
 *                {response: "some command",
 *                 value: {statusCode: HTTP_CODE
 *                 [, optional params]}}
 *                 HTTP_CODE ::= 200 | 204 | 404 | "no-op"
 */
function parsePortMessage(message) {
  if (!message || !message.response || !message.response.value || typeof(message.response.value.statusCode) == "undefined" || message.response.value.statusCode == null ||
      typeof(message.sequenceNumber) == "undefined") {
    console.log("Got invalid response.");
    return;
  }
  var toSend = "";
  switch (message.response.value.statusCode) {
  case 0:
  case 1: //org.openqa.selenium.NoSuchElementException
  case 2: //org.openqa.selenium.WebDriverException [Cookies]
    toSend = '{statusCode: ' + message.response.value.statusCode;
    if (typeof(message.response.value) != "undefined" && message.response.value != null &&
        typeof(message.response.value.value) != "undefined") {
      toSend += ',value:' + JSON.stringify(message.response.value.value);
    }
    toSend += ',class:"org.openqa.selenium.chrome.Response"}';
    break;
  case "no-op":
    //Some special operation which isn't sending HTTP
    switch (message.response.response) {
    /*case "click element":
      document.embeds[0].clickAt(message.value.x, message.value.y);
      break;
    case "drag element":
      document.embeds[0].drag(1000, message.value.from.x, message.value.from.y, message.value.to.x, message.value.to.y);
      break;
    case "send element keys":
      document.embeds[0].return_send_element_keys(message.value.value.join(""));
      break;
    default:
      toSend = '{statusCode: ' + message.value.statusCode + ',value:' + JSON.stringify(message.value.value) + 
      ',"class":"org.openqa.selenium.chrome.Response"}';
      break;*/
    }
    break
  }
  console.log("Sending: " + toSend)
  sendResponse(message.sequenceNumber, toSend);
}

function sendResponse(sequenceNumber, toSend) {
  var updatedRetryRequestBuffer = [];
  for (var i = 0; i < ChromeDriver.retryRequestBuffer.length; i++) {
    if (ChromeDriver.retryRequestBuffer[i].sequenceNumber != sequenceNumber) {
      updatedRetryRequestBuffer.push(ChromeDriver.retryRequestBuffer[i]);
    }
  }
  ChromeDriver.retryRequestBuffer = updatedRetryRequestBuffer;
  sendXmlHttpPostRequest(toSend);
}

/**
 * Sends the HTTP message passed to the current connection
 * @param http string of the message to send,
 *             e.g. 'HTTP/1.1 204 No Content'
 * TODO(danielwh): Some kind of filtering so that arbitrary HTTP can't be sent by random javascript
 */
function sendHttp(http) {
  console.log("Sending HTTP: " + http);
  document.embeds[0].sendHttp(http);
}

/**
 * Sends the passed value in a 200 OK HTTP message
 * @param value JSON.stringifiable value to send,
 *              e.g. ["element/0"]
 */
function sendValue(value) {
  var responseData = '{"error":false,"sessionId":"' + ChromeDriver.sessionId + '"';
  if (value != null) {
    responseData += ',"value":' + JSON.stringify(value);
  }
  responseData += ',"context":"' + ChromeDriver.context + 
      '","class":"org.openqa.selenium.remote.Response"}';
  
  var response = "HTTP/1.1 200 OK" +
      "\r\nContent-Length: " + responseData.length + 
      "\r\nContent-Type: application/json; charset=ISO-8859-1" +
      "\r\n\r\n" + responseData;
  sendHttp(response);
}

/**
 * Sends a 204 No Content HTTP message
 */
function sendNoContent() {
  sendHttp("HTTP/1.1 204 No Content");
}

/**
 * Sends a 302 Found HTTP Message to the passed location
 * @param location String containing the location to redirect to,
 *                 e.g. "http://www.google.co.uk"
 */
function sendFound(location) {
  if (typeof(location) != "string") {
    console.log("Tried to send 302 to a non-string location");
    return;
  }
  var response = "HTTP/1.1 302 Found" +
                 "\r\nLocation: " + location +
                 "\r\nContent-Length: 0";
  sendHttp(response);
}

/**
 * Sends the passed exception in a 404 Not Found HTTP message
 * @param value JSON.stringifiable object encapsulating the error,
 *              e.g. {message: "Element with ID 'foo' could not be found",
 *                    class: "org.openqa.selenium.NoSuchElementException"}
 */
function sendNotFound(value) {
  if (!typeof(value) == "string") {
    console.log("Tried to send an invalid 404 object");
  }
  var responseData = '{"error":true,"sessionId":\"' + ChromeDriver.sessionId + '\",' +
      '"context":"' + ChromeDriver.context + '","value":' + JSON.stringify(value) + 
      ',"class":"org.openqa.selenium.remote.Response"}';
  var response = "HTTP/1.1 404 Not Found" +
      "\r\nContent-Length: " + responseData.length +
      "\r\nContent-Type: application/json; charset=ISO-8859-1" +
      "\r\n\r\n" + responseData;
  sendHttp(response);
}

/**
 * If the plugin doesn't currently have an HWND for this page,
 * we need to get one by injecting an embed
 */
function wrapInjectEmbedIfNecessary(requestObject) {
  if (ChromeDriver.hasHwnd) {
    return requestObject;
  } else {
    return {request: "inject embed",
            followup: requestObject,
            value: {uuid: ChromeDriver.instanceUuid}};
  }
}

/**
 * Respond to a request to start a new session
 * TODO(danielwh): Actually make this do anything useful and
 * not just be hard-coded.  Oh, and look at all capabilities in turn
 * @param value array containing org.openqa.selenium.remote.DesiredCapabilities
 */
function createSession(capabilities) {
  ChromeDriver.capabilities = capabilities[0];
  if (capabilities[0].platform == "WINDOWS" && capabilities[0].browserName == "chrome") {
    sendFound("http://localhost:7601/session/" + ChromeDriver.sessionId + "/" + ChromeDriver.context);
  } else {
    sendNotFound({message: "Could not negotiate capabilities", class: "org.openqa.selenium.WebDriverException"});
  }
}

/**
 * Sends an array containing all of the current window handles
 */
function getWindowHandles() {
  var windowHandles = [];
  for (var i = 0; i < ChromeDriver.ports.length; ++i) {
    windowHandles.push(ChromeDriver.ports[i].name);
  }
  sendValue(windowHandles);
}

/**
 * Closes the current tab if it exists, and opens a new one, in which it
 * gets the URL passed and record the UUID passed.
 * @param value JSON array containing the URL to load
 * @param UUID a generated UUID that the extension can use for this page
 *             if needed
 */
function getUrl(url, uuid) {
  //Ignore any URL request we get while loading a page,
  //because we should still return a 204 when we cannot find the page.
  if (ChromeDriver.isCurrentlyLoadingUrl) {
    return;
  }
  ChromeDriver.activePort = null;
  ChromeDriver.hasHwnd = false;
  if (ChromeDriver.activeTabId != null) {
    chrome.tabs.remove(ChromeDriver.activeTabId);
  }
  ChromeDriver.activeTabId = null;
  ChromeDriver.instanceUuid = uuid;
  ChromeDriver.isCurrentlyLoadingUrl = true;
  chrome.tabs.create({url: url, selected: true}, getUrlCallback);
}

function getUrlCallback(tab) {
  if (tab.status != "complete") {
    ChromeDriver.isCurrentlyLoadingUrl = true
    //Use the helper calback so that we can add our own delay and not DOS the browser
    setTimeout("getUrlCallbackById(" + tab.id + ")", 10);
  } else {
    ChromeDriver.isCurrentlyLoadingUrl = false;
    ChromeDriver.activeTabId = tab.id;
    setActivePortByTabId(tab.id);
    ChromeDriver.retryRequestBuffer = [];
    ChromeDriver.requestSequenceNumber = 0;
    if (ChromeDriver.activePort == null) {
      ChromeDriver.isOnBadPage = true;
    }
    sendXmlHttpPostRequest("");
  }
}

function getUrlCallbackById(tabId) {
  chrome.tabs.get(tabId, getUrlCallback);
}

/**
 * Called directly by the plugin if a click failed
 */
function didBadClick() {
  sendNotFound({message: "Could not click",
                class: "org.openqa.selenium.WebDriverException"});
}

function pushPort(port) {
  //It would be nice to only have one port per name, so we enforce this
  removePort(port);
  ChromeDriver.ports.push(port);
}

function setActivePortByTabId(tabId) {
  for (var i = 0; i < ChromeDriver.ports.length; ++i) {
    if (ChromeDriver.ports[i].tab.id == tabId) {
      ChromeDriver.activePort = ChromeDriver.ports[i];
      break;
    }
  }
}

function setActivePortByWindowName(handle) {
  for (var i = 0; i < ChromeDriver.ports.length; ++i) {
    if (ChromeDriver.ports[i].name == handle) {
      ChromeDriver.activePort = ChromeDriver.ports[i];
      sendNoContent();
    }
  }
  sendNotFound({message: "Could not find window by handle: " + handle,
                class: "org.openqa.selenium.NoSuchWindowException"});
}

function removePort(port) {
  //TODO(danielwh): Nicer way of removing from array?
  var temp_ports = [];
  for (var i = 0; i < ChromeDriver.ports.length; ++i) {
    if (ChromeDriver.ports[i].name != port.name) {
      temp_ports.push(ChromeDriver.ports[i]);
    }
  }
  ChromeDriver.ports = temp_ports;
  if (ChromeDriver.activePort && ChromeDriver.activePort.name == port.name) {
    ChromeDriver.activePort = null;
  }
}
