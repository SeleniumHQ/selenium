#include "StdAfx.h"
#include "BrowserFactory.h"

namespace webdriver {

BrowserFactory::BrowserFactory(void) {
	this->GetExecutableLocation();
	this->GetIEVersion();
	this->GetOSVersion();
}

BrowserFactory::~BrowserFactory(void) {
}

DWORD BrowserFactory::LaunchBrowserProcess(int port) {
	DWORD process_id = NULL;
	STARTUPINFO start_info;
	PROCESS_INFORMATION proc_info;

	::ZeroMemory( &start_info, sizeof(start_info) );
    start_info.cb = sizeof(start_info);
	::ZeroMemory( &proc_info, sizeof(proc_info) );

	std::wstringstream url_stream;
	url_stream << L"http://localhost:" << port << L"/";
	std::wstring initial_url(url_stream.str());

	HMODULE library_handle = ::LoadLibrary(L"ieframe.dll");
	FARPROC proc_address = ::GetProcAddress(library_handle, "IELaunchURL");
	if (proc_address != 0) {
		// If we have the IELaunchURL API, expressly use it. This will
		// guarantee a new session. Simply using CoCreateInstance to 
		// create the browser will merge sessions, making separate cookie
		// handling impossible.
		::IELaunchURL(initial_url.c_str(), &proc_info, NULL);
	} else {
		LPWSTR url = new WCHAR[initial_url.size() + 1];
		wcscpy_s(url, initial_url.size() + 1, initial_url.c_str());
		url[initial_url.size()] = L'\0';
		::CreateProcess(this->ie_executable_location_.c_str(), url, NULL, NULL, FALSE, 0, NULL, NULL, &start_info, &proc_info);
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

	return process_id;
}

void BrowserFactory::AttachToBrowser(ProcessWindowInfo *process_window_info) {
	while (process_window_info->hwndBrowser == NULL) {
		// TODO: create a timeout for this. We shouldn't need it, since
		// we got a valid process ID, but we should bulletproof it.
		::EnumWindows(&BrowserFactory::FindBrowserWindow, (LPARAM)process_window_info);
		if (process_window_info->hwndBrowser == NULL) {
			::Sleep(250);
		}
	}

	if (process_window_info->hwndBrowser != NULL) {
		// Explicitly load MSAA so we know if it's installed
		HINSTANCE instance_handle = ::LoadLibrary(_T("OLEACC.DLL"));
		if (instance_handle) {
			CComPtr<IHTMLDocument2> document;
			LRESULT result;
			UINT msg = ::RegisterWindowMessage(_T("WM_HTML_GETOBJECT"));
			::SendMessageTimeout(process_window_info->hwndBrowser, msg, 0L, 0L, SMTO_ABORTIFHUNG, 1000, (PDWORD_PTR)&result);

			LPFNOBJECTFROMLRESULT object_pointer =  reinterpret_cast<LPFNOBJECTFROMLRESULT>(::GetProcAddress(instance_handle, "ObjectFromLresult"));
			if (object_pointer != NULL) {
				HRESULT hr;
				hr = (*object_pointer)(result, IID_IHTMLDocument2, 0, reinterpret_cast<void **>(&document));
				if (SUCCEEDED(hr)) {
				   CComPtr<IHTMLWindow2> window;
				   hr = document->get_parentWindow(&window);
				   if (SUCCEEDED(hr)) {
						// http://support.microsoft.com/kb/257717
						CComQIPtr<IServiceProvider> provider(window);
						if (provider) {
							CComPtr<IServiceProvider> child_provider;
							hr = provider->QueryService(SID_STopLevelBrowser, IID_IServiceProvider, reinterpret_cast<void **>(&child_provider));
							if (SUCCEEDED(hr)) {
								IWebBrowser2* browser;
								hr = child_provider->QueryService(SID_SWebBrowserApp, IID_IWebBrowser2, reinterpret_cast<void **>(&browser));
								if (SUCCEEDED(hr)) {
									process_window_info->pBrowser = browser;
								}
							}
						}
				   }
				}
			}
			::FreeLibrary(instance_handle);
		}
	} // else Active Accessibility is not installed
}

IWebBrowser2* BrowserFactory::CreateBrowser() {
	// TODO: Error and exception handling and return value checking.
	IWebBrowser2 *browser;
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

	::CoCreateInstance(CLSID_InternetExplorer, NULL, context, IID_IWebBrowser2, (void**)&browser);
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

HWND BrowserFactory::GetTabWindowHandle(IWebBrowser2 *browser)
 {
	ProcessWindowInfo process_window_info;
	process_window_info.pBrowser = browser;
	process_window_info.hwndBrowser = NULL;

	HWND hwnd = NULL;
	CComQIPtr<IServiceProvider> service_provider;
	HRESULT hr = browser->QueryInterface(IID_IServiceProvider, reinterpret_cast<void **>(&service_provider));
	if (SUCCEEDED(hr)) {
		CComPtr<IOleWindow> window;
		hr = service_provider->QueryService(SID_SShellBrowser, IID_IOleWindow, reinterpret_cast<void **>(&window));
		if (SUCCEEDED(hr)) {
			// This gets the TabWindowClass window in IE 7 and 8,
			// and the top-level window frame in IE 6. The window
			// we need is the InternetExplorer_Server window.
			window->GetWindow(&hwnd);

			DWORD process_id;
			::GetWindowThreadProcessId(hwnd, &process_id);
			process_window_info.dwProcessId = process_id;

			::EnumChildWindows(hwnd, &BrowserFactory::FindChildWindowForProcess, (LPARAM)&process_window_info);
			hwnd = process_window_info.hwndBrowser;
		}
	}

	return hwnd;
}

BOOL CALLBACK BrowserFactory::FindBrowserWindow(HWND hwnd, LPARAM arg) {
	// Could this be an IE instance?
	// 8 == "IeFrame\0"
	// 21 == "Shell DocObject View\0";
	char name[21];
	if (GetClassNameA(hwnd, name, 21) == 0) {
		// No match found. Skip
		return TRUE;
	}
	
	if (strcmp("IEFrame", name) != 0 && strcmp("Shell DocObject View", name) != 0) {
		return TRUE;
	}

	return EnumChildWindows(hwnd, FindChildWindowForProcess, arg);
}

BOOL CALLBACK BrowserFactory::FindChildWindowForProcess(HWND hwnd, LPARAM arg) {
	ProcessWindowInfo *process_window_info = (ProcessWindowInfo *)arg;

	// Could this be an Internet Explorer Server window?
	// 25 == "Internet Explorer_Server\0"
	char name[25];
	if (GetClassNameA(hwnd, name, 25) == 0) {
		// No match found. Skip
		return TRUE;
	}
	
	if (strcmp("Internet Explorer_Server", name) != 0) {
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
	ProcessWindowInfo *process_win_info = (ProcessWindowInfo *)arg;

	// Could this be an dialog window?
	// 7 == "#32770\0"
	char name[7];
	if (GetClassNameA(hwnd, name, 7) == 0) {
		// No match found. Skip
		return TRUE;
	}
	
	if (strcmp("#32770", name) != 0) {
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
	std::wstring class_id_key = L"SOFTWARE\\Classes\\InternetExplorer.Application\\CLSID";
	std::wstring class_id;

	if (this->GetRegistryValue(HKEY_LOCAL_MACHINE, class_id_key, L"", &class_id)) {
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

bool BrowserFactory::GetRegistryValue(HKEY root_key, std::wstring subkey, std::wstring value_name, std::wstring *value) {
	bool value_retrieved(false);
	DWORD required_buffer_size;
	HKEY key_handle;
	if (ERROR_SUCCESS == ::RegOpenKeyEx(root_key, subkey.c_str(), 0, KEY_QUERY_VALUE, &key_handle)) {
		if (ERROR_SUCCESS == ::RegQueryValueEx(key_handle, value_name.c_str(), NULL, NULL, NULL, &required_buffer_size)) {
			std::vector<TCHAR> value_buffer(required_buffer_size);
			if (ERROR_SUCCESS == ::RegQueryValueEx(key_handle, value_name.c_str(), NULL, NULL, (LPBYTE)&value_buffer[0], &required_buffer_size)) {
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
	BOOL query_result = ::VerQueryValue(&version_buffer[0], L"\\VarFileInfo\\Translation", (LPVOID*) &lpTranslate, &page_count);
    
	wchar_t sub_block[MAX_PATH];
    _snwprintf_s(sub_block, MAX_PATH, MAX_PATH,
                 L"\\StringFileInfo\\%04x%04x\\FileVersion", lpTranslate->language, lpTranslate->code_page);
    LPVOID value = NULL;
    UINT size;
    query_result = ::VerQueryValue(&version_buffer[0], sub_block, &value, &size);
	std::wstring ie_version;
	ie_version.assign(static_cast<wchar_t*>(value));
	std::wstringstream versionStream(ie_version);
	versionStream >> this->ie_major_version_;
}

void BrowserFactory::GetOSVersion() {
	OSVERSIONINFO osVersion;
	osVersion.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);
	::GetVersionEx(&osVersion);
	this->windows_major_version_ = osVersion.dwMajorVersion;
}

} // namespace webdriver