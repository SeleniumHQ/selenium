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

#include "WebDriver.h"

webdriver::Server* StartServer(int port,
                               const std::wstring& host,
                               const std::wstring& log_level,
                               const std::wstring& log_file,
                               const std::wstring& version) {
  if (server == NULL) {
    std::string converted_host = CW2A(host.c_str(), CP_UTF8);
    std::string converted_log_level = CW2A(log_level.c_str(), CP_UTF8);
    std::string converted_log_file = CW2A(log_file.c_str(), CP_UTF8);
    std::string converted_version = CW2A(version.c_str(), CP_UTF8);
    server = new webdriver::IEServer(port,
                                     converted_host,
                                     converted_log_level,
                                     converted_log_file,
                                     converted_version);
    if (!server->Start()) {
      delete server;
      server = NULL;
    }
  }
  return server;
}

void StopServer() {
  if (server) {
    server->Stop();
    delete server;
    server = NULL;
  }
}
