// Copyright 2011 WebDriver committers
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

#include "BrowserFactory.h"

namespace webdriver {

BrowserFactory::BrowserFactory(void) {
	this->GetExecutableLocation();
	this->GetIEVersion();
	this->GetOSVersion();
	this->html_getobject_msg_ = ::RegisterWindowMessage(HTML_GETOBJECT_MSG);

	// Explicitly load MSAA so we know if it's installed
	this->oleacc_instance_handle_ = ::LoadLibrary(OLEACC_LIBRARY_NAME);
}

BrowserFactory::~BrowserFactory(void) {
	if (this->oleacc_instance_handle_) {
		::FreeLibrary(this->oleacc_instance_handle_);
	}
}

DWORD BrowserFactory::LaunchBrowserProcess(const int port, const bool ignore_protected_mode_settings) {
	DWORD process_id = NULL;
	if (ignore_protected_mode_settings || this->ProtectedModeSettingsAreValid()) {
		STARTUPINFO start_info;
		PROCESS_INFORMATION proc_info;

		::ZeroMemory(&start_info, sizeof(start_info));
		start_info.cb = sizeof(start_info);
		::ZeroMemory(&proc_info, sizeof(proc_info));

		std::wstringstream url_stream;
		url_stream << L"http://localhost:" << port << L"/";
		std::wstring initial_url(url_stream.str());

		FARPROC proc_address = 0;
		HMODULE library_handle = ::LoadLibrary(IEFRAME_LIBRARY_NAME);
		if (library_handle != NULL) {
			proc_address = ::GetProcAddress(library_handle, IELAUNCHURL_FUNCTION_NAME);
		}

		if (proc_address != 0) {
			// If we have the IELaunchURL API, expressly use it. This will
			// guarantee a new session. Simply using CoCreateInstance to 
			// create the browser will merge sessions, making separate cookie
			// handling impossible.
			::IELaunchURL(initial_url.c_str(), &proc_info, NULL);
		} else {
			std::wstring executable_and_url = this->ie_executable_location_ + L" " + initial_url;
			LPWSTR command_line = new WCHAR[executable_and_url.size() + 1];
			wcscpy_s(command_line, executable_and_url.size() + 1, executable_and_url.c_str());
			command_line[executable_and_url.size()] = L'\0';
			::CreateProcess(NULL, command_line, NULL, NULL, FALSE, 0, NULL, NULL, &start_info, &proc_info);
			delete[] command_line;
		}

		process_id = proc_info.dwProcessId;

		if (proc_info.hThread != NULL) {
			::CloseHandle(proc_info.hThread);
		}

		if (proc_info.hProcess != NULL) {
			::CloseHandle(proc_info.hProcess);
		}

		if (library_handle != NULL) {
			::FreeLibrary(library_handle);
		}
	}
	return process_id;
}

bool BrowserFactory::GetDocumentFromWindowHandle(HWND window_handle, IHTMLDocument2** document) {
	if (window_handle != NULL && this->oleacc_instance_handle_) {
		LRESULT result;
		::SendMessageTimeout(window_handle, this->html_getobject_msg_, 0L, 0L, SMTO_ABORTIFHUNG, 1000, reinterpret_cast<PDWORD_PTR>(&result));

		LPFNOBJECTFROMLRESULT object_pointer =  reinterpret_cast<LPFNOBJECTFROMLRESULT>(::GetProcAddress(this->oleacc_instance_handle_, "ObjectFromLresult"));
		if (object_pointer != NULL) {
			HRESULT hr;
			hr = (*object_pointer)(result, IID_IHTMLDocument2, 0, reinterpret_cast<void**>(document));
			if (SUCCEEDED(hr)) {
				return true;
			}
		}
	}
	return false;
}

void BrowserFactory::AttachToBrowser(ProcessWindowInfo* process_window_info) {
	while (process_window_info->hwndBrowser == NULL) {
		// TODO: create a timeout for this. We shouldn't need it, since
		// we got a valid process ID, but we should bulletproof it.
		::EnumWindows(&BrowserFactory::FindBrowserWindow, reinterpret_cast<LPARAM>(process_window_info));
		if (process_window_info->hwndBrowser == NULL) {
			::Sleep(250);
		}
	}

	CComPtr<IHTMLDocument2> document;
	if (this->GetDocumentFromWindowHandle(process_window_info->hwndBrowser, &document)) {
	   CComPtr<IHTMLWindow2> window;
	   HRESULT hr = document->get_parentWindow(&window);
	   if (SUCCEEDED(hr)) {
			// http://support.microsoft.com/kb/257717
			CComQIPtr<IServiceProvider> provider(window);
			if (provider) {
				CComPtr<IServiceProvider> child_provider;
				hr = provider->QueryService(SID_STopLevelBrowser, IID_IServiceProvider, reinterpret_cast<void**>(&child_provider));
				if (SUCCEEDED(hr)) {
					IWebBrowser2* browser;
					hr = child_provider->QueryService(SID_SWebBrowserApp, IID_IWebBrowser2, reinterpret_cast<void**>(&browser));
					if (SUCCEEDED(hr)) {
						process_window_info->pBrowser = browser;
					}
				}
			}
		}
	}
}

IWebBrowser2* BrowserFactory::CreateBrowser() {
	// TODO: Error and exception handling and return value checking.
	IWebBrowser2* browser;
	if (this->windows_major_version_ >= 6) {
		// Only Windows Vista and above have mandatory integrity levels.
		this->SetThreadIntegrityLevel();
	}

	DWORD context = CLSCTX_LOCAL_SERVER;
	if (this->ie_major_version_ == 7 && this->windows_major_version_ >= 6) {
		// ONLY for IE 7 on Windows Vista. XP and below do not have Protected Mode;
		// Windows 7 shipped with IE8.
		context = context | CLSCTX_ENABLE_CLOAKING;
	}

	::CoCreateInstance(CLSID_InternetExplorer, NULL, context, IID_IWebBrowser2, reinterpret_cast<void**>(&browser));
	browser->put_Visible(VARIANT_TRUE);

	if (this->windows_major_version_ >= 6) {
		// Only Windows Vista and above have mandatory integrity levels.
		this->ResetThreadIntegrityLevel();
	}

	return browser;
}


void BrowserFactory::SetThreadIntegrityLevel() {
	// TODO: Error handling and return value checking.
	HANDLE process_token = NULL;
	HANDLE process_handle = ::GetCurrentProcess();
	BOOL result = ::OpenProcessToken(process_handle, TOKEN_DUPLICATE, &process_token);

	HANDLE thread_token = NULL;
	result = ::DuplicateTokenEx(
		process_token, 
		TOKEN_QUERY | TOKEN_IMPERSONATE | TOKEN_ADJUST_DEFAULT,
		NULL, 
		SecurityImpersonation,
		TokenImpersonation,
		&thread_token);

	PSID sid = NULL;
	result = ::ConvertStringSidToSid(SDDL_ML_LOW, &sid);

	TOKEN_MANDATORY_LABEL tml;
	tml.Label.Attributes = SE_GROUP_INTEGRITY | SE_GROUP_INTEGRITY_ENABLED;
	tml.Label.Sid = sid;

	result = ::SetTokenInformation(thread_token, TokenIntegrityLevel, &tml, sizeof(tml) + ::GetLengthSid(sid));
	::LocalFree(sid);

	HANDLE thread_handle = ::GetCurrentThread();
	result = ::SetThreadToken(&thread_handle, thread_token);
	result = ::ImpersonateLoggedOnUser(thread_token);

	result = ::CloseHandle(thread_token);
	result = ::CloseHandle(process_token);
}

void BrowserFactory::ResetThreadIntegrityLevel() {
	::RevertToSelf();
}

BOOL CALLBACK BrowserFactory::FindBrowserWindow(HWND hwnd, LPARAM arg) {
	// Could this be an IE instance?
	// 8 == "IeFrame\0"
	// 21 == "Shell DocObject View\0";
	char name[21];
	if (::GetClassNameA(hwnd, name, 21) == 0) {
		// No match found. Skip
		return TRUE;
	}
	
	if (strcmp(IE_FRAME_WINDOW_CLASS, name) != 0 && strcmp(SHELL_DOCOBJECT_VIEW_WINDOW_CLASS, name) != 0) {
		return TRUE;
	}

	return EnumChildWindows(hwnd, FindChildWindowForProcess, arg);
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
		if (process_window_info->dwProcessId == process_id) {
			// Once we've found the first Internet Explorer_Server window
			// for the process we want, we can stop.
			process_window_info->hwndBrowser = hwnd;
			return FALSE;
		}
	}

	return TRUE;
}

BOOL CALLBACK BrowserFactory::FindDialogWindowForProcess(HWND hwnd, LPARAM arg) {
	ProcessWindowInfo* process_win_info = reinterpret_cast<ProcessWindowInfo*>(arg);

	// Could this be an dialog window?
	// 7 == "#32770\0"
	// 34 == "Internet Explorer_TridentDlgFrame\0"
	char name[34];
	if (::GetClassNameA(hwnd, name, 34) == 0) {
		// No match found. Skip
		return TRUE;
	}
	
	if (strcmp(ALERT_WINDOW_CLASS, name) != 0 && strcmp(HTML_DIALOG_WINDOW_CLASS, name) != 0){
		return TRUE;
	} else {
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
	std::wstring class_id;
	if (this->GetRegistryValue(HKEY_LOCAL_MACHINE, IE_CLSID_REGISTRY_KEY, L"", &class_id)) {
		std::wstring location_key = L"SOFTWARE\\Classes\\CLSID\\" + class_id + L"\\LocalServer32";
		std::wstring executable_location;

		if (this->GetRegistryValue(HKEY_LOCAL_MACHINE, location_key, L"", &executable_location)) {
			// If the executable location in the registry has an environment
			// variable in it, expand the environment variable to an absolute
			// path.
			size_t start_percent = executable_location.find(L"%");
			if (start_percent != std::wstring::npos) {
				size_t end_percent = executable_location.find(L"%", start_percent + 1);
				if (end_percent != std::wstring::npos) {
					std::wstring variable_name = executable_location.substr(start_percent + 1, end_percent - start_percent - 1);
					DWORD variable_value_size = ::GetEnvironmentVariable(variable_name.c_str(), NULL, 0);
					vector<WCHAR> variable_value(variable_value_size);
					::GetEnvironmentVariable(variable_name.c_str(), &variable_value[0], variable_value_size);
					executable_location.replace(start_percent, end_percent - start_percent + 1, &variable_value[0]); 
				}
			}
			this->ie_executable_location_ = executable_location;
			if (this->ie_executable_location_.substr(0, 1) == L"\"") {
				this->ie_executable_location_.erase(0, 1);
				this->ie_executable_location_.erase(this->ie_executable_location_.size() - 1, 1);
			}
		}
	}
}

bool BrowserFactory::GetRegistryValue(const HKEY root_key, const std::wstring& subkey, const std::wstring& value_name, std::wstring *value) {
	bool value_retrieved = false;
	DWORD required_buffer_size;
	HKEY key_handle;
	if (ERROR_SUCCESS == ::RegOpenKeyEx(root_key, subkey.c_str(), 0, KEY_QUERY_VALUE, &key_handle)) {
		if (ERROR_SUCCESS == ::RegQueryValueEx(key_handle, value_name.c_str(), NULL, NULL, NULL, &required_buffer_size)) {
			std::vector<TCHAR> value_buffer(required_buffer_size);
			DWORD value_type(0);
			if (ERROR_SUCCESS == ::RegQueryValueEx(key_handle, value_name.c_str(), NULL, &value_type, reinterpret_cast<LPBYTE>(&value_buffer[0]), &required_buffer_size)) {
				*value = &value_buffer[0];
				value_retrieved = true;
			}
		}
		::RegCloseKey(key_handle);
	}
	return value_retrieved;
}

void BrowserFactory::GetIEVersion() {
	struct LANGANDCODEPAGE {
		WORD language;
		WORD code_page;
		} *lpTranslate;

	DWORD dummy;
	DWORD length = ::GetFileVersionInfoSize(this->ie_executable_location_.c_str(), &dummy);
	std::vector<BYTE> version_buffer(length);
	::GetFileVersionInfo(this->ie_executable_location_.c_str(), dummy, length, &version_buffer[0]);

	UINT page_count;
	BOOL query_result = ::VerQueryValue(&version_buffer[0], FILE_LANGUAGE_INFO, reinterpret_cast<void**>(&lpTranslate), &page_count);
    
	wchar_t sub_block[MAX_PATH];
    _snwprintf_s(sub_block, MAX_PATH, MAX_PATH, FILE_VERSION_INFO, lpTranslate->language, lpTranslate->code_page);
    LPVOID value = NULL;
    UINT size;
    query_result = ::VerQueryValue(&version_buffer[0], sub_block, &value, &size);
	std::wstring ie_version;
	ie_version.assign(static_cast<wchar_t*>(value));
	std::wstringstream version_stream(ie_version);
	version_stream >> this->ie_major_version_;
}

void BrowserFactory::GetOSVersion() {
	OSVERSIONINFO osVersion;
	osVersion.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);
	::GetVersionEx(&osVersion);
	this->windows_major_version_ = osVersion.dwMajorVersion;
}

bool BrowserFactory::ProtectedModeSettingsAreValid() {
	bool settings_are_valid = true;
	// Only need to check Protected Mode settings on IE 7 or higher
	// and on Windows Vista or higher. Otherwise, Protected Mode
	// doesn't come into play, and are valid.
	// Documentation of registry settings can be found at the following
	// Microsoft KnowledgeBase article:
	// http://support.microsoft.com/kb/182569
	if (this->ie_major_version_ >= 7 && this->windows_major_version_ >= 6) {
		HKEY key_handle;
		if (ERROR_SUCCESS == ::RegOpenKeyEx(HKEY_CURRENT_USER, IE_SECURITY_ZONES_REGISTRY_KEY, 0, KEY_QUERY_VALUE | KEY_ENUMERATE_SUB_KEYS, &key_handle)) {
			DWORD subkey_count = 0;
			DWORD max_subkey_name_length = 0;
			if (ERROR_SUCCESS == ::RegQueryInfoKey(key_handle, NULL, NULL, NULL, &subkey_count, &max_subkey_name_length, NULL, NULL, NULL, NULL, NULL, NULL)) {
				int protected_mode_value = -1;
				std::vector<TCHAR> subkey_name_buffer(max_subkey_name_length + 1);
				for (size_t index = 0; index < subkey_count; ++index) {
					DWORD number_of_characters_copied = max_subkey_name_length + 1;
					::RegEnumKeyEx(key_handle, static_cast<DWORD>(index), &subkey_name_buffer[0], &number_of_characters_copied, NULL, NULL, NULL, NULL);
					std::wstring subkey_name = &subkey_name_buffer[0];
					// Ignore the "My Computer" zone, since it's not displayed
					// in the UI.
					if (subkey_name != ZONE_MY_COMPUTER) {
						int value = this->GetZoneProtectedModeSetting(key_handle, subkey_name);
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
			}
			::RegCloseKey(key_handle);
		}
	}
	return settings_are_valid;
}

int BrowserFactory::GetZoneProtectedModeSetting(const HKEY key_handle, const std::wstring& zone_subkey_name) {
	int protected_mode_value = 0;
	HKEY subkey_handle;
	if (ERROR_SUCCESS == ::RegOpenKeyEx(key_handle, zone_subkey_name.c_str(), 0, KEY_QUERY_VALUE, &subkey_handle)) {
		DWORD value = 0;
		DWORD value_length = sizeof(DWORD);
		if (ERROR_SUCCESS == ::RegQueryValueEx(subkey_handle, IE_PROTECTED_MODE_SETTING_VALUE_NAME, NULL, NULL, reinterpret_cast<LPBYTE>(&value), &value_length)) {
			protected_mode_value = value;
		}
		::RegCloseKey(subkey_handle);
	} else {
		// The REG_DWORD value doesn't exist, so we have to return the default
		// value, which is "on" for the Internet and Restricted Sites zones and
		// is "on" for the Local Intranet zone in IE7 only (the default was
		// changed to "off" for Local Intranet in IE8), and "off" everywhere
		// else.
		if (zone_subkey_name == ZONE_INTERNET ||
				zone_subkey_name == ZONE_RESTRICTED_SITES ||
				(zone_subkey_name == ZONE_LOCAL_INTRANET && this->ie_major_version_ == 7)) {
			protected_mode_value = 3;
		}
	}
	return protected_mode_value;
}

} // namespace webdriver