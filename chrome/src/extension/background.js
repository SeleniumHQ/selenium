ChromeDriver = {};

//Array of ports to tabs we wish to use
//The name of each port is expected to be its JS window handle
ChromeDriver.ports = [];
//Port to the currently active tab
ChromeDriver.activePort = null;
//ID of the currently active tab
ChromeDriver.activeTabId = null;
ChromeDriver.activeWindowId = null;
//Whether the plugin has the OS-specific window handle for the active tab
//Called HWND rather than window handle to avoid confusion with the other
//use of window handle to mean 'name of window'
ChromeDriver.hasHwnd = false;
//Whether the content script which loads at document_start has connected
//(but the one which loads at document_end hasn't)
ChromeDriver.hasSeenPreContentScript = false;
ChromeDriver.xmlHttpRequest = null;
//TODO(danielwh): Get this from the initial URL
ChromeDriver.xmlHttpRequestUrl = "http://localhost:9700/chromeCommandExecutor"
ChromeDriver.requestSequenceNumber = 0;
ChromeDriver.getUrlRequestSequenceNumber = 0;
//Indicates we couldn't connect to the server
//(a page has loaded, but we have no content script)
ChromeDriver.isOnBadPage = false;

//URL currently being loaded, if any
ChromeDriver.currentlyLoadingUrl = null;
//Indicates we will not execute any commands because we are already executing one
ChromeDriver.isBlockedWaitingForResponse = false;

//Indicates we are in the process of closing a tab becuase .close() has been called
ChromeDriver.isClosingTab = false;

//We will try to re-send a request a few times if we don't have a port,
//in case a page is loading/changing and we get a port.
//This keeps track of how many attempts we have made.
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
  port.onDisconnect.addListener(function disconnectPort(port) {
    console.log("Disconnected from " + port.name);
    if (ChromeDriver.isClosingTab) {
      sendResponseToParsedRequest("{statusCode: 0}", false)
      ChromeDriver.isClosingTab = false;
    }
    removePort(port);
  })
});

//Tell the ChromeCommandExecutor that we are here
sendResponseByXHR("", false);

/**
 * Sends the passed argument as the result of a command
 * @param result result to send
 * @param wait whether we expect this command to possibly make changes
 * we need to wait for (e.g. adding elements, opening windows) - if so,
 * we wait until we think these effects are done
 */
function sendResponseByXHR(result, wait) {
  console.log("Sending result by XHR: " + result);
  if (ChromeDriver.xmlHttpRequest != null) {
    ChromeDriver.xmlHttpRequest.abort();
  }
  ChromeDriver.xmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.xmlHttpRequest.onreadystatechange = handleXmlHttpRequestReadyStateChange;
  ChromeDriver.xmlHttpRequest.open("POST", ChromeDriver.xmlHttpRequestUrl, true);
  ChromeDriver.xmlHttpRequest.setRequestHeader("Content-type", "application/json");
  //Default to waiting for page changes, just in case
  if (typeof(wait) == "undefined" || wait == null || wait == true) {
    setTimeout(sendResult, 600, [result]);
  } else {
    sendResult(result);
  }
}

/**
 * Actually sends the result by XHR
 * Should only EVER be called by sendResponseByXHR,
 * as it ignores things like setting up XHR and blocking,
 * and just forces the sending over an assumed open XHR
 */
function sendResult(result) {
  if (ChromeDriver.hasSeenPreContentScript) {
    //Wait! We are loading a new page!
    setTimeout(sendResult, 100, [result]);
  } else {
    ChromeDriver.xmlHttpRequest.send(result + "\nEOResponse\n");
    console.log("Sent result by XHR: " + result);
  }
}

/**
 * Sends the response to a request, which has been parsed by parseRequest
 * Should be used only from within parseRequest (or methods called from it),
 * because it adheres to the blocking semantics of parseRequest
 */
function sendResponseToParsedRequest(toSend, wait) {
  if (!ChromeDriver.isBlockedWaitingForResponse) {
    console.log("Tried to send a response (" + toSend + ") when not waiting for one.  Dropping response.");
    return;
  }
  ChromeDriver.isBlockedWaitingForResponse = false;
  sendResponseByXHR(toSend, wait);
  setToolstripsBusy(false);
}

/**
 * When we receive a request, dispatches parseRequest to execute it
 */
function handleXmlHttpRequestReadyStateChange() {
  if (this.readyState == 4) {
    if (this.status != 200) {
      console.log("Request state was 4 but status: " + this.status + ".  responseText: " + this.responseText);
    } else {
      if (this.responseText == "QUIT") {
        //We're only allowed to send a response if we're blocked waiting for one, so pretend
        sendResponseByXHR("", false);
      } else {
        console.log("Got request to execute from XHR: " + this.responseText);
        parseRequest(JSON.parse(this.responseText));
      }
    }
  }
}

/**
 * Parses a request received from the ChromeCommandExecutor and either sends the response,
 * or sends a message to the content script with a command to execute
 * @param request object encapsulating the request (e.g. {request: url, url: "http://www.google.co.uk"})
 */
function parseRequest(request) {
  if (ChromeDriver.isBlockedWaitingForResponse) {
    console.log("Already sent a request which hasn't been replied to yet.  Not parsing any more.");
    return;
  }
  if (ChromeDriver.isOnBadPage && request.request != "url") {
    console.log("On bad page.  Not sending request.")
    sendResponseByXHR("{statusCode: 500}");
    return;
  }
  ChromeDriver.isBlockedWaitingForResponse = true;
  setToolstripsBusy(true);
  
  switch (request.request) {
  case "url":
    getUrl(request.url);
    break;
  case "close":
    //Doesn't re-focus the ChromeDriver.activePort on any tab.
    //If this turns out to be a problem, may need to store ChromeDriver.activePort as a list,
    //using the head to post to, and popping as things are closed
    var tabId = ChromeDriver.activeTabId;
    ChromeDriver.activeTabId = null;
    ChromeDriver.activePort = null;
    ChromeDriver.isClosingTab = true;
    chrome.tabs.remove(tabId);
    break;
  case "getWindowHandle":
    sendResponseToParsedRequest("{statusCode: 0, value: '" + ChromeDriver.activePort.name + "'}", false);
    break;
  case "getWindowHandles":
    sendResponseToParsedRequest(getWindowHandles(), false);
    break;
  case "switchToWindow":
    ChromeDriver.hasHwnd = false;
    if (typeof("request.windowName") != "undefined") {
      setActivePortByWindowName(request.windowName);
    } else {
      sendResponseToParsedRequest("{statusCode: 3, value: {message: 'Window to switch to was not given'}}", false);
    }
    break;
  case "clickElement":
    //Falling through, as native events are handled the same
  case "sendElementKeys":
    try {
      ChromeDriver.activePort.postMessage(wrapInjectEmbedIfNecessary(request));
    } catch (e) {
      console.log("Tried to send request without an active port.  Ditching request and responding with error.");
      sendResponseToParsedRequest("{statusCode: 500}");
    }
    break;
  default:
    try {
      ChromeDriver.activePort.postMessage({request: request, sequenceNumber: ChromeDriver.requestSequenceNumber++});
    } catch (e) {
      console.log("Tried to send request without an active port.  Ditching request and responding with error.");
      sendResponseToParsedRequest("{statusCode: 500}");
    }
    break;
  }
}

/**
 * Parse messages coming in on the port (responses from the content script).
 * @param message JSON message of format:
 *                {response: "some command",
 *                 value: {statusCode: STATUS_CODE
 *                 [, optional params]}}
 */
function parsePortMessage(message) {
  console.log("Received response from content script: " + JSON.stringify(message));
  if (!message || !message.response || !message.response.value ||
      typeof(message.response.value.statusCode) == "undefined" ||
      message.response.value.statusCode == null ||
      typeof(message.sequenceNumber) == "undefined") {
    //Should only ever happen if we sent a bad request, or the content script is broken
    console.log("Got invalid response from the content script.");
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
    sendResponseToParsedRequest(toSend, message.response.wait);
    break;
  case "no-op":
    //Some special operation which isn't sending HTTP
    switch (message.response.response) {
    case "clickElement":
      try {
        if (document.embeds[0].clickAt(message.response.value.x, message.response.value.y)) {
          sendResponseToParsedRequest("{statusCode: 0}", true);
        } else {
          sendResponseToParsedRequest("{statusCode: 99}", true);
        }
      } catch(e) {
        console.log("Error natively clicking.  Trying non-native.");
        ChromeDriver.isBlockedWaitingForResponse = false;
        parseRequest({request: 'nonNativeClickElement', elementId: message.response.value.elementId});
      }
      break;
    case "sendElementKeys":
      console.log("Sending keys");
      try {
        if (document.embeds[0].sendKeys(message.response.value.keys)) {
          sendResponseToParsedRequest("{statusCode: 0}", true);
        } else {
          sendResponseToParsedRequest("{statusCode: 99}", true);
        }
      } catch(e) {
        console.log("Error natively sending keys.  Trying non-native.");
        ChromeDriver.isBlockedWaitingForResponse = false;
        parseRequest({request: 'sendElementNonNativeKeys', elementId: message.response.value.elementId, keys: message.response.value.keys});
      }
      break;
    }
    break
  }
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
 * Gets all current window handles
 * @return an array containing all of the current window handles
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
 * @param url the URL to load
 */
function getUrl(url) {
  ChromeDriver.activePort = null;
  ChromeDriver.hasHwnd = false;
  if (ChromeDriver.activeTabId != null) {
    chrome.tabs.remove(ChromeDriver.activeTabId);
  }
  ChromeDriver.activeTabId = null;
  ChromeDriver.currentlyLoadingUrl = url;
  chrome.tabs.create({url: url, selected: true}, getUrlCallback);
}

function getUrlCallback(tab) {
  if (chrome.extension.lastError) {
    //An error probably arose because Chrome didn't have a window yet (see crbug.com 19846)
    //If we retry, we *should* be fine.  Unless something really bad is happening, in which case
    //we will probably hang indefinitely trying to reload the same URL
    getUrl(ChromeDriver.currentlyLoadingUrl);
    return;
  }
  if (tab.status != "complete") {
    //Use the helper calback so that we actually get updated version of the tab we're getting
    setTimeout("getUrlCallbackById(" + tab.id + ")", 10);
  } else {
    ChromeDriver.getUrlRequestSequenceNumber++;
    ChromeDriver.activeTabId = tab.id;
    ChromeDriver.activeWindowId = tab.windowId;
    setActivePortByTabId(tab.id);
    ChromeDriver.requestSequenceNumber = 0;
    if (ChromeDriver.activePort == null) {
      ChromeDriver.isOnBadPage = true;
    }
    sendResponseToParsedRequest("", false);
  }
}

function getUrlCallbackById(tabId) {
  chrome.tabs.get(tabId, getUrlCallback);
}

function setToolstripsBusy(busy) {
  var toolstrips = chrome.self.getToolstrips(ChromeDriver.activeWindowId);
  for (var toolstrip in toolstrips) {
    if (toolstrips[toolstrip].setWebdriverToolstripBusy && 
        toolstrips[toolstrip].setWebdriverToolstripFree) {
      if (busy) {
        toolstrips[toolstrip].setWebdriverToolstripBusy();
      } else {
        toolstrips[toolstrip].setWebdriverToolstripFree();
      }
    }
  }
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
      ChromeDriver.activeTabId = ChromeDriver.activePort.tab.id;
      chrome.tabs.update(ChromeDriver.activeTabId, {selected: true});
      sendResponseToParsedRequest("{statusCode: 0}", false);
      return;
    }
  }
  sendResponseToParsedRequest("{statusCode: 3, value: {message: 'Could not find window to switch to by handle: " + handle + "'}}", false);
}

/**
 * Removes the passed port from our array of current ports
 */
function removePort(port) {
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
