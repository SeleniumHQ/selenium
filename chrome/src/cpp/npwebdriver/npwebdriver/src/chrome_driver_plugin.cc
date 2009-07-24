#include "webdriver/chrome_driver_plugin.h"

#include "webdriver/http_responses.h"
#include "webdriver/http_server.h"
#include "webdriver/javascript_executor.h"
#include "webdriver/logging.h"
#include "webdriver/webdriver_utils.h" //for kMaxSize_tDigits

#include "interactions.h"

#include <stdio.h>

using namespace std;

namespace webdriver {
ChromeDriverPlugin::ChromeDriverPlugin(size_t session_id,
                                       HttpServer *http_server,
                                       JavascriptExecutor *javascript_executor) :
    session_id_(session_id),
    context_("foo"),
    http_server_(http_server),
    javascript_executor_(javascript_executor),
    is_ready_(false)
#if defined(WIN32)
    ,current_handle_(0)
#endif
{}

bool ChromeDriverPlugin::ExecuteJavascript(string script) {
  if (javascript_executor_ == NULL) {
    return false;
  }
  return javascript_executor_->execute(script);
}

void ChromeDriverPlugin::DeleteFields() {
  is_ready_ = false;
  delete javascript_executor_;
  delete http_server_;
}

bool ChromeDriverPlugin::IsReady() {
  return (javascript_executor_ != NULL && javascript_executor_->is_ready());
}

#if defined(WIN32)
void ChromeDriverPlugin::GiveWindow(HWND handle) {
  //Sometimes the tab's HWND seems to be its direct parent,
  //sometimes grandparent, sometimes great-grandparent, so we also check
  //that we have the class we expect.
  //ALL OF THIS MAY CHANGE IN CHROME WITHOUT WARNING!!!
  HWND window = handle;
  const wchar_t *desired_class_name = L"Chrome_RenderWidgetHostHWND";
  wchar_t *class_name_w = new wchar_t[wcslen(desired_class_name) + 1];
  
  //If we go more than 10 deep in our searching for the window,
  //something is probably quite wrong...
  for (size_t i = 0; i < 10 && window != 0; ++i) {
    GetClassName(window, class_name_w, wcslen(desired_class_name) + 1);
    if (!wmemcmp(class_name_w, desired_class_name, wcslen(desired_class_name))) {
      break;
    }
    window = GetParent(window);
  }
  delete[] class_name_w;
  current_handle_ = window;
  char buf[1000];
  sprintf(buf, "Current handle: %x\n", current_handle_);
  WEBDRIVER_LOG(buf);
}
#endif

void ChromeDriverPlugin::SendHttp(const char *http) {
  http_server_->send(http);
}

JavascriptExecutor *ChromeDriverPlugin::javascript_executor() {
  return javascript_executor_;
}

const size_t ChromeDriverPlugin::session_id() {
  return session_id_;
}

const char *ChromeDriverPlugin::context() {
  return context_;
}


void ChromeDriverPlugin::ReturnSendElementKeys(bool success, char *to_type) {
  if (success) {
    sendKeys(current_handle_, CharStringToWCharString(to_type), 10);
    http_server_->send(kNoContentReseponse);
  } else {
    //TODO(danielwh): Fail somehow
    //http_server_->send(kNoContentReseponse);
  }
}

void ChromeDriverPlugin::ReturnClickElement(bool success, int32 x, int32 y) {
  if (success) {
    clickAt(current_handle_, x, y);
    http_server_->send(kNoContentReseponse);
  } else {
    //TODO(danielwh): Fail somehow
    //http_server_->send(kNoContentReseponse);
  }
}

} //namespace webdriver
