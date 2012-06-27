// Copyright 2011 Software Freedom Conservancy
// Licensed under the Apache License, Version 2.0 (the "License");
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

// Defines the server to respond to WebDriver JSON wire protocol commands.
// Subclasses are expected to provide their own initialization mechanism.

#ifndef WEBDRIVER_SERVER_SERVER_H_
#define WEBDRIVER_SERVER_SERVER_H_

#include <vector>
#include <map>
#include <sstream>
#include <string>
#include "command_types.h"
#include "mongoose.h"
#include "response.h"
#include "session.h"

namespace webdriver {

class Server {
 public:
  explicit Server(const int port);
  Server(const int port, const std::string& host);
  Server(const int port, const std::string& host, const std::string& log_level, const std::string& log_file);
  virtual ~Server(void);

  static void* OnHttpEvent(enum mg_event event_raised,
                           struct mg_connection* conn,
                           const struct mg_request_info* request_info);
  bool Start(void);
  void Stop(void);
  int ProcessRequest(struct mg_connection* conn,
                     const struct mg_request_info* request_info);

  int port(void) const { return this->port_; }

  int session_count(void) const {
    return static_cast<int>(this->sessions_.size());
  }

 protected:
  virtual SessionHandle InitializeSession(void) = 0;
  virtual std::string GetStatus(void) = 0;
  virtual void ShutDown(void) = 0;

 private:
  typedef std::map<std::string, int> VerbMap;
  typedef std::map<std::string, VerbMap> UrlMap;
  typedef std::map<std::string, SessionHandle> SessionMap;

  void Initialize(const int port,
                  const std::string& host,
                  const std::string& log_level,
                  const std::string& log_file);

  std::string ListSessions(void);
  int LookupCommand(const std::string& uri,
                    const std::string& http_verb,
                    std::string* session_id,
                    std::string* locator);
  std::string DispatchCommand(const std::string& url,
                              const std::string& http_verb,
                              const std::string& command_body);
  std::string CreateSession(void);
  void ShutDownSession(const std::string& session_id);
  std::string ReadRequestBody(struct mg_connection* conn,
                              const struct mg_request_info* request_info);
  bool LookupSession(const std::string& session_id,
                     SessionHandle* session_handle);
  int SendResponseToClient(struct mg_connection* conn,
                           const struct mg_request_info* request_info,
                           const std::string& serialized_response);
  void PopulateCommandRepository(void);

  void SendHttpOk(mg_connection* connection,
                  const mg_request_info* request_info,
                  const std::string& body,
                  const std::string& content_type);
  void SendHttpBadRequest(mg_connection* connection,
                          const mg_request_info* request_info,
                          const std::string& body);
  void SendHttpInternalError(mg_connection* connection,
                             const mg_request_info* request_info,
                             const std::string& body);
  void SendHttpMethodNotAllowed(mg_connection* connection,
                                const mg_request_info* request_info,
                                const std::string& allowed_methods);
  void SendHttpNotFound(mg_connection* connection,
                        const mg_request_info* request_info,
                        const std::string& body);
  void SendHttpNotImplemented(mg_connection* connection,
                              const mg_request_info* request_info,
                              const std::string& body);
  void SendHttpSeeOther(mg_connection* connection,
                        const mg_request_info* request_info,
                        const std::string& location);

  // The port used for communicating with this server.
  int port_;
  // The host IP address to which the server should bind.
  std::string host_;
  // The map of all command URIs (URL and HTTP verb), and 
  // the corresponding numerical value of the command.
  UrlMap commands_;
  // The map of all sessions currently active in this server.
  SessionMap sessions_;
  // The Mongoose context for this server.
  struct mg_context* context_;

  DISALLOW_COPY_AND_ASSIGN(Server);
};

}  // namespace WebDriver

#endif  // WEBDRIVER_SERVER_SERVER_H_
