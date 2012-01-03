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

typedef void (__cdecl *STARTSERVERPROC)(int); 
typedef void (__cdecl *STOPSERVERPROC)(void);

#define ERR_DLL_EXTRACT_FAIL 1
#define ERR_DLL_LOAD_FAIL 2
#define ERR_FUNCTION_NOT_FOUND 3

#define RESOURCE_TYPE L"BINARY"
#define TEMP_FILE_PREFIX L"IEDriver"
#define START_SERVER_API_NAME "StartServer"
#define STOP_SERVER_API_NAME "StopServer"

bool ExtractResource(unsigned short resource_id, const std::wstring& output_file_name) {
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

int GetPort(int argc, _TCHAR* argv[]) {
  int port = 5555;
  if (argc >=3) {
    std::wstring arg_name(argv[1]);
    std::wstring arg_value(argv[2]);
    if (arg_name == L"--port" ||
        arg_name == L"-p" || 
        arg_name == L"/port" || 
        arg_name == L"/p") {
      port = _wtoi(arg_value.c_str());
    }
  }
  return port;
}

int _tmain(int argc, _TCHAR* argv[]) {
  vector<TCHAR> temp_file_name_buffer(MAX_PATH);
  vector<TCHAR> temp_path_buffer(MAX_PATH);

  //  Gets the temp path env string (no guarantee it's a valid path).
  unsigned long temp_path_length = ::GetTempPath(MAX_PATH,
                                                 &temp_path_buffer[0]);

  unsigned int error_code = ::GetTempFileName(&temp_path_buffer[0],
                                              TEMP_FILE_PREFIX,
                                              0,
                                              &temp_file_name_buffer[0]);

  std::wstring temp_file_name(&temp_file_name_buffer[0]);
  if (!ExtractResource(IDR_DRIVER_LIBRARY, temp_file_name)) {
    return ERR_DLL_EXTRACT_FAIL;
  }

  HMODULE module_handle = ::LoadLibrary(temp_file_name.c_str());
  if (module_handle == NULL) {
    return ERR_DLL_LOAD_FAIL;
  }

  STARTSERVERPROC start_server_proc = reinterpret_cast<STARTSERVERPROC>(
      ::GetProcAddress(module_handle, START_SERVER_API_NAME));
  STOPSERVERPROC stop_server_proc = reinterpret_cast<STOPSERVERPROC>(
      ::GetProcAddress(module_handle, STOP_SERVER_API_NAME));
  if (start_server_proc == NULL || stop_server_proc == NULL) {
    return ERR_FUNCTION_NOT_FOUND;
  }

  start_server_proc(GetPort(argc, argv));

  // Create the shutdown event and wait for it to be signaled.
  HANDLE event_handle = ::CreateEvent(NULL,
                                      TRUE, 
                                      FALSE,
                                      IESERVER_SHUTDOWN_EVENT_NAME);
  ::WaitForSingleObject(event_handle, INFINITE);
  ::CloseHandle(event_handle);
  stop_server_proc();

  ::FreeLibrary(module_handle);
  ::DeleteFile(temp_file_name.c_str());
  return 0;
}

