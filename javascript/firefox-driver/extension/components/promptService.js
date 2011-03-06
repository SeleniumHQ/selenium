// Spoof the prompt service. Interesting thread on mozillazine:
// http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg00193.html

const CC = Components.classes;
const CI = Components.interfaces;

// Spoof implementation
function DrivenPromptService() {
  Components.utils.import('resource://fxdriver/modules/utils.js');

  // as defined in nsPromptService.h: used in firefox 3.x
  var NSPROMPTSERVICE_CID = "{A2112D6A-0E28-421f-B46A-25C0B308CBD0}";
  // as defined in nsPrompter.js: used in firefox 4.x
  var NSPROMPTER_CID = "{7ad1b327-6dfa-46ec-9234-f2a620ea7e00}";

  // Keep a reference to the original service
  if (Components.classesByID[NSPROMPTSERVICE_CID]) {
    Logger.dumpn("Locating original service using Firefox 3.x CID");
    var originalService = Components.classesByID[NSPROMPTSERVICE_CID].getService();
    this.originalPromptService_ =
        originalService.QueryInterface(CI.nsIPromptService2);
  } else if (Components.classesByID[NSPROMPTER_CID]) {
    Logger.dumpn("Locating original service using Firefox 4.x CID");
    this.originalPromptService_ = Components.classesByID[NSPROMPTER_CID].getService().QueryInterface(CI.nsIPromptService2);
  } else {
    Logger.dumpn("Unable to locate original prompt service");
  }

  Logger.dumpn("Spoofing prompt service");
}

// Constants from nsIPromtService.idl
DrivenPromptService.prototype = {
  BUTTON_POS_0: 1,
  BUTTON_POS_1: 256,
  BUTTON_POS_2: 65536,

  // Button Title Flags (used to set the labels of buttons in the prompt)
  BUTTON_TITLE_OK: 1,
  BUTTON_TITLE_CANCEL: 2,
  BUTTON_TITLE_YES: 3,
  BUTTON_TITLE_NO: 4,
  BUTTON_TITLE_SAVE: 5,
  BUTTON_TITLE_DONT_SAVE: 6,
  BUTTON_TITLE_REVERT: 7,
  BUTTON_TITLE_IS_STRING: 127,

  // Button Default Flags (used to select which button is the default one)
  BUTTON_POS_0_DEFAULT: 0,
  BUTTON_POS_1_DEFAULT: 16777216,
  BUTTON_POS_2_DEFAULT: 33554432,

  // Causes the buttons to be initially disabled.  They are enabled after a
  // timeout expires.  The implementation may interpret this loosely as the
  // intent is to ensure that the user does not click through a security dialog
  // too quickly.  Strictly speaking, the implementation could choose to ignore
  // this flag.
  BUTTON_DELAY_ENABLE: 67108864,

  // Selects the standard set of OK/Cancel buttons.
  STD_OK_CANCEL_BUTTONS: (this.BUTTON_TITLE_OK * this.BUTTON_POS_0) + (this.BUTTON_TITLE_CANCEL
      * this.BUTTON_POS_1),

  // Selects the standard set of Yes/No buttons.
  STD_YES_NO_BUTTONS: (this.BUTTON_TITLE_YES * this.BUTTON_POS_0) + (this.BUTTON_TITLE_NO
      * this.BUTTON_POS_1)
};

DrivenPromptService.prototype.findAssociatedDriver_ = function(window) {
  var ww = CC["@mozilla.org/embedcomp/window-watcher;1"].getService(CI["nsIWindowWatcher"]);

  var parent = window ? window : ww.activeWindow;
  if (parent.wrappedJSObject) {
    parent = parent.wrappedJSObject;
  }
  var top = parent.top;

  // Now iterate over all open browsers to find the one we belong to
  var wm = CC["@mozilla.org/appshell/window-mediator;1"].getService(CI["nsIWindowMediator"]);
  var allWindows = wm.getEnumerator("navigator:browser");
  while (allWindows.hasMoreElements()) {
    var chrome = allWindows.getNext().QueryInterface(CI.nsIDOMWindow);
    if (chrome.content == window) {
      return chrome.fxdriver;
    }
  }

  // There's no meaningful way we can reach this.
  Logger.dumpn('Unable to find the associated driver');
  return undefined;
};

DrivenPromptService.prototype.signalOpenModal_ = function(parent, text) {
  // Try to grab the top level window
  var driver = this.findAssociatedDriver_(parent);

  if (driver && driver.response_) {
    webdriver.modals.setFlag(driver, text);

    var res = driver.response_;
    res.value = {
      text: text
    };
    res.statusCode = ErrorCode.MODAL_DIALOG_OPENED;
    res.send();
  }
};

DrivenPromptService.prototype.alert = function(aParent, aDialogTitle, aText) {
  Logger.dumpn("calling alert");
  this.signalOpenModal_(aParent, aText);

  return this.originalPromptService_.alert(aParent, aDialogTitle, aText);
};

DrivenPromptService.prototype.alertCheck =
function(aParent, aDialogTitle, aText, aCheckMsg, aCheckState) {
  this.signalOpenModal_(aParent, aText);

  return this.originalPromptService_.alertCheck(aParent, aDialogTitle, aText, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.confirm = function(aParent, aDialogTitle, aText) {
  this.signalOpenModal_(aParent, aText);

  return this.originalPromptService_.confirm(aParent, aDialogTitle, aText);
};

DrivenPromptService.prototype.confirmCheck =
function(aParent, aDialogTitle, aText, aCheckMsg, aCheckState) {
  this.signalOpenModal_(aParent, aText);

  return this.originalPromptService_.confirmCheck(aParent, aDialogTitle, aText, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.confirmEx =
function(aParent, aDialogTitle, aText, aButtonFlags, aButton0Title, aButton1Title, aButton2Title, aCheckMsg, aCheckState) {
  this.signalOpenModal_(aParent, aText);

  return this.originalPromptService_.confirmEx(aParent, aDialogTitle, aText, aButtonFlags, aButton0Title, aButton1Title, aButton2Title, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.prompt =
function(aParent, aDialogTitle, aText, aValue, aCheckMsg, aCheckState) {
  this.signalOpenModal_(aParent, aText);
  return this.originalPromptService_.prompt(aParent, aDialogTitle, aText, aValue, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.promptUsernameAndPassword =
function(aParent, aDialogTitle, aText, aUsername, aPassword, aCheckMsg, aCheckState) {
  return this.originalPromptService_.promptUsernameAndPassword(aParent, aDialogTitle, aText, aUsername, aPassword, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.promptPassword =
function(aParent, aDialogTitle, aText, aPassword, aCheckMsg, aCheckState) {
  return this.originalPromptService_.promptPassword(aParent, aDialogTitle, aText, aPassword, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.select =
function(aParent, aDialogTitle, aText, aCount, aSelectList, aOutSelection) {
  return this.originalPromptService_.select(aParent, aDialogTitle, aText, aCount, aSelectList, aOutSelection);
};


// nsIPromptService2 functions
DrivenPromptService.prototype.promptAuth = function(aParent, aChannel, level, authInfo, checkboxLabel, checkValue) {
  this.signalOpenModal_(aParent, aText);
  return this.originalPromptService_.promptAuth(aParent, aChannel, level, authInfo, checkboxLabel, checkValue);
};

DrivenPromptService.prototype.asyncPromptAuth = function(aParent, aChannel, aCallback, aContext, level, authInfo, checkboxLabel,checkValue) {
  return this.originalPromptService_.asyncPromptAuth(aParent, aChannel, aCallback, aContext, level, authInfo, checkboxLabel,checkValue)
};

// nsIObserver
DrivenPromptService.prototype.observe = function(aSubject, aTopic, aData) {
  Logger.dumpn("Prompt service observing: " + aSubject);
  return this.originalPromptService_.observe(aSubject, aTopic, aData);
}


DrivenPromptService.prototype.QueryInterface = function(iid) {
  var supported = function(toCheck, iid, possibleMatch) {
    if (!iid.equals(possibleMatch)) {
      return false;
    }

    try {
      toCheck.QueryInterface(possibleMatch);
      return true;
    } catch (ignored) {
      return false;
    }
  };

  var matched = false;
  matched |= supported(this.originalPromptService_, iid, CI.nsIObserver);
  matched |= supported(this.originalPromptService_, iid, CI.nsIPromptService);
  matched |= supported(this.originalPromptService_, iid, CI.nsIPromptService2);
  matched |= supported(this.originalPromptService_, iid, CI.nsISupports);

  if (matched) {
    return this;
  }

  Logger.dumpn("Asked to cast to unknown iid: " + iid);
  throw Components.results.NS_ERROR_NO_INTERFACE;
};

const PROMPT_CONTRACT_ID = "@mozilla.org/embedcomp/prompt-service;1";
// This is defined by us
const DRIVEN_PROMPT_SERVICE_CLASS_ID = Components.ID('{e26dbdcd-d3ba-4ded-88c3-6cb07ee3e9e0}');

var service = undefined;

var PromptServiceSpoofFactory = {
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (service == undefined) {
      service = new DrivenPromptService();
    }
    return service;
  }
};

function PromptServiceSpoofModule() {
  this.firstTime_ = true;
}

PromptServiceSpoofModule.prototype.registerSelf = function(aCompMgr, aFileSpec, aLocation, aType) {
  if (this.firstTime_) {
    this.firstTime_ = false;
    throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
  }
  aCompMgr = aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
  aCompMgr.registerFactoryLocation(
      DRIVEN_PROMPT_SERVICE_CLASS_ID, "Driven prompt service", PROMPT_CONTRACT_ID, aFileSpec, aLocation, aType);
};

PromptServiceSpoofModule.prototype.unregisterSelf = function(aCompMgr, aLocation, aType) {
  Logger.dumpn("Unregistering\n");
  aCompMgr =
  aCompMgr.QueryInterface(CI.nsIComponentRegistrar);
  aCompMgr.unregisterFactoryLocation(DRIVEN_PROMPT_SERVICE_CLASS_ID, aLocation);
};

PromptServiceSpoofModule.prototype.getClassObject = function(aCompMgr, aCID, aIID) {
  if (!aIID.equals(Components.interfaces.nsIFactory))
    throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

  if (aCID.equals(DRIVEN_PROMPT_SERVICE_CLASS_ID))
    return PromptServiceSpoofFactory;

  throw Components.results.NS_ERROR_NO_INTERFACE;
};

PromptServiceSpoofModule.prototype.canUnload = function(aCompMgr) {
  return true;
};

function NSGetModule(comMgr, fileSpec) {
  return new PromptServiceSpoofModule();
}

DrivenPromptService.prototype.classID = DRIVEN_PROMPT_SERVICE_CLASS_ID;
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
if (XPCOMUtils.generateNSGetFactory) {
  const NSGetFactory = XPCOMUtils.generateNSGetFactory([DrivenPromptService]);
}
