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
  console.log("Sending POST request to get command");
  ChromeDriver.xmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.xmlHttpRequest.onreadystatechange = handleXmlHttpGetRequestReadyStateChange;
  ChromeDriver.xmlHttpRequest.open("POST", ChromeDriver.xmlHttpRequestUrl, true);
  ChromeDriver.xmlHttpRequest.send("\nEOF\n");
}

function sendXmlHttpPostRequest(params) {
  console.log("Sending POST request to respond to command");
  ChromeDriver.xmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.xmlHttpRequest.onreadystatechange = handleXmlHttpPostRequestReadyStateChange;
  ChromeDriver.xmlHttpRequest.open("POST", ChromeDriver.xmlHttpRequestUrl, true);
  ChromeDriver.xmlHttpRequest.setRequestHeader("Content-type", "application/json");
  ChromeDriver.xmlHttpRequest.send(params + "\nEOF\n");
  console.log("SENT POST request");
}


function handleXmlHttpGetRequestReadyStateChange() {
  console.log("State change to " + this.readyState);
  if (this.readyState == 4) {
    if (this.status != 200) {
      console.log("State was 4 but status: " + this.status + ".  responseText: " + this.responseText);
      setTimeout("handleXmlHttpGetRequestReadyStateChange()", 500);
    } else {
      console.log("State was 4 and status: " + this.status)
      if (this.responseText == "quit") {
        console.log("Sending QUIT POST");
        sendXmlHttpPostRequest("");
      } else {
        console.log("THE WIRE gave " + this.responseText);
        parseRequest(JSON.parse(this.responseText));
      }
    }
  }
}

function handleXmlHttpPostRequestReadyStateChange() {
  if (this.readyState == 4) {
    if (this.status != 200) {
      console.log("Waiting for status change");
      setTimeout("handleXmlHttpPostRequestReadyStateChange()", 500);
    } else {
      if (this.responseText == "ACK") {
        console.log("Got ACK");
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
  console.log("Aborted xmlHttpRequest");
}

function parseRequest(request) {
  switch (request.request) {
  case "url":
    //TODO(danielwh): Fill in GUID
    getUrl(request.url, "GUID");
    break;
  case "getWindowHandle":
    parsePortMessage({sequenceNumber: "INTERNAL", response: {value: {statusCode: 0, value: ChromeDriver.activePort.name}}});
    break;
  case "getWindowHandles":
    parsePortMessage(getWindowHandles());
    break;
  case "switchToWindow":
    if (typeof("request.windowName") != "undefined") {
      setActivePortByWindowName(request.windowName);
      parsePortMessage({sequenceNumber: "INTERNAL", response: {value: {statusCode: 0}}});
    } else {
      parsePortMessage({sequenceNumber: "INTERNAL", response: {value: {statusCode: 3, message: "Window to switch to was not given"}}});
    }
    break;
  default:
    ChromeDriver.retryRequestBuffer.push({request: request, sequenceNumber: ChromeDriver.requestSequenceNumber++});
    sendBufferedRequests();
    break;
  }
}

function sendResult(message) {
  ChromeDriver.retryRequestBuffer.push(message);
  sendBufferedRequests();
}

function sendBufferedRequests() {
  if (!ChromeDriver.activePort) {
    console.log("NO ACTIVE PORT");
    if (ChromeDriver.isOnBadPage) {
      ChromeDriver.retryRequestBuffer = [];
    }
  }
  for (var i = 0; i < ChromeDriver.retryRequestBuffer.length; ++i) {
    console.log("Sending: " + ChromeDriver.retryRequestBuffer[i].sequenceNumber);
    ChromeDriver.activePort.postMessage(ChromeDriver.retryRequestBuffer[i]);
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
  case 0:
  case 1: //org.openqa.selenium.NoSuchElementException
  case 2: //org.openqa.selenium.WebDriverException [Cookies]
  case 3: //org.openqa.selenium.NoSuchWindowException
  case 4: //org.openqa.selenium.WebDriverException [Bad javascript]
  case 5: //org.openqa.selenium.ElementNotVisibleException
  case 6: //java.lang.UnsupportedOperationException [Invalid element state (e.g. disabled)]
  case 7: //java.lang.UnsupportedOperationException [Unknown command]
  case 8: //org.openqa.selenium.StaleElementReferenceException
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
  console.log("Sending SENDRESPONSE POST");
  sendXmlHttpPostRequest(toSend);
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
 * Sends an array containing all of the current window handles
 */
function getWindowHandles() {
  var windowHandles = [];
  for (var i = 0; i < ChromeDriver.ports.length; ++i) {
    windowHandles.push(ChromeDriver.ports[i].name);
  }
  return {sequenceNumber: "INTERNAL", response: {value: {statusCode: 0, value: windowHandles}}};
}

/**
 * Closes the current tab if it exists, and opens a new one, in which it
 * gets the URL passed and record the UUID passed.
 * @param value JSON array containing the URL to load
 * @param UUID a generated UUID that the extension can use for this page
 *             if needed
 */
function getUrl(url, uuid) {
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
  ChromeDriver.instanceUuid = uuid;
  ChromeDriver.isCurrentlyLoadingUrl = true;
  console.log("Creating new tab");
  chrome.tabs.create({url: url, selected: true}, getUrlCallback);
  //TODO(danielwh): Remove this
  TEMPORARYloading = true;
  setTimeout(timeoutGetUrl, 10000);
  console.log("Created new tab");
}

function timeoutGetUrl() {
  if (TEMPORARYloading) {
    sendXmlHttpPostRequest("{statusCode: 500}");
  }
}

function getUrlCallback(tab) {
  console.log("getUrlCallback");
  if (tab.status != "complete") {
    console.log(tab);
    ChromeDriver.isCurrentlyLoadingUrl = true
    //Use the helper calback so that we can add our own delay and not DOS the browser
    setTimeout("getUrlCallbackById(" + tab.id + ")", 10);
  } else {
    TEMPORARYloading = false;
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
