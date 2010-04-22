/** @namespace */
ChromeDriver = {};


/**
 * Array of all information about currently loaded tabs (where a WebDriver
 * window is probably a tab)
 * Entries of form:
 * {Int tabId, String windowName, Port mainPort, Boolean isFrameset, FrameData[] frames}
 * FrameData ::= {[Int frameId], String frameName, Port framePort, FrameData[]}
 * frameId can be undefined, if it has not yet been looked up, but should be
 * added once it is known
 * @type {Array.<Object>}  TODO(jmleyba): Type info
 */
ChromeDriver.tabs = [];


/**
 * Port to the currently active frame (or tab, if the current page is not a
 * frameset).
 * @type {?Port}
 */
ChromeDriver.activePort = null;


/**
 * ID of the currently active tab.
 * @type {?string}
 */
ChromeDriver.activeTabId = null;


/**
 * Whether we should switch to the next tab which opens. Should be set if the
 * last active tab was closed.
 * @type {boolean}
 */
ChromeDriver.doFocusOnNextOpenedTab = true;


/**
 * Place to temporarily store the URL currently being loaded, so that we can
 * retry if needed, because opening a URL is an async callback.
 * @type {?string}
 */
ChromeDriver.urlBeingLoaded = null;


/**
 * URL we believe we're currently on.
 * @type {?string}
 */
ChromeDriver.currentUrl = null;


/**
 * Whether we are loading a new URL that difers from the current URL only in
 * fragment.
 * @type {boolean}
 */
ChromeDriver.isGettingUrlButOnlyChangingByFragment = false;


/**
 * Whether we are currently executing a {@code ChromeDriver#close()}, and
 * accordingly should send a success response when the tab closes.
 * @type {boolean}
 */
ChromeDriver.isClosingTab = false;


/**
 * Whether we have sent a response to the {currently, most recently loading
 * page.
 * @type {boolean}
 */
ChromeDriver.hasSentResponseToThisPageLoading = false;


/**
 * Whether we believe a page is open to which we have no content script.
 * @type {boolean}
 */
ChromeDriver.hasNoConnectionToPage = true;


/**
 * Stores the remaining frames to traverse when switching frames.
 * @type {Array.<string>}
 */
ChromeDriver.restOfCurrentFramePath = [];


/**
 * Port to the frameset or main content page we currently have loaded, so that
 * we can probe it for information about its frames.
 * @type {?Port}
 */
ChromeDriver.portToUseForFrameLookups = null;


/**
 * The last request we sent that has not been answered, so that if we change
 * page between sending a request and receiving a response, we can re-send it to
 * the newly loaded page.
 * @type {*}  TODO(jmleyba)
 */
ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet = null;


/**
 * Whether the plugin has the OS-specific window handle for the active tab. This
 * is called HWND rather than window handle to avoid confusion with the other
 * use of window handle to mean 'name of window'.
 * @type {boolean}
 */
ChromeDriver.hasHwnd = false;


/**
 * THe last XMLHttpRequest we made (used for communication with test language
 * bindings).
 * @type {?XMLHttpRequest}
 */
ChromeDriver.xmlHttpRequest = null;

/**
 * URL to ping for commands.
 * @type {string}
 */
ChromeDriver.xmlHttpRequestUrl = null;


/**
 * @type {number}
 */
ChromeDriver.requestSequenceNumber = 0;


/**
 * @type {number}
 */
ChromeDriver.lastReceivedSequenceNumber = -2;


/**
 * @type {number}
 */
ChromeDriver.getUrlRequestSequenceNumber = 0;


/**
 * Prefix prepended to the hopefully unique javascript window name, in hopes of
 * further removing conflict.
 * @type {string}
 */
ChromeDriver.windowHandlePrefix = '__webdriver_chromedriver_windowhandle';


/**
 * Whether we will not execute any commands because we are already executing
 * one.
 * @type {boolean}
 */
ChromeDriver.isBlockedWaitingForResponse = false;

/**
 * It's possible that the page has completed loading,
 * but the content script has not yet fired.
 * In this case, to not report that there is no page,
 * when we are just too fast, we wait up to this amount of time.
 * @type {number} unit: milliseconds
 */
ChromeDriver.timeoutUntilGiveUpOnContentScriptLoading = 5000;

/**
 * How long we are currently waiting for the content script to load
 * after loading the page
 * @type {number} unit: milliseconds
 */
ChromeDriver.currentlyWaitingUntilGiveUpOnContentScriptLoading;

/**
 * The amount of time, in milliseconds, to wait for an element to be located
 * when performing a search.
 * When searching for a single element, the driver will wait up to this amount
 * of time for the element to be located before returning an error.
 * When searching for multiple elements, the driver will wait up to this amount
 * of time for at least one element to be located before returning an empty
 * list.
 * @type {number}
 * @private
 */
ChromeDriver.implicitWait_ = 0;

//Set ChromeDriver.currentlyWaitingUntilGiveUpOnContentScriptLoading;
resetCurrentlyWaitingOnContentScriptTime();

/**
 * How long we wait between poling whether we have a content script,
 * when loading a new page, up until
 * ChromeDriver.timeoutUntilGiveUpOnContentScriptLoading
 * @type {number} unit: milliseconds
 */
ChromeDriver.waitForContentScriptIncrement = 100;

chrome.extension.onConnect.addListener(function(port) {
  if (ChromeDriver.xmlHttpRequestUrl == null) {
    //This is the first content script, so is from the URL we need to connect to
    ChromeDriver.xmlHttpRequestUrl = port.tab.url;
    //Tell the ChromeCommandExecutor that we are here
    sendResponseByXHR("", false);
    return;
  } else if (port.tab.url.indexOf(ChromeDriver.xmlHttpRequestUrl) == 0) {
    //We have reloaded the xmlHttpRequest page.  Ignore the connection.
    return;
  }

  console.log("Connected to " + port.name);
  // Note: The frameset port *always* connects before any frame port.  After
  // that, the order is in page loading time
  ChromeDriver.hasNoConnectionToPage = false;
  var foundTab = false;
  for (var tab in ChromeDriver.tabs) {
    if (ChromeDriver.tabs[tab].tabId == port.tab.id) {
      //We must be a new [i]frame in the page, because when a page closes, it is
      // removed from ChromeDriver.tabs
      //TODO(danielwh): Work out WHICH page it's a sub-frame of (I don't look
      // forward to this)
      ChromeDriver.tabs[tab].frames.push({
        frameName: port.name,
        framePort: port,
        frames: []
      });
      //Loaded a frame.  Pushed it to the array.  We don't know which page it's
      // a sub-frame of, in the case of nested frames, if they have the same
      // names.  It would be nice to think people didn't use frames, let alone
      // several layers of nesting of frames with the same name, but if it turns
      // out to be a problem... Well, we'll see.
      foundTab = true;
      break;
    }
  }
  if (!foundTab) {
    //New tab!
    //We don't know if it's a frameset yet, so we leave that as undefined
    ChromeDriver.tabs.push({
      tabId: port.tab.id,
      windowName: ChromeDriver.windowHandlePrefix + "_" + port.tab.id,
      mainPort: port,
      frames: []
    });
  }
  
  if (ChromeDriver.doFocusOnNextOpenedTab) {
    ChromeDriver.activePort = port;
    setActiveTabDetails(port.tab);
    //Re-parse the last request we sent if we didn't get a response,
    //because we ain't seeing a response any time soon
    
    if (ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet != null) {
      if (ChromeDriver.urlBeingLoaded != null) {
        ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet = null;
      } else {
        ChromeDriver.isBlockedWaitingForResponse = false;
        console.log("Re-trying request which was sent but not answered");
        parseRequest(ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet);
      }
    }
  }
  
  if (ChromeDriver.urlBeingLoaded != null) {
    //This was the result of a getUrl.  Need to issue a response
    sendEmptyResponseWhenTabIsLoaded(port.tab);  
  }
  port.onMessage.addListener(parsePortMessage);
  port.onDisconnect.addListener(function disconnectPort(port) {
    console.log("Disconnected from " + port.name);
    var remainingTabs = [];
    for (var tab in ChromeDriver.tabs) {
      if (ChromeDriver.tabs[tab].tabId == port.tab.id) {
        if (ChromeDriver.tabs[tab].mainPort == port) {
          //This main tab is being closed.
          //Don't include it in the new version of ChromeDriver.tabs.
          //Any subframes will also disconnect,
          //but their tabId won't be present in the array,
          //so they will be ignored.
          continue;
        } else {
          //This is a subFrame being ditched
          var remainingFrames = [];
          for (var frame in ChromeDriver.tabs[tab].frames) {
            if (ChromeDriver.tabs[tab].frames[frame].framePort == port) {
              continue;
            }
            remainingFrames.push(ChromeDriver.tabs[tab].frames[frame]);
          }
          ChromeDriver.tabs[tab].frames = remainingFrames;
        }
      }
      remainingTabs.push(ChromeDriver.tabs[tab]);
    }
    ChromeDriver.tabs = remainingTabs;
    if (ChromeDriver.tabs.length == 0 || ChromeDriver.activePort == null ||
        ChromeDriver.activePort.tab.id == port.tab.id) {
      //If it is the active tab, perhaps we have followed a link,
      //so we should focus on it.
      //We have nothing better to focus on, anyway.
      resetActiveTabDetails();
    }
    if (ChromeDriver.isClosingTab) {
      //We are actively closing the tab, and expect a response to this
      sendResponseToParsedRequest({status: 0}, false)
      ChromeDriver.isClosingTab = false;
      if (ChromeDriver.tabs.length == 0) {
        chrome.windows.getAll({}, function(windows) {
          for (var window in windows) {
            chrome.windows.remove(windows[window].id);
          }
        });
      }
    }
  });
});

/**
 * Sends the passed argument as the result of a command
 * @param result object encapsulating result to send
 * @param wait whether we expect this command to possibly make changes
 * we need to wait for (e.g. adding elements, opening windows) - if so,
 * we wait until we think these effects are done
 */
function sendResponseByXHR(result, wait) {
  console.log("Sending result by XHR: " + JSON.stringify(result));
  if (ChromeDriver.xmlHttpRequest != null) {
    ChromeDriver.xmlHttpRequest.abort();
  }
  ChromeDriver.xmlHttpRequest = new XMLHttpRequest();
  ChromeDriver.xmlHttpRequest.onreadystatechange =
      handleXmlHttpRequestReadyStateChange;
  ChromeDriver.xmlHttpRequest.open(
      "POST", ChromeDriver.xmlHttpRequestUrl, true);
  ChromeDriver.xmlHttpRequest.setRequestHeader(
      "Content-type", "application/json");
  //Default to waiting for page changes, just in case
  //TODO(danielwh): Iterate over tabs checking their status
  if (wait === undefined || wait == null || wait) {
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
 * @param result String to send
 */
function sendResult(result) {
  //TODO(danielwh): Iterate over tabs checking their status
  ChromeDriver.xmlHttpRequest.send(result + "\nEOResponse\n");
  console.log("Sent result by XHR: " + JSON.stringify(result));
}

/**
 * Sends the response to a request, which has been parsed by parseRequest
 * Should be used only from within parseRequest (or methods called from it),
 * because it adheres to the blocking semantics of parseRequest
 */
function sendResponseToParsedRequest(toSend, wait) {
  if (!ChromeDriver.isBlockedWaitingForResponse) {
    console.log("Tried to send a response (" + toSend +
                ") when not waiting for one.  Dropping response.");
    return;
  }
  ChromeDriver.isBlockedWaitingForResponse = false;
  ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet = null;
  console.log("SENDING RESPOND TO PARSED REQUEST");
  toSend['sessionId'] = 'static_session_id';  
  sendResponseByXHR(JSON.stringify(toSend), wait);
  setExtensionBusyIndicator(false);
}

/**
 * When we receive a request, dispatches parseRequest to execute it
 */
function handleXmlHttpRequestReadyStateChange() {
  if (this.readyState == 4) {
    if (this.status != 200) {
      console.log("Request state was 4 but status: " + this.status +
                  ".  responseText: " + this.responseText);
    } else {
      console.log("GOT XHR RESPONSE: " + this.responseText);
      var request = JSON.parse(this.responseText);
      if (request.request == "quit") {
        //We're only allowed to send a response if we're blocked waiting for one, so pretend
        console.log("SENDING QUIT XHR");
        sendResponseByXHR(JSON.stringify({status: 0}), false);
      } else {
        console.log("Got request to execute from XHR: " + this.responseText);
        parseRequest(request);
      }
    }
  }
}

/**
 * Parses a request received from the ChromeCommandExecutor and either sends the
 * response, or sends a message to the content script with a command to execute
 * @param request object encapsulating the request (e.g.
 *     {request: url, url: "http://www.google.co.uk"})
 */
function parseRequest(request) {
  if (ChromeDriver.isBlockedWaitingForResponse) {
    console.log("Already sent a request which hasn't been replied to yet. " +
                "Not parsing any more.");
    return;
  }
  ChromeDriver.isBlockedWaitingForResponse = true;
  setExtensionBusyIndicator(true);
  
  switch (request.request) {
  case "newSession":
    sendResponseToParsedRequest({
      status: 0,
      value: {
        'browserName': 'chrome',
        'version': navigator.appVersion.replace(/.*Chrome\/(\d(\.\d+)*\b).*/, "$1"),
        'platform': navigator.platform,
        'javascriptEnabled': true,
      }
    });
    break;
  case "get":
    getUrl(request.url);
    break;
  case "close":
    //Doesn't re-focus the ChromeDriver.activePort on any tab.
    chrome.tabs.remove(ChromeDriver.activeTabId);
    ChromeDriver.isClosingTab = true;
    break;
  case "getCurrentWindowHandle":
    if (ChromeDriver.activePort == null) {
      //        console.log("No active port right now.");
      // Fine. Find the active tab.
      // TODO(simon): This is lame and error prone
      var len = ChromeDriver.tabs.length;
      for (var i = 0; i < len; i++) {
        if (ChromeDriver.tabs[i].selected) {
          sendResponseToParsedRequest({status: 0, value:  ChromeDriver.tabs[i].id}, false);
        }
      }

      // Hohoho. The first argument to tabs.getSelected is optional, but must be set.
      chrome.windows.getCurrent(function(win) {
        chrome.tabs.getSelected(win.id, function(tab) {
          var len = ChromeDriver.tabs.length;
          for (var i = 0; i < len; i++) {
            if (ChromeDriver.tabs[i].tabId == tab.id) {
              sendResponseToParsedRequest({status: 0, value: ChromeDriver.tabs[i].tabId}, false);
              return;
            }
          }
        });
      });
    } else {
      // Wow. I can't see this being error prone in the slightest
      var handle = ChromeDriver.windowHandlePrefix + "_" + ChromeDriver.activePort.sender.tab.id;
      sendResponseToParsedRequest({status: 0, value:  handle}, false);
    };
    break;
  case "getWindowHandles":
    sendResponseToParsedRequest(getWindowHandles(), false);
    break;
  case "switchToFrame":
    if (request.id === undefined || request.id === null) {
      switchToDefaultContent();
    } else {
      switchToFrame(request.id);
    }
    break;
  case "switchToFrameByIndex":
  case "switchToFrameByName":
    switchToFrame(request.id);
    break;
  case "switchToWindow":
    ChromeDriver.hasHwnd = false;
    if (request.name !== undefined) {
      setActivePortByWindowName(request.name);
    } else {
      sendResponseToParsedRequest({
        status: 23,
        value: {
          message: 'Window to switch to was not given'
        }
      }, false);
    }
    break;
  case "screenshot":
    getScreenshot();
    break;
  case "implicitlyWait":
    ChromeDriver.implicitWait_ = request.ms || 0;
    sendResponseToParsedRequest({status: 0});
    break;
  case "clickElement":
  case "hoverOverElement":
    // Falling through, as native events are handled the same
  case "sendKeysToElement":
    if (typeof(request.keys) == "object" && request.keys.length !== undefined) {
      request.keys = request.keys.join("");
    }
    sendMessageOnActivePortAndAlsoKeepTrackOfIt(
        wrapInjectEmbedIfNecessary(request));
    break;
  case "getCurrentUrl":
  case "getTitle":
    if (hasNoPage()) {
      console.log("Not got a page, but asked for string, so sending empty string");
      sendResponseToParsedRequest({status: 0, value: ''});
      break;
    }
    // Falling through, as if we do have a page, we want to treat this like a
    // normal request
  case "findElement":
  case "findChildElement":
    if (hasNoPage()) {
      console.log("Not got a page, but asked for element, so throwing NoSuchElementException");
      sendResponseToParsedRequest({status: 7, value: {message: 'Was not on a page, so could not find elements'}});
      break;
    }
    // Falling through, as if we do have a page, we want to treat this like a
    // normal request
  case "findElements":
  case "findChildElements":
    if (hasNoPage()) {
      console.log("Not got a page, but asked for elements, so returning no elements");
      sendResponseToParsedRequest({status: 0, value: []});
      break;
    }
    // Falling through, as if we do have a page, we want to treat this like a
    // normal request
  case "deleteAllCookies":
  case "deleteCookie":
    if (hasNoPage()) {
      console.log("Not got a page, but asked to delete cookies, so returning ok");
      sendResponseToParsedRequest({status: 0});
      break;
    }
    // Falling through, as if we do have a page, we want to treat this like a
    // normal request
  case "executeScript":
    if (hasNoPage()) {
      console.log("Not got a page, but asked to execute script, so sending error 17");
      sendResponseToParsedRequest({status: 17, value: {message: 'Was not on a page, so could not execute javascript'}});
      break;
    }
    // Falling through, as if we do have a page, we want to treat this like a
    // normal request
  default:
    var sequenceNumber = ChromeDriver.requestSequenceNumber;
    ChromeDriver.requestSequenceNumber++;
    sendMessageOnActivePortAndAlsoKeepTrackOfIt({
      request: request,
      sequenceNumber: sequenceNumber,
      implicitWait: ChromeDriver.implicitWait_
    });
    break;
  }
}

function getScreenshot() {
  chrome.tabs.captureVisibleTab(null, getScreenshotResult);
}

function getScreenshotResult(snapshotDataUrl) {
  var index = snapshotDataUrl.indexOf('base64,');
  if (index == -1) {
    sendResponseToParsedRequest({status: 99}, false);
    return;
  }
  var base64 = snapshotDataUrl.substring(index + 'base64,'.length);
  sendResponseToParsedRequest({status: 0, value: base64}, false);
}

function sendMessageOnActivePortAndAlsoKeepTrackOfIt(message) {
  ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet = message.request;
  try {
    ChromeDriver.activePort.postMessage(message);
  } catch (e) {
    console.log("Tried to send request without an active port.  " +
                "Request will retry when connected, but will hang until then.");
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
  console.log(
      "Received response from content script: " + JSON.stringify(message));
  if (!message || !message.response || !message.response.value ||
      message.response.value.statusCode === undefined ||
      message.response.value.statusCode === null ||
      message.sequenceNumber === undefined || message.sequenceNumber < ChromeDriver.lastReceivedSequenceNumber) {
    // Should only ever happen if we sent a bad request,
    // or the content script is broken
    console.log("Got invalid response from the content script.");
    return;
  }
  var toSend = {status: 12};
  ChromeDriver.lastRequestToBeSentWhichHasntBeenAnsweredYet = null;
  switch (message.response.value.statusCode) {
  // Error codes are loosely based on native exception codes, see
  // common/src/cpp/webdriver-interactions/errorcodes.h
  case 0:
  case 7: //org.openqa.selenium.NoSuchElementException
  case 8: //org.openqa.selenium.NoSuchFrameException
  case 9: //java.lang.UnsupportedOperationException [Unknown command]
  case 10: //org.openqa.selenium.StaleElementReferenceException
  case 11: //org.openqa.selenium.ElementNotVisibleException
  case 12: //java.lang.UnsupportedOperationException [Invalid element state ]
  case 13: //org.openqa.selenium.WebDriverException [Unhandled error]
  case 17: //org.openqa.selenium.WebDriverException [Bad javascript]
  case 19: //org.openqa.selenium.XPathLookupException
  case 23: //org.openqa.selenium.NoSuchWindowException
  case 24: //org.openqa.selenium.InvalidCookieDomainException
  case 25: //org.openqa.selenium.UnableToSetCookieException
  case 99: //org.openqa.selenium.WebDriverException [Native event]
    toSend = {status: message.response.value.statusCode, value: null};
    if (message.response.value !== undefined && message.response.value !== null &&
        message.response.value.value !== undefined) {
      toSend.value = message.response.value.value;
    }
    sendResponseToParsedRequest(toSend, message.response.wait);
    break;
  case "no-op":
    //Some special operation which isn't sending HTTP
    switch (message.response.response) {
    case "clickElement":
      try {
        if (document.embeds[0].clickAt(message.response.value.x, message.response.value.y)) {
          sendResponseToParsedRequest({status: 0}, true);
        } else {
          sendResponseToParsedRequest({status: 99}, true);
        }
      } catch(e) {
        console.log("Error natively clicking.  Trying non-native.");
        ChromeDriver.isBlockedWaitingForResponse = false;
        parseRequest({
          request: 'nonNativeClickElement',
          id: message.response.value.id
        });
      }
      break;
    case "hoverElement":
      try {
        var points = message.response.value;
        if (document.embeds[0].mouseMoveTo(15, points.oldX, points.oldY, points.newX, points.newY)) {
          sendResponseToParsedRequest({status: 0}, true);
        } else {
          sendResponseToParsedRequest({status: 99}, true);
        }
      } catch(e) {
        sendResponseToParsedRequest({status: 99}, true);
      }
      break;
    case "sendKeysToElement":
      try {
        if (document.embeds[0].sendKeys(message.response.value.keys)) {
          sendResponseToParsedRequest({status: 0}, true);
        } else {
          sendResponseToParsedRequest({status: 99}, true);
        }
      } catch(e) {
        console.log("Error natively sending keys.  Trying non-native.");
        ChromeDriver.isBlockedWaitingForResponse = false;
        parseRequest({
          request: 'sendElementNonNativeKeys',
          id: message.response.value.id,
          keys: message.response.value.keys
        });
      }
      break;
    case "sniffForMetaRedirects":
      if (!message.response.value.value &&
          !ChromeDriver.hasSentResponseToThisPageLoading) {
        ChromeDriver.urlBeingLoaded = null;
        ChromeDriver.hasSentResponseToThisPageLoading = true;
        switchToDefaultContent();
      }
      break;
    case "newTabInformation":
      var response = message.response.value;
      for (var tab in ChromeDriver.tabs) {
        //RACE CONDITION!!!
        //This call should happen before another content script
        //connects and returns this value,
        //but if it doesn't, we may get mismatched information
        if (ChromeDriver.tabs[tab].isFrameset === undefined) {
          ChromeDriver.tabs[tab].isFrameset = response.isFrameset;
          return;
        } else {
          for (var frame in ChromeDriver.tabs[tab].frames) {
            var theFrame = ChromeDriver.tabs[tab].frames[frame];
            if (theFrame.isFrameset === undefined) {
              theFrame.isFrameset = response.isFrameset;
              return;
            }
          }
        }
      }
      break;
    case "getFrameNameFromIndex":
      var newName = message.response.value.name;
      if (ChromeDriver.restOfCurrentFramePath.length != 0) {
        newName += "." + ChromeDriver.restOfCurrentFramePath.join(".");
      }
      switchToFrameByName(newName);
      break;
    }
    break;
  }
}

/**
 * If the plugin doesn't currently have an HWND for this page,
 * we need to get one by injecting an embed
 */
function wrapInjectEmbedIfNecessary(requestObject) {
  if (ChromeDriver.hasHwnd) {
    var sequenceNumber = ChromeDriver.requestSequenceNumber;
    ChromeDriver.requestSequenceNumber++;
    return {
      sequenceNumber: sequenceNumber,
      request: requestObject
    };
  } else {
    var wrappedObject = {
      sequenceNumber: ChromeDriver.requestSequenceNumber,
      request: {
        request: "injectEmbed",
        followup: {
          sequenceNumber: ChromeDriver.requestSequenceNumber + 1,
          request: requestObject
        }
      }
    };
    ChromeDriver.requestSequenceNumber += 2;
    return wrappedObject;
  }
}

/**
 * Gets all current window handles
 * @return an array containing all of the current window handles
 */
function getWindowHandles() {
  var windowHandles = [];
  for (var tab in ChromeDriver.tabs) {
    windowHandles.push(ChromeDriver.tabs[tab].windowName);
  }
  return {status: 0, value: windowHandles}
}

function resetActiveTabDetails() {
  ChromeDriver.activePort = null;
  ChromeDriver.hasHwnd = false;
  ChromeDriver.activeTabId = null;
  ChromeDriver.doFocusOnNextOpenedTab = true;
  ChromeDriver.hasSentResponseToThisPageLoading = false;
  ChromeDriver.portToUseForFrameLookups = null;
  ChromeDriver.currentUrl = null;
  resetCurrentlyWaitingOnContentScriptTime();
}

function setActiveTabDetails(tab) {
  ChromeDriver.activeTabId = tab.id;
  ChromeDriver.activeWindowId = tab.windowId;
  ChromeDriver.doFocusOnNextOpenedTab = false;
  ChromeDriver.currentUrl = tab.url;
  resetCurrentlyWaitingOnContentScriptTime();
}

function switchToDefaultContent() {
  ChromeDriver.hasHwnd = false;
  for (var tab in ChromeDriver.tabs) {
    if (ChromeDriver.tabs[tab].tabId == ChromeDriver.activeTabId) {
      if (ChromeDriver.tabs[tab].isFrameset) {
        ChromeDriver.isBlockedWaitingForResponse = false;
        parseRequest({request: 'switchToFrame', id: 0});
      } else {
        ChromeDriver.activePort = ChromeDriver.tabs[tab].mainPort;
        sendResponseToParsedRequest({status: 0}, false);
      }
      return;
    }
  }
}

function switchToFrame(id) {
  ChromeDriver.hasHwnd = false;
  for (var tab in ChromeDriver.tabs) {
    if (ChromeDriver.tabs[tab].tabId == ChromeDriver.activeTabId) {
      ChromeDriver.portToUseForFrameLookups = ChromeDriver.tabs[tab].mainPort;
      break;
    }
  }
  if (typeof id == 'string') {
    switchToFrameByName(id);
  } else if (typeof id == 'number') {
    getFrameNameFromIndex(id);
  } else {
    sendResponseToParsedRequest({
      status: 9,
      value: {
        message: "Switching frames other than by name or id is unsupported"
      }
    });
  }
}

function switchToFrameByName(name) {
  var names = name.split(".");
  
  for (var tab in ChromeDriver.tabs) {
    if (ChromeDriver.tabs[tab].tabId == ChromeDriver.activeTabId) {
      var frame;
      for (frame in ChromeDriver.tabs[tab].frames) {
        // Maybe name was a fully qualified name, which perhaps just happened to
        // include .s
        if (ChromeDriver.tabs[tab].frames[frame].frameName == name) {
          ChromeDriver.activePort =
              ChromeDriver.tabs[tab].frames[frame].framePort;
          ChromeDriver.restOfCurrentFramePath = [];
          sendResponseToParsedRequest({status: 0}, false);
          return;
        }
      }
      for (frame in ChromeDriver.tabs[tab].frames) {
        // Maybe we're looking for a child, see if this is the parent of it
        if (ChromeDriver.tabs[tab].frames[frame].frameName == names[0]) {
          ChromeDriver.activePort =
              ChromeDriver.tabs[tab].frames[frame].framePort;
          ChromeDriver.portToUseForFrameLookups = ChromeDriver.activePort;
          names.shift();
          ChromeDriver.restOfCurrentFramePath = names;
          if (names.length == 0) {
            sendResponseToParsedRequest({status: 0}, false);
            return;
          } else {
            switchToFrameByName(names.join("."));
            return;
          }
        }
      }
    }
  }
  
  //Maybe the "name" was actually an index? Let's find out...
  var index = null;
  try {
    index = parseInt(names[0]);
  } catch (e) {
  }
  if (!isNaN(index)) {
    names.shift();
    ChromeDriver.restOfCurrentFramePath = names;
    getFrameNameFromIndex(index);
    return;
  }

  ChromeDriver.isBlockedWaitingForResponse = false;
  parseRequest({request: 'switchToNamedIFrameIfOneExists', name: name});
}

function getFrameNameFromIndex(index) {
  var message = {
    request: {
      request: "getFrameNameFromIndex",
      index: index
    },
    sequenceNumber: ChromeDriver.requestSequenceNumber
  };
  ChromeDriver.requestSequenceNumber++;
  ChromeDriver.portToUseForFrameLookups.postMessage(message);
}

/**
 * Closes the current tab if it exists, and opens a new one, in which it
 * gets the URL passed
 * @param url the URL to load
 */
function getUrl(url) {
  ChromeDriver.urlBeingLoaded = url;
  var tempActiveTagId = ChromeDriver.activeTabId;
  if (url.indexOf("#") > -1 && ChromeDriver.currentUrl != null &&
      ChromeDriver.currentUrl.split("#")[0] == url.split("#")[0]) {
    ChromeDriver.isGettingUrlButOnlyChangingByFragment = true;
  } else {
    resetActiveTabDetails();
  }
  ChromeDriver.currentUrl = url;
  if (tempActiveTagId == null) {
    chrome.tabs.create({url: url, selected: true}, getUrlCallback);
  } else {
    ChromeDriver.activeTabId = tempActiveTagId;
    if (ChromeDriver.isGettingUrlButOnlyChangingByFragment) {
      chrome.tabs.update(ChromeDriver.activeTabId, {url: url, selected: true},
          getUrlCallback);
    } else {
      // we need to create the new tab before deleting the old one
      // in order to avoid hanging on OS X
      var oldId = ChromeDriver.activeTabId;
      resetActiveTabDetails();
      chrome.tabs.create({url: url, selected: true}, getUrlCallback);
      chrome.tabs.remove(oldId);
    }
  }
}

function getUrlCallback(tab) {
  if (chrome.extension.lastError) {
    // An error probably arose because Chrome didn't have a window yet
    // (see crbug.com 19846)
    // If we retry, we *should* be fine. Unless something really bad is
    // happening, in which case we will probably hang indefinitely trying to
    // reload the same URL
    getUrl(ChromeDriver.urlBeingLoaded);
    return;
  }
  if (tab == null) {
    //chrome.tabs.update's callback doesn't pass a Tab argument,
    //so we need to populate it ourselves
    chrome.tabs.get(ChromeDriver.activeTabId, getUrlCallback);
    return;
  }
  if (tab.status != "complete") {
    // Use the helper calback so that we actually get updated version of the tab
    // we're getting
    setTimeout("getUrlCallbackById(" + tab.id + ")", 10);
  } else {
    ChromeDriver.getUrlRequestSequenceNumber++;
    if (ChromeDriver.activePort == null) {
      if (ChromeDriver.currentlyWaitingUntilGiveUpOnContentScriptLoading <= 0) {
        ChromeDriver.hasNoConnectionToPage = true;
        sendEmptyResponseWhenTabIsLoaded(tab);
      } else {
        ChromeDriver.currentlyWaitingUntilGiveUpOnContentScriptLoading -=
          ChromeDriver.waitForContentScriptIncrement;
        setTimeout("getUrlCallbackById(" + tab.id + ")", ChromeDriver.waitForContentScriptIncrement);
        return;
      }
    }
    setActiveTabDetails(tab);
  }
  if (ChromeDriver.isGettingUrlButOnlyChangingByFragment) {
    ChromeDriver.urlBeingLoaded = null;
    resetCurrentlyWaitingOnContentScriptTime();
    sendResponseToParsedRequest({status: 0}, false);
    ChromeDriver.isGettingUrlButOnlyChangingByFragment = false;
  }
}

function getUrlCallbackById(tabId) {
  chrome.tabs.get(tabId, getUrlCallback);
}

function sendEmptyResponseWhenTabIsLoaded(tab) {
  if (tab.status == "complete") {
    if (ChromeDriver.activePort) {
      ChromeDriver.isBlockedWaitingForResponse = false;
      parseRequest({request: 'sniffForMetaRedirects'});
    } else {
      if (!ChromeDriver.hasSentResponseToThisPageLoading) {
        ChromeDriver.urlBeingLoaded = null;
        sendResponseToParsedRequest({status: 0}, false);
      }
    }
  } else {
    chrome.tabs.get(tab.id, sendEmptyResponseWhenTabIsLoaded);
  }
}
      

function setExtensionBusyIndicator(busy) {
  if (busy) {
    chrome.browserAction.setIcon({path: "icons/busy.png"})
  } else {
    chrome.browserAction.setIcon({path: "icons/free.png"})
  }
}

function setActivePortByWindowName(handle) {
  for (var tab in ChromeDriver.tabs) {
    if (ChromeDriver.tabs[tab].windowName == handle || 
        ChromeDriver.tabs[tab].mainPort.name == handle ||
        ChromeDriver.tabs[tab].tabId.toString() == handle) {
      ChromeDriver.activePort = ChromeDriver.tabs[tab].mainPort;
      chrome.tabs.get(ChromeDriver.tabs[tab].tabId, setActiveTabDetails);
      chrome.tabs.update(ChromeDriver.tabs[tab].tabId, {selected: true});
      sendResponseToParsedRequest({status: 0}, false);
      return;
    }
  }
  sendResponseToParsedRequest({status: 23, value: {message: 'Could not find window to switch to by handle: ' + handle}}, false);
}


/**
 * @return {boolean} Whether there is currently no active page.
 */
function hasNoPage() {
  return ChromeDriver.hasNoConnectionToPage ||
         ChromeDriver.activePort == null ||
         ChromeDriver.activeTabId == null;
}

function resetCurrentlyWaitingOnContentScriptTime() {
  console.log('resetting current content script wait time');
  ChromeDriver.currentlyWaitingUntilGiveUpOnContentScriptLoading =
      ChromeDriver.timeoutUntilGiveUpOnContentScriptLoading;
}
