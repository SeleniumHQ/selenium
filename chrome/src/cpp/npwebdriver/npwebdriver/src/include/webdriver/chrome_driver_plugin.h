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
  
#if defined(WIN32)
  void GiveWindow(HWND handle);
#endif
  
  void SendGeneralFailure();
  void SendNotFound();
  void SendStringValue(std::string value);
  void SendValue(std::string value);
  
  void CreateSession(std::string capabilities);
  void ConfirmSession();
  void DeleteSession();
  void ConfirmUrlLoaded();
  void ReturnGetTitleSuccess(std::string title);
  void ReturnGetTitleFailure();
  void ReturnGetElementNotFound(std::string identifier_string);
  void ReturnGetElementFound(std::string internal_element_ids);
  void ReturnSendElementKeys(bool success, char *to_type);
  void ReturnClearElement(bool success);
  void ReturnClickElement(bool success, int32 x, int32 y);
  void ReturnGetElementAttributeSuccess(std::string value);
  void ReturnGetElementAttributeFailure();
  void ReturnGetElementTextSuccess(std::string text);
  void ReturnGetElementTextFailure();
  void ReturnIsElementSelected(bool selected);
  //TODO(danielwh): Window switching
  //void ReturnSwitchWindow(bool success);
  void ReturnSubmitElement(bool success);
 private:
  const size_t session_id_;
  const char *context_;
  HttpServer *http_server_;
  JavascriptExecutor *javascript_executor_;
  bool is_ready_;
  std::string capabilities_;
#if defined(WIN32)
  HWND current_handle_;
#endif
}; //class ChromeDriverPlugin

} //namespace webdriver

#endif //WEBDRIVER_CHROME_DRIVER_PLUGIN_H_
