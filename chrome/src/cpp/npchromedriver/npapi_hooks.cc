#include "npapi_hooks.h"

#include "stubs.h"

#include "webkit/glue/plugins/nphostapi.h"

#include "interactions.h"

#include <stdio.h>

static const char *kMainMime = "application/x-chromedriver";
static const char *kReporterMime = "application/x-chromedriver-reporter";
static const wchar_t *kDesiredClassName = L"Chrome_RenderWidgetHostHWND";
static const size_t kMaxWindowDepth = 10;

//These are per browser instance,
//i.e. from when the first Chrome process is launched until the last is closed
//so can be kept throughout
static NPNetscapeFuncs *browser_funcs_ = NULL;
static NPPluginFuncs *plugin_funcs_ = NULL;

static NPP current_reporter_instance_ = NULL;
static WINDOW_HANDLE window_handle_ = NULL;

bool isSendKeysCommand(const char *command_name) {
  return !strcmp(command_name, kSendKeysJavascriptCommand);
}

bool isClickCommand(const char *command_name) {
  return !strcmp(command_name, kClickJavascriptCommand);
}

bool isMouseMoveCommand(const char *command_name) {
  return !strcmp(command_name, kMouseMoveJavascriptCommand );
}

wchar_t *utf8ToWChar(const char *utf8, size_t len) {
#if defined(OS_WIN)
  wchar_t *value = new wchar_t[len + 1];
  int r = MultiByteToWideChar(CP_UTF8,
                              0,
                              utf8,
                              len,
                              value,
                              len + 1);
  value[r] = 0; //MultiByteToWideChar claims to null-terminate, but doesn't
  return value;
#endif
}

NPError NewInstance(NPMIMEType pluginType,
                    NPP instance,
                    uint16 mode,
                    int16 argc,
                    char *argn[],
                    char *argv[],
                    NPSavedData *saved) {
  if (!strcmp(pluginType, kReporterMime)) {
    current_reporter_instance_ = instance;
  }
  return NPERR_NO_ERROR;
}

static void GetChromeRenderWindow(WINDOW_HANDLE window) {
#if defined(OS_WIN)
  HWND handle = (HWND)window;
  wchar_t *window_class_name = new wchar_t[wcslen(kDesiredClassName) + 1];
  
  for (size_t i = 0; i < kMaxWindowDepth && handle != 0; ++i) {
    GetClassName(handle, window_class_name, wcslen(kDesiredClassName) + 1);
    if (!wmemcmp(window_class_name, kDesiredClassName, wcslen(kDesiredClassName))) {
      break;
    }
    handle = GetParent(handle);
  }
  delete[] window_class_name;
  window_handle_ = handle;
#endif
}

NPError SetWindow(NPP instance, NPWindow *window) {
  if (window->window != NULL && current_reporter_instance_ == instance) {
    GetChromeRenderWindow(window->window);
  }
  return NPERR_NO_ERROR;
}

bool HasJavascriptMethod(NPObject *npobj, NPIdentifier name) {
  const char *method = browser_funcs_->utf8fromidentifier(name);
  return (isSendKeysCommand(method) || isClickCommand(method) ||
      isMouseMoveCommand(method));
}

bool CallMethod(const char *name, const uint32_t argCount, const NPVariant *args) {
  if (window_handle_ == NULL) {
    return false;
  }
  if (isSendKeysCommand(name) && argCount == 1 &&
      args[0].type == NPVariantType_String) {
    wchar_t *val = utf8ToWChar(args[0].value.stringValue.UTF8Characters,
                               args[0].value.stringValue.UTF8Length);
    sendKeys(window_handle_, val, 10);
    delete[] val;
    return true;
  } else if (isClickCommand(name) && argCount == 2 &&
      args[0].type == NPVariantType_Int32 &&
      args[1].type == NPVariantType_Int32) {
    clickAt(window_handle_, args[0].value.intValue, args[1].value.intValue);
    return true;
  } else if (isMouseMoveCommand(name) && argCount == 5 &&
      args[0].type == NPVariantType_Int32 &&
      args[1].type == NPVariantType_Int32 &&
      args[2].type == NPVariantType_Int32 &&
      args[3].type == NPVariantType_Int32 &&
      args[4].type == NPVariantType_Int32) {
    mouseMoveTo(window_handle_, args[0].value.intValue, args[1].value.intValue,
        args[2].value.intValue, args[3].value.intValue, args[4].value.intValue);
    return true;
  }
  return false;
}

bool InvokeJavascript(NPObject *npobj,
                      NPIdentifier name,
                      const NPVariant *args,
                      uint32_t argCount,
                      NPVariant *result) {
  const char *method = browser_funcs_->utf8fromidentifier(name);
  result->type = NPVariantType_Bool;
  bool success = CallMethod(method, argCount, args);
  result->value.boolValue = success;
  return success;
}

static NPClass JavascriptListener_NPClass = {
  NP_CLASS_STRUCT_VERSION_CTOR,
  StubAllocate,
  StubDeallocate,
  StubInvalidate,
  HasJavascriptMethod,
  InvokeJavascript,
  StubInvokeDefault,
  StubHasProperty,
  StubGetProperty,
  StubSetProperty,
  StubRemoveProperty,
  StubEnumerate,
  StubConstruct
}; //NPClass JavascriptListener_NPClass

NPError GetValue(NPP instance, NPPVariable variable, void *value) {
  switch (variable) {
    case NPPVpluginScriptableNPObject: {
      NPObject *listener = (NPObject *)browser_funcs_->
          createobject(instance, &JavascriptListener_NPClass);
      *((NPObject **)value) = listener;
      break;
    }
    default: {
      return NPERR_INVALID_PARAM;
    }
  }
  return NPERR_NO_ERROR;
}

static NPError SetupPluginFuncs(NPPluginFuncs *plugin_funcs) {
  if (plugin_funcs_ != NULL) {
    return NPERR_INVALID_FUNCTABLE_ERROR;
  }
  plugin_funcs_ = plugin_funcs;
  
  plugin_funcs->newp = NewInstance;
  plugin_funcs->destroy = StubDestroy;
  plugin_funcs->setwindow = SetWindow;
  plugin_funcs->newstream = StubNewStream;
  plugin_funcs->destroystream = StubDestroyStream;
  plugin_funcs->asfile = StubStreamAsFile;
  plugin_funcs->writeready = StubWriteReady;
  plugin_funcs->write = StubWrite;
  plugin_funcs->print = StubPrint;
  plugin_funcs->event = StubHandleEvent;
  plugin_funcs->urlnotify = StubURLNotify;
  plugin_funcs->getvalue = GetValue;
  plugin_funcs->setvalue = StubSetValue;
  
  return NPERR_NO_ERROR;
}

static NPError SetBrowserFuncs(NPNetscapeFuncs *browser_funcs) {
  if (browser_funcs_ != NULL) {
    return NPERR_INVALID_FUNCTABLE_ERROR;
  }
  browser_funcs_ = browser_funcs;
  return NPERR_NO_ERROR;
}

static void ResetFuncs() {
  browser_funcs_ = NULL;
  plugin_funcs_ = NULL;
} 

#if defined(OS_WIN)
NPError WINAPI NP_GetEntryPoints(NPPluginFuncs *plugin_funcs) {
  return SetupPluginFuncs(plugin_funcs);
}

NPError WINAPI NP_Initialize(NPNetscapeFuncs *browser_funcs) {
  return SetBrowserFuncs(browser_funcs);
}
#elif defined(OS_LINUX)
NPError NP_Initialize(NPNetscapeFuncs *browser_funcs,
    NPPluginFuncs *plugin_funcs) {
  NPError error = SetupPluginFuncs(plugin_funcs);
  if (error != NPERR_NO_ERROR) {
    ResetFuncs();
    return error;
  }
  NPError error2 = SetBrowserFuncs(browser_funcs);
  if (error2 != NPERR_NO_ERROR) {
    ResetFuncs();
  }
  return error2;
}

//If changing this, make sure you also change npchromedriver.rc's MIMEType
char *NP_GetMIMEDescription() {
  //TODO(danielwh): Output MIME type
  return ":";
}

//If changing this, make sure you also change npchromedriver.rc's details
NPError	NP_GetValue(NPP instance, NPPVariable variable,
    void *value) {
  switch (variable) {
    case NPPVpluginNameString: {
      *((char **)value) = "WebDriver Chrome Plugin";
      break;
    }
    case NPPVpluginDescriptionString: {
      *((char **)value) = "Plugin to allow WebDriver to send native events to Chrome ";
      break;
    }
    default: {
      return NPERR_INVALID_PARAM;
    }
  }
  return NPERR_NO_ERROR;
}
#endif

NPError NP_Shutdown(void) {
  return NPERR_NO_ERROR;
}