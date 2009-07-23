//TODO(danielwh): Break this processing out into Javascript

#ifndef WEBDRIVER_JAVASCRIPT_EXECUTOR_H_
#define WEBDRIVER_JAVASCRIPT_EXECUTOR_H_

#include <string>

#include "webkit/glue/plugins/nphostapi.h"

namespace webdriver {

/**
 * Class to execute arbitrary javascript in the context of our plugin's page
 */
class JavascriptExecutor {
 public:
  JavascriptExecutor(NPNetscapeFuncs *browser_funcs, NPP instance);
  /**
   * Execute passed javascript in our context
   * @return true if could execute, false otherwise
   */
  bool execute(std::string script);
  void set_has_window(bool has_window);
  /**
   * A JavascriptExecutor is ready iff it has had a window set,
   * @return true if ready for commands to execute, false otherwise
   */
  bool is_ready();
 private:
  NPNetscapeFuncs *browser_funcs_;
  NPP instance_;
  bool has_window_;
}; //class JavascriptExecutor

} //namespace webdriver

#endif //WEBDRIVER_JAVASCRIPT_EXECUTOR_H_
