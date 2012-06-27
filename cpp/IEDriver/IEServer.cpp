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

#include "IEServer.h"
#include "IESession.h"

namespace webdriver {

IEServer::IEServer(int port,
                   const std::string& host,
                   const std::string& log_level,
                   const std::string& log_file) : Server(port, host, log_level, log_file) {

}

IEServer::~IEServer(void) {
}

SessionHandle IEServer::InitializeSession() {
  SessionHandle session_handle(new IESession());
  int port = this->port();
  session_handle->Initialize(&port);
  return session_handle;
}

std::string IEServer::GetStatus() {
  SYSTEM_INFO system_info;
  ::ZeroMemory(&system_info, sizeof(SYSTEM_INFO));
  ::GetNativeSystemInfo(&system_info);

  OSVERSIONINFO os_version_info;
  ::ZeroMemory(&os_version_info, sizeof(OSVERSIONINFO));
  os_version_info.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);
  ::GetVersionEx(&os_version_info);

  // Allocate only 2 characters for the major and minor versions
  // and 5 characters for the build number (+1 for null char)
  vector<char> major_buffer(3);
  _itoa_s(os_version_info.dwMajorVersion, &major_buffer[0], 3, 10);
  vector<char> minor_buffer(3);
  _itoa_s(os_version_info.dwMinorVersion, &minor_buffer[0], 3, 10);
  vector<char> build_buffer(6);
  _itoa_s(os_version_info.dwBuildNumber, &build_buffer[0], 6, 10);

  std::string major_version(&major_buffer[0]);
  std::string minor_version(&minor_buffer[0]);
  std::string build_version(&build_buffer[0]);
  std::string os_version = major_version + "." + minor_version + "." + build_version;

  std::string arch = "x86";
  if (system_info.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64) {
    arch = "x64";
  }

  Json::Value build;
  build["version"] = "2.21.0";

  Json::Value os;
  os["arch"] = arch;
  os["name"] = "windows";
  os["version"] = os_version;
    
  Json::Value status;
  status["build"] = build;
  status["os"] = os;
  Response response;
  response.SetSuccessResponse(status);
  return response.Serialize();
}

void IEServer::ShutDown() {
  DWORD process_id = ::GetCurrentProcessId();
  vector<wchar_t> process_id_buffer(10);
  _ltow_s(process_id, &process_id_buffer[0], process_id_buffer.size(), 10);
  std::wstring process_id_string(&process_id_buffer[0]);
  std::wstring event_name = IESERVER_SHUTDOWN_EVENT_NAME + process_id_string;
  HANDLE event_handle = ::OpenEvent(EVENT_MODIFY_STATE,
                                    FALSE, 
                                    event_name.c_str());
  if (event_handle) {
    ::SetEvent(event_handle);
    ::CloseHandle(event_handle);
  }
}

} //namespace webdriver
