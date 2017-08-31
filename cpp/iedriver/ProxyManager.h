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

#ifndef WEBDRIVER_IE_PROXYMANAGER_H_
#define WEBDRIVER_IE_PROXYMANAGER_H_

#include <string>

// Forward declaration of classes.
namespace Json {
  class Value;
} // namespace Json

namespace webdriver {

struct ProxySettings {
  bool use_per_process_proxy;
  std::string proxy_type;
  std::string http_proxy;
  std::string ftp_proxy;
  std::string ssl_proxy;
  std::string socks_proxy;
  std::string socks_user_name;
  std::string socks_password;
  std::string proxy_bypass;
  std::string proxy_autoconfig_url;
};

class ProxyManager {
 public:
  ProxyManager(void);
  virtual ~ProxyManager(void);

  void Initialize(ProxySettings settings);
  void SetProxySettings(HWND browser_window_handle);
  Json::Value GetProxyAsJson(void);

  bool is_proxy_set(void) const { return this->proxy_type_.size() > 0; }
  bool use_per_process_proxy(void) const { return this->use_per_process_proxy_; }

 private:
  void SetPerProcessProxySettings(HWND browser_window_handle);
  void SetGlobalProxySettings(void);
  void SetProxyAuthentication(const std::wstring& user_name, const std::wstring& password);
  void GetCurrentProxySettings(void);
  void GetCurrentProxyType(void);
  void GetCurrentProxyAuthentication(void);
  void RestoreProxySettings(void);

  std::wstring BuildProxySettingsString(void);

  unsigned long current_proxy_type_;
  unsigned long current_proxy_auto_detect_flags_;
  std::wstring current_autoconfig_url_;
  std::wstring current_proxy_server_;
  std::wstring current_proxy_bypass_list_;
  std::wstring current_socks_user_name_;
  std::wstring current_socks_password_;

  std::string proxy_type_;
  std::string http_proxy_;
  std::string ftp_proxy_;
  std::string ssl_proxy_;
  std::string socks_proxy_;
  std::string socks_user_name_;
  std::string socks_password_;
  std::string proxy_bypass_;
  std::string proxy_autoconfigure_url_;
  bool use_per_process_proxy_;
  bool is_proxy_modified_;
  bool is_proxy_authorization_modified_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_PROXYMANAGER_H_
