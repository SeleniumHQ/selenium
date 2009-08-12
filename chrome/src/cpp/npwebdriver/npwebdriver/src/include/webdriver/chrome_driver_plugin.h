#ifndef WEBDRIVER_CHROME_DRIVER_PLUGIN_H_
#define WEBDRIVER_CHROME_DRIVER_PLUGIN_H_

#include <string>
#include "base/basictypes.h"

#if defined(WIN32)
#include <windows.h> //for HWND
#endif

namespace webdriver {
static const size_t kMaxWindowDepth = 10;

class HttpHandler;
class HttpServer;
class JavascriptExecutor;

class ChromeDriverPlugin {
 public:
  ChromeDriverPlugin(size_t session_id,
                     HttpServer *http_server,
                     JavascriptExecutor *javascript_executor);
  virtual ~ChromeDriverPlugin();
  bool ExecuteJavascript(std::string script);
  const size_t session_id();
  const char *context();
  
  void GiveWindow(void *handle);
  
  void SendHttp(const char *http);
  void ConfirmUrlLoaded();
  void ReturnSendElementKeys(wchar_t *to_type);
  void ReturnClickElement(int32 x, int32 y);
  void ReturnDragElement(int32 duration, int32 from_x, int32 from_y,
                                         int32 to_x, int32 to_y);
 private:
  const size_t session_id_;
  const char *context_;
  HttpServer *http_server_;
  JavascriptExecutor *javascript_executor_;
  bool is_ready_;
  void *current_handle_;
}; //class ChromeDriverPlugin

} //namespace webdriver

#endif //WEBDRIVER_CHROME_DRIVER_PLUGIN_H_
