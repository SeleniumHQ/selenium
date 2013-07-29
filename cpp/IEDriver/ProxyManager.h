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

#ifndef WEBDRIVER_IE_PROXYMANAGER_H_
#define WEBDRIVER_IE_PROXYMANAGER_H_

#include <string>

namespace webdriver {

class ProxyManager {
 public:
  ProxyManager(void);
  virtual ~ProxyManager(void);

  void Initialize(std::string proxy_settings, bool use_per_process_proxy);
  void SetProxySettings(HWND browser_window_handle);

 private:
  void SetPerProcessProxySettings(HWND browser_window_handle);
  void SetGlobalProxySettings(void);
  void GetCurrentProxySettings(void);
  void GetCurrentProxyType(void);
  void RestoreProxySettings(void);

  static bool InstallWindowsHook(HWND window_handle);
  static void UninstallWindowsHook(void);

  unsigned long current_proxy_type_;
  unsigned long current_proxy_auto_detect_flags_;
  std::wstring current_autoconfig_url_;
  std::wstring current_proxy_server_;
  std::wstring current_proxy_bypass_list_;

  std::string proxy_settings_;
  bool use_per_process_proxy_;
  bool proxy_modified_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_PROXYMANAGER_H_
