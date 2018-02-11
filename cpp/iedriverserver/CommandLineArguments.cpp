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

#include "CommandLineArguments.h"
#include "logging.h"

CommandLineArguments::CommandLineArguments(int argc, _TCHAR* argv[]) {
  this->ParseArguments(argc, argv);
}

CommandLineArguments::~CommandLineArguments(void) {
}

std::wstring CommandLineArguments::GetValue(std::wstring arg_name,
                                            std::wstring default_value) {
  std::map<std::wstring, std::wstring>::const_iterator it = 
      this->args_map_.find(arg_name);
  if (it != this->args_map_.end()) {
    return it->second;
  }
  return default_value;
}

void CommandLineArguments::ParseArguments(int argc, _TCHAR* argv[]) {
  this->is_help_requested_ = false;
  this->is_version_requested_ = false;
  for (int i = 1; i < argc; ++i) {
    std::wstring raw_arg(argv[i]);
    int switch_delimiter_length = GetSwitchDelimiterLength(raw_arg);
    std::wstring arg = raw_arg.substr(switch_delimiter_length);
    size_t equal_pos = arg.find(L"=");
    std::wstring arg_name = L"";
    std::wstring arg_value = L"";
    if (equal_pos != std::string::npos && equal_pos > 0) { 
      arg_name = arg.substr(0, equal_pos);
      arg_value = arg.substr(equal_pos + 1);
    } else {
      arg_name = arg;
    }

    // coerce all argument names to lowercase, making argument names
    // case-insensitive.
    std::transform(arg_name.begin(), arg_name.end(), arg_name.begin(), tolower);

    // trim single and double quotes from argument value begin and end
    size_t startpos = arg_value.find_first_not_of(L"'\"");    
    if (startpos != std::string::npos) {
      arg_value = arg_value.substr(startpos);
    }
    size_t endpos = arg_value.find_last_not_of(L"'\"");
    if (endpos != std::string::npos) {
      arg_value = arg_value.substr(0, endpos + 1);
    }

    if (arg_name == L"?" || arg_name == L"h" || arg_name == L"help") {
      this->is_help_requested_ = true;
    }

    if (arg_name == L"v" || arg_name == L"version") {
      this->is_version_requested_ = true;
    }

    this->args_map_[arg_name] = arg_value;
  }
}

int CommandLineArguments::GetSwitchDelimiterLength(std::wstring arg) {
  if (arg.find(L"--") == 0) {
    return 2;
  } else if (arg.find(L"-") == 0 || arg.find(L"/") == 0) {
    return 1;
  }

  return 0;
}
