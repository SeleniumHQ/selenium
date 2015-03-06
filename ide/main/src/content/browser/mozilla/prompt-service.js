/*
  Encapsulate the low level calls into a service that is functionally useful and avoids use of cryptic numbers
 */
var PromptService = (function() {
  function PromptService() {
  }

  PromptService.prototype.svc = function() {
    if (!this._svc) {
      this._svc = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

      this.saveFlags = this._svc.BUTTON_TITLE_SAVE * this._svc.BUTTON_POS_0 +
                       this._svc.BUTTON_TITLE_CANCEL * this._svc.BUTTON_POS_1 +
                       this._svc.BUTTON_TITLE_DONT_SAVE * this._svc.BUTTON_POS_2;

      this.yesNoFlags = this._svc.BUTTON_TITLE_YES * this._svc.BUTTON_POS_0 +
                        this._svc.BUTTON_TITLE_NO * this._svc.BUTTON_POS_1;

      this.yesNoCancelFlags = this._svc.BUTTON_TITLE_YES * this._svc.BUTTON_POS_0 +
                              this._svc.BUTTON_TITLE_CANCEL * this._svc.BUTTON_POS_1 +
                              this._svc.BUTTON_TITLE_NO * this._svc.BUTTON_POS_2;
    }
    return this._svc;
  };

  PromptService.prototype.save = function(prompt, title) {
    title = title || "Save?";
    var btn = this.svc().confirmEx(window, title, prompt, this.saveFlags, null, null, null, null, {});
    return {
      save: btn == 0,
      cancel: btn == 1,
      dontSave: btn == 2
    };
  };

  PromptService.prototype.yesNo = function(prompt, title) {
    var btn = this.svc().confirmEx(window, title, prompt, this.yesNoFlags, null, null, null, null, {});
    return {
      yes: btn == 0,
      no: btn == 1
    };
  };

  PromptService.prototype.yesNoCancel = function(prompt, title) {
    var btn = this.svc().confirmEx(window, title, prompt, this.yesNoCancelFlags, null, null, null, null, {});
    return {
      yes: btn == 0,
      no: btn == 2,
      cancel: btn == 1
    };
  };

  return new PromptService();
})();
