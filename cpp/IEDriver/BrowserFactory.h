// Copyright 2011 Software Freedom Conservancy
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

#ifndef WEBDRIVER_IE_BROWSERFACTORY_H_
#define WEBDRIVER_IE_BROWSERFACTORY_H_

#include <exdisp.h>
#include <exdispid.h>
#include <iepmapi.h>
#include <shlguid.h>
#include <oleacc.h>
#include <sddl.h>
#include <string>
#include <sstream>
#include <vector>

#define HTML_GETOBJECT_MSG L"WM_HTML_GETOBJECT"
#define OLEACC_LIBRARY_NAME L"OLEACC.DLL"
#define IEFRAME_LIBRARY_NAME L"ieframe.dll"
#define IELAUNCHURL_FUNCTION_NAME "IELaunchURL"

#define IE_FRAME_WINDOW_CLASS "IEFrame"
#define SHELL_DOCOBJECT_VIEW_WINDOW_CLASS "Shell DocObject View"
#define IE_SERVER_CHILD_WINDOW_CLASS "Internet Explorer_Server"
#define ALERT_WINDOW_CLASS "#32770"
#define HTML_DIALOG_WINDOW_CLASS "Internet Explorer_TridentDlgFrame"

#define FILE_LANGUAGE_INFO L"\\VarFileInfo\\Translation"
#define FILE_VERSION_INFO L"\\StringFileInfo\\%04x%04x\\FileVersion"

#define IE_CLSID_REGISTRY_KEY L"SOFTWARE\\Classes\\InternetExplorer.Application\\CLSID"
#define IE_SECURITY_ZONES_REGISTRY_KEY L"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones"
#define IE_TABPROCGROWTH_REGISTRY_KEY L"Software\\Microsoft\\Internet Explorer\\Main"

#define IE_PROTECTED_MODE_SETTING_VALUE_NAME L"2500"

#define IELAUNCHURL_ERROR_MESSAGE "IELaunchURL() returned %X for URL '%s'"
#define CREATEPROCESS_ERROR_MESSAGE L"CreateProcess() failed for command line '%s'"
#define NULL_PROCESS_ID_ERROR_MESSAGE " successfully launched Internet Explorer, but did not return a valid process ID."
#define PROTECTED_MODE_SETTING_ERROR_MESSAGE "Protected Mode settings are not the same for all zones. Enable Protected Mode must be set to the same value (enabled or disabled) for all zones."
#define ATTACH_TIMEOUT_ERROR_MESSAGE "Could not find an Internet Explorer window belonging to the process with ID %d within %d milliseconds."
#define CREATEPROCESS_REGISTRY_ERROR_MESSAGE "Unable to use CreateProcess() API. To use CreateProcess() with Internet Explorer 8 or higher, the value of registry setting in HEKY_CURRENT_USER\\Software\\Microsoft\\Internet Explorer\\Main\\TabProcGrowth must be '0'."

#define ZONE_MY_COMPUTER L"0"
#define ZONE_LOCAL_INTRANET L"1"
#define ZONE_TRUSTED_SITES L"2"
#define ZONE_INTERNET L"3"
#define ZONE_RESTRICTED_SITES L"4"

#define IELAUNCHURL_API L"ielaunchurl"
#define CREATEPROCESS_API L"createprocess"

using namespace std;

namespace webdriver {

struct ProcessWindowInfo {
  DWORD dwProcessId;
  HWND hwndBrowser;
  IWebBrowser2* pBrowser;
};

class BrowserFactory {
 public:
  BrowserFactory(void);
  virtual ~BrowserFactory(void);

  DWORD LaunchBrowserProcess(const std::string& initial_url,
                             const bool ignore_protected_mode_settings,
                             const bool force_createprocess_api,
                             const std::string& ie_switches,
                             std::string* error_message);
  IWebBrowser2* CreateBrowser();
  bool AttachToBrowser(ProcessWindowInfo* procWinInfo,
                       const int timeout_in_milliseconds,
                       const bool ignore_zoom_setting,
                       std::string* error_message);
  bool GetDocumentFromWindowHandle(HWND window_handle,
                                   IHTMLDocument2** document);
  bool GetRegistryValue(const HKEY root_key,
                        const std::wstring& subkey,
                        const std::wstring& value_name,
                        std::wstring* value);

  int browser_version(void) const { return this->ie_major_version_; }
  int windows_major_version(void) const { return this->windows_major_version_; }
  int windows_minor_version(void) const { return this->windows_minor_version_; }

  static BOOL CALLBACK FindChildWindowForProcess(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindDialogWindowForProcess(HWND hwnd, LPARAM arg);

 private:
  static BOOL CALLBACK FindBrowserWindow(HWND hwnd, LPARAM param);
  UINT html_getobject_msg_;
  HINSTANCE oleacc_instance_handle_;

  void SetThreadIntegrityLevel(void);
  void ResetThreadIntegrityLevel(void);

  void GetExecutableLocation(void);
  void GetIEVersion(void);
  void GetOSVersion(void);
  bool ProtectedModeSettingsAreValid(void);
  int GetZoneProtectedModeSetting(const HKEY key_handle,
                                  const std::wstring& zone_subkey_name);
  int GetZoomLevel(IHTMLDocument2* document, IHTMLWindow2* window);
  void LaunchBrowserUsingCreateProcess(const std::string& initial_url,
                                       const std::string& command_line_switches,
                                       PROCESS_INFORMATION* proc_info,
                                       std::string* error_message);
  void LaunchBrowserUsingIELaunchURL(const std::string& initial_url,
                                     PROCESS_INFORMATION* proc_info,
                                     std::string* error_message);
  bool IsIELaunchURLAvailable(void);
  bool IsCreateProcessApiAvailable(void);

  int ie_major_version_;
  int windows_major_version_;
  int windows_minor_version_;
  std::wstring ie_executable_location_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSERFACTORY_H_
