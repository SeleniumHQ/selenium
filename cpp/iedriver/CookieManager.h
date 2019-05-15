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

#ifndef WEBDRIVER_COOKIEMANAGER_H_
#define WEBDRIVER_COOKIEMANAGER_H_

#include <map>
#include <string>
#include <vector>

namespace webdriver {

// Forward declaration of classes.
class BrowserCookie;
class HookProcessor;

class CookieManager {
 public:
  CookieManager(void);
  virtual ~CookieManager(void);

  static unsigned int WINAPI ThreadProc(LPVOID lpParameter);

  void Initialize(HWND window_handle);
  int GetCookies(const std::string& url,
                 std::vector<BrowserCookie>* all_cookies);
  int SetCookie(const std::string& url, const BrowserCookie& cookie);
  bool DeleteCookie(const std::string& url, const BrowserCookie& cookie);

 private:
  std::wstring SendGetCookieMessage(const std::wstring& url,
                                    const unsigned int message,
                                    HookProcessor* hook);
  void ParseCookieString(const std::wstring& cookie_string,
                         std::map<std::string, std::string>* cookies);
  BrowserCookie ParseSingleCookie(const std::string& cookie);
  void ParseCookieList(const std::string& cookie_file_contents,
                       const bool include_secure_cookies,
                       std::map<std::string, BrowserCookie>* cookies);
  std::string ReadCookieFile(const std::wstring& file_name);

  bool RecursivelyDeleteCookie(const std::string& url, const BrowserCookie& cookie);
  bool RecurseCookiePath(const std::string& url, const BrowserCookie& cookie);
  bool RecurseCookieDomain(const std::string& url, const BrowserCookie& cookie);

  bool IsAdvancedCookiesApi(void);

  HWND window_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSER_H_
