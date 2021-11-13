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

#include "WindowUtilities.h"

#include <algorithm>
#include <ctime>
#include <Psapi.h>

#include "StringUtilities.h"

namespace webdriver {

WindowUtilities::WindowUtilities() {
}


WindowUtilities::~WindowUtilities() {
}

void WindowUtilities::Wait(long wait_in_milliseconds) {
  clock_t end = clock() + wait_in_milliseconds;
  do {
    MSG msg;
    if (::PeekMessage(&msg, NULL, 0, 0, PM_REMOVE)) {
      ::TranslateMessage(&msg);
      ::DispatchMessage(&msg);
    }
    ::Sleep(0);
  } while (clock() < end);
}

void WindowUtilities::WaitWithoutMsgPump(long wait_in_milliseconds) {
  ::Sleep(wait_in_milliseconds);
}

HWND WindowUtilities::GetChildWindow(HWND parent_window_handle,
                                     std::wstring window_class) {
  std::vector<wchar_t> class_name_buffer(window_class.size() + 1);
  HWND hwndtmp = GetWindow(parent_window_handle, GW_CHILD);
  while (hwndtmp != NULL) {
    ::GetClassName(hwndtmp,
                   &class_name_buffer[0],
                   static_cast<int>(class_name_buffer.size()));
    std::wstring actual_class = &class_name_buffer[0];
    if (window_class == actual_class) {
      return hwndtmp;
    }
    hwndtmp = GetWindow(hwndtmp, GW_HWNDNEXT);
  }
  return NULL;
}

std::string WindowUtilities::GetWindowCaption(HWND window_handle) {
  std::wstring window_caption = L"";
  std::vector<wchar_t> buffer(256);
  int success = ::GetWindowText(window_handle, &buffer[0], 256);
  if (success > 0) {
    window_caption = &buffer[0];
  }
  return StringUtilities::ToString(window_caption);
}

std::string WindowUtilities::GetWindowClass(HWND window_handle) {
  std::string window_class = "";
  std::vector<char> buffer(256);
  int success = ::GetClassNameA(window_handle, &buffer[0], buffer.size());
  if (success > 0) {
    window_class = &buffer[0];
  }
  return window_class;
}

void WindowUtilities::GetProcessesByName(const std::wstring& process_name,
                                         std::vector<DWORD>* process_ids) {
  int max_process_id_count = 1024;
  std::vector<DWORD> all_process_ids(max_process_id_count);
  DWORD bytes_needed = 0;
  BOOL processes_enumerated = ::EnumProcesses(&all_process_ids[0],
                                              static_cast<DWORD>(all_process_ids.size()) * sizeof(DWORD),
                                              &bytes_needed);
  DWORD process_id_count = bytes_needed / sizeof(DWORD);
  while (process_id_count == max_process_id_count) {
    // Retry EnumProcesses with bigger array. This shouldn't happen often.
    max_process_id_count *= 2;
    all_process_ids.resize(max_process_id_count);
    bytes_needed = 0;
    processes_enumerated = ::EnumProcesses(&all_process_ids[0],
                                           static_cast<DWORD>(all_process_ids.size()) * sizeof(DWORD),
                                           &bytes_needed);
    process_id_count = bytes_needed / sizeof(DWORD);
  }

  for (size_t index = 0; index < process_id_count; ++index) {
    DWORD process_id = all_process_ids[index];
    HANDLE process_handle = ::OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ,
                                          FALSE,
                                          process_id);
    if (process_handle != NULL) {
      std::vector<wchar_t> image_path_buffer(MAX_PATH);
      DWORD chars_copied = ::GetProcessImageFileName(process_handle,
                                                     &image_path_buffer[0],
                                                     MAX_PATH);
      std::wstring image_path(&image_path_buffer[0]);
      std::transform(image_path.begin(),
                     image_path.end(),
                     image_path.begin(),
                     ::towlower);
      if (image_path.find(process_name) != std::wstring::npos) {
        process_ids->push_back(process_id);
      }
      ::CloseHandle(process_handle);
    }
  }
}

} // namespace webdriver
