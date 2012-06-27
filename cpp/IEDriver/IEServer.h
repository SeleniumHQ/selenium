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

#ifndef WEBDRIVER_IE_IESERVER_H_
#define WEBDRIVER_IE_IESERVER_H_

#include "server.h"

#define IESERVER_SHUTDOWN_EVENT_NAME L"IEServer_Shutdown_Event"

using namespace std;

namespace webdriver
{

class IEServer : public Server
{
 public:
  IEServer(int port,
           const std::string& host,
           const std::string& log_level,
           const std::string& log_file);
  virtual ~IEServer(void);

 protected:
  virtual SessionHandle InitializeSession(void);
  virtual std::string GetStatus(void);
  virtual void ShutDown(void);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IESERVER_H_