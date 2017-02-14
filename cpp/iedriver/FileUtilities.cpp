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

#include "FileUtilities.h"
#include "StringUtilities.h"

#define FILE_LANGUAGE_INFO L"\\VarFileInfo\\Translation"
#define FILE_VERSION_INFO L"\\StringFileInfo\\%04x%04x\\FileVersion"

namespace webdriver {

FileUtilities::FileUtilities(void) {
}

FileUtilities::~FileUtilities(void) {
}

std::string FileUtilities::GetFileVersion(const std::string& file_name) {
  return GetFileVersion(StringUtilities::ToWString(file_name));
}

std::string FileUtilities::GetFileVersion(const std::wstring& file_name) {
  struct LANGANDCODEPAGE {
    WORD language;
    WORD code_page;
  } *language_info;

  DWORD dummy = 0;
  DWORD length = ::GetFileVersionInfoSize(file_name.c_str(), &dummy);
  if (length == 0) {
    return "";
  }

  std::vector<char> version_buffer(length);
  ::GetFileVersionInfo(file_name.c_str(),
                       0, /* ignored */
                       length,
                       &version_buffer[0]);

  UINT page_count;
  BOOL query_result = ::VerQueryValue(&version_buffer[0],
                                      FILE_LANGUAGE_INFO,
                                      reinterpret_cast<void**>(&language_info),
                                      &page_count);

  std::vector<wchar_t> sub_block(MAX_PATH);
  _snwprintf_s(&sub_block[0],
               MAX_PATH,
               MAX_PATH,
               FILE_VERSION_INFO,
               language_info->language,
               language_info->code_page);
  std::wstring sub_block_string = &sub_block[0];

  void* value = NULL;
  unsigned int size;
  query_result = ::VerQueryValue(&version_buffer[0],
                                 sub_block_string.c_str(),
                                 &value,
                                 &size);
  std::wstring wide_version;
  wide_version.assign(static_cast<wchar_t*>(value));
  std::string version = StringUtilities::ToString(wide_version);
  return version;
}

} // namespace webdriver