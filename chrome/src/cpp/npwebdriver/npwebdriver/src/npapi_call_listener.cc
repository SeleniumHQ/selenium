#include "webdriver/npapi_call_listener.h"

#include "webdriver/chrome_driver_plugin.h"
#include "webdriver/http_handler.h"
#include "webdriver/http_server.h"
#include "webdriver/javascript_executor.h"
#include "webdriver/javascript_listener.h"
#include "webdriver/logging.h"
#include "webdriver/stubs.h"
#include "webdriver/webdriver_utils.h"

#include <stdio.h>

#if defined(UNIX)
#include <stdlib.h> //for atoi
#endif

using namespace std;

namespace webdriver {

NPNetscapeFuncs *NpapiCallListener::browser_funcs_ = NULL;
NPPluginFuncs *NpapiCallListener::plugin_funcs_ = NULL;
ChromeDriverPlugin *NpapiCallListener::chrome_driver_plugin_ = NULL;
size_t NpapiCallListener::global_session_id_ = 0;
vector<WindowListenerData> NpapiCallListener::windows_;
NPP NpapiCallListener::global_instance_ = NULL;

NPError NpapiCallListener::set_browser_funcs(NPNetscapeFuncs *browser_funcs) {
  WEBDRIVER_LOG("set_browser_funcs\n");
  browser_funcs_ = browser_funcs;
  return NPERR_NO_ERROR;
}

NPError NpapiCallListener::setup_plugin_funcs(NPPluginFuncs *plugin_funcs) {
  WEBDRIVER_LOG("setup_plugin_funcs\n");
  if (plugin_funcs_ != NULL) {
    return NPERR_INVALID_FUNCTABLE_ERROR;
  }
  plugin_funcs_ = plugin_funcs;
  
  plugin_funcs->newp = NpapiCallListener::NewInstance;
  plugin_funcs->destroy = NpapiCallListener::Destroy;
  plugin_funcs->setwindow = NpapiCallListener::SetWindow;
  plugin_funcs->newstream = StubNewStream;
  plugin_funcs->destroystream = StubDestroyStream;
  plugin_funcs->asfile = StubStreamAsFile;
  plugin_funcs->writeready = StubWriteReady;
  plugin_funcs->write = StubWrite;
  plugin_funcs->print = StubPrint;
  plugin_funcs->event = StubHandleEvent;
  plugin_funcs->urlnotify = StubURLNotify;
  plugin_funcs->getvalue = NpapiCallListener::GetValue;
  plugin_funcs->setvalue = StubSetValue;
  
  return NPERR_NO_ERROR;
}

void NpapiCallListener::reset_funcs() {
  plugin_funcs_ = NULL;
  browser_funcs_ = NULL;
}

NPError NpapiCallListener::NewInstance(NPMIMEType pluginType,
                                       NPP instance,
                                       uint16 mode,
                                       int16 argc,
                                       char *argn[],
                                       char *argv[],
                                       NPSavedData *saved) {
  //We ignore the args (key-value HTML params), but could use them if they were
  //ever to be useful.  Similarly for saved data cross sessions
  WEBDRIVER_LOG("NewInstance\n");
  if (!strcmp(pluginType, "application/x-webdriver") &&
      chrome_driver_plugin_ != NULL) {
    return NPERR_INVALID_PLUGIN_ERROR;
  } else if (!strcmp(pluginType, "application/x-webdriver-reporter") &&
             chrome_driver_plugin_ != NULL &&
             GetArg(argc, argn, argv, "session_id") != NULL) {
      WEBDRIVER_LOG("application/x-webdriver-reporter\n");
      windows_.push_back(WindowListenerData(instance,
          atoi(GetArg(argc, argn, argv, "session_id"))));
      WEBDRIVER_LOG("Added to windows vector\n");
    return NPERR_NO_ERROR;
  }
  WEBDRIVER_LOG("application/x-webdriver\n");
    

  //We purport to only have one instance per ChromeDriver, as we should.
  //If we get further ones, they are simply ignored.
  //So it is fairly important that this first one is the one we want.
  //Which it *really* should be, as it's in the background page.
  JavascriptExecutor *executor = new JavascriptExecutor(browser_funcs_,
                                                        instance);
  
  HttpHandler *handler = new HttpHandler(executor);
  HttpServer *server = new HttpServer(handler);
  
  //TODO(danielwh): Try ports if we can't bind to this one
  //TODO(danielwh): Read preference for port number
  server->Listen(7601);
  
  chrome_driver_plugin_ = new ChromeDriverPlugin(global_session_id_++,
                                                 server,
                                                 executor);

  global_instance_ = instance;

  handler->set_chrome_driver_plugin(chrome_driver_plugin_);

  return NPERR_NO_ERROR;
}

NPError NpapiCallListener::Destroy(NPP instance, NPSavedData **save) {
  WEBDRIVER_LOG("Destroy\n");
  //We don't save anything in save.  This could be useful in the future
  if (chrome_driver_plugin_ == NULL) {
    return NPERR_INVALID_PLUGIN_ERROR;
  }
  if (instance == global_instance_) {
    chrome_driver_plugin_->DeleteFields();
    delete chrome_driver_plugin_;
    chrome_driver_plugin_ = NULL;
  }
  return NPERR_NO_ERROR;
}

NPError NpapiCallListener::SetWindow(NPP instance, NPWindow *window) {
  WEBDRIVER_LOG("SetWindow\n");
  if (chrome_driver_plugin_ == NULL) {
    return NPERR_INVALID_PLUGIN_ERROR;
  }
  
  //Scan through windows vector
  vector<WindowListenerData>::iterator it;
  for (it = windows_.begin(); it < windows_.end(); ++it) {
    if (it->instance_ == instance &&
        it->session_id_ == chrome_driver_plugin_->session_id() &&
        window->window != NULL) {
#if defined(WIN32)
      chrome_driver_plugin_->GiveWindow((HWND)window->window);
#endif
    }
  }
  
  if (instance == global_instance_ &&
      chrome_driver_plugin_->javascript_executor() != NULL) {
    chrome_driver_plugin_->javascript_executor()->set_has_window(true);
  }
  return NPERR_NO_ERROR;
}

NPError NpapiCallListener::GetValue(NPP instance, NPPVariable variable,
                                    void *value) {
  //XXX(danielwh): If we start getting things double-free'd
  //(or not free'd at all), look here, because I haven't done any refcounting
  char buf[1000];
  sprintf(buf, "GOT CALL GetValue with %d\n", variable);
  WEBDRIVER_LOG(buf);
  switch (variable) {
    case NPPVpluginScriptableNPObject: {
      JavascriptListener *listener = (JavascriptListener *)browser_funcs_->
          createobject(instance, &JavascriptListener_NPClass);
      listener->set_chrome_driver_plugin(chrome_driver_plugin_);
      listener->set_browser_funcs(browser_funcs_);
      *((NPObject **)value) = listener;
      browser_funcs_->retainobject(listener);
      break;
    }
    default: {
      return NPERR_INVALID_PARAM;
    }
  }
  return NPERR_NO_ERROR;
}

#if defined(WIN32)
NPError WINAPI NP_GetEntryPoints(NPPluginFuncs *plugin_funcs) {
  WEBDRIVER_LOG("NP_GetEntryPoints\n");
  return NpapiCallListener::setup_plugin_funcs(plugin_funcs);
}

NPError WINAPI NP_Initialize(NPNetscapeFuncs *browser_funcs) {
  WEBDRIVER_LOG("NP_Initialize\n");
  return NpapiCallListener::set_browser_funcs(browser_funcs);
}
#elif defined(UNIX)
NPError NP_Initialize(NPNetscapeFuncs *browser_funcs,
    NPPluginFuncs *plugin_funcs) {
  NPError error = NpapiCallListener::setup_plugin_funcs(plugin_funcs);
  if (error != NPERR_NO_ERROR) {
    NpapiCallListener::reset_funcs();
    return error;
  }
  NPError error2 = NpapiCallListener::set_browser_funcs(browser_funcs);
  if (error2 != NPERR_NO_ERROR) {
    NpapiCallListener::reset_funcs();
  }
  return error2;
}

//If changing this, make sure you also change npwebdriver.rc's MIMEType
char *NP_GetMIMEDescription() {
  return "application/x-webdriver:application/x-webdriver-reporter";
}

//If changing this, make sure you also change npwebdriver.rc's details
NPError	NP_GetValue(NPP instance, NPPVariable variable,
    void *value) {
  switch (variable) {
    case NPPVpluginNameString: {
      *((char **)value) = "WebDriver Chrome Plugin";
      break;
    }
    case NPPVpluginDescriptionString: {
      *((char **)value) = "Plugin to allow WebDriver to drive Chrome";
      break;
    }
    default: {
      return NPERR_INVALID_PARAM;
    }
  }
}
#endif

NPError NP_Shutdown(void) {
  WEBDRIVER_LOG("NP_Shutdown\n");
  //TODO(danielwh): Clean up as necessary
  return NPERR_NO_ERROR;
}

}; //namespace webdriver
