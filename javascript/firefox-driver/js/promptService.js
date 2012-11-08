// Spoof the prompt service. Interesting thread on mozillazine:
// http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg00193.html

goog.require('fxdriver.logging');
goog.require('fxdriver.modals');
goog.require('fxdriver.moz');
goog.require('goog.array');


var EXCLUDED_NAMES = [
  'QueryInterface',
  'alert',
  'alertCheck',
  'confirm',
  'confirmCheck',
  'confirmEx',
  'getPrompt',
  'prompt',
  'promptPassword',
  'promptUsernameAndPassword',
  'select'
];

function addInterfaces(to, delegate, interfaces) {
  goog.array.forEach(interfaces, function(iid) {
    try {
      var queried = delegate.QueryInterface(iid);
      for (var i in queried) {
        if (!goog.array.contains(EXCLUDED_NAMES, i.toString())) {
          to[i] = queried[i];
        }
      }
    } catch (ignored) {}
  });
}

// Implementation of nsIPrompt
function ObservingAlert(parentWindow, delegate) {
  this.parentWindow_ = parentWindow;

  var interfaces = [CI.nsIPrompt, CI.nsIAuthPrompt, CI.nsIAuthPrompt2, CI.nsIWritablePropertyBag2];

  addInterfaces(this, delegate, interfaces);

  this.delegate_ = delegate;
  this.QueryInterface = fxdriver.moz.queryInterface(this, interfaces);
}

ObservingAlert.prototype.alert = function(dialogTitle, text) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  this.delegate_.alert(dialogTitle, text);
};

ObservingAlert.prototype.alertCheck = function(dialogTitle, text, checkMsg, checkValue) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  this.delegate_.alertCheck(dialogTitle, text, checkMsg, checkValue);
};

ObservingAlert.prototype.confirm = function(dialogTitle, text) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  return this.delegate_.confirm(dialogTitle, text);
};

ObservingAlert.prototype.confirmCheck = function(dialogTitle, text, checkMsg, checkValue) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  return this.delegate_.confirmCheck(dialogTitle, text, checkMsg, checkValue);
};

ObservingAlert.prototype.confirmEx = function(dialogTitle, text,
    buttonFlags, button0Title, button1Title, button2Title,
    checkMsg, checkValue) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  return this.delegate_.confirmEx(dialogTitle, text,
      buttonFlags, button0Title, button1Title, button2Title,
      checkMsg, checkValue);
};

ObservingAlert.prototype.prompt = function(dialogTitle, text, value, checkMsg, checkValue) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  return this.delegate_.prompt(dialogTitle, text, value, checkMsg, checkValue);
};

ObservingAlert.prototype.promptPassword = function(dialogTitle, text, password, checkMsg, checkValue) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);
  return this.delegate_.promptPassword(dialogTitle, text, password, checkMsg, checkValue);
};

ObservingAlert.prototype.promptUsernameAndPassword = function(dialogTitle, text, username, password, checkMsg, checkValue) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);

  return this.delegate_.promptUsernameAndPassword(dialogTitle, text, username, password, checkMsg, checkValue);
};

ObservingAlert.prototype.select = function(dialogTitle, text, count, selectList, outSelection) {
  fxdriver.modals.signalOpenModal(this.parentWindow_, text);

  return this.delegate_.select(dialogTitle, text, count, selectList, outSelection);
};


// Spoof implementation
function DrivenPromptService() {
  fxdriver.logging.info('Spoofing prompt service');

  // @mozilla.org/prompter;1
  var prompters = [
    '{1c978d25-b37f-43a8-a2d6-0c7a239ead87}' // nsPrompter.js: Firefox 4 late betas onwards
  ];

  // @mozilla.org/embedcomp/prompt-service;
  var promptServices = [
    '{7ad1b327-6dfa-46ec-9234-f2a620ea7e00}', // nsPrompter.js: Firefox 4 betas
    '{A2112D6A-0E28-421f-B46A-25C0B308CBD0}'  // nsPromptService.h: Firefox 3.x
  ];

  var findImplementation = function(interfaceName, cids) {
    for (var i = 0; i < cids.length; i++) {
      var impl = Components.classesByID[cids[i]];
      if (!impl) { continue; }

      var service = impl.getService();
      if (!service) { continue; }

      try {
        var toReturn = service.QueryInterface(interfaceName);
        fxdriver.logging.info('Found implementation at: ' + cids[i]);
        return toReturn;
      } catch (ignored) {}
    }

    return null;
  };

  // Keep a reference to the original service. Check for the most recent version of Firefox first
  var originalPromptService_ = findImplementation(CI.nsIPromptService2, promptServices);
  var originalPrompter_ = findImplementation(CI.nsIPromptFactory, prompters);

  if (!originalPromptService_) {
    fxdriver.logging.info('Unable to locate original prompt service');
  }

  if (!originalPrompter_) {
    fxdriver.logging.info('Unable to locate original prompter');
  }

  this.delegate_ = originalPrompter_ ? originalPrompter_ : originalPromptService_;

  var interfaces = [CI.nsIPromptFactory, CI.nsIPromptService, CI.nsIPromptService2];
  addInterfaces(this, this.delegate_, interfaces);

  this.QueryInterface = fxdriver.moz.queryInterface(this,
    [CI.nsIPromptFactory, CI.nsIPromptService, CI.nsIPromptService2]);

  fxdriver.logging.info('Finished initializing spoofed prompt service');
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


DrivenPromptService.prototype.alert = function(aParent, aDialogTitle, aText) {
  fxdriver.modals.signalOpenModal(aParent, aText);

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.alert(aParent, aDialogTitle, aText);
};

DrivenPromptService.prototype.alertCheck =
function(aParent, aDialogTitle, aText, aCheckMsg, aCheckState) {
  fxdriver.modals.signalOpenModal(aParent, aText);

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.alertCheck(aParent, aDialogTitle, aText, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.confirm = function(aParent, aDialogTitle, aText) {
  fxdriver.modals.signalOpenModal(aParent, aText);

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.confirm(aParent, aDialogTitle, aText);
};

DrivenPromptService.prototype.confirmCheck =
function(aParent, aDialogTitle, aText, aCheckMsg, aCheckState) {
  fxdriver.modals.signalOpenModal(aParent, aText);

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.confirmCheck(aParent, aDialogTitle, aText, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.confirmEx =
function(aParent, aDialogTitle, aText, aButtonFlags, aButton0Title, aButton1Title, aButton2Title, aCheckMsg, aCheckState) {
  fxdriver.modals.signalOpenModal(aParent, aText);

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.confirmEx(aParent, aDialogTitle, aText, aButtonFlags, aButton0Title, aButton1Title, aButton2Title, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.prompt =
function(aParent, aDialogTitle, aText, aValue, aCheckMsg, aCheckState) {
  fxdriver.modals.signalOpenModal(aParent, aText);

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.prompt(aParent, aDialogTitle, aText, aValue, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.promptUsernameAndPassword =
function(aParent, aDialogTitle, aText, aUsername, aPassword, aCheckMsg, aCheckState) {
  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.promptUsernameAndPassword(aParent, aDialogTitle, aText, aUsername, aPassword, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.promptPassword =
function(aParent, aDialogTitle, aText, aPassword, aCheckMsg, aCheckState) {
  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.promptPassword(aParent, aDialogTitle, aText, aPassword, aCheckMsg, aCheckState);
};

DrivenPromptService.prototype.select =
function(aParent, aDialogTitle, aText, aCount, aSelectList, aOutSelection) {
  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.select(aParent, aDialogTitle, aText, aCount, aSelectList, aOutSelection);
};


// nsIPromptService2 functions
DrivenPromptService.prototype.promptAuth = function(aParent, aChannel, level, authInfo, checkboxLabel, checkValue) {
  fxdriver.modals.signalOpenModal(aParent, '');

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.promptAuth(aParent, aChannel, level, authInfo, checkboxLabel, checkValue);
};

DrivenPromptService.prototype.asyncPromptAuth = function(aParent, aChannel, aCallback, aContext, level, authInfo, checkboxLabel,checkValue) {
  fxdriver.modals.signalOpenModal(aParent, '');

  var service = this.delegate_.QueryInterface(CI.nsIPromptService2);
  return service.asyncPromptAuth(aParent, aChannel, aCallback, aContext, level, authInfo, checkboxLabel, checkValue);
};


// nsIPromptFactory
DrivenPromptService.prototype.getPrompt = function(domWin, iid) {
  var factory = this.delegate_.QueryInterface(CI.nsIPromptFactory);
  var rawPrompt = factory.getPrompt(domWin, iid);

  return new ObservingAlert(domWin, rawPrompt);
};

// nsIObserver
DrivenPromptService.prototype.observe = function(aSubject, aTopic, aData) {
  return this.delegate_.observe(aSubject, aTopic, aData);
};


/** @const */ var PROMPT_SERVICE_CONTRACT_ID = '@mozilla.org/embedcomp/prompt-service;1';
/** @const */ var PROMPTER_CONTRACT_ID = '@mozilla.org/prompter;1';

// This is defined by us
/** @const */ var DRIVEN_PROMPT_SERVICE_CLASS_ID = Components.ID('{e26dbdcd-d3ba-4ded-88c3-6cb07ee3e9e0}');

var service = undefined;

var PromptServiceSpoofFactory = {
  createInstance: function(aOuter, aIID) {
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
      DRIVEN_PROMPT_SERVICE_CLASS_ID, 'Driven prompt service', PROMPT_SERVICE_CONTRACT_ID, aFileSpec, aLocation, aType);
  aCompMgr.registerFactoryLocation(
      DRIVEN_PROMPT_SERVICE_CLASS_ID, 'Driven prompter service', PROMPTER_CONTRACT_ID, aFileSpec, aLocation, aType);
};

PromptServiceSpoofModule.prototype.unregisterSelf = function(aCompMgr, aLocation, aType) {
  fxdriver.logging.info('Unregistering\n');
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

NSGetModule = function(comMgr, fileSpec) {
  return new PromptServiceSpoofModule();
};

DrivenPromptService.prototype.classID = DRIVEN_PROMPT_SERVICE_CLASS_ID;
fxdriver.moz.load('resource://gre/modules/XPCOMUtils.jsm');
if (XPCOMUtils.generateNSGetFactory) {
  /** @const */ NSGetFactory = XPCOMUtils.generateNSGetFactory([DrivenPromptService]);
}
