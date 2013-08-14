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
#include "logging.h"

namespace webdriver {

IEServer::IEServer(int port,
                   const std::string& host,
                   const std::string& log_level,
                   const std::string& log_file,
                   const std::string& version) : Server(port, host, log_level, log_file) {
  LOG(TRACE) << "Entering IEServer::IEServer";

  this->version_ = version;
}

IEServer::~IEServer(void) {
}

SessionHandle IEServer::InitializeSession() {
  LOG(TRACE) << "Entering IEServer::InitializeSession";
  SessionHandle session_handle(new IESession());
  SessionParameters params;
  params.port = this->port();
  session_handle->Initialize(reinterpret_cast<void*>(&params));
  return session_handle;
}

std::string IEServer::GetStatus() {
  LOG(TRACE) << "Entering IEServer::GetStatus";
  SYSTEM_INFO system_info;
  ::ZeroMemory(&system_info, sizeof(SYSTEM_INFO));
  ::GetNativeSystemInfo(&system_info);

  OSVERSIONINFO os_version_info;
  ::ZeroMemory(&os_version_info, sizeof(OSVERSIONINFO));
  os_version_info.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);
  ::GetVersionEx(&os_version_info);

  std::string major_version = std::to_string(static_cast<long long>(os_version_info.dwMajorVersion));
  std::string minor_version = std::to_string(static_cast<long long>(os_version_info.dwMinorVersion));
  std::string build_version = std::to_string(static_cast<long long>(os_version_info.dwBuildNumber));
  std::string os_version = major_version + "." + minor_version + "." + build_version;

  std::string arch = "x86";
  if (system_info.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64) {
    arch = "x64";
  }

  Json::Value build;
  build["version"] = this->version_;

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
  LOG(TRACE) << "Entering IEServer::ShutDown";  
  DWORD process_id = ::GetCurrentProcessId();
  std::wstring process_id_string = std::to_wstring(static_cast<long long>(process_id));
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
