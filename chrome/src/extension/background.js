//Initialise globals
ChromeDriver = {};

//Array of ports to tabs we wish to use
//The name of each port is expected to be its JS window handle
ChromeDriver.ports = [];
//Port to the currently active tab
ChromeDriver.activePort = null;
ChromeDriver.activeTabId = null;
//Whether the plugin has the OS-specific window handle for the active tab
//Called HWND rather than window handle to avoid confusion with the other
//use of window handle to mean 'name of window'
ChromeDriver.hasHwnd = false;
ChromeDriver.hasSeenPreContentScript = false;
ChromeDriver.isCurrentlyLoadingUrl = false;
//ChromeDriver.currentSpeed = 500; //TODO(danielwh): enum this? Oh, and actually do anything with it
ChromeDriver.requestXmlHttpRequest = null;
ChromeDriver.responseXmlHttpRequest = null;
ChromeDriver.requestXmlHttpRequestUrl = "http://localhost:9700/chromeCommandExecutor"
ChromeDriver.responseXmlHttpRequestUrl = "http://localhost:9701/chromeCommandExecutor"
ChromeDriver.requestSequenceNumber = 0;
ChromeDriver.retryRequestBuffer = [];
ChromeDriver.isOnBadPage = false; //Indicates we couldn't connect to the server

ChromeDriver.isLoadingTabAtTheMomentAndMaybeWillNotSucceed = false;
ChromeDriver.attemptsToSendWithNoPort = 0;

chrome.self.onConnect.addListener(function(port) {
  console.log("Connected to " + port.name);
  if (!ChromeDriver.hasSeenPreContentScript) {
    ChromeDriver.hasSeenPreContentScript = true;
    return;
  }
  ChromeDriver.hasSeenPreContentScript = false;
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

sendRequestXmlHttpRequest();

function sendRequestXmlHttpRequest() {
  if (ChromeDriver.requestXmlHttpRequest != null) {
    ChromeDriver.requestXmlHttpRequest.abort();
  }
  ChromeDriver.requestXmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.requestXmlHttpRequest.onreadystatechange = handleRequestXmlHttpRequestReadyStateChange;
  ChromeDriver.requestXmlHttpRequest.open("POST", ChromeDriver.requestXmlHttpRequestUrl, true);
  ChromeDriver.requestXmlHttpRequest.send("\nEORequest\n");
  console.log("Sent XMLHTTP with a request");
}

function sendResponseXmlHttpRequest(params, wait) {
  console.log("sendResponseXmlHttpRequest");
  if (ChromeDriver.responseXmlHttpRequest != null) {
    ChromeDriver.responseXmlHttpRequest.abort();
  }
  ChromeDriver.responseXmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.responseXmlHttpRequest.onreadystatechange = handleResponseXmlHttpRequestReadyStateChange;
  ChromeDriver.responseXmlHttpRequest.open("POST", ChromeDriver.responseXmlHttpRequestUrl, true);
  ChromeDriver.responseXmlHttpRequest.setRequestHeader("Content-type", "application/json");
  //Default to waiting for page changes, just in case
  if (typeof(wait) == "undefined" || wait == null || wait == true) {
    setTimeout(sendParams, 600, [params]);
  } else {
    sendParams(params);
  }
}

function sendParams(params) {
  if (ChromeDriver.hasSeenPreContentScript) {
    setTimeout(sendParams, 100, [params]);
  } else {
    ChromeDriver.responseXmlHttpRequest.send(params + "\nEOResponse\n");
  }
}

function handleRequestXmlHttpRequestReadyStateChange() {
  console.log("State change to " + this.readyState);
  if (this.readyState == 4) {
    if (this.status != 200) {
      console.log("Request state was 4 but status: " + this.status + ".  responseText: " + this.responseText);
    } else {
      console.log("State was 4 and status: 200")
      if (this.responseText == "QUIT") {
        sendResponse("", false);
      } else {
        console.log("THE WIRE gave " + this.responseText);
        parseRequest(JSON.parse(this.responseText));
      }
    }
  }
}

function handleResponseXmlHttpRequestReadyStateChange() {
  if (this.readyState == 4) {
    if (this.status != 200) {
      console.log("Response state was 4 but status: " + this.status + ".  responseText: " + this.responseText);
    } else {
      if (this.responseText == "ACK") {
        console.log("Got ACK");
        if (ChromeDriver.activePort == null) {
          console.log("WARNING: No active port.  Asking for command anyway.");
        }
        sendRequestXmlHttpRequest();
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
    getUrl(request.url);
    break;
  case "getWindowHandle":
    console.log("CALL FOR getWindowHandle");
    sendResponse("{statusCode: 0, value: '" + ChromeDriver.activePort.name + "'}", false);
    break;
  case "getWindowHandles":
    sendResponse(getWindowHandles(), false);
    break;
  case "switchToWindow":
    ChromeDriver.hasHwnd = false;
    if (typeof("request.windowName") != "undefined") {
      setActivePortByWindowName(request.windowName);
    } else {
      sendResponse("{statusCode: 3, value: {message: 'Window to switch to was not given'}}", false);
    }
    break;
  case "clickElement":
  case "sendElementKeys":
    sendRequest(wrapInjectEmbedIfNecessary(request));
    break;
  default:
    sendRequest({request: request, sequenceNumber: ChromeDriver.requestSequenceNumber++});
    break;
  }
}

function sendRequest(message) {
  ChromeDriver.retryRequestBuffer.push(message);
  sendBufferedRequests();
}

function sendBufferedRequests() {
  if (!ChromeDriver.activePort) {
    console.log("NO ACTIVE PORT");
    if (ChromeDriver.isOnBadPage) {
      ChromeDriver.retryRequestBuffer = [];
    }
    if (++ChromeDriver.attemptsToSendWithNoPort > 15) {
      sendResponse("{statusCode: 500}", false);
      return;
    }
  } else {
    ChromeDriver.attemptsToSendWithNoPort = 0;
    for (var i = 0; i < ChromeDriver.retryRequestBuffer.length; ++i) {
      console.log("Sending: " + ChromeDriver.retryRequestBuffer[i].sequenceNumber);
      ChromeDriver.activePort.postMessage(ChromeDriver.retryRequestBuffer[i]);
    }
  }
  setTimeout(sendBufferedRequests, 1000);
}


/**
 * Parse messages coming in on the port.
 * Sends HTTP according to the value passed.
 * @param message JSON message of format:
 *                {response: "some command",
 *                 value: {statusCode: STATUS_CODE
 *                 [, optional params]}}
 */
function parsePortMessage(message) {
  console.log("FROM CONTENT SCRIPT Received response to: " + message.response.response + "(" + message.sequenceNumber + ")");
  console.log(JSON.stringify(message));
  if (!message || !message.response || !message.response.value || typeof(message.response.value.statusCode) == "undefined" || message.response.value.statusCode == null ||
      typeof(message.sequenceNumber) == "undefined") {
    console.log("Got invalid response.");
    return;
  }
  var toSend = "";
  switch (message.response.value.statusCode) {
  //Error codes are loosely based on native exception codes, see common/src/cpp/webdriver-interactions/errorcodes.h
  case 0:
  case 2: //org.openqa.selenium.WebDriverException [Cookies]
  case 3: //org.openqa.selenium.NoSuchWindowException
  case 7: //org.openqa.selenium.NoSuchElementException
  case 9: //java.lang.UnsupportedOperationException [Unknown command]
  case 10: //org.openqa.selenium.StaleElementReferenceException
  case 11: //org.openqa.selenium.ElementNotVisibleException
  case 12: //java.lang.UnsupportedOperationException [Invalid element state (e.g. disabled)]
  case 17: //org.openqa.selenium.WebDriverException [Bad javascript]
  case 99: //org.openqa.selenium.WebDriverException [Native event]
    toSend = '{statusCode: ' + message.response.value.statusCode;
    if (typeof(message.response.value) != "undefined" && message.response.value != null &&
        typeof(message.response.value.value) != "undefined") {
      toSend += ',value:' + JSON.stringify(message.response.value.value);
    }
    toSend += '}';
    console.log("Sending: " + toSend)
    var wait = message.response.wait;
    sendResponse(toSend, wait);
    break;
  case "no-op":
    //Some special operation which isn't sending HTTP
    switch (message.response.response) {
    case "clickElement":
      try {
        if (document.embeds[0].clickAt(message.response.value.x, message.response.value.y)) {
          sendResponse("{statusCode: 0}", true);
        } else {
          sendResponse("{statusCode: 99}", true);
        }
      } catch(e) {
        sendResponse("{statusCode: 99}", true);
      }
      break;
    case "sendElementKeys":
      console.log("Sending keys");
      try {
        if (document.embeds[0].sendKeys(message.response.value.keys)) {
          sendResponse("{statusCode: 0}", true);
        } else {
          sendResponse("{statusCode: 99}", true);
        }
      } catch(e) {
        console.log("Error natively sending keys.  Trying non-native");
        parseRequest({request: 'sendElementNonNativeKeys', elementId: message.response.value.elementId, keys: message.response.value.keys});
      }
      break;
    }
    break
  }
  updateRetryBuffer(message.sequenceNumber);
}

function updateRetryBuffer(sequenceNumber) {
  var updatedRetryRequestBuffer = [];
  for (var i = 0; i < ChromeDriver.retryRequestBuffer.length; ++i) {
    //Because of followup/wrapped requests, we assume that any sequence number returned means all previous command have been executed
    if (ChromeDriver.retryRequestBuffer[i].sequenceNumber > sequenceNumber) {
      updatedRetryRequestBuffer.push(ChromeDriver.retryRequestBuffer[i]);
    }
  }
  ChromeDriver.retryRequestBuffer = updatedRetryRequestBuffer;
}

function sendResponse(toSend, wait) {
  console.log("Sending SENDRESPONSE POST");
  sendResponseXmlHttpRequest(toSend, wait);
}

/**
 * If the plugin doesn't currently have an HWND for this page,
 * we need to get one by injecting an embed
 */
function wrapInjectEmbedIfNecessary(requestObject) {
  if (ChromeDriver.hasHwnd) {
    return {sequenceNumber: ChromeDriver.requestSequenceNumber++, request: requestObject};
  } else {
    var wrappedObject = {sequenceNumber: ChromeDriver.requestSequenceNumber,
                         request: {request: "injectEmbed",
                                   followup: {sequenceNumber: ChromeDriver.requestSequenceNumber + 1,
                                              request: requestObject}}};
    ChromeDriver.requestSequenceNumber += 2
    return wrappedObject;
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
  return JSON.stringify({statusCode: 0, value: windowHandles});
}

/**
 * Closes the current tab if it exists, and opens a new one, in which it
 * gets the URL passed
 * @param value JSON array containing the URL to load
 */
function getUrl(url) {
  console.log("getUrl");
  //Ignore any URL request we get while loading a page,
  //because we should still return a 204 when we cannot find the page.
  if (ChromeDriver.isCurrentlyLoadingUrl) {
    console.log("IS CURRENTLY LOADING URL");
    return;
  }
  ChromeDriver.activePort = null;
  ChromeDriver.hasHwnd = false;
  if (ChromeDriver.activeTabId != null) {
    chrome.tabs.remove(ChromeDriver.activeTabId);
  }
  ChromeDriver.activeTabId = null;
  ChromeDriver.isCurrentlyLoadingUrl = true;
  console.log("Creating new tab with url: " + url);
  ChromeDriver.isLoadingTabAtTheMomentAndMaybeWillNotSucceed = true;
  chrome.tabs.create({url: url, selected: true}, getUrlCallback);
  setTimeout(getUrlTimeout, 20000);
}

function getUrlTimeout() {
  if (ChromeDriver.isLoadingTabAtTheMomentAndMaybeWillNotSucceed) {
    ChromeDriver.isLoadingTabAtTheMomentAndMaybeWillNotSucceed = false;
    sendResponse("{statusCode: 500}", false);
  }
}

function getUrlCallback(tab) {
  if (tab.status != "complete") {
    ChromeDriver.isCurrentlyLoadingUrl = true
    //Use the helper calback so that we can add our own delay and not DOS the browser
    setTimeout("getUrlCallbackById(" + tab.id + ")", 10);
  } else {
    ChromeDriver.isLoadingTabAtTheMomentAndMaybeWillNotSucceed = false;
    ChromeDriver.isCurrentlyLoadingUrl = false;
    ChromeDriver.activeTabId = tab.id;
    setActivePortByTabId(tab.id);
    ChromeDriver.retryRequestBuffer = [];
    ChromeDriver.requestSequenceNumber = 0;
    if (ChromeDriver.activePort == null) {
      ChromeDriver.isOnBadPage = true;
    }
    sendResponse("", false);
  }
}

function getUrlCallbackById(tabId) {
  chrome.tabs.get(tabId, getUrlCallback);
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
      sendResponse("{statusCode: 0}", false);
      return;
    }
  }
  sendResponse("{statusCode: 3, value: {message: 'Could not find window by handle: " + handle + "'}}", false);
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
