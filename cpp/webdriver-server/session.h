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

// Abstract class defining a session for the WebDriver server. Subclasses
// must implement methods to initialize, shutdown, and execute commands.

#ifndef WEBDRIVER_SERVER_SESSION_H_
#define WEBDRIVER_SERVER_SESSION_H_

#include <string>

namespace webdriver {

class Session {
 public:
  Session(void) {}
  virtual ~Session(void) {}

  virtual void Initialize(void* init_params) = 0;
  virtual void ShutDown(void) = 0;
  virtual bool ExecuteCommand(const std::string& serialized_command,
                              std::string* serialized_response) = 0;

  //std::string session_id(void) const { return this->session_id_; }

 protected:
  void set_session_id(const std::string& id) { this->session_id_ = id; }

 private:
  // The unique ID of the session.
  std::string session_id_;

  DISALLOW_COPY_AND_ASSIGN(Session);
};

}  // namespace webdriver

#endif  // WEBDRIVER_SERVER_SESSION_H_
