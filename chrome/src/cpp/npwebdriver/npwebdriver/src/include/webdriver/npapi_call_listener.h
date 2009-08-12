#ifndef WEBDRIVER_NPAPI_CALL_LISTENER_H_
#define WEBDRIVER_NPAPI_CALL_LISTENER_H_

#include "webkit/glue/plugins/nphostapi.h"

#include "webdriver/window_listener_data.h"

#include <vector>

namespace webdriver {

class ChromeDriverPlugin;

/**
 * Contains the DLL hooks and expected functions to allow plugin to be
 * instantiated by an NPAPI-compliant browser, and properly instantiates a
 * single plugin, populating the NPP_* function pointers
 */
class NpapiCallListener {
 public:
  static NPError set_browser_funcs(NPNetscapeFuncs *browser_funcs);
  static NPError setup_plugin_funcs(NPPluginFuncs *plugin_funcs);
  static void reset_funcs();
  
  static NPError NewInstance(NPMIMEType pluginType,
                             NPP instance,
                             uint16 mode,
                             int16 argc,
                             char *argn[],
                             char *argv[],
                             NPSavedData *saved);
  static NPError Destroy(NPP instance, NPSavedData **save);
  static NPError SetWindow(NPP instance, NPWindow *window);
  static NPError GetValue(NPP instance, NPPVariable variable, void *value);
 private:
  static NPNetscapeFuncs *browser_funcs_;
  static NPPluginFuncs *plugin_funcs_;
  //XXX(danielwh): We may want to keep a collection of plugins in the future,
  // but for now just the one does the job
  static ChromeDriverPlugin *chrome_driver_plugin_;
  static size_t global_session_id_;
  static std::vector<WindowListenerData> windows_;
  static NPP global_instance_;
}; //class NpapiCallListener

} //namespace webdriver

#endif //WEBDRIVER_NPAPI_CALL_LISTENER_H_
