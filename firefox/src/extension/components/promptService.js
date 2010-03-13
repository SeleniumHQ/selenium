// Spoof the prompt service. Interesting thread on mozillazine:
// http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg00193.html

const CC = Components.classes;
const CI = Components.interfaces;

const CONSOLE = CC["@mozilla.org/consoleservice;1"].getService(CI["nsIConsoleService"]);

function dumpn(message) {
  try {
    CONSOLE.logStringMessage(message + "\n");
  } catch (e) {
    dump(message + "\n");
  }
}

// Spoof implementation
function DrivenPromptService() {
  // as defined in nsPromptService.h
  var ORIGINAL_PARENT_SERVICE_ID = "{A2112D6A-0E28-421f-B46A-25C0B308CBD0}";

  // Keep a reference to the original service
  var originalService = Components.classesByID[ORIGINAL_PARENT_SERVICE_ID].getService();

  this.originalPromptService_ =
  originalService.QueryInterface(Components.interfaces.nsIPromptService);

  dumpn("Spoofing prompt service");
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

  // There might be an easy answer.
  var win = ww.getChromeForWindow(window);
  if (win) {
    return win;
  }

  // There isn't. Grab the top window's default view
  var parent = window ? window : ww.activeWindow;
  if (parent.wrappedJSObject)
    parent = parent.wrappedJSObject;
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
  return undefined;
};

DrivenPromptService.prototype.alert = function(aParent, aDialogTitle, aText) {
  // Try to grab the top level window
  var driver = this.findAssociatedDriver_(aParent);

  if (driver && driver.response_) {
    var res = driver.response_;
    res.value = {
      title: aDialogTitle,
      text: aText,
      __webdriverType: 'alert'
    };
    res.send();
  } else {
    // TODO(simon): we should prevent the next command from blocking.
  }

  return this.originalPromptService_.alert(aParent, aDialogTitle, aText);
};

DrivenPromptService.prototype.alertCheck =
function(aParent, aDialogTitle, aText, aCheckMsg, aCheckState) {
  return this.originalPromptService_.alertCheck(aParent, aDialogTitle, aText, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.confirm = function(aParent, aDialogTitle, aText) {
  return this.originalPromptService_.confirm(aParent, aDialogTitle, aText);
};

DrivenPromptService.prototype.confirmCheck =
function(aParent, aDialogTitle, aText, aCheckMsg, aCheckState) {
  return this.originalPromptService_.confirmCheck(aParent, aDialogTitle, aText, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.confirmEx =
function(aParent, aDialogTitle, aText, aButtonFlags, aButton0Title, aButton1Title, aButton2Title, aCheckMsg, aCheckState) {
  return this.originalPromptService_.confirmEx(aParent, aDialogTitle, aText, aButtonFlags, aButton0Title, aButton1Title, aButton2Title, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.prompt =
function(aParent, aDialogTitle, aText, aValue, aCheckMsg, aCheckState) {
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

const PROMPT_CONTRACT_ID = "@mozilla.org/embedcomp/prompt-service;1";
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
  aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
  aCompMgr.registerFactoryLocation(
      DRIVEN_PROMPT_SERVICE_CLASS_ID, "Driven prompt service", PROMPT_CONTRACT_ID, aFileSpec, aLocation, aType);
};

PromptServiceSpoofModule.prototype.unregisterSelf = function(aCompMgr, aLocation, aType) {
  dumpn("Unregistering\n");
  aCompMgr =
  aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
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
