#include "webdriver/http_server.h"

#include <sstream>

#include "mongoose/mongoose.h"

#include "webdriver/http_header.h"
#include "webdriver/http_handler.h"
#include "webdriver/logging.h"
#include "webdriver/webdriver_utils.h"

#if defined(UNIX)
#include <string.h> //for strcmp
#endif

using namespace std;

namespace webdriver {

HttpServer::HttpServer(HttpHandler *http_handler) : port_(0),
                                                    server_context_(NULL),
                                                    connection_(NULL),
                                                    http_handler_(http_handler) {
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
  //XXX(danielwh): It may be useful to pass the full mg_request_info
  //to the HttpHandler, and remove a bit of the abstraction, but I'm not
  //going to for now, because I don't need to, and it's cleaner not to
  
  WEBDRIVER_LOG_HTTP_IN(info);
  
  //Keep the connection alive until we have sent a response
  set_connection_keep_alive(connection, true);
  HttpServer *server = (HttpServer *)mg_get_connection_context_custom(connection);
  //Update the server's connection to the current one
  server->connection_ = connection;
  
  HttpHandler *handler = server->http_handler_;
  vector<string> uri = server->SplitPath(string(info->uri));
  vector<HttpHeader> headers;
  headers.reserve(info->num_headers);
  for (int i = 0; i < info->num_headers; i++) {
    mg_header header = info->http_headers[i];
    headers.push_back(HttpHeader(string(header.name),
        string(header.value)));
  }
  
  char buf[1000];
  sprintf(buf, "Got %s to %s\n", info->request_method, info->uri);
  WEBDRIVER_LOG(buf);
  
  if (!strcmp(info->request_method, "POST")) {
    string post_data = EscapeChar(string(info->post_data,
        info->post_data_len), '\'');
    handler->HandlePost(uri, headers, post_data, connection);
  } else if (!strcmp(info->request_method, "GET")) {
    handler->HandleGet(uri, headers, connection);
  } else if (!strcmp(info->request_method, "DELETE")) {
    handler->HandleDelete(uri, headers, connection);
  }
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

size_t HttpServer::send(const char *response) {
  if (connection_ == NULL) {
    return 0;
  }
  HTTP_WEBDRIVER_LOG(">");
  HTTP_WEBDRIVER_LOG(response);
  HTTP_WEBDRIVER_LOG("\n");
  size_t wrote = mg_printf(connection_, "%s", response);
  set_connection_keep_alive(connection_, false);
  return wrote;
}

} //namespace webdriver
