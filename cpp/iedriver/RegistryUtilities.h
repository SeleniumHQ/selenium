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

#ifndef WEBDRIVER_IE_REGISTRYUTILITIES_H
#define WEBDRIVER_IE_REGISTRYUTILITIES_H

#include <string>

namespace webdriver {

class RegistryUtilities {
 private:
  RegistryUtilities(void);
  ~RegistryUtilities(void);
 public:
  static bool GetRegistryValue(const HKEY root_key,
                               const std::wstring& subkey,
                               const std::wstring& value_name,
                               std::wstring* value);
  static bool GetRegistryValue(const HKEY root_key,
                               const std::wstring& subkey,
                               const std::wstring& value_name,
                               const bool bypass_registry_redirection,
                               std::wstring* value);
  static bool RegistryKeyExists(const HKEY root_key,
                                const std::wstring& subkey);
  static bool Is64BitWindows(void);
};

} // namespace webdriver

#endif  // WEBDRIVER_IE_REGISTRYUTILITIES_H
