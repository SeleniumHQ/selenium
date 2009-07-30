#include "webdriver/http_server.h"

#include <sstream>

#include "mongoose/mongoose.h"

#include "webdriver/chrome_driver_plugin.h"
#include "webdriver/logging.h"
#include "webdriver/webdriver_utils.h"

#if defined(UNIX)
#include <string.h> //for strcmp
#endif

using namespace std;

namespace webdriver {

HttpServer::HttpServer() : port_(0),
                           server_context_(NULL),
                           connection_(NULL) {
}

//Starts at the first slash, so if we ever change to have a non / root path,
//We will need to offset
vector<string> HttpServer::SplitPath(string path) {
  vector<string> parts;
  string::size_type last_pos = path.find_first_not_of("/", 0);
  string::size_type pos = path.find_first_of("/", last_pos);

  while (pos != string::npos || last_pos != string::npos) {
    parts.push_back(path.substr(last_pos, pos - last_pos));
    last_pos = path.find_first_not_of("/", pos);
    pos = path.find_first_of("/", last_pos);
  }
  return parts;
}

void HttpServer::_CallbackHandler(mg_connection *connection,
                                  const mg_request_info *info,
                                  void *user_data) {
  WEBDRIVER_LOG_HTTP_IN(info);
  
  //Keep the connection alive until we have sent a response
  set_connection_keep_alive(connection, true);
  HttpServer *server = (HttpServer *)mg_get_connection_context_custom(connection);

  //Update the server's connection to the current one
  server->connection_ = connection;

  ChromeDriverPlugin *chrome_driver_plugin = server->chrome_driver_plugin_;
  if (chrome_driver_plugin == NULL) {
    //TODO(danielwh): Fail with an HTTP message
    return;
  }  
  
  vector<string> uri = server->SplitPath(string(info->uri));

  char buf[1000];
  sprintf(buf, "Got %s to %s\n", info->request_method, info->uri);
  WEBDRIVER_LOG(buf);
  
  stringstream js;
  if (!strcmp(info->request_method, "POST")) {
    string post_data = EscapeChar(EscapeChar(EscapeChar(string(info->post_data,
        info->post_data_len), '\\'), '\''), '\"');
    if (uri.size() == 4 && uri[3] == "url") {
      char *guid = GenerateGuidString();
      js << "get_url('" << post_data << "', '"
         << chrome_driver_plugin->session_id() << "', '" << guid << "');";
      delete[] guid;
    } else {
      js << "HandlePost(" << "'" << info->uri << "', '" << post_data << "', '"
         << chrome_driver_plugin->session_id() << "', '"
         << chrome_driver_plugin->context() << "')";
    }
  } else if (!strcmp(info->request_method, "GET")) {
    js << "HandleGet(" << "'" << info->uri << "')";
  } else if (!strcmp(info->request_method, "DELETE")) {
    js << "HandleDelete(" << "'" << info->uri << "')";
  } else {
    js << "HandleUnknown()";
  }
  chrome_driver_plugin->ExecuteJavascript(js.str());
}

bool HttpServer::Listen(unsigned short port) {
  server_context_ = mg_start();
  mg_set_context_custom(server_context_, this);
  
  stringstream port_string;
  port_string << port;

  mg_set_option(server_context_, "ports", port_string.str().c_str());
  
  //Terminate connection whenever idle
  //We set keep_alive when we are processing, waiting to respond
  //And remove it when we have responded, so never want to stay idle
  mg_set_option(server_context_, "idle_time", "0");

  //We bind to all addresses for convenience  
  mg_bind_to_uri(server_context_, "*", _CallbackHandler, NULL);
  port_ = port;
  is_listening_ = true;
  return true;
}

void HttpServer::StopListening(){
  is_listening_ = false;
  port_ = 0;
  if (server_context_ != NULL) {
    mg_stop(server_context_);
    server_context_ = NULL;
  }
}


bool HttpServer::is_listening() {
  return is_listening_;
}

void HttpServer::set_chrome_driver_plugin(
    ChromeDriverPlugin *chrome_driver_plugin) {
  chrome_driver_plugin_ = chrome_driver_plugin;
}

size_t HttpServer::send(const char *response) {
  if (connection_ == NULL) {
    HTTP_WEBDRIVER_LOG(">>>COULD NOT SEND DUE TO NULL CONNECTION");
    return 0;
  }
  HTTP_WEBDRIVER_LOG(">");
  HTTP_WEBDRIVER_LOG(response);
  HTTP_WEBDRIVER_LOG("\n");
  
  //TODO(danielwh): This is slightly iffy sign-wise...
  //Should really use a signed type larger than size_t
  size_t sent = 0;
  while (sent < strlen(response)) {
    //TODO(danielwh): Check that this should not be + sent - 1
    //(null-terminated strings)
    sent += mg_printf(connection_, "%s", response + sent);
  }
  set_connection_keep_alive(connection_, false);
  connection_ = NULL;
  return sent;
}

} //namespace webdriver
