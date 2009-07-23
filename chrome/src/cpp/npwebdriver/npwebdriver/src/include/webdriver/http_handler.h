#ifndef WEBDRIVER_HTTP_HANDLER_H_
#define WEBDRIVER_HTTP_HANDLER_H_

#include "webdriver/http_header.h"

#include <string>
#include <vector>

struct mg_connection;

namespace webdriver {

class ChromeDriverPlugin;
class JavascriptExecutor;
/**
 * Handler for HTTP WebDriver requests
 */
class HttpHandler {
 public:
  HttpHandler(JavascriptExecutor *javascript_executor);
  void HandleGet(std::vector<std::string> uri,
                 std::vector<HttpHeader> headers,
                 mg_connection *connection);
  void HandlePost(std::vector<std::string> uri,
                  std::vector<HttpHeader> headers,
                  std::string post_data,
                  mg_connection *connection);
  void HandleDelete(std::vector<std::string> uri,
                    std::vector<HttpHeader> headers,
                    mg_connection *connection);
  void set_chrome_driver_plugin(ChromeDriverPlugin *chrome_driver_plugin);
 private:
  /**
   * Validate that a request is valid
   * i.e. either /session (to create a new session)
   * or /sesssion/:session/:context[/...]
   * and check that :session is the valid current session
   * (Ignores :context, because it may get clobbered)
   *
   * Also checks that we have a chrome_driver_plugin_
   */
  bool ValidateRequest(std::vector<std::string> uri);

  void FillAndExecutePost(const char *command_format, std::string post_data);

  JavascriptExecutor *const javascript_executor_;
  //Should perhaps have a collection of plugins, rather than just the one,
  //what with how it should be able to deal with multiple sessions and all
  ChromeDriverPlugin *chrome_driver_plugin_;
}; //class HttpHandler

} //namespace webdriver

#endif //WEBDRIVER_HTTP_HANDLER_H_
