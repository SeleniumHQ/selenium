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
    context_(kSpoofContext),
    http_server_(http_server),
    javascript_executor_(javascript_executor),
    is_ready_(false)
#if defined(WIN32)
    ,current_handle_(NULL)
#endif
{}

ChromeDriverPlugin::~ChromeDriverPlugin() {
  delete javascript_executor_;
}

bool ChromeDriverPlugin::ExecuteJavascript(string script) {
  if (javascript_executor_ == NULL) {
    return false;
  }
  return javascript_executor_->execute(script);
}

void ChromeDriverPlugin::GiveWindow(void *handle) {
#if defined(WIN32)
  //Sometimes the tab's HWND seems to be its direct parent,
  //sometimes grandparent, sometimes great-grandparent, so we also check
  //that we have the class we expect.
  //ALL OF THIS MAY CHANGE IN CHROME WITHOUT WARNING!!!
  HWND window = (HWND)handle;
  const wchar_t *desired_class_name = L"Chrome_RenderWidgetHostHWND";
  wchar_t *class_name_w = new wchar_t[wcslen(desired_class_name) + 1];
  
  //If we go more than 10 deep in our searching for the window,
  //something is probably quite wrong...
  for (size_t i = 0; i < kMaxWindowDepth && window != 0; ++i) {
    GetClassName(window, class_name_w, wcslen(desired_class_name) + 1);
    if (!wmemcmp(class_name_w, desired_class_name, wcslen(desired_class_name))) {
      break;
    }
    window = GetParent(window);
  }
  delete[] class_name_w;
  current_handle_ = window;
  char buf[1000];
  sprintf(buf, "Current handle: %x\n", (HWND)current_handle_);
  WEBDRIVER_LOG(buf);
//TODO(danielwh): Add other operating systems
#endif //OS-specific
}

void ChromeDriverPlugin::SendHttp(const char *http) {
  http_server_->send(http);
}

const size_t ChromeDriverPlugin::session_id() {
  return session_id_;
}

const char *ChromeDriverPlugin::context() {
  return context_;
}

void ChromeDriverPlugin::ReturnSendElementKeys(wchar_t *to_type) {
  sendKeys(current_handle_, to_type, 10);
  http_server_->send(kNoContentReseponse);
}

void ChromeDriverPlugin::ReturnClickElement(int32 x, int32 y) {
  if (clickAt(current_handle_, x, y) == 0) {
    http_server_->send(kNoContentReseponse);
  } else {
    ExecuteJavascript("didBadClick()");
  }
}

void ChromeDriverPlugin::ReturnDragElement(int32 duration,
                                           int32 from_x, int32 from_y,
                                           int32 to_x, int32 to_y) {
  char buf[1000];
  sprintf(buf, "DRAG from: (%d, %d) to (%d, %d) in %d\n", from_x, from_y, to_x, to_y, duration);
  WEBDRIVER_LOG(buf);
  //mouseDownAt(current_handle_, from_x, from_y);
  sprintf(buf, "RETURNED: %p\n", mouseMoveTo(current_handle_, duration, from_x, from_y, to_x, to_y));
  WEBDRIVER_LOG(buf);
  //mouseUpAt(current_handle_, to_x, to_y);
  http_server_->send(kNoContentReseponse);
}

} //namespace webdriver
