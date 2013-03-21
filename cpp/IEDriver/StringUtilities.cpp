// Copyright 2013 Software Freedom Conservancy
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

#include "StringUtilities.h"
#include <vector>

namespace webdriver {

StringUtilities::StringUtilities(void) {
}

StringUtilities::~StringUtilities(void) {
}

std::wstring StringUtilities::ToWString(const std::string& input) {
  // Assumption: The wstring character count will be the same as the length of
  // the string character count. Allocate the buffer with that many wchar_t items
  // so that the first MultiByteToWideChar call will succeed most of the time as
  // an optimization.
  std::wstring output = L"";
  int input_string_byte_count = static_cast<int>(input.size()) + 1;
  int wide_string_length = input_string_byte_count;
  std::vector<wchar_t> output_buffer(wide_string_length);
  bool convert_failed = (0 == ::MultiByteToWideChar(CP_UTF8,
                                                    0,
                                                    input.c_str(),
                                                    input_string_byte_count,
                                                    &output_buffer[0],
                                                    wide_string_length));
  if (convert_failed) {
    if (::GetLastError() == ERROR_INSUFFICIENT_BUFFER) {
      // Buffer wasn't big enough. Call MultiByteToWideChar again with
      // NULL values to determine how big the buffer should be.
      wide_string_length = ::MultiByteToWideChar(CP_UTF8,
                                                 0,
                                                 input.c_str(),
                                                 input_string_byte_count,
                                                 NULL,
                                                 0);
      output_buffer.resize(wide_string_length);
      convert_failed = (0 == ::MultiByteToWideChar(CP_UTF8,
                                                   0,
                                                   input.c_str(),
                                                   input_string_byte_count,
                                                   &output_buffer[0],
                                                   wide_string_length));
      if (!convert_failed) {
        output = &output_buffer[0];
      }
    }
  } else {
    output = &output_buffer[0];
  }
  return output;
}

std::string StringUtilities::ToString(const std::wstring& input) {
  // Assumption: The byte count of the resulting narrow string will be at most
  // four times the character count of the input wstring. Allocate the buffer 
  // with that many char items (bytes) so that the first WideCharToMultiByte 
  // call will succeed most of the time as an optimization.
  std::string output = "";
  int wide_string_length = static_cast<int>(input.size()) + 1;
  int output_string_byte_count = wide_string_length * 4;
  std::vector<char> string_buffer(output_string_byte_count);
  bool convert_failed = (0 == ::WideCharToMultiByte(CP_UTF8,
                                                    0,
                                                    input.c_str(),
                                                    wide_string_length,
                                                    &string_buffer[0],
                                                    output_string_byte_count,
                                                    NULL,
                                                    NULL));
  if (convert_failed) {
    if (::GetLastError() == ERROR_INSUFFICIENT_BUFFER) {
      // Buffer wasn't big enough. Call WideCharToMultiByte again with
      // NULL values to determine how big the buffer should be.
      output_string_byte_count = ::WideCharToMultiByte(CP_UTF8,
                                                       0,
                                                       input.c_str(),
                                                       wide_string_length,
                                                       NULL,
                                                       0,
                                                       NULL, 
                                                       NULL);
      string_buffer.resize(output_string_byte_count);
      convert_failed = (0 == ::WideCharToMultiByte(CP_UTF8,
                                                   0,
                                                   input.c_str(),
                                                   wide_string_length,
                                                   &string_buffer[0],
                                                   output_string_byte_count,
                                                   NULL,
                                                   NULL));
      if (!convert_failed) {
        output = &string_buffer[0];
      }
    }
  } else {
    output = &string_buffer[0];
  }
  return output;
}

} // namespace webdriver