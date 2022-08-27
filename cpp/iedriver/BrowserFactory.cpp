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

#include "BrowserFactory.h"

#include <ctime>
#include <vector>

#include <exdispid.h>
#include <iepmapi.h>
#include <psapi.h>
#include <sddl.h>
#include <shlguid.h>
#include <shlobj.h>

#include "logging.h"

#include "FileUtilities.h"
#include "RegistryUtilities.h"
#include "StringUtilities.h"
#include "WebDriverConstants.h"

#define HTML_GETOBJECT_MSG L"WM_HTML_GETOBJECT"
#define OLEACC_LIBRARY_NAME L"OLEACC.DLL"
#define IEFRAME_LIBRARY_NAME L"ieframe.dll"
#define IELAUNCHURL_FUNCTION_NAME "IELaunchURL"

#define IE_FRAME_WINDOW_CLASS "IEFrame"
#define SHELL_DOCOBJECT_VIEW_WINDOW_CLASS "Shell DocObject View"
#define IE_SERVER_CHILD_WINDOW_CLASS "Internet Explorer_Server"
#define ANDIE_FRAME_WINDOW_CLASS "Chrome_WidgetWin_1"

#define IE_CLSID_REGISTRY_KEY L"SOFTWARE\\Classes\\InternetExplorer.Application\\CLSID"
#define IE_SECURITY_ZONES_REGISTRY_KEY L"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\\Zones"
#define IE_TABPROCGROWTH_REGISTRY_KEY L"Software\\Microsoft\\Internet Explorer\\Main"

#define IE_PROTECTED_MODE_SETTING_VALUE_NAME L"2500"

#define IELAUNCHURL_ERROR_MESSAGE "IELaunchURL() returned HRESULT %X ('%s') for URL '%s'"
#define CREATEPROCESS_ERROR_MESSAGE "CreateProcess() failed for command line '%s'"
#define CREATEPROCESS_EDGE_ERROR "CreateProcess() failed for edge with the following command: "
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

BrowserFactory::BrowserFactory(void) {
  // Must be done in the constructor. Do not move to Initialize().
  this->GetExecutableLocation();
  this->GetIEVersion();
  this->oleacc_instance_handle_ = NULL;
  this->edge_ie_mode_ = false;
}

BrowserFactory::~BrowserFactory(void) {
  if (this->oleacc_instance_handle_) {
    ::FreeLibrary(this->oleacc_instance_handle_);
  }
}

std::string BrowserFactory::initial_browser_url(void) {
  return StringUtilities::ToString(this->initial_browser_url_);
}

std::string BrowserFactory::browser_command_line_switches(void) {
  return StringUtilities::ToString(this->browser_command_line_switches_);
}

void BrowserFactory::Initialize(BrowserFactorySettings settings) {
  LOG(TRACE) << "Entering BrowserFactory::Initialize";
  this->ignore_protected_mode_settings_ = settings.ignore_protected_mode_settings;
  this->ignore_zoom_setting_ = settings.ignore_zoom_setting;
  this->browser_attach_timeout_ = settings.browser_attach_timeout;
  this->force_createprocess_api_ = settings.force_create_process_api;
  this->force_shell_windows_api_ = settings.force_shell_windows_api;
  this->clear_cache_ = settings.clear_cache_before_launch;
  this->browser_command_line_switches_ = StringUtilities::ToWString(settings.browser_command_line_switches);
  this->initial_browser_url_ = StringUtilities::ToWString(settings.initial_browser_url);
  this->edge_ie_mode_ = settings.attach_to_edge_ie;
  LOG(DEBUG) << "path before was " << settings.edge_executable_path << "\n";
  this->edge_executable_location_ = StringUtilities::ToWString(settings.edge_executable_path);
  LOG(DEBUG) << "path after was " << this->edge_executable_location_.c_str() << "\n";
  this->html_getobject_msg_ = ::RegisterWindowMessage(HTML_GETOBJECT_MSG);

  // Explicitly load MSAA so we know if it's installed
  this->oleacc_instance_handle_ = ::LoadLibrary(OLEACC_LIBRARY_NAME);
}

void BrowserFactory::ClearCache() {
  LOG(TRACE) << "Entering BrowserFactory::ClearCache";
  if (this->clear_cache_) {
    if (IsWindowsVistaOrGreater()) {
      LOG(DEBUG) << "Clearing cache with low mandatory integrity level as required on Windows Vista or later.";
      this->InvokeClearCacheUtility(true);
    }
    LOG(DEBUG) << "Clearing cache with normal process execution.";
    this->InvokeClearCacheUtility(false);
  }
}

DWORD BrowserFactory::LaunchBrowserProcess(std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::LaunchBrowserProcess";

  DWORD process_id = NULL;
  bool has_valid_protected_mode_settings = false;
  LOG(DEBUG) << "Ignoring Protected Mode Settings: "
             << this->ignore_protected_mode_settings_;
  if (!this->ignore_protected_mode_settings_) {
    LOG(DEBUG) << "Checking validity of Protected Mode settings.";
    has_valid_protected_mode_settings = this->ProtectedModeSettingsAreValid();
  }
  LOG(DEBUG) << "Has Valid Protected Mode Settings: "
             << has_valid_protected_mode_settings;
  if (this->ignore_protected_mode_settings_ || has_valid_protected_mode_settings) {
    // Determine which launch API to use.
    bool use_createprocess_api = false;
    if (this->force_createprocess_api_) {
      if (this->IsCreateProcessApiAvailable()) {
        use_createprocess_api = true;
      } else {
        // The only time IsCreateProcessApiAvailable will return false
        // is when the user is using IE 8 or higher, and does not have
        // the correct registry key setting to force the same process
        // for the enclosing window and tab processes.
        *error_message = CREATEPROCESS_REGISTRY_ERROR_MESSAGE;
        return NULL;
      }
    } else {
      // If we have the IELaunchURL API, expressly use it. Otherwise,
      // fall back to using CreateProcess().
      if (!this->IsIELaunchURLAvailable()) {
        use_createprocess_api = true;
      }
    }

    this->ClearCache();

    PROCESS_INFORMATION proc_info;
    ::ZeroMemory(&proc_info, sizeof(proc_info));

    if (this->edge_ie_mode_) {
      this->LaunchEdgeInIEMode(&proc_info, error_message);
    } else if (!use_createprocess_api) {
      this->LaunchBrowserUsingIELaunchURL(&proc_info, error_message);
    } else {
      this->LaunchBrowserUsingCreateProcess(&proc_info, error_message);
    }

    process_id = proc_info.dwProcessId;
    if (process_id == NULL) {
      // If whatever API we are using failed to launch the browser, we should
      // have a NULL value in the dwProcessId member of the PROCESS_INFORMATION
      // structure. In that case, we will have already set the approprate error
      // message. On the off chance that we haven't yet set the appropriate
      // error message, that means we successfully launched the browser (i.e.,
      // the browser launch API returned a success code), but we still have a
      // NULL process ID.
      if (error_message->size() == 0) {
        std::string launch_api_name = use_createprocess_api ? "The CreateProcess API" : "The IELaunchURL API";
        *error_message = launch_api_name + NULL_PROCESS_ID_ERROR_MESSAGE;
      }
    } else {
      ::WaitForInputIdle(proc_info.hProcess, 2000);
      LOG(DEBUG) << "IE launched successfully with process ID " << process_id;
      std::vector<wchar_t> image_buffer(MAX_PATH);
      int buffer_count = ::GetProcessImageFileName(proc_info.hProcess, &image_buffer[0], MAX_PATH);
      std::wstring full_image_path = &image_buffer[0];
      size_t last_delimiter = full_image_path.find_last_of('\\');
      std::string image_name = StringUtilities::ToString(full_image_path.substr(last_delimiter + 1, buffer_count - last_delimiter));
      LOG(DEBUG) << "Process with ID " << process_id << " is executing " << image_name;
    }

    if (proc_info.hThread != NULL) {
      ::CloseHandle(proc_info.hThread);
    }

    if (proc_info.hProcess != NULL) {
      ::CloseHandle(proc_info.hProcess);
    }

  } else {
    *error_message = PROTECTED_MODE_SETTING_ERROR_MESSAGE;
  }
  return process_id;
}

bool BrowserFactory::IsIELaunchURLAvailable() {
  LOG(TRACE) << "Entering BrowserFactory::IsIELaunchURLAvailable";
  bool api_is_available = false;
  HMODULE library_handle = ::LoadLibrary(IEFRAME_LIBRARY_NAME);
  if (library_handle != NULL) {
    FARPROC proc_address = 0;
    proc_address = ::GetProcAddress(library_handle, IELAUNCHURL_FUNCTION_NAME);
    if (proc_address == NULL || proc_address == 0) {
      LOGERR(DEBUG) << "Unable to get address of " << IELAUNCHURL_FUNCTION_NAME 
                    << " method in " << IEFRAME_LIBRARY_NAME;
    } else {
      api_is_available = true;
    }
    ::FreeLibrary(library_handle);
  } else {
    LOGERR(DEBUG) << "Unable to load library " << IEFRAME_LIBRARY_NAME;
  }
  return api_is_available;
}

void BrowserFactory::LaunchBrowserUsingIELaunchURL(PROCESS_INFORMATION* proc_info,
                                                   std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::LaunchBrowserUsingIELaunchURL";
  LOG(DEBUG) << "Starting IE using the IELaunchURL API";
  HRESULT launch_result = ::IELaunchURL(this->initial_browser_url_.c_str(),
                                        proc_info,
                                        NULL);
  if (FAILED(launch_result)) {
    LOGHR(WARN, launch_result) << "Error using IELaunchURL to start IE";
    std::wstring hresult_msg = _com_error(launch_result).ErrorMessage();
    *error_message = StringUtilities::Format(IELAUNCHURL_ERROR_MESSAGE,
                                             launch_result,
                                             StringUtilities::ToString(hresult_msg).c_str(),
                                             this->initial_browser_url().c_str());
  }
}

bool BrowserFactory::IsCreateProcessApiAvailable() {
  LOG(TRACE) << "Entering BrowserFactory::IsCreateProcessApiAvailable";
  if (this->ie_major_version_ >= 8) {
    // According to http://blogs.msdn.com/b/askie/archive/2009/03/09/opening-a-new-tab-may-launch-a-new-process-with-internet-explorer-8-0.aspx
    // If CreateProcess() is used and TabProcGrowth != 0 IE will use different tab and frame processes.
    // Such behaviour is not supported by AttachToBrowser().
    // FYI, IELaunchURL() returns correct 'frame' process (but sometimes not).
    std::wstring tab_proc_growth;
    if (RegistryUtilities::GetRegistryValue(HKEY_CURRENT_USER,
                                            IE_TABPROCGROWTH_REGISTRY_KEY,
                                            L"TabProcGrowth",
                                            &tab_proc_growth)) {
      if (tab_proc_growth != L"0") {
        // Registry value has wrong value, return false
        return false;
      }
    } else {
      // Registry key or value not found, or another error condition getting the value.
      return false;
    }
  }
  return true;
}

void BrowserFactory::LaunchBrowserUsingCreateProcess(PROCESS_INFORMATION* proc_info,
                                                     std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::LaunchBrowserUsingCreateProcess";
  LOG(DEBUG) << "Starting IE using the CreateProcess API";

  STARTUPINFO start_info;
  ::ZeroMemory(&start_info, sizeof(start_info));
  start_info.cb = sizeof(start_info);

  std::wstring executable_and_url = this->ie_executable_location_;
  if (this->browser_command_line_switches_.size() != 0) {
    executable_and_url.append(L" ");
    executable_and_url.append(this->browser_command_line_switches_);
  }
  executable_and_url.append(L" ");
  executable_and_url.append(this->initial_browser_url_);

  LOG(TRACE) << "IE starting command line is: '"
             << LOGWSTRING(executable_and_url) << "'.";

  LPWSTR command_line = new WCHAR[executable_and_url.size() + 1];
  wcscpy_s(command_line,
           executable_and_url.size() + 1,
           executable_and_url.c_str());
  command_line[executable_and_url.size()] = L'\0';
  BOOL create_process_result = ::CreateProcess(NULL,
                                               command_line,
                                               NULL,
                                               NULL,
                                               FALSE,
                                               0,
                                               NULL,
                                               NULL,
                                               &start_info,
                                               proc_info);
  if (!create_process_result) {
    *error_message = StringUtilities::Format(CREATEPROCESS_ERROR_MESSAGE,
                                             StringUtilities::ToString(command_line));
  }
  delete[] command_line;
}

bool BrowserFactory::DirectoryExists(std::wstring& dir_name) {
  DWORD attribs = ::GetFileAttributes(dir_name.c_str());
  if (attribs == INVALID_FILE_ATTRIBUTES) {
    return false;
  }
  return (attribs & FILE_ATTRIBUTE_DIRECTORY);
}

bool BrowserFactory::CreateUniqueTempDir(std::wstring &temp_dir) {
  // get temporary folder for the current user
  wchar_t temp_path_array[128];
  ::GetTempPath(128, temp_path_array);
  std::wstring temp_path = temp_path_array;
  if (!DirectoryExists(temp_path)) {
    return false;
  }

  // create a IEDriver temporary folder inside the user level temporary folder
  bool temp_dir_created = false;
  for (int i = 0; i < 10; i++) {
    std::wstring output =
        temp_path + L"IEDriver-" + StringUtilities::CreateGuid();
    if (DirectoryExists(output)) {
      continue;
    }

    ::CreateDirectory(output.c_str(), NULL);
    if (!DirectoryExists(output)) {
      continue;
    }

    temp_dir = output;
    temp_dir_created = true;
    break;
  }

  return temp_dir_created;
}

void BrowserFactory::LaunchEdgeInIEMode(PROCESS_INFORMATION* proc_info,
                                        std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::LaunchEdgeInIEMode";
  LOG(DEBUG) << "Starting Edge Chromium from the command line";

  STARTUPINFO start_info;
  ::ZeroMemory(&start_info, sizeof(start_info));
  start_info.cb = sizeof(start_info);

  std::wstring executable_and_url = this->edge_executable_location_;
  if (executable_and_url == L"") {
    executable_and_url = L"msedge.exe"; // Assume it's on the path if it's not passed
  }

  // These flags force Edge into a mode where it will only run MSHTML
  executable_and_url.append(L" --ie-mode-force");
  executable_and_url.append(L" --internet-explorer-integration=iemode");

  // create a temporary directory for IEDriver test
  std::wstring temp_dir;
  if (CreateUniqueTempDir(temp_dir)) {
    LOG(TRACE) << L"Using temporary folder " << LOGWSTRING(temp_dir) << ".";
    executable_and_url.append(L" --user-data-dir=" + temp_dir);
    this->edge_user_data_dir_ = temp_dir;
  }

  executable_and_url.append(L" --no-first-run");
  executable_and_url.append(L" --no-service-autorun");
  executable_and_url.append(L" --disable-sync");
  executable_and_url.append(L" --disable-features=msImplicitSignin");
  executable_and_url.append(L" --disable-popup-blocking");

  executable_and_url.append(L" ");
  executable_and_url.append(this->initial_browser_url_);

  LOG(TRACE) << "IE starting command line is: '"
             << LOGWSTRING(executable_and_url) << "'.";

  LPWSTR command_line = new WCHAR[executable_and_url.size() + 1];
  wcscpy_s(command_line,
           executable_and_url.size() + 1,
           executable_and_url.c_str());
  command_line[executable_and_url.size()] = L'\0';
  BOOL create_process_result = ::CreateProcess(NULL,
                                               command_line,
                                               NULL,
                                               NULL,
                                               FALSE,
                                               0,
                                               NULL,
                                               NULL,
                                               &start_info,
                                               proc_info);


  if (!create_process_result) {
    *error_message = CREATEPROCESS_EDGE_ERROR + StringUtilities::ToString(command_line);
  }

  delete[] command_line;
}


bool BrowserFactory::GetDocumentFromWindowHandle(HWND window_handle,
                                                 IHTMLDocument2** document) {
  LOG(TRACE) << "Entering BrowserFactory::GetDocumentFromWindowHandle";

  if (window_handle != NULL && this->oleacc_instance_handle_) {
    LRESULT result;

    ::SendMessageTimeout(window_handle,
                         this->html_getobject_msg_,
                         0L,
                         0L,
                         SMTO_ABORTIFHUNG,
                         1000,
                         reinterpret_cast<PDWORD_PTR>(&result));

    LPFNOBJECTFROMLRESULT object_pointer = reinterpret_cast<LPFNOBJECTFROMLRESULT>(::GetProcAddress(this->oleacc_instance_handle_, "ObjectFromLresult"));
    if (object_pointer != NULL) {
      HRESULT hr;
      hr = (*object_pointer)(result,
                             IID_IHTMLDocument2,
                             0,
                             reinterpret_cast<void**>(document));
      if (SUCCEEDED(hr)) {
        return true;
      } else {
        LOGHR(WARN, hr) << "Unable to convert document object pointer to IHTMLDocument2 object via ObjectFromLresult";
      }
    } else {
      LOG(WARN) << "Unable to get address of ObjectFromLresult method from library; GetProcAddress() for ObjectFromLresult returned NULL";
    }
  } else {
    LOG(WARN) << "Window handle is invalid or OLEACC.DLL is not loaded properly";
  }
  return false;
}

bool BrowserFactory::AttachToBrowser(ProcessWindowInfo* process_window_info,
                                     std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::AttachToBrowser";
  bool attached = false;

  // Attempt to attach to the browser using ActiveAccessibility API
  // first, if this fails fallback to using ShellWindows API.
  // ActiveAccessibility fails if the Windows Desktop runs out of
  // free space for GlobalAtoms.
  // ShellWindows might fail if there is an IE modal dialog blocking
  // execution (unverified).
  if (!this->force_shell_windows_api_) {
    LOG(DEBUG) << "Using Active Accessibility to find IWebBrowser2 interface";
    attached = this->AttachToBrowserUsingActiveAccessibility(process_window_info,
                                                             error_message);
    if (!attached) {
      LOG(DEBUG) << "Failed to find IWebBrowser2 using ActiveAccessibility: "
                 << *error_message;
      // Reset the browser window handle to NULL, since we didn't attach
      // using Active Accessibility.
      process_window_info->hwndBrowser = NULL;
    }
  }

  if (!attached) {
    LOG(DEBUG) << "Using IShellWindows to find IWebBrowser2 interface";
    attached = this->AttachToBrowserUsingShellWindows(process_window_info,
                                                      error_message);
  }

  if (attached) {
    // Test for zoom level = 100%
    int zoom_level = 100;
    LOG(DEBUG) << "Ignoring zoom setting: " << this->ignore_zoom_setting_;
    if (!this->ignore_zoom_setting_) {
      zoom_level = this->GetBrowserZoomLevel(process_window_info->pBrowser);
    }
    if (zoom_level != 100) {
      std::string zoom_level_error = 
          StringUtilities::Format(ZOOM_SETTING_ERROR_MESSAGE, zoom_level);
      LOG(WARN) << zoom_level_error;
      *error_message = zoom_level_error;
      return false;
    }
  }
  return attached;
}


bool BrowserFactory::IsBrowserProcessInitialized(DWORD process_id) {
  ProcessWindowInfo info;
  info.dwProcessId = process_id;
  info.hwndBrowser = NULL;
  info.pBrowser = NULL;

  ::EnumWindows(&BrowserFactory::FindBrowserWindow,
                reinterpret_cast<LPARAM>(&info));
  return info.hwndBrowser != NULL;
}

bool BrowserFactory::AttachToBrowserUsingActiveAccessibility
                                    (ProcessWindowInfo* process_window_info,
                                     std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::AttachToBrowserUsingActiveAccessibility";

  clock_t end = clock() + (this->browser_attach_timeout_ / 1000 * CLOCKS_PER_SEC);
  while (process_window_info->hwndBrowser == NULL) {
    if (this->browser_attach_timeout_ > 0 && (clock() > end)) {
      break;
    }
    if (!this->edge_ie_mode_) {
      ::EnumWindows(&BrowserFactory::FindBrowserWindow,
                    reinterpret_cast<LPARAM>(process_window_info));
    } else {
      // If we're in edge_ie_mode, we need to look for different windows
      ::EnumWindows(&BrowserFactory::FindEdgeWindow,
                    reinterpret_cast<LPARAM>(process_window_info));
    }

    if (process_window_info->hwndBrowser == NULL) {
      ::Sleep(250);
    }
  }

  if (process_window_info->hwndBrowser == NULL) {
    *error_message = StringUtilities::Format(ATTACH_TIMEOUT_ERROR_MESSAGE,
                                             process_window_info->dwProcessId,
                                             this->browser_attach_timeout_);
    return false;
  } else {
    LOG(DEBUG) << "Found window handle " << process_window_info->hwndBrowser
               << " for window with class 'Internet Explorer_Server' belonging"
               << " to process with id " << process_window_info->dwProcessId;
  }

  CComPtr<IHTMLDocument2> document;
  if (this->GetDocumentFromWindowHandle(process_window_info->hwndBrowser,
                                        &document)) {
    int get_parent_window_retry_count = 8;
    CComPtr<IHTMLWindow2> window;
    HRESULT hr = document->get_parentWindow(&window);
    while (FAILED(hr) && get_parent_window_retry_count > 0) {
      // We know we have a valid document. We *should* be able to do a
      // document.parentWindow call to get the window. However, on the off-
      // chance that the document exists, but IE is slow to initialize all
      // of the COM objects and the full DOM, we'll sleep up to 2 seconds,
      // retrying to get the parent window.
      ::Sleep(250);
      hr = document->get_parentWindow(&window);
      --get_parent_window_retry_count;
    }
    if (SUCCEEDED(hr)) {
      // http://support.microsoft.com/kb/257717
      CComPtr<IServiceProvider> provider;
      window->QueryInterface<IServiceProvider>(&provider);
      if (provider) {
        CComPtr<IServiceProvider> child_provider;
        hr = provider->QueryService(SID_STopLevelBrowser,
                                    IID_IServiceProvider,
                                    reinterpret_cast<void**>(&child_provider));
        if (SUCCEEDED(hr)) {
          CComPtr<IWebBrowser2> browser;
          hr = child_provider->QueryService(SID_SWebBrowserApp,
                                            IID_IWebBrowser2,
                                            reinterpret_cast<void**>(&browser));
          if (SUCCEEDED(hr)) {
            process_window_info->pBrowser = browser.Detach();
            return true;
          } else {
            LOGHR(WARN, hr) << "IServiceProvider::QueryService for SID_SWebBrowserApp failed";
          }
        } else {
          LOGHR(WARN, hr) << "IServiceProvider::QueryService for SID_STopLevelBrowser failed";
        }
      } else {
        LOG(WARN) << "QueryInterface for IServiceProvider failed";
      }
    } else {
      LOGHR(WARN, hr) << "Call to IHTMLDocument2::get_parentWindow failed";
    }
  } else {
    *error_message = "Could not get document from window handle";
  }
  return false;
}

bool BrowserFactory::AttachToBrowserUsingShellWindows(
                                     ProcessWindowInfo* process_window_info,
                                     std::string* error_message) {
  LOG(TRACE) << "Entering BrowserFactory::AttachToBrowserUsingShellWindows";

  CComPtr<IShellWindows> shell_windows;
  HRESULT hr = shell_windows.CoCreateInstance(CLSID_ShellWindows);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to create an object using the IShellWindows interface with CoCreateInstance";
    return false;
  }

  CComPtr<IUnknown> enumerator_unknown;
  hr = shell_windows->_NewEnum(&enumerator_unknown);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get enumerator from IShellWindows interface";
    return false;
  }

  clock_t end = clock() + (this->browser_attach_timeout_ / 1000 * CLOCKS_PER_SEC);

  CComPtr<IEnumVARIANT> enumerator;
  enumerator_unknown->QueryInterface<IEnumVARIANT>(&enumerator);
  while (process_window_info->hwndBrowser == NULL) {
    if (this->browser_attach_timeout_ > 0 && (clock() > end)) {
      break;
    }
    enumerator->Reset();
    for (CComVariant shell_window_variant;
         enumerator->Next(1, &shell_window_variant, NULL) == S_OK;
         shell_window_variant.Clear()) {

      if (shell_window_variant.vt != VT_DISPATCH) {
        continue;
      }

      CComPtr<IShellBrowser> shell_browser;
      hr = IUnknown_QueryService(shell_window_variant.pdispVal,
                                 SID_STopLevelBrowser,
                                 IID_PPV_ARGS(&shell_browser));
      if (shell_browser) {
        HWND hwnd;
        hr = shell_browser->GetWindow(&hwnd);
        if (SUCCEEDED(hr)) {
          ::EnumChildWindows(hwnd,
                             &BrowserFactory::FindChildWindowForProcess, 
                             reinterpret_cast<LPARAM>(process_window_info));
          if (process_window_info->hwndBrowser != NULL) {
            LOG(DEBUG) << "Found window handle "
                       << process_window_info->hwndBrowser
                       << " for window with class 'Internet Explorer_Server'"
                       << " belonging to process with id "
                       << process_window_info->dwProcessId;
            CComPtr<IWebBrowser2> browser;
            hr = shell_window_variant.pdispVal->QueryInterface<IWebBrowser2>(&browser);
            if (FAILED(hr)) {
              LOGHR(WARN, hr) << "Found browser window using ShellWindows "
                              << "API, but QueryInterface for IWebBrowser2 "
                              << "failed, so could not attach to the browser.";
            } else {
              process_window_info->pBrowser = browser.Detach();
            }
            break;
          }
        }
      }
    }
    if (process_window_info->hwndBrowser == NULL ||
        process_window_info->pBrowser == NULL) {
      ::Sleep(250);
    }
  }

  if (process_window_info->hwndBrowser == NULL) {
    *error_message = StringUtilities::Format(ATTACH_TIMEOUT_ERROR_MESSAGE,
                                             process_window_info->dwProcessId,
                                             this->browser_attach_timeout_);
    return false;
  }

  if (process_window_info->pBrowser == NULL) {
    *error_message = ATTACH_FAILURE_ERROR_MESSAGE;
    return false;
  }
  return true;
}

int BrowserFactory::GetBrowserZoomLevel(IWebBrowser2* browser) {
  LOG(TRACE) << "Entering BrowserFactory::GetBrowserZoomLevel";
  clock_t end = clock() + (this->browser_attach_timeout_ / 1000 * CLOCKS_PER_SEC);
  CComPtr<IDispatch> document_dispatch;
  while (!document_dispatch) {
    if (this->browser_attach_timeout_ > 0 && (clock() > end)) {
      break;
    }

    browser->get_Document(&document_dispatch);

    if (!document_dispatch) {
      ::Sleep(250);
    }
  }

  if (!document_dispatch) {
    LOG(WARN) << "Call to IWebBrowser2::get_Document failed";
    return 0;
  }

  CComPtr<IHTMLDocument2> document;
  document_dispatch->QueryInterface(&document);
  if (!document) {
    LOG(WARN) << "QueryInterface for IHTMLDocument2 failed.";
    return 0;
  }

  CComPtr<IHTMLWindow2> window;
  HRESULT hr = document->get_parentWindow(&window);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to IHTMLDocument2::get_parentWindow failed";
    return 0;
  }

  // Test for zoom level = 100%
  int zoom_level = this->GetZoomLevel(document, window);
  return zoom_level;
}

int BrowserFactory::GetZoomLevel(IHTMLDocument2* document, IHTMLWindow2* window) {
  LOG(TRACE) << "Entering BrowserFactory::GetZoomLevel";
  int zoom = 100;  // Chances are the zoom level hasn't been modified....
  HRESULT hr = S_OK;
  if (this->ie_major_version_ == 7) {
    CComPtr<IHTMLElement> body;
    hr = document->get_body(&body);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLDocument2::get_body failed";
      return zoom;
    }

    long offset_width = 0;
    hr = body->get_offsetWidth(&offset_width);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLElement::get_offsetWidth failed";
      return zoom;
    }

    CComPtr<IHTMLElement2> body2;
    hr = body.QueryInterface<IHTMLElement2>(&body2);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Attempt to QueryInterface for IHTMLElement2 failed";
      return zoom;
    }

    CComPtr<IHTMLRect> rect;
    hr = body2->getBoundingClientRect(&rect);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLElement2::getBoundingClientRect failed";
      return zoom;
    }

    long left = 0, right = 0;
    hr = rect->get_left(&left);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLRect::get_left failed";
      return zoom;
    }

    hr = rect->get_right(&right);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLRect::get_right failed";
      return zoom;
    }

    zoom = static_cast<int>((static_cast<double>(right - left) / offset_width) * 100.0);
  } else if (this->ie_major_version_ >= 8) {
    CComPtr<IHTMLScreen> screen;
    hr = window->get_screen(&screen);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLWindow2::get_screen failed";
      return zoom;
    }

    CComPtr<IHTMLScreen2> screen2;
    hr = screen.QueryInterface<IHTMLScreen2>(&screen2);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Attempt to QueryInterface for IHTMLScreen2 failed";
      return zoom;
    }

    long device_xdpi=0, logical_xdpi = 0;
    hr = screen2->get_deviceXDPI(&device_xdpi);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLScreen2::get_deviceXDPI failed";
      return zoom;
    }

    hr = screen2->get_logicalXDPI(&logical_xdpi);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Call to IHTMLScreen2::get_logicalXDPI failed";
      return zoom;
    }

    zoom = static_cast<int>((static_cast<double>(device_xdpi) / logical_xdpi) * 100.0);
  } else {
    // IE6 case
    zoom = 100;
  }

  LOG(DEBUG) << "Browser zoom level is " << zoom << "%";
  return zoom;
}

IWebBrowser2* BrowserFactory::CreateBrowser(bool is_protected_mode) {
  LOG(TRACE) << "Entering BrowserFactory::CreateBrowser";

  IWebBrowser2* browser = NULL;
  DWORD context = CLSCTX_LOCAL_SERVER;
  if (this->ie_major_version_ == 7 && IsWindowsVistaOrGreater()) {
    // ONLY for IE 7 on Windows Vista. XP and below do not have Protected Mode;
    // Windows 7 shipped with IE8.
    context = context | CLSCTX_ENABLE_CLOAKING;
  }

  HRESULT hr = S_OK;
  if (is_protected_mode) {
    hr = ::CoCreateInstance(CLSID_InternetExplorer,
                            NULL,
                            context,
                            IID_IWebBrowser2,
                            reinterpret_cast<void**>(&browser));
  } else {
    hr = ::CoCreateInstance(CLSID_InternetExplorerMedium,
                            NULL,
                            context,
                            IID_IWebBrowser2,
                            reinterpret_cast<void**>(&browser));
  }
  // When IWebBrowser2::Quit() is called, the wrapper process doesn't
  // exit right away. When that happens, CoCreateInstance can fail while
  // the abandoned iexplore.exe instance is still valid. The "right" way
  // to do this would be to call ::EnumProcesses before calling
  // CoCreateInstance, finding all of the iexplore.exe processes, waiting
  // for one to exit, and then proceed. However, there is no way to tell
  // if a process ID belongs to an Internet Explorer instance, particularly
  // when a 32-bit process tries to enumerate 64-bit processes on 64-bit
  // Windows. So, we'll take the brute force way out, just retrying the call
  // to CoCreateInstance until it succeeds (the old iexplore.exe process has
  // exited), or we get a different error code. We'll also set a 45-second
  // timeout, with 45 seconds being chosen because it's below the default
  // 60 second HTTP request timeout of most language bindings.
  if (FAILED(hr) && HRESULT_CODE(hr) == ERROR_SHUTDOWN_IS_SCHEDULED) {
    LOG(DEBUG) << "CoCreateInstance for IWebBrowser2 failed due to a "
                << "browser process that has not yet fully exited. Retrying "
                << "until the browser process exits and a new instance can "
                << "be successfully created.";
  }
  clock_t timeout = clock() + (45 * CLOCKS_PER_SEC);
  while (FAILED(hr) && 
         HRESULT_CODE(hr) == ERROR_SHUTDOWN_IS_SCHEDULED &&
         clock() < timeout) {
    ::Sleep(500);
    hr = ::CoCreateInstance(CLSID_InternetExplorer,
                            NULL,
                            context,
                            IID_IWebBrowser2,
                            reinterpret_cast<void**>(&browser));
  }
  if (FAILED(hr) && HRESULT_CODE(hr) != ERROR_SHUTDOWN_IS_SCHEDULED) {
    // If we hit this branch, the CoCreateInstance failed due to an unexpected
    // error, either before we looped, or at some point during the loop. In
    // in either case, there's not much else we can do except log the failure.
    LOGHR(WARN, hr) << "CoCreateInstance for IWebBrowser2 failed.";
  }

  if (browser != NULL) {
    browser->put_Visible(VARIANT_TRUE);
  }

  return browser;
}

bool BrowserFactory::CreateLowIntegrityLevelToken(HANDLE* process_token_handle,
                                                  HANDLE* mic_token_handle,
                                                  PSID* sid) {
  LOG(TRACE) << "Entering BrowserFactory::CreateLowIntegrityLevelToken";
  BOOL result = TRUE;
  TOKEN_MANDATORY_LABEL tml = {0};

  HANDLE process_handle = ::GetCurrentProcess();
  result = ::OpenProcessToken(process_handle,
                              MAXIMUM_ALLOWED,
                              process_token_handle);

  if (result) {
    result = ::DuplicateTokenEx(*process_token_handle,
                                MAXIMUM_ALLOWED,
                                NULL,
                                SecurityImpersonation,
                                TokenPrimary,
                                mic_token_handle);
    if (!result) {
      LOGERR(WARN) << "CreateLowIntegrityLevelToken: Could not duplicate token";
      ::CloseHandle(*process_token_handle);
    }
   }

  if (result) {     
    result = ::ConvertStringSidToSid(SDDL_ML_LOW, sid);
    if (result) {
      tml.Label.Attributes = SE_GROUP_INTEGRITY;
      tml.Label.Sid = *sid;
    } else {
      LOGERR(WARN) << "CreateLowIntegrityLevelToken: Could not convert string SID to SID";
      ::CloseHandle(*process_token_handle);
      ::CloseHandle(*mic_token_handle);
    }
  }

  if(result) {
    result = ::SetTokenInformation(*mic_token_handle,
                                   TokenIntegrityLevel,
                                   &tml,
                                   sizeof(tml) + ::GetLengthSid(*sid));
    if (!result) {
      LOGERR(WARN) << "CreateLowIntegrityLevelToken: Could not set token information to low level";
      ::CloseHandle(*process_token_handle);
      ::CloseHandle(*mic_token_handle);
      ::LocalFree(*sid);
    }
  }

  ::CloseHandle(process_handle);
  return result == TRUE;
}

void BrowserFactory::InvokeClearCacheUtility(bool use_low_integrity_level) {
  LOG(TRACE) << "Entering BrowserFactory::InvokeClearCacheUtility";
  HRESULT hr = S_OK;
  std::vector<wchar_t> system_path_buffer(MAX_PATH);
  std::vector<wchar_t> rundll_exe_path_buffer(MAX_PATH);
  std::vector<wchar_t> inetcpl_path_buffer(MAX_PATH);
  std::wstring args = L"";

  UINT system_path_size = ::GetSystemDirectory(&system_path_buffer[0], MAX_PATH);

  HANDLE  process_token = NULL;
  HANDLE  mic_token = NULL;
  PSID    sid = NULL;

  bool can_create_process = true;
  if (!use_low_integrity_level || 
      this->CreateLowIntegrityLevelToken(&process_token, &mic_token, &sid)) {
    if (0 != system_path_size &&
        system_path_size <= static_cast<int>(system_path_buffer.size())) {
      if (::PathCombine(&rundll_exe_path_buffer[0],
                        &system_path_buffer[0],
                        RUNDLL_EXE_NAME) && 
          ::PathCombine(&inetcpl_path_buffer[0],
                        &system_path_buffer[0],
                        INTERNET_CONTROL_PANEL_APPLET_NAME)) {
        // PathCombine will return NULL if the buffer would be exceeded.
        ::PathQuoteSpaces(&rundll_exe_path_buffer[0]);
        ::PathQuoteSpaces(&inetcpl_path_buffer[0]);
        args = StringUtilities::Format(CLEAR_CACHE_COMMAND_LINE_ARGS,
                                       &inetcpl_path_buffer[0],
                                       CLEAR_CACHE_OPTIONS);
      } else {
        LOG(WARN) << "Cannot combine paths to utilities required to clear cache.";
        can_create_process = false;
      }
    } else {
      LOG(WARN) << "Paths system directory exceeds MAX_PATH.";
      can_create_process = false;
    }

    if (can_create_process) {
      LOG(DEBUG) << "Launching inetcpl.cpl via rundll32.exe to clear cache";
      STARTUPINFO start_info;
      ::ZeroMemory(&start_info, sizeof(start_info));
      start_info.cb = sizeof(start_info);

      PROCESS_INFORMATION process_info;
      BOOL is_process_created = FALSE;
      start_info.dwFlags = STARTF_USESHOWWINDOW;
      start_info.wShowWindow = SW_SHOWNORMAL;

      std::vector<wchar_t> args_buffer(0);
      StringUtilities::ToBuffer(args, &args_buffer);
      // Create the process to run with low or medium rights
      if (use_low_integrity_level) {
        is_process_created = CreateProcessAsUser(mic_token,
                                                 &rundll_exe_path_buffer[0],
                                                 &args_buffer[0],
                                                 NULL,
                                                 NULL,
                                                 FALSE,
                                                 0,
                                                 NULL,
                                                 NULL,
                                                 &start_info,
                                                 &process_info);
      } else {
        is_process_created = CreateProcess(&rundll_exe_path_buffer[0],
                                           &args_buffer[0],
                                           NULL,
                                           NULL,
                                           FALSE,
                                           0,
                                           NULL,
                                           NULL,
                                           &start_info,
                                           &process_info);
      }

      if (is_process_created) {
        // Wait for the rundll32.exe process to exit.
        LOG(DEBUG) << "Waiting for rundll32.exe process to exit.";
        ::WaitForInputIdle(process_info.hProcess, 5000);
        ::WaitForSingleObject(process_info.hProcess, 30000);
        ::CloseHandle(process_info.hProcess);
        ::CloseHandle(process_info.hThread);
        LOG(DEBUG) << "Cache clearing complete.";
      } else {
        LOGERR(WARN) << "Could not create process for clearing cache.";
      }
    }

    // Close the handles opened when creating the
    // low integrity level token
    if (use_low_integrity_level) {
      ::CloseHandle(process_token);
      ::CloseHandle(mic_token);
      ::LocalFree(sid);
    }
  }
}

BOOL CALLBACK BrowserFactory::FindBrowserWindow(HWND hwnd, LPARAM arg) {
  // Could this be an IE instance?
  // 8 == "IeFrame\0"
  // 21 == "Shell DocObject View\0"
  // 19 == "Chrome_WidgetWin_1"
  char name[21];
  if (::GetClassNameA(hwnd, name, 21) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (strcmp(IE_FRAME_WINDOW_CLASS, name) != 0 &&
      strcmp(SHELL_DOCOBJECT_VIEW_WINDOW_CLASS, name) != 0 &&
      strcmp(ANDIE_FRAME_WINDOW_CLASS, name) != 0) {
    return TRUE;
  }

  return EnumChildWindows(hwnd, FindChildWindowForProcess, arg);
}

BOOL CALLBACK BrowserFactory::FindEdgeWindow(HWND hwnd, LPARAM arg) {
  // Could this be an EdgeChrome window?
  // 19 == "Chrome_WidgetWin_1"
  char name[20];
  if (::GetClassNameA(hwnd, name, 20) == 0) {
    // No match found. Skip
    return TRUE;
  }

  // continue if it is not "Chrome_WidgetWin_1"
  if (strcmp(ANDIE_FRAME_WINDOW_CLASS, name) != 0) return TRUE;

  // continue if window does not belong to the target process
  DWORD process_id = NULL;
  ::GetWindowThreadProcessId(hwnd, &process_id);
  ProcessWindowInfo* process_window_info = reinterpret_cast<ProcessWindowInfo*>(arg);
  if (process_window_info->dwProcessId != process_id) {
    return TRUE;
  }

  return EnumChildWindows(hwnd, FindEdgeChildWindowForProcess, arg);
}

BOOL CALLBACK BrowserFactory::FindIEBrowserHandles(HWND hwnd, LPARAM arg) {
  std::vector<HWND>* handles = reinterpret_cast<std::vector<HWND>*>(arg);

  // Could this be an Internet Explorer Server window?
  // 25 == "Internet Explorer_Server\0"
  char name[25];
  if (::GetClassNameA(hwnd, name, 25) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (strcmp("Internet Explorer_Server", name) == 0) {
    handles->push_back(hwnd);
  }

  return TRUE;
}

BOOL CALLBACK BrowserFactory::FindEdgeBrowserHandles(HWND hwnd, LPARAM arg) {
  std::vector<HWND>* handles = reinterpret_cast<std::vector<HWND>*>(arg);

  // Could this be an Internet Explorer Server window?
  // 19 == "Chrome_WidgetWin_1\0"
  char name[20];
  if (::GetClassNameA(hwnd, name, 20) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (strcmp("Chrome_WidgetWin_1", name) == 0) {
    handles->push_back(hwnd);
  }

  return TRUE;
}

BOOL CALLBACK BrowserFactory::FindChildWindowForProcess(HWND hwnd, LPARAM arg) {
  ProcessWindowInfo *process_window_info = reinterpret_cast<ProcessWindowInfo*>(arg);

  // Could this be an Internet Explorer Server window?
  // 25 == "Internet Explorer_Server\0"
  char name[25];
  if (::GetClassNameA(hwnd, name, 25) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (strcmp(IE_SERVER_CHILD_WINDOW_CLASS, name) != 0) {
    return TRUE;
  } else {
    DWORD process_id = NULL;
    ::GetWindowThreadProcessId(hwnd, &process_id);
    LOG(DEBUG) << "Looking for " << process_window_info->dwProcessId;
    if (process_window_info->dwProcessId == process_id) {
      // Once we've found the first Internet Explorer_Server window
      // for the process we want, we can stop.
      process_window_info->hwndBrowser = hwnd;
      return FALSE;
    }
  }

  return TRUE;
}

BOOL CALLBACK BrowserFactory::FindEdgeChildWindowForProcess(HWND hwnd, LPARAM arg) {
  ProcessWindowInfo* process_window_info = reinterpret_cast<ProcessWindowInfo*>(arg);

  // Could this be an Internet Explorer Server window?
  // 25 == "Internet Explorer_Server\0"
  char name[25];
  if (::GetClassNameA(hwnd, name, 25) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (strcmp(IE_SERVER_CHILD_WINDOW_CLASS, name) != 0) {
    return TRUE;
  }
  else {
    DWORD process_id = NULL;
    ::GetWindowThreadProcessId(hwnd, &process_id);
    LOG(DEBUG) << "Looking for " << process_window_info->dwProcessId;
    // Once we've found the first Internet Explorer_Server window
    // for the process we want, we can stop.
    process_window_info->hwndBrowser = hwnd;
    return FALSE;
  }

  return TRUE;
}

BOOL CALLBACK BrowserFactory::FindDialogWindowForProcess(HWND hwnd, LPARAM arg) {
  ProcessWindowInfo* process_win_info = reinterpret_cast<ProcessWindowInfo*>(arg);

  // Could this be an dialog window?
  // 7 == "#32770\0"
  // 29 == "Credential Dialog Xaml Host\0"
  // 34 == "Internet Explorer_TridentDlgFrame\0"
  char name[34];
  if (::GetClassNameA(hwnd, name, 34) == 0) {
    // No match found. Skip
    return TRUE;
  }
  
  if (strcmp(ALERT_WINDOW_CLASS, name) != 0 && 
      strcmp(HTML_DIALOG_WINDOW_CLASS, name) != 0 &&
      strcmp(SECURITY_DIALOG_WINDOW_CLASS, name) != 0) {
    return TRUE;
  } else {
    // If the window style has the WS_DISABLED bit set or the 
    // WS_VISIBLE bit unset, it can't be handled via the UI, 
    // and must not be a visible dialog. Furthermore, if the
    // window style does not display a caption bar, it's not a
    // dialog displayed by the browser, but likely by an add-on
    // (like an antivirus toolbar). Note that checking the caption
    // window style is a hack, and may begin to fail if IE ever
    // changes the style of its alert windows.
    long window_long_style = ::GetWindowLong(hwnd, GWL_STYLE);
    if ((window_long_style & WS_DISABLED) != 0 ||
        (window_long_style & WS_VISIBLE) == 0 ||
        (window_long_style & WS_CAPTION) == 0) {
      return TRUE;
    }
    DWORD process_id = NULL;
    ::GetWindowThreadProcessId(hwnd, &process_id);
    if (process_win_info->dwProcessId == process_id) {
      // Once we've found the first dialog (#32770) window
      // for the process we want, we can stop.
      process_win_info->hwndBrowser = hwnd;
      return FALSE;
    }
  }

  return TRUE;
}

void BrowserFactory::GetExecutableLocation() {
  LOG(TRACE) << "Entering BrowserFactory::GetExecutableLocation";

  std::wstring class_id;
  if (RegistryUtilities::GetRegistryValue(HKEY_LOCAL_MACHINE,
                                          IE_CLSID_REGISTRY_KEY,
                                          L"",
                                          &class_id)) {
    std::wstring location_key = L"SOFTWARE\\Classes\\CLSID\\" + 
                                class_id +
                                L"\\LocalServer32";
    std::wstring executable_location;

    // If we are a 32-bit driver instance, running on 64-bit Windows,
    // we want to bypass the registry redirection so that we can get
    // the actual location of the browser executable. The primary place
    // this matters is when getting the browser version; the secondary
    // place is if the user specifies to use the CreateProcess API for
    // launching the browser, hence the 'true' argument in the following
    // call to RegistryUtilities::GetRegistryValue.
    if (RegistryUtilities::GetRegistryValue(HKEY_LOCAL_MACHINE,
                                            location_key,
                                            L"",
                                            true,
                                            &executable_location)) {
      // If the executable location in the registry has an environment
      // variable in it, expand the environment variable to an absolute
      // path.
      DWORD expanded_location_size = ::ExpandEnvironmentStrings(executable_location.c_str(), NULL, 0);
      std::vector<wchar_t> expanded_location(expanded_location_size);
      ::ExpandEnvironmentStrings(executable_location.c_str(), &expanded_location[0], expanded_location_size);
      executable_location = &expanded_location[0];
      this->ie_executable_location_ = executable_location;
      size_t arg_start_pos = executable_location.find(L" -");
      if (arg_start_pos != std::string::npos) {
        this->ie_executable_location_ = executable_location.substr(0, arg_start_pos);
      }
      if (this->ie_executable_location_.substr(0, 1) == L"\"") {
        this->ie_executable_location_.erase(0, 1);
        this->ie_executable_location_.erase(this->ie_executable_location_.size() - 1, 1);
      }
    } else {
      LOG(WARN) << "Unable to get IE executable location from registry";
    }
  } else {
    LOG(WARN) << "Unable to get IE class id from registry";
  }
}

void BrowserFactory::GetIEVersion() {
  LOG(TRACE) << "Entering BrowserFactory::GetIEVersion";

  std::string ie_version = FileUtilities::GetFileVersion(this->ie_executable_location_);
  
  if (ie_version.size() == 0) {
    // 64-bit Windows 8 has a bug where it does not return the executable location properly
    this->ie_major_version_ = -1;
    LOG(WARN) << "Couldn't find IE version for executable "
               << LOGWSTRING(this->ie_executable_location_)
               << ", falling back to "
               << this->ie_major_version_;
    return;
  }

  std::stringstream version_stream(ie_version);
  version_stream >> this->ie_major_version_;
}

bool BrowserFactory::ProtectedModeSettingsAreValid() {
  LOG(TRACE) << "Entering BrowserFactory::ProtectedModeSettingsAreValid";

  bool settings_are_valid = true;
  LOG(DEBUG) << "Detected IE version: " << this->ie_major_version_
             << ", Windows version supports Protected Mode: "
             << IsWindowsVistaOrGreater() ? "true" : "false";
  // Only need to check Protected Mode settings on IE 7 or higher
  // and on Windows Vista or higher. Otherwise, Protected Mode
  // doesn't come into play, and are valid.
  // Documentation of registry settings can be found at the following
  // Microsoft KnowledgeBase article:
  // http://support.microsoft.com/kb/182569
  if (this->ie_major_version_ >= 7 && IsWindowsVistaOrGreater()) {
    HKEY key_handle;
    if (ERROR_SUCCESS == ::RegOpenKeyEx(HKEY_CURRENT_USER,
                                        IE_SECURITY_ZONES_REGISTRY_KEY,
                                        0,
                                        KEY_QUERY_VALUE | KEY_ENUMERATE_SUB_KEYS,
                                        &key_handle)) {
      DWORD subkey_count = 0;
      DWORD max_subkey_name_length = 0;
      if (ERROR_SUCCESS == ::RegQueryInfoKey(key_handle,
                                             NULL,
                                             NULL,
                                             NULL,
                                             &subkey_count,
                                             &max_subkey_name_length,
                                             NULL,
                                             NULL,
                                             NULL,
                                             NULL,
                                             NULL,
                                             NULL)) {
        int protected_mode_value = -1;
        std::vector<wchar_t> subkey_name_buffer(max_subkey_name_length + 1);
        for (size_t index = 0; index < subkey_count; ++index) {
          DWORD number_of_characters_copied = max_subkey_name_length + 1;
          ::RegEnumKeyEx(key_handle,
                         static_cast<DWORD>(index),
                         &subkey_name_buffer[0],
                         &number_of_characters_copied,
                         NULL,
                         NULL,
                         NULL,
                         NULL);
          std::wstring subkey_name = &subkey_name_buffer[0];
          // Ignore the "My Computer" zone, since it's not displayed
          // in the UI.
          if (subkey_name != ZONE_MY_COMPUTER) {
            int value = this->GetZoneProtectedModeSetting(key_handle,
                                                          subkey_name);
            if (protected_mode_value == -1) {
              protected_mode_value = value;
            } else {
              if (value != protected_mode_value) {
                settings_are_valid = false;
                break;
              }
            }
          }
        }
      } else {
        LOG(WARN) << "RegQueryInfoKey to get count of zone setting subkeys failed";
      }
      ::RegCloseKey(key_handle);
    } else {
      std::wstring registry_key_string = IE_SECURITY_ZONES_REGISTRY_KEY;
      LOG(WARN) << "RegOpenKeyEx for zone settings registry key "
                << LOGWSTRING(registry_key_string)
                << " in HKEY_CURRENT_USER failed";
    }
  }
  return settings_are_valid;
}

int BrowserFactory::GetZoneProtectedModeSetting(const HKEY key_handle,
                                                const std::wstring& zone_subkey_name) {
  LOG(TRACE) << "Entering BrowserFactory::GetZoneProtectedModeSetting";

  int protected_mode_value = 3;
  HKEY subkey_handle;
  if (ERROR_SUCCESS == ::RegOpenKeyEx(key_handle,
                                      zone_subkey_name.c_str(),
                                      0,
                                      KEY_QUERY_VALUE,
                                      &subkey_handle)) {
    DWORD value = 0;
    DWORD value_length = sizeof(DWORD);
    if (ERROR_SUCCESS == ::RegQueryValueEx(subkey_handle,
                                           IE_PROTECTED_MODE_SETTING_VALUE_NAME,
                                           NULL,
                                           NULL,
                                           reinterpret_cast<LPBYTE>(&value),
                                           &value_length)) {
      LOG(DEBUG) << "Found Protected Mode setting value of "
                 << value << " for zone " << LOGWSTRING(zone_subkey_name);
      protected_mode_value = value;
    } else {
      LOG(DEBUG) << "RegQueryValueEx failed for getting Protected Mode setting for a zone: "
                 << LOGWSTRING(zone_subkey_name);
    }
    ::RegCloseKey(subkey_handle);
  } else {
    // The REG_DWORD value doesn't exist, so we have to return the default
    // value, which is "on" for the Internet and Restricted Sites zones and
    // is "on" for the Local Intranet zone in IE7 only (the default was
    // changed to "off" for Local Intranet in IE8), and "off" everywhere
    // else.
    // Note that a value of 0 in the registry value indicates that Protected
    // Mode is "on" for that zone; a value of 3 indicates that Protected Mode
    // is "off" for that zone.
    if (zone_subkey_name == ZONE_INTERNET ||
        zone_subkey_name == ZONE_RESTRICTED_SITES ||
        (zone_subkey_name == ZONE_LOCAL_INTRANET && this->ie_major_version_ == 7)) {
      protected_mode_value = 0;
    }
    LOG(DEBUG) << "Protected Mode zone setting value does not exist for zone "
               << LOGWSTRING(zone_subkey_name) << ". Using default value of "
               << protected_mode_value;
  }
  return protected_mode_value;
}

bool BrowserFactory::IsWindowsVersionOrGreater(unsigned short major_version,
                                               unsigned short minor_version,
                                               unsigned short service_pack) {
  OSVERSIONINFOEXW osvi = { sizeof(osvi), 0, 0, 0, 0,{ 0 }, 0, 0 };
  DWORDLONG        const dwlConditionMask = VerSetConditionMask(
    VerSetConditionMask(
      VerSetConditionMask(
        0, VER_MAJORVERSION, VER_GREATER_EQUAL),
      VER_MINORVERSION, VER_GREATER_EQUAL),
    VER_SERVICEPACKMAJOR, VER_GREATER_EQUAL);

  osvi.dwMajorVersion = major_version;
  osvi.dwMinorVersion = minor_version;
  osvi.wServicePackMajor = service_pack;

  return VerifyVersionInfoW(&osvi,
                            VER_MAJORVERSION | VER_MINORVERSION | VER_SERVICEPACKMAJOR,
                            dwlConditionMask) != FALSE;
}
 
bool BrowserFactory::IsWindowsVistaOrGreater() {
  return IsWindowsVersionOrGreater(HIBYTE(_WIN32_WINNT_VISTA), LOBYTE(_WIN32_WINNT_VISTA), 0);
}

bool BrowserFactory::IsEdgeMode() const {
  return this->edge_ie_mode_;
}

// delete a folder recursively
int BrowserFactory::DeleteDirectory(const std::wstring &dir_name) {
  WIN32_FIND_DATA file_info;      

  std::wstring file_pattern = dir_name + L"\\*.*";
  HANDLE file_handle = ::FindFirstFile(file_pattern.c_str(), &file_info);
  if (file_handle != INVALID_HANDLE_VALUE) {
    do {
      if (file_info.cFileName[0] == '.') {
        continue;
      }
      std::wstring file_path = dir_name + L"\\" + file_info.cFileName;

      if (file_info.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY) {
        int return_value = DeleteDirectory(file_path);
        if (return_value) {
          return return_value;
        }
      } else {
        if (::SetFileAttributes(file_path.c_str(), FILE_ATTRIBUTE_NORMAL) == FALSE) {
          return ::GetLastError();
        }

        if (::DeleteFile(file_path.c_str()) == FALSE) {
          return ::GetLastError();
        }
      }
    } while (::FindNextFile(file_handle, &file_info) == TRUE);

    ::FindClose(file_handle);
    DWORD dwError = ::GetLastError();
    if (dwError != ERROR_NO_MORE_FILES) {
      return dwError;
    }

    if (::SetFileAttributes(dir_name.c_str(), FILE_ATTRIBUTE_NORMAL) == FALSE) {
      return ::GetLastError();
    }

    if (::RemoveDirectory(dir_name.c_str()) == FALSE) {
      return ::GetLastError();
    }
  }

  return 0;
}

std::wstring BrowserFactory::GetEdgeTempDir() {
  return this->edge_user_data_dir_;
}

} // namespace webdriver
