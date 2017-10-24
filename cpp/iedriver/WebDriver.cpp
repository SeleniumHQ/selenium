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

#include "WebDriver.h"

#include "logging.h"

#include "StringUtilities.h"

webdriver::Server* StartServer(int port,
                               const std::wstring& host,
                               const std::wstring& log_level,
                               const std::wstring& log_file,
                               const std::wstring& version,
                               const std::wstring& whitelist) {
  LOG(TRACE) << "Entering StartServer";
  if (server == NULL) {
    LOG(DEBUG) << "Instantiating webdriver server";

    std::string converted_host = webdriver::StringUtilities::ToString(host);
    std::string converted_log_level = webdriver::StringUtilities::ToString(log_level);
    std::string converted_log_file = webdriver::StringUtilities::ToString(log_file);
    std::string converted_version = webdriver::StringUtilities::ToString(version);
    std::string converted_acl = webdriver::StringUtilities::ToString(whitelist);
    server = new webdriver::IEServer(port,
                                     converted_host,
                                     converted_log_level,
                                     converted_log_file,
                                     converted_version,
                                     converted_acl);
    if (!server->Start()) {
      LOG(TRACE) << "Starting of IEServer is failed";
      delete server;
      server = NULL;
    }
  }
  return server;
}

void StopServer() {
  LOG(TRACE) << "Entering StopServer";
  if (server) {
    server->Stop();
    delete server;
    server = NULL;
  }
}
