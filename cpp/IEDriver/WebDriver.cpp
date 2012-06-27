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

webdriver::Server* StartServer(int port) {
  return StartServerEx(port, "", "", "");
}

webdriver::Server* StartServerEx(int port,
                                 const std::string& host,
                                 const std::string& log_level,
                                 const std::string& log_file) {
  if (server == NULL) {
    server = new webdriver::IEServer(port, host, log_level, log_file);
    if (!server->Start()) {
      delete server;
      server = NULL;
    }
  }
  return server;
}

void StopServer(webdriver::Server* myserver) {
  if (server) {
    server->Stop();
    delete server;
    server = NULL;
  }
}

int GetServerSessionCount() {
  int session_count(0);
  if (server != NULL) {
    session_count = server->session_count();
  }
  return session_count;
}

int GetServerPort() {
  int server_port(0);
  if (server != NULL) {
    server_port = server->port();
  }
  return server_port;
}

bool ServerIsRunning() {
  return server != NULL;
}