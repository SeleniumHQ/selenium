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

#include "stdafx.h"
#include "resource.h"
#include "CommandLineArguments.h"
#include "IEServer.h"
#include <algorithm>
#include <iostream>
#include <map>
#include <iostream>
#include <string>
#include <vector>

// The prototypes for these functions must match those exported
// by the .dll produced by the IEDriver project in this solution.
// The definitions of these functions can be found in WebDriver.h
// in that project.
typedef void* (__cdecl *STARTSERVERPROC)(int, const std::wstring&, const std::wstring&, const std::wstring&, const std::wstring&, const std::wstring&, const std::wstring&);
typedef void (__cdecl *STOPSERVERPROC)(void);

#define ERR_DLL_EXTRACT_FAIL 1
#define ERR_DLL_LOAD_FAIL 2
#define ERR_FUNCTION_NOT_FOUND 3
#define ERR_SERVER_START 4

#define RESOURCE_TYPE L"BINARY"
#define TEMP_FILE_PREFIX L"IEDriver"
#define START_SERVER_EX_API_NAME "StartServer"
#define STOP_SERVER_API_NAME "StopServer"

#define PORT_COMMAND_LINE_ARG L"port"
#define HOST_COMMAND_LINE_ARG L"host"
#define LOGLEVEL_COMMAND_LINE_ARG L"log-level"
#define LOGFILE_COMMAND_LINE_ARG L"log-file"
#define SILENT_COMMAND_LINE_ARG L"silent"
#define EXTRACTPATH_COMMAND_LINE_ARG L"extract-path"
#define IMPLEMENTATION_COMMAND_LINE_ARG L"implementation"
#define ACL_COMMAND_LINE_ARG L"whitelisted-ips"
#define BOOLEAN_COMMAND_LINE_ARG_MISSING_VALUE L"value-not-specified"

bool ExtractResource(unsigned short resource_id,
                     const std::wstring& output_file_name) {
  bool success = false; 
  try {
    // First find and load the required resource
    HRSRC resource_handle = ::FindResource(NULL, 
                                           MAKEINTRESOURCE(resource_id),
                                           RESOURCE_TYPE);
    HGLOBAL global_resouce_handle = ::LoadResource(NULL, resource_handle);

    // Now open and map this to a disk file
    LPVOID file_pointer = ::LockResource(global_resouce_handle);
    DWORD resource_size = ::SizeofResource(NULL, resource_handle);
 
    // Open the file and filemap
    HANDLE file_handle = ::CreateFile(output_file_name.c_str(),
                                      GENERIC_READ | GENERIC_WRITE,
                                      0,
                                      NULL,
                                      CREATE_ALWAYS, 
                                      FILE_ATTRIBUTE_NORMAL, 
                                      NULL);
    HANDLE file_mapping_handle = ::CreateFileMapping(file_handle,
                                                     NULL,
                                                     PAGE_READWRITE, 
                                                     0,
                                                     resource_size, 
                                                     NULL);
    LPVOID base_address_pointer = ::MapViewOfFile(file_mapping_handle,
                                                  FILE_MAP_WRITE,
                                                  0,
                                                  0,
                                                  0);

    // Write the file
    ::CopyMemory(base_address_pointer, file_pointer, resource_size);

    // Unmap the file and close the handles
    ::UnmapViewOfFile(base_address_pointer);
    ::CloseHandle(file_mapping_handle);
    ::CloseHandle(file_handle);
    success = true;
  } catch(...) {
    // Ignore all type of errors
  } 
  return success;
}

std::wstring GetProcessArchitectureDescription() {
  std::wstring arch_description = L"32-bit";
  SYSTEM_INFO system_info;
  ::GetNativeSystemInfo(&system_info);
  if (system_info.wProcessorArchitecture != 0) {
    BOOL is_emulated;
    HANDLE process_handle = ::GetCurrentProcess();
    ::IsWow64Process(process_handle, &is_emulated);
    if (!is_emulated) {
      arch_description = L"64-bit";
    }
    ::CloseHandle(process_handle);
  }

  return arch_description;
}

std::wstring GetExecutableVersion() {
  struct LANGANDCODEPAGE {
    WORD language;
    WORD code_page;
  } *lang_info;

  // get the filename of the executable containing the version resource
  std::vector<wchar_t> file_name_buffer(MAX_PATH + 1);
  ::GetModuleFileNameW(NULL, &file_name_buffer[0], MAX_PATH);

  DWORD dummy;
  DWORD length = ::GetFileVersionInfoSizeW(&file_name_buffer[0],
                                           &dummy);
  std::vector<BYTE> version_buffer(length);
  ::GetFileVersionInfoW(&file_name_buffer[0],
                       dummy,
                       length,
                       &version_buffer[0]);

  UINT page_count;
  BOOL query_result = ::VerQueryValueW(&version_buffer[0],
                                      L"\\VarFileInfo\\Translation",
                                      reinterpret_cast<void**>(&lang_info),
                                      &page_count);
    
  wchar_t sub_block[MAX_PATH];
  _snwprintf_s(sub_block,
               MAX_PATH,
               MAX_PATH,
               L"\\StringFileInfo\\%04x%04x\\FileVersion",
               lang_info->language,
               lang_info->code_page);
  LPVOID value = NULL;
  UINT size;
  query_result = ::VerQueryValueW(&version_buffer[0],
                                 sub_block,
                                 &value,
                                 &size);
  return static_cast<wchar_t*>(value);
}


void ShowUsage(void) {
  std::wcout << L"Launches the WebDriver server for the Internet Explorer driver" << std::endl
             << std::endl
             << L"IEDriverServer [/port=<port>] [/host=<host>] [/log-level=<level>]" << std::endl
             << L"               [/log-file=<file>] [/extract-path=<path>] [/silent]" << std::endl
             << L"               [/whitelisted-ips=<whitelisted-ips>] [/version]" << std::endl
             << std::endl
             << L"  /port=<port>  Specifies the port on which the server will listen for" << std::endl
             << L"                commands. Defaults to 5555 if not specified." << std::endl
             << L"  /host=<host>  Specifies the address of the host adapter on which the server" << std::endl
             << L"                will listen for commands." << std::endl
             << L"  /log-level=<level>" << std::endl
             << L"                Specifies the log level used by the server. Valid values are:" << std::endl
             << L"                TRACE, DEBUG, INFO, WARN, ERROR, and FATAL. Defaults to FATAL" << std::endl
             << L"                if not specified." << std::endl
             << L"  /log-file=<file>" << std::endl
             << L"                Specifies the full path and file name of the log file used by" << std::endl
             << L"                the server. Defaults logging to stdout if not specified. " << std::endl
             << L"  /implementation=<implementation>" << std::endl
             << L"                Specifies the driver implementation used by the server. Valid" << std::endl
             << L"                values are: LEGACY, AUTODETECT, VENDOR. Defaults to LEGACY if" << std::endl
             << L"                not specified." << std::endl
             << L"  /extract-path=<path>" << std::endl
             << L"                Specifies the full path to the directory used to extract" << std::endl
             << L"                supporting files used by the server. Defaults to the TEMP" << std::endl
             << L"                directory if not specified." << std::endl
             << L"  /silent       Suppresses diagnostic output when the server is started." << std::endl
             << L"  /whitelisted-ips=<whitelisted-ips>" << std::endl
             << L"                Comma-separated whitelist of remote IPv4 addresses which" << std::endl
             << L"                are allowed to connect to the WebDriver server." << std::endl
             << L"  /version      Displays version information and exits. All other arguments" << std::endl
             << L"                are ignored." << std::endl;
}

int _tmain(int argc, _TCHAR* argv[]) {
  CommandLineArguments args(argc, argv);
  if (args.is_help_requested()) {
    ShowUsage();
    return 0;
  }
  vector<TCHAR> temp_file_name_buffer(MAX_PATH);
  vector<TCHAR> temp_path_buffer(MAX_PATH);

  //  Gets the temp path env string (no guarantee it's a valid path).
  unsigned long temp_path_length = ::GetTempPath(MAX_PATH,
                                                 &temp_path_buffer[0]);

  std::wstring extraction_path(&temp_path_buffer[0]);

  std::wstring extraction_path_arg = args.GetValue(EXTRACTPATH_COMMAND_LINE_ARG, L"");
  if (extraction_path_arg.size() != 0) {
    extraction_path = extraction_path_arg;
  }
  
  unsigned int error_code = ::GetTempFileName(extraction_path.c_str(),
                                              TEMP_FILE_PREFIX,
                                              0,
                                              &temp_file_name_buffer[0]);

  std::wstring temp_file_name(&temp_file_name_buffer[0]);
  if (!ExtractResource(IDR_DRIVER_LIBRARY, temp_file_name)) {
    std::wcout << L"Failed to extract the library to temp directory: "
               << temp_file_name;
    return ERR_DLL_EXTRACT_FAIL;
  }

  HMODULE module_handle = ::LoadLibrary(temp_file_name.c_str());
  if (module_handle == NULL) {
    std::wcout << L"Failed to load the library from temp directory: "
               << temp_file_name;
    return ERR_DLL_LOAD_FAIL;
  }

  STARTSERVERPROC start_server_ex_proc = reinterpret_cast<STARTSERVERPROC>(
      ::GetProcAddress(module_handle, START_SERVER_EX_API_NAME));
  STOPSERVERPROC stop_server_proc = reinterpret_cast<STOPSERVERPROC>(
      ::GetProcAddress(module_handle, STOP_SERVER_API_NAME));
  if (start_server_ex_proc == NULL || stop_server_proc == NULL) {
    std::wcout << L"Could not find entry point in extracted library: "
               << temp_file_name;
    return ERR_FUNCTION_NOT_FOUND;
  }

  int port = _wtoi(args.GetValue(PORT_COMMAND_LINE_ARG, L"5555").c_str());
  std::wstring host_address = args.GetValue(HOST_COMMAND_LINE_ARG, L"");
  std::wstring log_level = args.GetValue(LOGLEVEL_COMMAND_LINE_ARG, L"");
  std::wstring log_file = args.GetValue(LOGFILE_COMMAND_LINE_ARG, L"");
  bool silent = args.GetValue(SILENT_COMMAND_LINE_ARG,
      BOOLEAN_COMMAND_LINE_ARG_MISSING_VALUE).size() == 0;
  std::wstring executable_version = GetExecutableVersion();
  std::wstring executable_architecture = GetProcessArchitectureDescription();
  std::wstring implementation = args.GetValue(IMPLEMENTATION_COMMAND_LINE_ARG,
                                              L"");
  std::wstring whitelist = args.GetValue(ACL_COMMAND_LINE_ARG, L"");

  // coerce log level and implementation to uppercase, making the values
  // case-insensitive, to match expected values.
  std::transform(log_level.begin(),
                 log_level.end(),
                 log_level.begin(),
                 toupper);
  std::transform(implementation.begin(),
                 implementation.end(),
                 implementation.begin(),
                 toupper);

  if (args.is_version_requested()) {
    std::wcout << L"IEDriverServer.exe"
               << L" " << executable_version
               << L" (" << executable_architecture << L")" << std::endl;
  } else {
    void* server_value = start_server_ex_proc(port,
                                              host_address,
                                              log_level,
                                              log_file,
                                              executable_version + L" (" + executable_architecture + L")",
                                              implementation,
                                              whitelist);
    if (server_value == NULL) {
      std::wcout << L"Failed to start the server with: "
                 << L"port = '" << port << L"', "
                 << L"host = '" << host_address << L"', "
                 << L"log level = '" << log_level << L"', "
                 << L"log file = '" << log_file << L"', "
                 << L"whitelisted ips = '" << whitelist << L"'.";
      return ERR_SERVER_START;
    }
    if (!silent) {
      std::wcout << L"Started InternetExplorerDriver server"
                 << L" (" << executable_architecture << L")"
                 << std::endl;
      std::wcout << executable_version
                 << std::endl;
      std::wcout << L"Listening on port " << port << std::endl;
      if (host_address.size() > 0) {
        std::wcout << L"Bound to network adapter with IP address " 
                   << host_address
                   << std::endl;
      }
      if (log_level.size() > 0) {
        std::wcout << L"Log level is set to "
                   << log_level
                   << std::endl;
      }
      if (log_file.size() > 0) {
        std::wcout << L"Log file is set to "
                   << log_file
                   << std::endl;
      }
      if (implementation.size() > 0) {
        std::wcout << L"Driver implementation set to "
                   << implementation
                   << std::endl;
      }
      if (extraction_path_arg.size() > 0) {
        std::wcout << L"Library extracted to "
                   << extraction_path_arg
                   << std::endl;
      }
      if (whitelist.size() > 0) {
        std::wcout << L"IP addresses allowed to connect are "
                   << whitelist
                   << std::endl;
      } else {
        std::wcout << L"Only local connections are allowed"
                   << std::endl;
      }
    }

    // Create the shutdown event and wait for it to be signaled.
    DWORD process_id = ::GetCurrentProcessId();
    vector<wchar_t> process_id_buffer(10);
    _ltow_s(process_id, &process_id_buffer[0], process_id_buffer.size(), 10);
    std::wstring process_id_string(&process_id_buffer[0]);
    std::wstring event_name = IESERVER_SHUTDOWN_EVENT_NAME + process_id_string;
    HANDLE event_handle = ::CreateEvent(NULL,
                                        TRUE, 
                                        FALSE,
                                        event_name.c_str());
    ::WaitForSingleObject(event_handle, INFINITE);
    ::CloseHandle(event_handle);
    stop_server_proc();
  }

  ::FreeLibrary(module_handle);
  ::DeleteFile(temp_file_name.c_str());
  return 0;
}
