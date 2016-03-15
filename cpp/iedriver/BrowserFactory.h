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

#define HTML_GETOBJECT_MSG L"WM_HTML_GETOBJECT"
#define OLEACC_LIBRARY_NAME L"OLEACC.DLL"
#define IEFRAME_LIBRARY_NAME L"ieframe.dll"
#define IELAUNCHURL_FUNCTION_NAME "IELaunchURL"

#define IE_FRAME_WINDOW_CLASS "IEFrame"
#define SHELL_DOCOBJECT_VIEW_WINDOW_CLASS "Shell DocObject View"
#define IE_SERVER_CHILD_WINDOW_CLASS "Internet Explorer_Server"
#define ALERT_WINDOW_CLASS "#32770"
#define HTML_DIALOG_WINDOW_CLASS "Internet Explorer_TridentDlgFrame"

#define IE_CLSID_REGISTRY_KEY L"SOFTWARE\\Classes\\InternetExplorer.Application\\CLSID"
#define IE_SECURITY_ZONES_REGISTRY_KEY L"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones"
#define IE_TABPROCGROWTH_REGISTRY_KEY L"Software\\Microsoft\\Internet Explorer\\Main"

#define IE_PROTECTED_MODE_SETTING_VALUE_NAME L"2500"

#define IELAUNCHURL_ERROR_MESSAGE "IELaunchURL() returned HRESULT %X ('%s') for URL '%s'"
#define CREATEPROCESS_ERROR_MESSAGE "CreateProcess() failed for command line '%s'"
#define NULL_PROCESS_ID_ERROR_MESSAGE " successfully launched Internet Explorer, but did not return a valid process ID."
#define PROTECTED_MODE_SETTING_ERROR_MESSAGE "Protected Mode settings are not the same for all zones. Enable Protected Mode must be set to the same value (enabled or disabled) for all zones."
#define ZOOM_SETTING_ERROR_MESSAGE "Browser zoom level was set to %d%%. It should be set to 100%%"
#define ATTACH_TIMEOUT_ERROR_MESSAGE "Could not find an Internet Explorer window belonging to the process with ID %d within %d milliseconds."
#define ATTACH_FAILURE_ERROR_MESSAGE "Found browser window using ShellWindows API, but could not attach to the browser IWebBrowser2 object."
#define CREATEPROCESS_REGISTRY_ERROR_MESSAGE "Unable to use CreateProcess() API. To use CreateProcess() with Internet Explorer 8 or higher, the value of registry setting in HKEY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main\\TabProcGrowth must be '0'."

#define ZONE_MY_COMPUTER L"0"
#define ZONE_LOCAL_INTRANET L"1"
#define ZONE_TRUSTED_SITES L"2"
#define ZONE_INTERNET L"3"
#define ZONE_RESTRICTED_SITES L"4"

#define IELAUNCHURL_API L"ielaunchurl"
#define CREATEPROCESS_API L"createprocess"

#define RUNDLL_EXE_NAME L"rundll32.exe"
#define INTERNET_CONTROL_PANEL_APPLET_NAME L"inetcpl.cpl"
#define CLEAR_CACHE_COMMAND_LINE_ARGS L"rundll32.exe %s,ClearMyTracksByProcess %u"
// This magic value is the combination of the following bitflags:
// #define CLEAR_HISTORY         0x0001 // Clears history
// #define CLEAR_COOKIES         0x0002 // Clears cookies
// #define CLEAR_CACHE           0x0004 // Clears Temporary Internet Files folder
// #define CLEAR_CACHE_ALL       0x0008 // Clears offline favorites and download history
// #define CLEAR_FORM_DATA       0x0010 // Clears saved form data for form auto-fill-in
// #define CLEAR_PASSWORDS       0x0020 // Clears passwords saved for websites
// #define CLEAR_PHISHING_FILTER 0x0040 // Clears phishing filter data
// #define CLEAR_RECOVERY_DATA   0x0080 // Clears webpage recovery data
// #define CLEAR_PRIVACY_ADVISOR 0x0800 // Clears tracking data
// #define CLEAR_SHOW_NO_GUI     0x0100 // Do not show a GUI when running the cache clearing
//
// Bitflags available but not used in this magic value are as follows:
// #define CLEAR_USE_NO_THREAD      0x0200 // Do not use multithreading for deletion
// #define CLEAR_PRIVATE_CACHE      0x0400 // Valid only when browser is in private browsing mode
// #define CLEAR_DELETE_ALL         0x1000 // Deletes data stored by add-ons
// #define CLEAR_PRESERVE_FAVORITES 0x2000 // Preserves cached data for "favorite" websites
#define CLEAR_CACHE_OPTIONS 0x09FF

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
  IWebBrowser2* CreateBrowser();
  bool AttachToBrowser(ProcessWindowInfo* procWinInfo,
                       std::string* error_message);
  bool GetDocumentFromWindowHandle(HWND window_handle,
                                   IHTMLDocument2** document);

  bool ignore_protected_mode_settings(void) const { return this->ignore_protected_mode_settings_; }
  bool ignore_zoom_setting(void) const { return this->ignore_zoom_setting_; }
  bool clear_cache(void) const { return this->clear_cache_; }
  bool force_createprocess_api(void) const { return this->force_createprocess_api_; }
  bool force_shell_windows_api(void) const { return this->force_shell_windows_api_; }
  int browser_attach_timeout(void) const { return this->browser_attach_timeout_; }
  std::string initial_browser_url(void) const {
    return StringUtilities::ToString(this->initial_browser_url_);
  }
  std::string browser_command_line_switches(void) const {
    return StringUtilities::ToString(this->browser_command_line_switches_);
  }

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
