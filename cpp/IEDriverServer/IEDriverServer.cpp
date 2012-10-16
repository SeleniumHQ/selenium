// Copyright 2012 Software Freedom Conservancy
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

#include "stdafx.h"
#include "resource.h"
#include "IEServer.h"
#include "CommandLineArguments.h"
#include <algorithm>
#include <map>
#include <string>
#include <vector>

// TODO(JimEvans): Change the prototypes of these functions in the
// IEDriver project to match the prototype specified here.
typedef void* (__cdecl *STARTSERVEREXPROC)(int, const std::string&, const std::string&, const std::string&);
typedef void (__cdecl *STOPSERVERPROC)(void);

#define ERR_DLL_EXTRACT_FAIL 1
#define ERR_DLL_LOAD_FAIL 2
#define ERR_FUNCTION_NOT_FOUND 3
#define ERR_SERVER_START 4

#define RESOURCE_TYPE L"BINARY"
#define TEMP_FILE_PREFIX L"IEDriver"
#define START_SERVER_EX_API_NAME "StartServerEx"
#define STOP_SERVER_API_NAME "StopServer"

#define PORT_COMMAND_LINE_ARG "port"
#define HOST_COMMAND_LINE_ARG "host"
#define LOGLEVEL_COMMAND_LINE_ARG "log-level"
#define LOGFILE_COMMAND_LINE_ARG "log-file"
#define SILENT_COMMAND_LINE_ARG "silent"
#define EXTRACTPATH_COMMAND_LINE_ARG "extract-path"
#define BOOLEAN_COMMAND_LINE_ARG_MISSING_VALUE "value-not-specified"

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

std::string GetProcessArchitectureDescription() {
  std::string arch_description = "32-bit";
  SYSTEM_INFO system_info;
  ::GetNativeSystemInfo(&system_info);
  if (system_info.wProcessorArchitecture != 0) {
    BOOL is_emulated;
    HANDLE process_handle = ::GetCurrentProcess();
    ::IsWow64Process(process_handle, &is_emulated);
    if (!is_emulated) {
      arch_description = "64-bit";
    }
    ::CloseHandle(process_handle);
  }

  return arch_description;
}

std::string GetExecutableVersion() {
  struct LANGANDCODEPAGE {
    WORD language;
    WORD code_page;
  } *lang_info;

  // get the filename of the executable containing the version resource
  std::vector<char> file_name_buffer(MAX_PATH + 1);
  ::GetModuleFileNameA(NULL, &file_name_buffer[0], MAX_PATH);

  DWORD dummy;
  DWORD length = ::GetFileVersionInfoSizeA(&file_name_buffer[0],
                                           &dummy);
  std::vector<BYTE> version_buffer(length);
  ::GetFileVersionInfoA(&file_name_buffer[0],
                       dummy,
                       length,
                       &version_buffer[0]);

  UINT page_count;
  BOOL query_result = ::VerQueryValueA(&version_buffer[0],
                                      "\\VarFileInfo\\Translation",
                                      reinterpret_cast<void**>(&lang_info),
                                      &page_count);
    
  char sub_block[MAX_PATH];
  _snprintf_s(sub_block,
               MAX_PATH,
               MAX_PATH,
               "\\StringFileInfo\\%04x%04x\\FileVersion",
               lang_info->language,
               lang_info->code_page);
  LPVOID value = NULL;
  UINT size;
  query_result = ::VerQueryValueA(&version_buffer[0],
                                 sub_block,
                                 &value,
                                 &size);
  return static_cast<char*>(value);
}

int _tmain(int argc, _TCHAR* argv[]) {
  CommandLineArguments args(argc, argv);
  vector<TCHAR> temp_file_name_buffer(MAX_PATH);
  vector<TCHAR> temp_path_buffer(MAX_PATH);

  //  Gets the temp path env string (no guarantee it's a valid path).
  unsigned long temp_path_length = ::GetTempPath(MAX_PATH,
                                                 &temp_path_buffer[0]);

  std::wstring extraction_path(&temp_path_buffer[0]);

  std::string extraction_path_arg = args.GetValue(EXTRACTPATH_COMMAND_LINE_ARG, "");
  if (extraction_path_arg.size() != 0) {
    extraction_path = CA2W(extraction_path_arg.c_str(), CP_UTF8);
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

  STARTSERVEREXPROC start_server_ex_proc = reinterpret_cast<STARTSERVEREXPROC>(
      ::GetProcAddress(module_handle, START_SERVER_EX_API_NAME));
  STOPSERVERPROC stop_server_proc = reinterpret_cast<STOPSERVERPROC>(
      ::GetProcAddress(module_handle, STOP_SERVER_API_NAME));
  if (start_server_ex_proc == NULL || stop_server_proc == NULL) {
    std::wcout << L"Could not find entry point in extracted library: "
               << temp_file_name;
    return ERR_FUNCTION_NOT_FOUND;
  }

  int port = atoi(args.GetValue(PORT_COMMAND_LINE_ARG, "5555").c_str());
  std::string host_address = args.GetValue(HOST_COMMAND_LINE_ARG, "");
  std::string log_level = args.GetValue(LOGLEVEL_COMMAND_LINE_ARG, "");
  std::string log_file = args.GetValue(LOGFILE_COMMAND_LINE_ARG, "");
  bool silent = args.GetValue(SILENT_COMMAND_LINE_ARG,
      BOOLEAN_COMMAND_LINE_ARG_MISSING_VALUE).size() == 0;
  void* server_value = start_server_ex_proc(port,
                                            host_address,
                                            log_level,
                                            log_file);
  if (server_value == NULL) {
    std::cout << L"Failed to start the server with: "
              << L"port = '" << port << "', "
              << L"host = '" << host_address << "', "
              << L"log level = '" << log_level << "', "
              << L"log file = '" << log_file << "'";
    return ERR_SERVER_START;
  }
  if (!silent) {
    std::cout << "Started InternetExplorerDriver server"
              << " (" << GetProcessArchitectureDescription() << ")"
              << std::endl;
    std::cout << GetExecutableVersion()
              << std::endl;
    std::cout << "Listening on port " << port << std::endl;
    if (host_address.size() > 0) {
      std::cout << "Bound to network adapter with IP address " 
                << host_address
                << std::endl;
    }
    if (log_level.size() > 0) {
      std::cout << "Log level is set to "
                << log_level
                << std::endl;
    }
    if (log_file.size() > 0) {
      std::cout << "Log file is set to "
                << log_file
                << std::endl;
    }
    if (extraction_path_arg.size() > 0) {
      std::cout << "Library extracted to "
                << extraction_path_arg
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

  ::FreeLibrary(module_handle);
  ::DeleteFile(temp_file_name.c_str());
  return 0;
}
