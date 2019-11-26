// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "server.h"
#include <cstdio>
#include <cstring>
#include <sstream>
#include "session.h"
#include "errorcodes.h"
#include "uri_info.h"
#include "logging.h"

#define SERVER_DEFAULT_PAGE "<html><head><title>WebDriver</title></head><body><p id='main'>This is the initial start page for the WebDriver server.</p></body></html>"
#define SERVER_DEFAULT_WHITELIST "127.0.0.1"
#define SERVER_DEFAULT_BLACKLIST "-0.0.0.0/0"
#define HTML_CONTENT_TYPE "text/html"
#define JSON_CONTENT_TYPE "application/json"

#if defined(WINDOWS)
#include <cstdarg>
inline int wd_snprintf(char* str, size_t size, const char* format, ...) {
  va_list args;
  va_start(args, format);
  int count = _vscprintf(format, args);
  if (str != NULL && size > 0) {
    count = _vsnprintf_s(str, size, _TRUNCATE, format, args);
  }
  va_end(args);
  return count;
}
#define snprintf wd_snprintf
#endif

namespace webdriver {

Server::Server(const int port) {
  this->Initialize(port, "", "", "", "");
}

Server::Server(const int port, const std::string& host) {
  this->Initialize(port, host, "", "", "");
}

Server::Server(const int port,
               const std::string& host,
               const std::string& log_level,
               const std::string& log_file) {
  this->Initialize(port, host, log_level, log_file, "");
}

Server::Server(const int port,
               const std::string& host,
               const std::string& log_level,
               const std::string& log_file,
               const std::string& acl) {
    this->Initialize(port, host, log_level, log_file, acl);
}

Server::~Server(void) {
  SessionMap::iterator it = this->sessions_.begin();
  for (; it != this->sessions_.end(); ++it) {
    std::string session_id = it->first;
    this->ShutDownSession(session_id);
  }
}

void Server::Initialize(const int port,
                        const std::string& host,
                        const std::string& log_level,
                        const std::string& log_file,
                        const std::string& acl) {
  LOG::Level(log_level);
  LOG::File(log_file);
  LOG(INFO) << "Starting WebDriver server on port: '"
            << port << "' on host: '" << host << "'";
  this->port_ = port;
  this->host_ = host;
  if (acl.size() > 0) {
    this->ProcessWhitelist(acl);
  }
  this->PopulateCommandRepository();
}

void Server::ProcessWhitelist(const std::string& whitelist) {
  std::string input_copy = whitelist;
  while (input_copy.size() > 0) {
    size_t delimiter_pos = input_copy.find(",");
    std::string token = input_copy.substr(0, delimiter_pos);
    if (delimiter_pos == std::string::npos) {
      input_copy = "";
    } else {
      input_copy = input_copy.substr(delimiter_pos + 1);
    }
    this->whitelist_.push_back(token);
  }
}

std::string Server::GetListeningPorts(const bool use_ipv6) {
  std::string port_format_string = "%s:%d";
  if (this->host_.size() == 0) {
    // If the host name is an empty string, then we want to bind
    // to the local loopback address on both IPv4 and IPv6 if we
    // can. Using the addresses in the listening port format string
    // will prevent connection from external IP addresses.
    port_format_string = "%s127.0.0.1:%d";
    if (use_ipv6) {
      port_format_string.append(",[::1]:%d");
    }
  } else if (this->whitelist_.size() > 0) {
    // If there are white-listed IP addresses, we can only use IPv4,
    // and we don't want the colon in the listening ports string.
    // Instead, we want to bind to all adapters, and use the access
    // control list to determine which addresses can connect. So to
    // remove the host from the format string, when we use printf to
    // format, the %s will be replaced by an empty string.
    port_format_string = "%s%d";
  }
  int formatted_string_size = snprintf(NULL,
                                       0,
                                       port_format_string.c_str(),
                                       this->host_.c_str(),
                                       this->port_,
                                       this->port_) + 1;
  std::vector<char> listening_ports_buffer(formatted_string_size);
  snprintf(&listening_ports_buffer[0],
           formatted_string_size,
           port_format_string.c_str(),
           this->host_.c_str(),
           this->port_,
           this->port_);
  return &listening_ports_buffer[0];
}

std::string Server::GetAccessControlList() {
  std::string acl = "";
  if (this->whitelist_.size() > 0) {
    acl = SERVER_DEFAULT_BLACKLIST;
    for (std::vector<std::string>::const_iterator it = this->whitelist_.begin();
      it < this->whitelist_.end();
      ++it) {
      acl.append(",+").append(*it);
    }
    LOG(DEBUG) << "Civetweb ACL is " << acl;
  }
  return acl;
}

void Server::GenerateOptionsList(std::vector<const char*>* options) {
  std::map<std::string, std::string>::const_iterator it = this->options_.begin();
  for (; it != this->options_.end(); ++it) {
    options->push_back(it->first.c_str());
    options->push_back(it->second.c_str());
  }
  options->push_back(NULL);
}

int Server::OnNewHttpRequest(struct mg_connection* conn) {
  mg_context* context = mg_get_context(conn);
  Server* current_server = reinterpret_cast<Server*>(mg_get_user_data(context));
  const mg_request_info* request_info = mg_get_request_info(conn);
  int handler_result_code = current_server->ProcessRequest(conn, request_info);
  return handler_result_code;
}

bool Server::Start() {
  LOG(TRACE) << "Entering Server::Start";

  std::string listening_port_option = this->GetListeningPorts(true);
  this->options_["listening_ports"] = listening_port_option;

  std::string acl_option = this->GetAccessControlList();
  if (acl_option.size() > 0) {
    this->options_["access_control_list"] = acl_option;
  }

  this->options_["enable_keep_alive"] = "yes";

  std::vector<const char*> options;
  this->GenerateOptionsList(&options);

  mg_callbacks callbacks = {};
  callbacks.begin_request = &OnNewHttpRequest;
  context_ = mg_start(&callbacks, this, &options[0]);
  if (context_ == NULL) {
    std::string ipv4_port_option = this->GetListeningPorts(false);
    if (listening_port_option == ipv4_port_option) {
      // If the IPv4 and IPv6 versions of the port option string
      // are equal, then either a host to bind to or an ACL was
      // specified, so there is no need to retry.
      LOG(WARN) << "Failed to start Civetweb";
      return false;
    } else {
      // If we fail, a host and ACL aren't specified, we might not
      // be able to bind to an IPv6 address. Try again to bind to
      // the IPv4 loopback only.
      LOG(INFO) << "Failed first attempt to start Civetweb. Attempt start with IPv4 only";
      this->options_["listening_ports"] = listening_port_option;
      options.clear();
      this->GenerateOptionsList(&options);
      context_ = mg_start(&callbacks, this, &options[0]);
      if (context_ == NULL) {
        LOG(WARN) << "Failed to start Civetweb";
        return false;
      }
    }
  }
  return true;
}

void Server::Stop() {
  LOG(TRACE) << "Entering Server::Stop";
  if (context_) {
    mg_stop(context_);
    context_ = NULL;
  }
}

int Server::ProcessRequest(struct mg_connection* conn,
    const struct mg_request_info* request_info) {
  LOG(TRACE) << "Entering Server::ProcessRequest";

  int http_response_code = 0;
  std::string http_verb = request_info->request_method;
  std::string request_body = "{}";
  if (http_verb == "POST") {
    request_body = this->ReadRequestBody(conn, request_info);
  }

  LOG(TRACE) << "Process request with:"
             << " URI: "  << request_info->local_uri
             << " HTTP verb: " << http_verb << std::endl
             << "body: " << request_body;

  if (strcmp(request_info->local_uri, "/") == 0) {
    this->SendHttpOk(conn,
                     request_info,
                     SERVER_DEFAULT_PAGE,
                     HTML_CONTENT_TYPE);
    http_response_code = 0;
  } else if (strcmp(request_info->local_uri, "/shutdown") == 0) {
    this->SendHttpOk(conn,
                     request_info,
                     SERVER_DEFAULT_PAGE,
                     HTML_CONTENT_TYPE);
    http_response_code = 0;
    this->ShutDown();
  } else {
    std::string serialized_response = this->DispatchCommand(request_info->local_uri,
                                                            http_verb,
                                                            request_body);
    http_response_code = this->SendResponseToClient(conn,
                                                    request_info,
                                                    serialized_response);
  }

  return http_response_code;
}

void Server::AddCommand(const std::string& url,
                        const std::string& http_verb,
                        const std::string& command_name) {
  if (this->commands_.find(url) == this->commands_.end()) {
    this->commands_[url] = std::shared_ptr<UriInfo>(
        new UriInfo(url, http_verb, command_name));
  } else {
    this->commands_[url]->AddHttpVerb(http_verb, command_name);
  }
}

void Server::ShutDownSession(const std::string& session_id) {
  LOG(TRACE) << "Entering Server::ShutDownSession";

  SessionMap::iterator it = this->sessions_.find(session_id);
  if (it != this->sessions_.end()) {
    it->second->ShutDown();
    this->sessions_.erase(session_id);
  } else {
    LOG(DEBUG) << "Shutdown session is not found";
  }
}

std::string Server::ReadRequestBody(struct mg_connection* conn,
    const struct mg_request_info* request_info) {
  LOG(TRACE) << "Entering Server::ReadRequestBody";

  std::string request_body = "";
  int content_length = 0;
  for (int header_index = 0; header_index < 64; ++header_index) {
    if (request_info->http_headers[header_index].name == NULL) {
      break;
    }
    if (strcmp(request_info->http_headers[header_index].name,
               "Content-Length") == 0) {
      content_length = atoi(request_info->http_headers[header_index].value);
      break;
    }
  }
  if (content_length != 0) {
    std::vector<char> buffer(content_length + 1);
    int bytes_read = 0;
    while (bytes_read < content_length) {
      bytes_read += mg_read(conn,
                            &buffer[bytes_read],
                            content_length - bytes_read);
    }
    buffer[content_length] = '\0';
    request_body.append(&buffer[0]);
  }

  return request_body;
}

std::string Server::DispatchCommand(const std::string& uri,
                                     const std::string& http_verb,
                                     const std::string& command_body) {
  LOG(TRACE) << "Entering Server::DispatchCommand";

  std::string session_id = "";
  std::string locator_parameters = "";
  std::string serialized_response = "";
  std::string command = this->LookupCommand(uri,
                                            http_verb,
                                            &session_id,
                                            &locator_parameters);
  LOG(DEBUG) << "Command: " << http_verb << " " << uri << " " << command_body;

  if (command == webdriver::CommandType::NoCommand) {
    Response invalid_command_response;
    if (locator_parameters.size() > 0) {
      std::string unknown_method_body = "Invalid method requested: ";
      unknown_method_body.append(http_verb);
      unknown_method_body.append(" is not a valid HTTP verb for ");
      unknown_method_body.append(uri);
      unknown_method_body.append("; acceptable verbs are: ");
      unknown_method_body.append(locator_parameters);
      invalid_command_response.SetErrorResponse(ERROR_UNKNOWN_METHOD,
                                                unknown_method_body);
      invalid_command_response.AddAdditionalData("verbs", locator_parameters);
    } else {
      std::string unknown_command_body = "Command not found: ";
      unknown_command_body.append(http_verb);
      unknown_command_body.append(" ");
      unknown_command_body.append(uri);
      invalid_command_response.SetErrorResponse(ERROR_UNKNOWN_COMMAND,
                                                unknown_command_body);
    }
    serialized_response = invalid_command_response.Serialize();
  } else if (command == webdriver::CommandType::Status) {
    // Status command must be handled by the server, not by the session.
    serialized_response = this->GetStatus();
  } else if (command == webdriver::CommandType::GetSessionList) {
    // GetSessionList command must be handled by the server,
    // not by the session.
    serialized_response = this->ListSessions();
  } else {
    SessionHandle session_handle;
    if (command != webdriver::CommandType::NewSession &&
        !this->LookupSession(session_id, &session_handle)) {
      if (command == webdriver::CommandType::Quit) {
        // Calling quit on an invalid session should be a no-op.
        // Hand-code the response for quit on an invalid (already
        // quit) session.
        serialized_response.append("{ \"value\" : null }");
      } else {
        Response invalid_session_id_response;
        std::string invalid_session_message = "session ";
        invalid_session_message.append(session_id);
        invalid_session_message.append(" does not exist");
        invalid_session_id_response.SetErrorResponse(ERROR_INVALID_SESSION_ID,
                                                     invalid_session_message);
        serialized_response = invalid_session_id_response.Serialize();
      }
    } else {
      if (command == webdriver::CommandType::NewSession &&
          this->sessions_.size() > 0) {
        std::string session_exists_message = "Only one session may ";
        session_exists_message.append("be created at a time, and a ");
        session_exists_message.append("session already exists.");
        Response session_exists_response;
        session_exists_response.SetErrorResponse(ERROR_SESSION_NOT_CREATED,
                                                 session_exists_message);
        serialized_response = session_exists_response.Serialize();
      } else {
        // Compile the serialized JSON representation of the command by hand.
        std::string serialized_command = "{ \"name\" : \"" + command + "\"";
        serialized_command.append(", \"locator\" : ");
        serialized_command.append(locator_parameters);
        serialized_command.append(", \"parameters\" : ");
        serialized_command.append(command_body);
        serialized_command.append(" }");
        if (command == webdriver::CommandType::NewSession) {
          session_handle = this->InitializeSession();
        }
        bool session_is_valid = session_handle->ExecuteCommand(
            serialized_command,
            &serialized_response);
        if (command == webdriver::CommandType::NewSession) {
          Response new_session_response;
          new_session_response.Deserialize(serialized_response);
          this->sessions_[new_session_response.GetSessionId()] = session_handle;
        }
        if (!session_is_valid) {
          this->ShutDownSession(session_id);
        }
      }
    }
  }
  LOG(DEBUG) << "Response: " << serialized_response;
  return serialized_response;
}

std::string Server::ListSessions() {
  LOG(TRACE) << "Entering Server::ListSessions";

  // Manually construct the serialized command for getting 
  // session capabilities.
  std::string get_caps_command = "{ \"name\" : \"" + 
                                 webdriver::CommandType::GetSessionCapabilities
                                 + "\"" +
                                 ", \"locator\" : {}, \"parameters\" : {} }";

  Json::Value sessions(Json::arrayValue);
  SessionMap::iterator it = this->sessions_.begin();
  for (; it != this->sessions_.end(); ++it) {
    // Each element of the GetSessionList command is an object with two
    // named properties, "id" and "capabilities". We already know the
    // ID, so we execute the GetSessionCapabilities command on each session
    // to be able to return the capabilities.
    Json::Value session_descriptor;
    session_descriptor["id"] = it->first;

    SessionHandle session = it->second;
    std::string serialized_session_response;
    session->ExecuteCommand(get_caps_command, &serialized_session_response);

    Response session_response;
    session_response.Deserialize(serialized_session_response);
    session_descriptor["capabilities"] = session_response.value();
    sessions.append(session_descriptor);
  }
  Response response;
  response.SetSuccessResponse(sessions);
  return response.Serialize();
}

bool Server::LookupSession(const std::string& session_id,
                           SessionHandle* session_handle) {
  LOG(TRACE) << "Entering Server::LookupSession";

  SessionMap::iterator it = this->sessions_.find(session_id);
  if (it == this->sessions_.end()) {
    return false;
  }
  *session_handle = it->second;
  return true;
}

int Server::SendResponseToClient(struct mg_connection* conn,
                                 const struct mg_request_info* request_info,
                                 const std::string& serialized_response) {
  LOG(TRACE) << "Entering Server::SendResponseToClient";

  int return_code = 0;
  if (serialized_response.size() > 0) {
    Response response;
    response.Deserialize(serialized_response);
    return_code = response.GetHttpResponseCode();
    if (return_code == 0) {
      this->SendHttpOk(conn,
                       request_info,
                       serialized_response,
                       HTML_CONTENT_TYPE);
      return_code = 200;
    } else if (return_code == 200) {
      this->SendHttpOk(conn,
                       request_info,
                       serialized_response,
                       JSON_CONTENT_TYPE);
    } else if (return_code == 303) {
      std::string location = response.value().asString();
      response.SetSuccessResponse(response.value());
      this->SendHttpSeeOther(conn, request_info, location);
      return_code = 303;
    } else if (return_code == 400) {
      this->SendHttpBadRequest(conn, request_info, serialized_response);
      return_code = 400;
    } else if (return_code == 404) {
      this->SendHttpNotFound(conn, request_info, serialized_response);
      return_code = 404;
    } else if (return_code == 405) {
      std::string allowed_verbs = "";
      Json::Value additional_data = response.additional_data();
      if (additional_data.isObject() && additional_data.isMember("verbs")) {
        allowed_verbs = additional_data["verbs"].asString();
      }
      this->SendHttpMethodNotAllowed(conn,
                                     request_info,
                                     allowed_verbs,
                                     serialized_response);
      return_code = 405;
    } else if (return_code == 501) {
      this->SendHttpNotImplemented(conn,
                                   request_info,
                                   "");
      return_code = 501;
    } else {
      this->SendHttpInternalError(conn, request_info, serialized_response);
      return_code = 500;
    }
  }
  return return_code;
}

// The standard HTTP Status codes are implemented below.  Chrome uses
// OK, See Other, Not Found, Method Not Allowed, and Internal Error.
// Internal Error, HTTP 500, is used as a catch all for any issue
// not covered in the JSON protocol.
void Server::SendHttpOk(struct mg_connection* connection,
                        const struct mg_request_info* request_info,
                        const std::string& body,
                        const std::string& content_type) {
  LOG(TRACE) << "Entering Server::SendHttpOk";

  std::string body_to_send = body + "\r\n";

  std::ostringstream out;
  out << "HTTP/1.1 200 OK\r\n"
      << "Content-Length: " << strlen(body_to_send.c_str()) << "\r\n"
      << "Content-Type: " << content_type << "; charset=utf-8\r\n"
      << "Cache-Control: no-cache\r\n"
      << "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
      << "Accept-Ranges: bytes\r\n\r\n";
  if (strcmp(request_info->request_method, "HEAD") != 0) {
    out << body_to_send;
  }

  mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpBadRequest(struct mg_connection* const connection,
                                const struct mg_request_info* request_info,
                                const std::string& body) {
  LOG(TRACE) << "Entering Server::SendHttpBadRequest";

  std::string body_to_send = body + "\r\n";

  std::ostringstream out;
  out << "HTTP/1.1 400 Bad Request\r\n"
      << "Content-Length: " << strlen(body_to_send.c_str()) << "\r\n"
      << "Content-Type: application/json; charset=utf-8\r\n"
      << "Cache-Control: no-cache\r\n"
      << "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
      << "Accept-Ranges: bytes\r\n\r\n";
  if (strcmp(request_info->request_method, "HEAD") != 0) {
    out << body_to_send;
  }

  mg_printf(connection, "%s", out.str().c_str());
}

void Server::SendHttpInternalError(struct mg_connection* connection,
                                   const struct mg_request_info* request_info,
                                   const std::string& body) {
  LOG(TRACE) << "Entering Server::SendHttpInternalError";

  std::string body_to_send = body + "\r\n";

  std::ostringstream out;
  out << "HTTP/1.1 500 Internal Server Error\r\n"
      << "Content-Length: " << strlen(body_to_send.c_str()) << "\r\n"
      << "Content-Type: application/json; charset=utf-8\r\n"
      << "Cache-Control: no-cache\r\n"
      << "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
      << "Accept-Ranges: bytes\r\n\r\n";
  if (strcmp(request_info->request_method, "HEAD") != 0) {
    out << body_to_send;
  }

  mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpNotFound(struct mg_connection* const connection,
                              const struct mg_request_info* request_info,
                              const std::string& body) {
  LOG(TRACE) << "Entering Server::SendHttpNotFound";

  std::string body_to_send = body + "\r\n";

  std::ostringstream out;
  out << "HTTP/1.1 404 Not Found\r\n"
      << "Content-Length: " << strlen(body_to_send.c_str()) << "\r\n"
      << "Content-Type: application/json; charset=utf-8\r\n"
      << "Cache-Control: no-cache\r\n"
      << "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
      << "Accept-Ranges: bytes\r\n\r\n";
  if (strcmp(request_info->request_method, "HEAD") != 0) {
    out << body_to_send;
  }

  mg_printf(connection, "%s", out.str().c_str());
}

void Server::SendHttpMethodNotAllowed(
    struct mg_connection* connection,
    const struct mg_request_info* request_info,
    const std::string& allowed_methods,
    const std::string& body) {
  LOG(TRACE) << "Entering Server::SendHttpMethodNotAllowed";

  std::string body_to_send = body + "\r\n";

  std::ostringstream out;
  out << "HTTP/1.1 405 Method Not Allowed\r\n"
      << "Content-Type: text/html\r\n"
      << "Content-Length: " << strlen(body_to_send.c_str()) << "\r\n"
      << "Allow: " << allowed_methods << "\r\n\r\n";
  if (strcmp(request_info->request_method, "HEAD") != 0) {
    out << body_to_send;
  }

  mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpTimeout(struct mg_connection* connection,
                             const struct mg_request_info* request_info,
                             const std::string& body) {
  LOG(TRACE) << "Entering Server::SendHttpTimeout";

  std::ostringstream out;
  out << "HTTP/1.1 408 Timeout\r\n\r\n"
      << "Content-Length: " << strlen(body.c_str()) << "\r\n"
      << "Content-Type: application/json; charset=utf-8\r\n"
      << "Cache-Control: no-cache\r\n"
      << "Vary: Accept-Charset, Accept-Encoding, Accept-Language, Accept\r\n"
      << "Accept-Ranges: bytes\r\n\r\n";

  mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpNotImplemented(struct mg_connection* connection,
                                    const struct mg_request_info* request_info,
                                    const std::string& body) {
  LOG(TRACE) << "Entering Server::SendHttpNotImplemented";

  std::ostringstream out;
  out << "HTTP/1.1 501 Not Implemented\r\n\r\n";

  mg_write(connection, out.str().c_str(), out.str().size());
}

void Server::SendHttpSeeOther(struct mg_connection* connection,
                              const struct mg_request_info* request_info,
                              const std::string& location) {
  LOG(TRACE) << "Entering Server::SendHttpSeeOther";

  std::ostringstream out;
  out << "HTTP/1.1 303 See Other\r\n"
      << "Location: " << location << "\r\n"
      << "Content-Type: text/html\r\n"
      << "Content-Length: 0\r\n\r\n";

  mg_write(connection, out.str().c_str(), out.str().size());
}

std::string Server::LookupCommand(const std::string& uri,
                                  const std::string& http_verb,
                                  std::string* session_id,
                                  std::string* locator) {
  LOG(TRACE) << "Entering Server::LookupCommand";

  std::string value = webdriver::CommandType::NoCommand;
  std::vector<std::string> url_fragments;
  UriInfo::ParseUri(uri, &url_fragments, NULL);
  UrlMap::const_iterator it = this->commands_.begin();
  for (; it != this->commands_.end(); ++it) {
    std::vector<std::string> locator_param_names;
    std::vector<std::string> locator_param_values;
    if (it->second->IsUriMatch(url_fragments,
                               &locator_param_names,
                               &locator_param_values)) {
      if (it->second->HasHttpVerb(http_verb, &value)) {
        std::string param = this->ConstructLocatorParameterJson(
            locator_param_names, locator_param_values, session_id);
        locator->append(param);
      } else {
        locator->append(it->second->GetSupportedVerbs());
      }
      break;
    }
  }
  return value;
}

std::string Server::ConstructLocatorParameterJson(
    std::vector<std::string> locator_param_names, 
    std::vector<std::string> locator_param_values,
    std::string* session_id) {
  std::string param = "{";
  size_t param_count = locator_param_names.size();
  for (unsigned int i = 0; i < param_count; i++) {
    if (i != 0) {
      param.append(",");
    }

    param.append(" \"");
    param.append(locator_param_names[i]);
    param.append("\" : \"");
    param.append(locator_param_values[i]);
    param.append("\"");
    if (locator_param_names[i] == "sessionid") {
      session_id->append(locator_param_values[i]);
    }
  }

  param.append(" }");
  return param;
}

void Server::PopulateCommandRepository() {
  LOG(TRACE) << "Entering Server::PopulateCommandRepository";

  this->AddCommand("/session", "POST",  webdriver::CommandType::NewSession);
  this->AddCommand("/session/:sessionid", "DELETE",  webdriver::CommandType::Quit);
  this->AddCommand("/status", "GET", webdriver::CommandType::Status);
  this->AddCommand("/session/:sessionid/timeouts", "GET", webdriver::CommandType::GetTimeouts);
  this->AddCommand("/session/:sessionid/timeouts", "POST", webdriver::CommandType::SetTimeouts);
  this->AddCommand("/session/:sessionid/url", "GET",  webdriver::CommandType::GetCurrentUrl);
  this->AddCommand("/session/:sessionid/url", "POST",  webdriver::CommandType::Get);
  this->AddCommand("/session/:sessionid/back", "POST",  webdriver::CommandType::GoBack);
  this->AddCommand("/session/:sessionid/forward", "POST",  webdriver::CommandType::GoForward);
  this->AddCommand("/session/:sessionid/refresh", "POST",  webdriver::CommandType::Refresh);
  this->AddCommand("/session/:sessionid/title", "GET",  webdriver::CommandType::GetTitle);
  this->AddCommand("/session/:sessionid/window", "GET",  webdriver::CommandType::GetCurrentWindowHandle);
  this->AddCommand("/session/:sessionid/window", "POST",  webdriver::CommandType::SwitchToWindow);
  this->AddCommand("/session/:sessionid/window", "DELETE",  webdriver::CommandType::CloseWindow);
  this->AddCommand("/session/:sessionid/window/handles", "GET",  webdriver::CommandType::GetWindowHandles);
  this->AddCommand("/session/:sessionid/window/new", "POST",  webdriver::CommandType::NewWindow);
  this->AddCommand("/session/:sessionid/frame", "POST",  webdriver::CommandType::SwitchToFrame);
  this->AddCommand("/session/:sessionid/frame/parent", "POST",  webdriver::CommandType::SwitchToParentFrame);
  this->AddCommand("/session/:sessionid/window/rect", "GET", webdriver::CommandType::GetWindowRect);
  this->AddCommand("/session/:sessionid/window/rect", "POST", webdriver::CommandType::SetWindowRect);
  this->AddCommand("/session/:sessionid/window/maximize", "POST", webdriver::CommandType::MaximizeWindow);
  this->AddCommand("/session/:sessionid/window/minimize", "POST", webdriver::CommandType::MinimizeWindow);
  this->AddCommand("/session/:sessionid/window/fullscreen", "POST", webdriver::CommandType::FullscreenWindow);
  this->AddCommand("/session/:sessionid/element/active", "GET",  webdriver::CommandType::GetActiveElement);
  this->AddCommand("/session/:sessionid/element", "POST",  webdriver::CommandType::FindElement);
  this->AddCommand("/session/:sessionid/elements", "POST",  webdriver::CommandType::FindElements);
  this->AddCommand("/session/:sessionid/element/:id/element", "POST",  webdriver::CommandType::FindChildElement);
  this->AddCommand("/session/:sessionid/element/:id/elements", "POST",  webdriver::CommandType::FindChildElements);
  this->AddCommand("/session/:sessionid/element/:id/selected", "GET",  webdriver::CommandType::IsElementSelected);
  this->AddCommand("/session/:sessionid/element/:id/attribute/:name", "GET", webdriver::CommandType::GetElementAttribute);
  this->AddCommand("/session/:sessionid/element/:id/property/:name", "GET", webdriver::CommandType::GetElementProperty);
  this->AddCommand("/session/:sessionid/element/:id/css/:propertyName", "GET",  webdriver::CommandType::GetElementValueOfCssProperty);
  this->AddCommand("/session/:sessionid/element/:id/text", "GET",  webdriver::CommandType::GetElementText);
  this->AddCommand("/session/:sessionid/element/:id/name", "GET",  webdriver::CommandType::GetElementTagName);
  this->AddCommand("/session/:sessionid/element/:id/rect", "GET", webdriver::CommandType::GetElementRect);
  this->AddCommand("/session/:sessionid/element/:id/enabled", "GET",  webdriver::CommandType::IsElementEnabled);
  this->AddCommand("/session/:sessionid/element/:id/click", "POST",  webdriver::CommandType::ClickElement);
  this->AddCommand("/session/:sessionid/element/:id/clear", "POST",  webdriver::CommandType::ClearElement);
  this->AddCommand("/session/:sessionid/element/:id/value", "POST",  webdriver::CommandType::SendKeysToElement);
  this->AddCommand("/session/:sessionid/source", "GET",  webdriver::CommandType::GetPageSource);
  this->AddCommand("/session/:sessionid/execute/sync", "POST",  webdriver::CommandType::ExecuteScript);
  this->AddCommand("/session/:sessionid/execute/async", "POST",  webdriver::CommandType::ExecuteAsyncScript);
  this->AddCommand("/session/:sessionid/cookie", "GET",  webdriver::CommandType::GetAllCookies);
  this->AddCommand("/session/:sessionid/cookie/:name", "GET", webdriver::CommandType::GetNamedCookie);
  this->AddCommand("/session/:sessionid/cookie", "POST",  webdriver::CommandType::AddCookie);
  this->AddCommand("/session/:sessionid/cookie", "DELETE",  webdriver::CommandType::DeleteAllCookies);
  this->AddCommand("/session/:sessionid/cookie/:name", "DELETE",  webdriver::CommandType::DeleteNamedCookie);
  this->AddCommand("/session/:sessionid/actions", "POST", webdriver::CommandType::Actions);
  this->AddCommand("/session/:sessionid/actions", "DELETE", webdriver::CommandType::ReleaseActions);
  this->AddCommand("/session/:sessionid/alert/dismiss", "POST",  webdriver::CommandType::DismissAlert);
  this->AddCommand("/session/:sessionid/alert/accept", "POST",  webdriver::CommandType::AcceptAlert);
  this->AddCommand("/session/:sessionid/alert/text", "GET",  webdriver::CommandType::GetAlertText);
  this->AddCommand("/session/:sessionid/alert/text", "POST",  webdriver::CommandType::SendKeysToAlert);
  this->AddCommand("/session/:sessionid/screenshot", "GET", webdriver::CommandType::Screenshot);
  this->AddCommand("/session/:sessionid/element/:id/screenshot", "GET", webdriver::CommandType::ElementScreenshot);

  // Additional commands required to be supported, but not defined
  // in the specification.
  this->AddCommand("/session/:sessionid/alert/credentials", "POST",  webdriver::CommandType::SetAlertCredentials);
  this->AddCommand("/session/:sessionid/element/:id/displayed", "GET",  webdriver::CommandType::IsElementDisplayed);
  this->AddCommand("/session/:sessionid/element/:id/equals/:other", "GET",  webdriver::CommandType::ElementEquals);
  this->AddCommand("/sessions", "GET",  webdriver::CommandType::GetSessionList);
  this->AddCommand("/session/:sessionid", "GET",  webdriver::CommandType::GetSessionCapabilities);

  this->AddCommand("/session/:sessionid/ime/available_engines", "GET",  webdriver::CommandType::ListAvailableImeEngines);
  this->AddCommand("/session/:sessionid/ime/active_engines", "GET",  webdriver::CommandType::GetActiveImeEngine);
  this->AddCommand("/session/:sessionid/ime/activated", "GET",  webdriver::CommandType::IsImeActivated);
  this->AddCommand("/session/:sessionid/ime/activate", "POST",  webdriver::CommandType::ActivateImeEngine);
  this->AddCommand("/session/:sessionid/ime/deactivate", "POST",  webdriver::CommandType::DeactivateImeEngine);
}

}  // namespace webdriver
