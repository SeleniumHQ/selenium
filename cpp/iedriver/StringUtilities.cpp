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

#include "StringUtilities.h"

#define WHITESPACE " \n\r\t"
#define WIDE_WHITESPACE L" \n\r\t"

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

std::string StringUtilities::Format(const char* format, ...) {
  va_list args;
  va_start(args, format);
  size_t buffer_size = _vscprintf(format, args);
  std::vector<char> buffer(buffer_size + 1);
  _vsnprintf_s(&buffer[0], buffer.size(), buffer_size + 1, format, args);
  va_end(args);
  std::string formatted = &buffer[0];
  return formatted;
}

std::wstring StringUtilities::Format(const wchar_t* format, ...) {
  va_list args;
  va_start(args, format);
  size_t buffer_size = _vscwprintf(format, args);
  std::vector<wchar_t> buffer(buffer_size + 1);
  _vsnwprintf_s(&buffer[0], buffer.size(), buffer_size + 1, format, args);
  va_end(args);
  std::wstring formatted = &buffer[0];
  return formatted;
}

void StringUtilities::ToBuffer(const std::string& input, std::vector<char>* buffer) {
  buffer->resize(input.size() + 1);
  strcpy_s(&((*buffer)[0]), buffer->size(), input.c_str());
  (*buffer)[buffer->size() - 1] = L'\0';
}

void StringUtilities::ToBuffer(const std::wstring& input, std::vector<wchar_t>* buffer) {
  buffer->resize(input.size() + 1);
  wcscpy_s(&((*buffer)[0]), buffer->size(), input.c_str());
  (*buffer)[buffer->size() - 1] = L'\0';
}

std::string StringUtilities::Trim(const std::string& input) {
    return TrimRight(TrimLeft(input));
}

std::string StringUtilities::TrimLeft(const std::string& input) {
    size_t startpos = input.find_first_not_of(WHITESPACE);
    return (startpos == std::string::npos) ? "" : input.substr(startpos);
}

std::string StringUtilities::TrimRight(const std::string& input) {
    size_t endpos = input.find_last_not_of(WHITESPACE);
    return (endpos == std::string::npos) ? "" : input.substr(0, endpos + 1);
}

std::wstring StringUtilities::Trim(const std::wstring& input) {
    return TrimRight(TrimLeft(input));
}

std::wstring StringUtilities::TrimLeft(const std::wstring& input) {
    size_t startpos = input.find_first_not_of(WIDE_WHITESPACE);
    return (startpos == std::wstring::npos) ? L"" : input.substr(startpos);
}

std::wstring StringUtilities::TrimRight(const std::wstring& input) {
    size_t endpos = input.find_last_not_of(WIDE_WHITESPACE);
    return (endpos == std::wstring::npos) ? L"" : input.substr(0, endpos + 1);
}

void StringUtilities::Split(const std::string& input,
                            const std::string& delimiter,
                            std::vector<std::string>* tokens) {
  std::string input_copy = input;
  while (input_copy.size() > 0) {
    size_t delimiter_pos = input_copy.find(delimiter);
    std::string token = input_copy.substr(0, delimiter_pos);
    if (delimiter_pos == std::string::npos) {
      input_copy = "";
    } else {
      input_copy = input_copy.substr(delimiter_pos + delimiter.size());
    }
    tokens->push_back(token);
  }
}

void StringUtilities::Split(const std::wstring& input,
                            const std::wstring& delimiter,
                            std::vector<std::wstring>* tokens) {
  std::wstring input_copy = input;
  while (input_copy.size() > 0) {
    size_t delimiter_pos = input_copy.find(delimiter);
    std::wstring token = input_copy.substr(0, delimiter_pos);
    if (delimiter_pos == std::wstring::npos) {
      input_copy = L"";
    } else {
      input_copy = input_copy.substr(delimiter_pos + delimiter.size());
    }
    tokens->push_back(token);
  }
}

std::wstring StringUtilities::CreateGuid() {
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  if (status != RPC_S_OK) {
    // If we encounter an error, not bloody much we can do about it.
    // Just log it and continue.
    // LOG(WARN) << "UuidCreate returned a status other then RPC_S_OK: " << status;
  }
  status = ::UuidToString(&guid, &guid_string);
  if (status != RPC_S_OK) {
    // If we encounter an error, not bloody much we can do about it.
    // Just log it and continue.
    // LOG(WARN) << "UuidToString returned a status other then RPC_S_OK: " << status;
  }

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t*
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  std::wstring returned_guid(cast_guid_string);

  ::RpcStringFree(&guid_string);
  return returned_guid;
}

void StringUtilities::ComposeUnicodeString(std::wstring* input) {
  StringUtilities::NormalizeUnicodeString(NormalizationC, input);
}

void StringUtilities::DecomposeUnicodeString(std::wstring* input) {
  StringUtilities::NormalizeUnicodeString(NormalizationD, input);
}

void StringUtilities::NormalizeUnicodeString(NORM_FORM normalization_form,
                                             std::wstring* input) {
  if (FALSE == ::IsNormalizedString(normalization_form, input->c_str(), -1)) {
    int required = ::NormalizeString(normalization_form,
                                     input->c_str(),
                                     -1,
                                     NULL,
                                     0);
    std::vector<wchar_t> buffer(required);
    ::NormalizeString(normalization_form,
                      input->c_str(),
                      -1,
                      &buffer[0],
                      static_cast<int>(buffer.size()));
    *input = &buffer[0];
  }
}

} // namespace webdriver
