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

#ifndef WEBDRIVER_IE_IESERVER_H_
#define WEBDRIVER_IE_IESERVER_H_

#include "server.h"

#define IESERVER_SHUTDOWN_EVENT_NAME L"IEServer_Shutdown_Event"

namespace webdriver {

class IEServer : public Server {
 public:
  IEServer(int port,
           const std::string& host,
           const std::string& log_level,
           const std::string& log_file,
           const std::string& version,
           const std::string& acl);
  virtual ~IEServer(void);

 protected:
  virtual SessionHandle InitializeSession(void);
  virtual std::string GetStatus(void);
  virtual void ShutDown(void);
 private:
  std::string version_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IESERVER_H_