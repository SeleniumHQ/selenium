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

// Static class providing utilities for string handling.

#ifndef WEBDRIVER_SERVER_STRING_UTILITIES_H_
#define WEBDRIVER_SERVER_STRING_UTILITIES_H_

#include <string>
#include <vector>

namespace webdriver {

class StringUtilities {
 public:
  static std::string WideStringToNarrowString(const std::wstring& str);
  static std::wstring NarrowStringToWideString(const std::string& str);
  static std::wstring CharBufferToWideString(const std::vector<char>& buffer);
  static void ReplaceAllSubstrings(const std::wstring& to_replace,
                                   const std::wstring& replace_with,
                                   std::wstring* str);
};

}  // namespace webdriver

#endif  // WEBDRIVER_SERVER_STRING_UTILITIES_H_