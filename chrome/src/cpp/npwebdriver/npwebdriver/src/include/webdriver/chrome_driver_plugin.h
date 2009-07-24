#ifndef WEBDRIVER_CHROME_DRIVER_PLUGIN_H_
#define WEBDRIVER_CHROME_DRIVER_PLUGIN_H_

#include <string>
#include "base/basictypes.h"

#if defined(WIN32)
#include <windows.h> //for HWND
#endif

namespace webdriver {

class HttpHandler;
class HttpServer;
class JavascriptExecutor;

class ChromeDriverPlugin {
 public:
  ChromeDriverPlugin(size_t session_id,
                     HttpServer *http_server,
                     JavascriptExecutor *javascript_executor);
  bool ExecuteJavascript(std::string script);
  JavascriptExecutor *javascript_executor();
  void DeleteFields();
  /**
   * A ChromeDriverPlugin is ready (to receive commands down the wire) iff
   * it its JavascriptExecutor is ready
   * @return true if we are ready for WebDriver commands down the wire,
   *         false otherwise
   */
  bool IsReady();
  const size_t session_id();
  const char *context();
  
#if defined(WIN32)
  void GiveWindow(HWND handle);
#endif
  
  void SendHttp(const char *http);
  void ConfirmUrlLoaded();
  void ReturnSendElementKeys(bool success, char *to_type);
  void ReturnClickElement(bool success, int32 x, int32 y);
 private:
  const size_t session_id_;
  const char *context_;
  HttpServer *http_server_;
  JavascriptExecutor *javascript_executor_;
  bool is_ready_;
#if defined(WIN32)
  HWND current_handle_;
#endif
}; //class ChromeDriverPlugin

} //namespace webdriver

#endif //WEBDRIVER_CHROME_DRIVER_PLUGIN_H_
