#ifndef WEBDRIVER_HTTP_SERVER_H_
#define WEBDRIVER_HTTP_SERVER_H_

#include <string>
#include <vector>

struct mg_context;
struct mg_connection;
struct mg_request_info;

namespace webdriver {

class HttpHandler;

/**
 * Server to listen for HTTP on the TCP port indicated, handle requests using
 * an HttpHandler, and issue responses
 */
class HttpServer {
 public:
  HttpServer(HttpHandler *http_handler);
  
  static void _CallbackHandler(mg_connection *connection,
                               const mg_request_info *info,
                               void *user_data);
  
  /**
   * Split the URL path up by / characters
   * Starts from the beginning - will need modifying if we want to
   * run the server on anything but /
   */
  std::vector<std::string> SplitPath(std::string path);
  
  /**
   * Start listening on passed port
   * @param port TCP port to listen on
   * @return true if could start listening, false otherwise
   */
  bool Listen(unsigned short port);

  /**
   * Stop listening
   */
  void StopListening();
  bool is_listening();
  
  /**
   * Send passed string down the connection
   * @return Number of bytes sent
   */
  size_t send(const char *response);
  mg_connection *connection_;
 private:
  /**
   * Handler to use to parse requests which are received
   */
  HttpHandler *http_handler_;
  unsigned short port_;
  bool is_listening_;
  mg_context *server_context_;
}; //class HttpServer

} //namespace webdriver

#endif //WEBDRIVER_HTTP_SERVER_H_
