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
  JavascriptExecutor(const NPNetscapeFuncs *const browser_funcs, const NPP instance);
  /**
   * Execute passed javascript in our context
   * @return true if could execute, false otherwise
   */
  bool execute(const std::string script) const;
 private:
  const NPNetscapeFuncs * const browser_funcs_;
  const NPP instance_;
}; //class JavascriptExecutor

} //namespace webdriver

#endif //WEBDRIVER_JAVASCRIPT_EXECUTOR_H_
