#include "webdriver/javascript_executor.h"

#include "webdriver/logging.h"

using namespace std;

namespace webdriver {

JavascriptExecutor::JavascriptExecutor(NPNetscapeFuncs *browser_funcs,
                                       NPP instance) :
    browser_funcs_(browser_funcs),
    instance_(instance),
    has_window_(false) {
}

bool JavascriptExecutor::execute(string javascript) {
  if (!is_ready()) {
    WEBDRIVER_LOG("JSE wasn't ready\n");
    return false;
  }
  NPString script;
  script.UTF8Characters = javascript.c_str();
  script.UTF8Length = strlen(script.UTF8Characters);
  
  NPObject *window = NULL;
  browser_funcs_->getvalue(instance_, NPNVWindowNPObject, &window);

  //Currently just throw away result - it could be helpful in the future
  NPVariant result;
 
  JS_WEBDRIVER_LOG(javascript.c_str());
  JS_WEBDRIVER_LOG("\n");

  browser_funcs_->evaluate(instance_, window, &script, &result);
  
  return true;
}

void JavascriptExecutor::set_has_window(bool has_window) {
  has_window_ = has_window;
}

bool JavascriptExecutor::is_ready() {
  return has_window_;
}

} //namespace webdriver
