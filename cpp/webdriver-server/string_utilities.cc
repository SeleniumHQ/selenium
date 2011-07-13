// Copyright 2011 Software Freedom Conservatory
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

#include "string_utilities.h"

namespace webdriver {

std::wstring StringUtilities::NarrowStringToWideString(
    const std::string& str) {
  std::wstring converted = L"";
#ifdef WINDOWS
  converted =  CA2W(str.c_str(), CP_UTF8);
#else
  // TODO(JimEvans): Add non-Windows string handling code here.
#endif
  return converted;
}

std::string StringUtilities::WideStringToNarrowString(
    const std::wstring& str) {
  std::string converted = "";
#ifdef WINDOWS
  converted = CW2A(str.c_str(), CP_UTF8);
#endif
  return converted;
}

std::wstring StringUtilities::CharBufferToWideString(
    const std::vector<char>& buffer) {
  std::wstring str = L"";
#ifdef WINDOWS
  int output_buffer_size = ::MultiByteToWideChar(CP_UTF8,
                                                 0,
                                                 &buffer[0],
                                                 -1,
                                                 NULL,
                                                 0);
  std::vector<TCHAR> output_buffer(output_buffer_size);
  ::MultiByteToWideChar(CP_UTF8,
                        0,
                        &buffer[0],
                        -1,
                        &output_buffer[0],
                        output_buffer_size);
  str = &output_buffer[0];
#else
  // TODO(JimEvans): Add non-Windows string handling code here.
#endif
  return str;
}

void StringUtilities::ReplaceAllSubstrings(const std::wstring& to_replace,
                                           const std::wstring& replace_with,
                                           std::wstring* str) {
  size_t pos = str->find(to_replace);
  while (pos != std::wstring::npos) {
    str->replace(pos, to_replace.length(), replace_with);
	pos = str->find(to_replace, pos + replace_with.length());
  }
}

}  // namespace webdriver
