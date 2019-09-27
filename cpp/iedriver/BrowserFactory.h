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

#ifndef WEBDRIVER_IE_BROWSERFACTORY_H_
#define WEBDRIVER_IE_BROWSERFACTORY_H_

#include <string>

namespace webdriver {

struct ProcessWindowInfo {
  DWORD dwProcessId;
  HWND hwndBrowser;
  IWebBrowser2* pBrowser;
};

struct BrowserFactorySettings {
  bool ignore_protected_mode_settings;
  bool ignore_zoom_setting;
  bool force_create_process_api;
  bool force_shell_windows_api;
  bool clear_cache_before_launch;
  int browser_attach_timeout;
  std::string initial_browser_url;
  std::string browser_command_line_switches;
};

class BrowserFactory {
 public:
  BrowserFactory(void);
  virtual ~BrowserFactory(void);

  void Initialize(BrowserFactorySettings settings);

  DWORD LaunchBrowserProcess(std::string* error_message);
  IWebBrowser2* CreateBrowser(bool is_protected_mode);
  bool AttachToBrowser(ProcessWindowInfo* procWinInfo,
                       std::string* error_message);
  bool GetDocumentFromWindowHandle(HWND window_handle,
                                   IHTMLDocument2** document);
  bool IsBrowserProcessInitialized(DWORD process_id);

  bool ignore_protected_mode_settings(void) const { return this->ignore_protected_mode_settings_; }
  bool ignore_zoom_setting(void) const { return this->ignore_zoom_setting_; }
  bool clear_cache(void) const { return this->clear_cache_; }
  bool force_createprocess_api(void) const { return this->force_createprocess_api_; }
  bool force_shell_windows_api(void) const { return this->force_shell_windows_api_; }
  int browser_attach_timeout(void) const { return this->browser_attach_timeout_; }
  std::string initial_browser_url(void);
  std::string browser_command_line_switches(void);

  int browser_version(void) const { return this->ie_major_version_; }

  static BOOL CALLBACK FindChildWindowForProcess(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindDialogWindowForProcess(HWND hwnd, LPARAM arg);

  static bool IsWindowsVistaOrGreater(void);

 private:
  static BOOL CALLBACK FindBrowserWindow(HWND hwnd, LPARAM param);
  static bool IsWindowsVersionOrGreater(unsigned short major_version,
                                        unsigned short minor_version,
                                        unsigned short service_pack);

  UINT html_getobject_msg_;
  HINSTANCE oleacc_instance_handle_;

  bool CreateLowIntegrityLevelToken(HANDLE* process_token_handle,
                                    HANDLE* mic_token_handle,
                                    PSID* sid);

  bool AttachToBrowserUsingShellWindows(ProcessWindowInfo* process_window_info,
                                        std::string* error_message);
  bool AttachToBrowserUsingActiveAccessibility(
      ProcessWindowInfo* process_window_info,
      std::string* error_message);

  void GetExecutableLocation(void);
  void GetIEVersion(void);
  bool ProtectedModeSettingsAreValid(void);
  int GetZoneProtectedModeSetting(const HKEY key_handle,
                                  const std::wstring& zone_subkey_name);
  int GetBrowserZoomLevel(IWebBrowser2* browser);
  int GetZoomLevel(IHTMLDocument2* document, IHTMLWindow2* window);
  void LaunchBrowserUsingCreateProcess(PROCESS_INFORMATION* proc_info,
                                       std::string* error_message);
  void LaunchBrowserUsingIELaunchURL(PROCESS_INFORMATION* proc_info,
                                     std::string* error_message);
  bool IsIELaunchURLAvailable(void);
  bool IsCreateProcessApiAvailable(void);
  void ClearCache(void);
  void InvokeClearCacheUtility(bool use_low_integrity_level);

  bool ignore_protected_mode_settings_;
  bool ignore_zoom_setting_;
  bool force_createprocess_api_;
  bool force_shell_windows_api_;
  bool clear_cache_;

  std::wstring browser_command_line_switches_;
  std::wstring initial_browser_url_;
  int browser_attach_timeout_;

  int ie_major_version_;
  std::wstring ie_executable_location_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSERFACTORY_H_
