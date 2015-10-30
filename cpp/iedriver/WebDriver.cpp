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

std::wstring ProcessWhitelistedIpsArgument(const std::wstring whitelist) {
    // Convert comma separated string of IP addresses into a Civetweb ACL
    if (whitelist == L"")
    {
        // Different behavior than the Chrome WebDriver, as there a missing whitelisted-ips argument
        // means "local only" connections, an an empty string ("") means all remote IPs allowed.
        // IEDriverServer doesn't appear to have a way to test for missing cli arguments, so an empty
        // string will mean to allow local only connections.
        return L"-0.0.0.0/0,+127.0.0.1";
    }

    std::vector<std::wstring> whitelisted_ips;
    webdriver::StringUtilities::Split(whitelist, L",", &whitelisted_ips);
    std::wstring acl = L"-0.0.0.0/0";

    for (std::vector<std::wstring>::iterator it = whitelisted_ips.begin(); it != whitelisted_ips.end(); ++it) {
        acl += L",+" + webdriver::StringUtilities::Trim(*it);
    }

    return acl;
}

webdriver::Server* StartServer(int port,
                               const std::wstring& host,
                               const std::wstring& log_level,
                               const std::wstring& log_file,
                               const std::wstring& version,
                               const std::wstring& driver_engine,
                               const std::wstring& whitelist) {
  LOG(TRACE) << "Entering StartServer";
  if (server == NULL) {
    LOG(DEBUG) << "Instantiating webdriver server";

    std::string converted_host = webdriver::StringUtilities::ToString(host);
    std::string converted_log_level = webdriver::StringUtilities::ToString(log_level);
    std::string converted_log_file = webdriver::StringUtilities::ToString(log_file);
    std::string converted_version = webdriver::StringUtilities::ToString(version);
    std::string converted_engine = webdriver::StringUtilities::ToString(driver_engine);
    std::string converted_acl = webdriver::StringUtilities::ToString(ProcessWhitelistedIpsArgument(whitelist));
    server = new webdriver::IEServer(port,
                                     converted_host,
                                     converted_log_level,
                                     converted_log_file,
                                     converted_version,
                                     converted_engine,
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
