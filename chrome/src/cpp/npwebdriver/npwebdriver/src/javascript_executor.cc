#include "webdriver/javascript_executor.h"

#include "webdriver/logging.h"

using namespace std;

namespace webdriver {

JavascriptExecutor::JavascriptExecutor(
    const NPNetscapeFuncs *const browser_funcs,
    const NPP instance) :
  browser_funcs_(browser_funcs),
  instance_(instance) {
}

bool JavascriptExecutor::execute(const string javascript) const {
  NPString script;
  script.UTF8Characters = javascript.c_str();
  script.UTF8Length = strlen(script.UTF8Characters);
  
  NPObject *window = NULL;
  if (browser_funcs_->getvalue(instance_, NPNVWindowNPObject, &window) !=
      NPERR_NO_ERROR) {
    return false;
  }

  //Currently just throw away result - it could be helpful in the future
  NPVariant result;
 
  JS_WEBDRIVER_LOG(javascript.c_str());
  JS_WEBDRIVER_LOG("\n");

  browser_funcs_->evaluate(instance_, window, &script, &result);
  
  return true;
}

} //namespace webdriver
