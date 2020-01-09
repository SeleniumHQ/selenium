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

#include "CookieManager.h"

#include <UrlMon.h>
#include <wininet.h>

#include "errorcodes.h"
#include "logging.h"

#include "BrowserCookie.h"
#include "HookProcessor.h"
#include "messages.h"
#include "StringUtilities.h"

#define TICKS_PER_SECOND 10000000
#define UNIX_TIME_OFFSET_SECONDS 11644473600L

namespace webdriver {

struct CookieSendMessageInfo {
  HWND window_handle;
  unsigned int message;
};

CookieManager::CookieManager(void) {
  this->window_handle_ = NULL;
}

CookieManager::~CookieManager(void) {
}

void CookieManager::Initialize(HWND window_handle) {
  LOG(TRACE) << "Entering CookieManager::Initialize";
  this->window_handle_ = window_handle;
}

bool CookieManager::IsAdvancedCookiesApi() {
  FARPROC address = NULL;
  HMODULE wininet_handle = ::GetModuleHandle(L"wininet");
  if (wininet_handle) {
    address = ::GetProcAddress(wininet_handle, "InternetGetCookieEx2");
  }
  return address != NULL;
}

int CookieManager::SetCookie(const std::string& url, 
                             const BrowserCookie& cookie) {
  std::string full_data = url + "|" + cookie.ToString();
  WPARAM set_flags = 0;
  if (cookie.is_httponly()) {
    set_flags = INTERNET_COOKIE_HTTPONLY;
  }

  HookSettings hook_settings;
  hook_settings.hook_procedure_name = "CookieWndProc";
  hook_settings.hook_procedure_type = WH_CALLWNDPROC;
  hook_settings.window_handle = this->window_handle_;
  hook_settings.communication_type = OneWay;

  HookProcessor hook;
  if (!hook.CanSetWindowsHook(this->window_handle_)) {
    LOG(WARN) << "Cannot set cookie because driver and browser are not the "
              << "same bit-ness.";
    return EUNHANDLEDERROR;
  }
  hook.Initialize(hook_settings);
  hook.PushData(StringUtilities::ToWString(full_data));
  ::SendMessage(this->window_handle_, WD_SET_COOKIE, set_flags, NULL);
  int status = HookProcessor::GetDataBufferSize();
  if (status != 0) {
    LOG(WARN) << "Setting cookie encountered error " << status;
    return EINVALIDCOOKIEDOMAIN;
  }
  return WD_SUCCESS;
}

int CookieManager::GetCookies(const std::string& url,
                              std::vector<BrowserCookie>* all_cookies) {
  LOG(TRACE) << "Entering CookieManager::GetCookies";
  std::wstring wide_url = StringUtilities::ToWString(url);
  CComPtr<IUri> parsed_url;
  ::CreateUri(wide_url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &parsed_url);
  DWORD url_scheme = 0;
  parsed_url->GetScheme(&url_scheme);
  bool is_secure_url = URL_SCHEME_HTTPS == url_scheme;

  HookSettings hook_settings;
  hook_settings.hook_procedure_name = "CookieWndProc";
  hook_settings.hook_procedure_type = WH_CALLWNDPROC;
  hook_settings.window_handle = this->window_handle_;
  hook_settings.communication_type = TwoWay;

  HookProcessor hook;
  if (!hook.CanSetWindowsHook(this->window_handle_)) {
    LOG(WARN) << "Cannot get cookies because driver and browser are not the "
              << "same bit-ness.";
    return EUNHANDLEDERROR;
  }
  hook.Initialize(hook_settings);

  bool supports_advanced_api = this->IsAdvancedCookiesApi();
  if (supports_advanced_api) {
    // The version of WinINet installed supports the InternetGetCookieEx2
    // API, which gets all cookies (session and persistent) at once.
    std::wstring raw_cookie_data =
        this->SendGetCookieMessage(wide_url,
                                   WD_GET_ALL_COOKIES,
                                   &hook);
    std::string all_cookies_list = StringUtilities::ToString(raw_cookie_data);
    std::map<std::string, BrowserCookie> cookies;
    this->ParseCookieList(all_cookies_list,
                          is_secure_url,
                          &cookies);
    std::map<std::string, BrowserCookie>::const_iterator cookie_iterator;
    for (cookie_iterator = cookies.begin();
         cookie_iterator != cookies.end();
         ++cookie_iterator) {
      all_cookies->push_back(cookie_iterator->second);
    }
  } else {
    // Get all cookies for the current URL visible to JavaScript.
    std::wstring scriptable_cookie_string = 
        this->SendGetCookieMessage(wide_url,
                                   WD_GET_SCRIPTABLE_COOKIES,
                                   &hook);
    std::map<std::string, std::string> scriptable_cookies;
    this->ParseCookieString(scriptable_cookie_string, &scriptable_cookies);

    // Get all cookies for the insecure version of the current URL,
    // which will include HttpOnly cookies.
    std::wstring insecure_cookie_string = 
        this->SendGetCookieMessage(wide_url,
                                   WD_GET_HTTPONLY_COOKIES,
                                   &hook);
    std::map<std::string, std::string> insecure_cookies;  
    this->ParseCookieString(insecure_cookie_string, &insecure_cookies);

    // Get all cookies for the current secure URL. This will include
    // HttpOnly cookies.
    std::wstring secure_cookie_string = 
        this->SendGetCookieMessage(wide_url,
                                   WD_GET_SECURE_COOKIES,
                                   &hook);
    std::map<std::string, std::string> secure_cookies;  
    this->ParseCookieString(secure_cookie_string, &secure_cookies);

    // Get all of the persistent cookie files in the cache for the 
    // URL currently being browsed.
    std::wstring file_list =
        this->SendGetCookieMessage(wide_url,
                                   WD_GET_COOKIE_CACHE_FILES,
                                   &hook);
    std::vector<std::wstring> files;
    StringUtilities::Split(file_list, L"|", &files);

    // Parse the persistent cookie files to produce a list of
    // cookies.
    std::map<std::string, BrowserCookie> persistent_cookies;
    std::vector<std::wstring>::const_iterator file_iterator;
    for (file_iterator = files.begin();
         file_iterator != files.end();
         ++file_iterator) {
      std::string cookie_file_contents = this->ReadCookieFile(*file_iterator);
      this->ParseCookieList(cookie_file_contents,
                            is_secure_url,
                            &persistent_cookies);
    }

    // Loop through the entire list of cookies, including HttpOnly and secure
    // cookies. If the cookie exists as a persistent cookie, use its data from
    // the cache. If the cookie is found in the list of cookies visible to 
    // JavaScript, set the HttpOnly property of the cookie to false. If the
    // cookie is found in the list of cookies set on the insecure version of
    // the URL, set the Secure property of the cookie to false.
    std::map<std::string, std::string>::const_iterator it = secure_cookies.begin();
    for (; it != secure_cookies.end(); ++it) {
      BrowserCookie browser_cookie;
      if (persistent_cookies.find(it->first) != persistent_cookies.end()) {
        browser_cookie = persistent_cookies[it->first];
      } else {
        browser_cookie.set_name(it->first);
        browser_cookie.set_value(it->second);
        browser_cookie.set_is_httponly(scriptable_cookies.find(it->first) == scriptable_cookies.end());
        browser_cookie.set_is_secure(insecure_cookies.find(it->first) == insecure_cookies.end());
      }
      all_cookies->push_back(browser_cookie);
    }
  }
  return WD_SUCCESS;
}

bool CookieManager::DeleteCookie(const std::string& url,
                                 const BrowserCookie& cookie) {
  std::wstring wide_url = StringUtilities::ToWString(url);
  CComPtr<IUri> uri_pointer;
  ::CreateUri(wide_url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &uri_pointer);

  CComBSTR host_bstr;
  uri_pointer->GetHost(&host_bstr);
  std::wstring wide_domain = host_bstr;
  
  CComBSTR path_bstr;
  uri_pointer->GetPath(&path_bstr);
  std::wstring wide_path = path_bstr;

  std::string domain = StringUtilities::ToString(wide_domain);
  std::string path = StringUtilities::ToString(wide_path);

  // N.B., We can hard-code the value and expiration time, since
  // we are deleting the cookie. So the value will be "deleted",
  // and the expiration time will be 1000 milliseconds after the
  // zero date (or Thu 1 Jan 1970 00:00:01 GMT).
  BrowserCookie recursive_cookie = cookie.Copy();
  recursive_cookie.set_domain(domain);
  recursive_cookie.set_path(path);
  recursive_cookie.set_value("deleted");
  recursive_cookie.set_expiration_time(1000);
  return this->RecursivelyDeleteCookie(url, recursive_cookie);
}

bool CookieManager::RecursivelyDeleteCookie(const std::string& url,
                                            const BrowserCookie& cookie) {
  // TODO: Optimize this path from the recursive to only
  // call setting the cookie as often as needed.
  BrowserCookie recursive_cookie = cookie.Copy();
  recursive_cookie.set_domain("." + cookie.domain());
  return this->RecurseCookiePath(url, recursive_cookie);
}

bool CookieManager::RecurseCookiePath(const std::string& url,
                                      const BrowserCookie& cookie) {
  size_t number_of_characters = 0;
  size_t slash_index = cookie.path().find_last_of('/');
  size_t final_index = cookie.path().size() - 1;
  if (slash_index == final_index) {
    number_of_characters = slash_index;
  }
  else {
    number_of_characters = slash_index + 1;
  }

  if (slash_index != std::string::npos) {
    BrowserCookie path_cookie = cookie.Copy();
    path_cookie.set_path(cookie.path().substr(0, number_of_characters));
    bool deleted = this->RecurseCookiePath(url, path_cookie);
  }
  return this->RecurseCookieDomain(url, cookie);
}

bool CookieManager::RecurseCookieDomain(const std::string& url,
                                        const BrowserCookie& cookie) {
  int status = this->SetCookie(url, cookie);

  size_t dot_index = cookie.domain().find_first_of('.');
  if (dot_index == 0) {
    BrowserCookie first_dot_cookie = cookie.Copy();
    first_dot_cookie.set_domain(cookie.domain().substr(1));
    return this->RecurseCookieDomain(url, first_dot_cookie);
  } else if (dot_index != std::string::npos) {
    BrowserCookie no_dot_cookie = cookie.Copy();
    no_dot_cookie.set_domain(cookie.domain().substr(dot_index));
    return this->RecurseCookieDomain(url, no_dot_cookie);
  }

  BrowserCookie no_domain_cookie = cookie.Copy();
  no_domain_cookie.set_domain("");
  status = this->SetCookie(url, no_domain_cookie);
  return status == WD_SUCCESS;
}

std::string CookieManager::ReadCookieFile(const std::wstring& file_name) {
  LOG(TRACE) << "Entering CookieManager::ReadCookieFile";
  HANDLE file_handle = ::CreateFile(file_name.c_str(),
                                    GENERIC_READ,
                                    FILE_SHARE_READ | FILE_SHARE_WRITE,
                                    NULL,
                                    OPEN_EXISTING,
                                    0,
                                    NULL);
  // Read the cookie file. Hopefully, we will never have a 2GB cookie file.
  DWORD file_size_high = 0;
  DWORD file_size_low = ::GetFileSize(file_handle, &file_size_high);
  std::vector<char> file_content(file_size_low + 1);
  DWORD bytes_read = 0;
  ::ReadFile(file_handle, &file_content[0], file_size_low, &bytes_read, NULL);
  ::CloseHandle(file_handle);

  // Null-terminate and convert to a string for easier manipulation.
  file_content[bytes_read - 1] = '\0';
  std::string cookie_file_contents = &file_content[0];
  return cookie_file_contents;
}

void CookieManager::ParseCookieList(const std::string& cookie_file_contents,
                                    const bool include_secure_cookies,
                                    std::map<std::string, BrowserCookie>* cookies) {
  LOG(TRACE) << "Entering CookieManager::ParseCookieList";

  // Each cookie in the file is a record structure separated by
  // a line containing a single asterisk ('*'). Split the file 
  // content on this delimiter, and parse each record.
  std::vector<std::string> persistent_cookie_strings;
  StringUtilities::Split(cookie_file_contents,
                         "\n*\n",
                         &persistent_cookie_strings);
  std::vector<std::string>::const_iterator cookie_string_iterator;
  for (cookie_string_iterator = persistent_cookie_strings.begin();
       cookie_string_iterator != persistent_cookie_strings.end();
       ++cookie_string_iterator) {
    BrowserCookie persistent_cookie = 
        this->ParseSingleCookie(*cookie_string_iterator);
    if (include_secure_cookies || !persistent_cookie.is_secure()) {
      // Omit the cookie if it's 'secure' flag is set and we are *not*
      // browsing using SSL.
      cookies->insert(
          std::pair<std::string, BrowserCookie>(persistent_cookie.name(),
          persistent_cookie));
    }
  }
}

BrowserCookie CookieManager::ParseSingleCookie(const std::string& cookie) {
  LOG(TRACE) << "Entering CookieManager::ParsePersistentCookieInfo";
  // Cookies represented by a structured string record type.
  // This structure is modeled after how some versions of IE
  // stored perisitent cookeis as files on disk. Each cookie
  // is represented by 8 lines in the file separated by line
  // feed (0xA) characters, with the following format:
  //
  //     cookie_name
  //     cookie_value
  //     cookie.domain.value/cookie/path/value/
  //     <integer representing cookie flags>
  //     <unsigned long representing the low 32 bits of expiration time>
  //     <unsigned long representing the high 32 bits of expiration time>
  //     <unsigned long representing the low 32 bits of last-modified time>
  //     <unsigned long representing the high 32 bits of last-modified time>
  //
  // Read each of these lines and set the appropriate values
  // in the resulting cookie object.
  std::vector<std::string> cookie_parts;
  StringUtilities::Split(cookie, "\n", &cookie_parts);

  BrowserCookie cookie_to_return;
  cookie_to_return.set_name(cookie_parts[0]);
  cookie_to_return.set_value(cookie_parts[1]);

  size_t position = cookie_parts[2].find_first_of("/");
  cookie_to_return.set_domain(cookie_parts[2].substr(0, position));
  cookie_to_return.set_path(cookie_parts[2].substr(position));

  int flags = atoi(cookie_parts[3].c_str());
  cookie_to_return.set_is_secure(INTERNET_COOKIE_IS_SECURE == (INTERNET_COOKIE_IS_SECURE & flags));
  cookie_to_return.set_is_httponly(INTERNET_COOKIE_HTTPONLY == (INTERNET_COOKIE_HTTPONLY & flags));

  if (cookie_parts[4].size() > 0 && cookie_parts[5].size() > 0) {
    unsigned long expiry_time_low = strtoul(cookie_parts[4].c_str(), NULL, 10);
    unsigned long expiry_time_high = strtoul(cookie_parts[5].c_str(), NULL, 10);
    unsigned long long expiration_time = (expiry_time_high * static_cast<long long>(pow(2.0, 32))) + expiry_time_low;

    // Cookie expiration time is stored in the file as the number
    // of 100-nanosecond ticks since 1 January 1601 12:00:00 AM GMT.
    // We need the number of seconds since 1 January 1970 12:00:00 AM GMT.
    // This is the conversion.
    unsigned long cookie_expiration_time = static_cast<unsigned long>((expiration_time / TICKS_PER_SECOND) - UNIX_TIME_OFFSET_SECONDS);
    cookie_to_return.set_expiration_time(cookie_expiration_time);
  }
  return cookie_to_return;
}

void CookieManager::ParseCookieString(const std::wstring& cookie_string,
                                      std::map<std::string, std::string>* cookies) {
  LOG(TRACE) << "Entering CookieManager::ParseCookieString";
  std::wstring cookie_string_copy = cookie_string;
  while (cookie_string_copy.size() > 0) {
    size_t cookie_delimiter_pos = cookie_string_copy.find(L"; ");
    std::wstring cookie = cookie_string_copy.substr(0, cookie_delimiter_pos);
    if (cookie_delimiter_pos == std::wstring::npos) {
      cookie_string_copy = L"";
    } else {
      cookie_string_copy = cookie_string_copy.substr(cookie_delimiter_pos + 2);
    }
    size_t cookie_separator_pos(cookie.find_first_of(L"="));
    std::string cookie_name(StringUtilities::ToString(cookie.substr(0, cookie_separator_pos)));
    std::string cookie_value(StringUtilities::ToString(cookie.substr(cookie_separator_pos + 1)));
    cookies->insert(std::pair<std::string, std::string>(cookie_name, cookie_value));
  }
}

std::wstring CookieManager::SendGetCookieMessage(const std::wstring& url, 
                                                 const unsigned int message,
                                                 HookProcessor* hook) {
  LOG(TRACE) << "Entering CookieManager::SendGetCookieMessage";
  hook->PushData(url);

  // Since the named pipe server has to wait for the named pipe client
  // injected into the browser to connect to it before reading the data,
  // and since SendMessage is synchronous, we need to send the message
  // from a different thread to avoid a deadlock.
  CookieSendMessageInfo info;
  info.window_handle = this->window_handle_;
  info.message = message;
  unsigned int thread_id = 0;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                  0,
                                                  &CookieManager::ThreadProc,
                                                  reinterpret_cast<void*>(&info),
                                                  0,
                                                  &thread_id));
  if (thread_handle != NULL) {
    ::CloseHandle(thread_handle);
  } else {
    LOGERR(DEBUG) << "Unable to create thread";
  }
  std::vector<char> buffer(0);
  int bytes = hook->PullData(&buffer);
  std::wstring cookies = reinterpret_cast<const wchar_t*>(&buffer[0]);
  return cookies;
}

unsigned int WINAPI CookieManager::ThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering CookieManager::ThreadProc";

  CookieSendMessageInfo* info = reinterpret_cast<CookieSendMessageInfo*>(lpParameter);
  DWORD process_id = ::GetCurrentProcessId();
  LRESULT result = ::SendMessage(info->window_handle,
                                 info->message,
                                 process_id,
                                 NULL);
  return 0;
}

} // namespace webdriver

#ifdef __cplusplus
extern "C" {
#endif

// In order to run the IE driver against versions of IE that do not include
// a version of WinINet.dll that supports the InternetGetCookiesEx2 API,
// we must access the API in a way that does not import it into our DLL.
// To that end, we duplicate the INTERNET_COOKIE2 structure here, and will
// call the API (if it exists) via GetModuleHandle and GetProcAddress.
typedef struct {
  PWSTR pwszName;
  PWSTR pwszValue;
  PWSTR pwszDomain;
  PWSTR pwszPath;
  DWORD dwFlags;
  FILETIME ftExpires;
  BOOL fExpiresSet;
} INTERNETCOOKIE2;

typedef void* (__stdcall *InternetFreeCookiesProc)(INTERNETCOOKIE2*, DWORD);
typedef DWORD(__stdcall *InternetGetCookieEx2Proc)(PCWSTR, PCWSTR, DWORD, INTERNETCOOKIE2**, PDWORD);

LRESULT CALLBACK CookieWndProc(int nCode, WPARAM wParam, LPARAM lParam) {
  CWPSTRUCT* call_window_proc_struct = reinterpret_cast<CWPSTRUCT*>(lParam);
  if (WM_COPYDATA == call_window_proc_struct->message) {
    COPYDATASTRUCT* data = reinterpret_cast<COPYDATASTRUCT*>(call_window_proc_struct->lParam);
    webdriver::HookProcessor::CopyDataToBuffer(data->cbData, data->lpData);
  } else if (WD_GET_ALL_COOKIES == call_window_proc_struct->message) {
    std::wstring url = webdriver::HookProcessor::CopyWStringFromBuffer();
    int driver_process_id = static_cast<int>(call_window_proc_struct->wParam);

    CComPtr<IUri> uri_pointer;
    HRESULT hr = ::CreateUri(url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &uri_pointer);
    DWORD scheme = 0;
    uri_pointer->GetScheme(&scheme);
    CComBSTR scheme_bstr;
    uri_pointer->GetSchemeName(&scheme_bstr);
    CComBSTR host_bstr;
    uri_pointer->GetHost(&host_bstr);
    CComBSTR path_bstr;
    uri_pointer->GetPath(&path_bstr);
    
    std::wstring parsed_uri = scheme_bstr;
    parsed_uri.append(L"://");
    parsed_uri.append(host_bstr);
    parsed_uri.append(path_bstr);

    InternetGetCookieEx2Proc get_cookie_proc = NULL;
    InternetFreeCookiesProc free_cookies_proc = NULL;
    HMODULE wininet_handle = ::GetModuleHandle(L"wininet");
    if (wininet_handle) {
      get_cookie_proc = reinterpret_cast<InternetGetCookieEx2Proc>(::GetProcAddress(wininet_handle, "InternetGetCookieEx2"));
      free_cookies_proc = reinterpret_cast<InternetFreeCookiesProc>(::GetProcAddress(wininet_handle, "InternetFreeCookies"));
    }

    DWORD cookie_count = 0;
    INTERNETCOOKIE2* cookie_pointer = NULL;
    DWORD success = 1;
    if (get_cookie_proc) {
      success = get_cookie_proc(parsed_uri.c_str(),
                                NULL,
                                INTERNET_COOKIE_NON_SCRIPT,
                                &cookie_pointer,
                                &cookie_count);
    }

    if (success == 0) {
      // Mimic the format of the old persistent cookie files for ease of
      // transmission back to the driver and parsing.
      std::wstring all_cookies = L"";
      for (DWORD cookie_index = 0; cookie_index < cookie_count; ++cookie_index) {
        if (all_cookies.size() > 0) {
          all_cookies.append(L"\n*\n");
        }
        INTERNETCOOKIE2* current_cookie = cookie_pointer + cookie_index;
        std::wstring cookie_name = current_cookie->pwszName;
        std::wstring cookie_value = L"";
        if (current_cookie->pwszValue) {
          cookie_value = current_cookie->pwszValue;
        }
        std::wstring cookie_domain = L"";
        if (current_cookie->pwszDomain) {
          cookie_domain = current_cookie->pwszDomain;
        }
        std::wstring cookie_path = L"";
        if (current_cookie->pwszPath) {
          cookie_path = current_cookie->pwszPath;
        }
        DWORD flags = current_cookie->dwFlags;
        FILETIME expires = current_cookie->ftExpires;
        all_cookies.append(cookie_name).append(L"\n");
        all_cookies.append(cookie_value).append(L"\n");
        all_cookies.append(cookie_domain).append(L"/").append(cookie_path).append(L"\n");
        all_cookies.append(std::to_wstring(flags)).append(L"\n");
        // If the expiration time is set, add it to the string for the cookie.
        // If not, append empty fields to the record so subsequent parsing
        // of the string will still work.
        if (current_cookie->fExpiresSet) {
          all_cookies.append(std::to_wstring(expires.dwLowDateTime)).append(L"\n");
          all_cookies.append(std::to_wstring(expires.dwHighDateTime)).append(L"\n");
        } else {
          all_cookies.append(L"\n\n");
        }
      }
      free_cookies_proc(cookie_pointer, cookie_count);
      webdriver::HookProcessor::CopyWStringToBuffer(all_cookies);
    } else {
      webdriver::HookProcessor::SetDataBufferSize(sizeof(wchar_t));
    }
    webdriver::HookProcessor::WriteBufferToPipe(driver_process_id);
  } else if (WD_GET_HTTPONLY_COOKIES == call_window_proc_struct->message ||
             WD_GET_SCRIPTABLE_COOKIES == call_window_proc_struct->message ||
             WD_GET_SECURE_COOKIES == call_window_proc_struct->message) {
    std::wstring url = webdriver::HookProcessor::CopyWStringFromBuffer();
    int driver_process_id = static_cast<int>(call_window_proc_struct->wParam);

    DWORD get_cookie_flags = 0;
    if (WD_GET_HTTPONLY_COOKIES == call_window_proc_struct->message ||
      WD_GET_SECURE_COOKIES == call_window_proc_struct->message) {
      get_cookie_flags = INTERNET_COOKIE_HTTPONLY;
    }

    CComPtr<IUri> uri_pointer;
    HRESULT hr = ::CreateUri(url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &uri_pointer);
    DWORD scheme = 0;
    uri_pointer->GetScheme(&scheme);
    CComBSTR scheme_bstr;
    uri_pointer->GetSchemeName(&scheme_bstr);
    CComBSTR host_bstr;
    uri_pointer->GetHost(&host_bstr);
    CComBSTR path_bstr;
    uri_pointer->GetPath(&path_bstr);

    // Get only the cookies for the base URL, omitting port, if there is one.
    // N.B., we only return cookies secure cookies when browsing a site using
    // SSL. The browser won't see cookies with the 'secure' flag for sites
    // visited using plain http.
    std::wstring parsed_uri = L"http";
    if ((WD_GET_SECURE_COOKIES == call_window_proc_struct->message ||
         WD_GET_SCRIPTABLE_COOKIES == call_window_proc_struct->message) &&
        URL_SCHEME_HTTPS == scheme) {
      parsed_uri.append(L"s");
    }
    parsed_uri.append(L"://");
    parsed_uri.append(host_bstr);
    parsed_uri.append(path_bstr);

    // Call InternetGetCookieEx once to get the size of the buffer needed,
    // then call again with the appropriately sized buffer allocated.
    DWORD buffer_size = 0;
    BOOL success = ::InternetGetCookieEx(parsed_uri.c_str(),
                                         NULL,
                                         NULL,
                                         &buffer_size,
                                         get_cookie_flags,
                                         NULL);
    if (success) {
      webdriver::HookProcessor::SetDataBufferSize(buffer_size);
      ::InternetGetCookieEx(parsed_uri.c_str(),
                            NULL,
                            reinterpret_cast<LPTSTR>(webdriver::HookProcessor::GetDataBufferAddress()),
                            &buffer_size,
                            get_cookie_flags,
                            NULL);

      webdriver::HookProcessor::WriteBufferToPipe(driver_process_id);
    } else {
      if (ERROR_NO_MORE_ITEMS == ::GetLastError()) {
        webdriver::HookProcessor::SetDataBufferSize(sizeof(wchar_t));
        webdriver::HookProcessor::WriteBufferToPipe(driver_process_id);
      }
    }
  } else if (WD_GET_COOKIE_CACHE_FILES == call_window_proc_struct->message) {
    int driver_process_id = static_cast<int>(call_window_proc_struct->wParam);
    std::wstring file_list = L"";
    std::wstring url = webdriver::HookProcessor::CopyWStringFromBuffer();

    // We need to remove the port to find the entry in the cache.
    CComPtr<IUri> uri_pointer;
    HRESULT hr = ::CreateUri(url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &uri_pointer);
    CComBSTR host_bstr;
    uri_pointer->GetHost(&host_bstr);
    CComBSTR path_bstr;
    uri_pointer->GetPath(&path_bstr);
    std::wstring parsed_uri = host_bstr;
    parsed_uri.append(path_bstr);

    // A 2048-byte buffer should be large enough to handle cookie
    // cache entries in all but the most extreme cases.
    HANDLE cache_enum_handle = NULL;
    DWORD entry_size = 2048;
    LPINTERNET_CACHE_ENTRY_INFO entry = NULL;
    std::vector<char> entry_buffer(entry_size);
    entry = reinterpret_cast<INTERNET_CACHE_ENTRY_INFO*>(&entry_buffer[0]);
    cache_enum_handle = ::FindFirstUrlCacheEntry(L"cookie:",
                                                 entry,
                                                 &entry_size);
    if (cache_enum_handle == NULL &&
        ERROR_INSUFFICIENT_BUFFER == ::GetLastError()) {
      entry_buffer.resize(entry_size);
      entry = reinterpret_cast<INTERNET_CACHE_ENTRY_INFO*>(&entry_buffer[0]);
      cache_enum_handle = ::FindFirstUrlCacheEntry(L"cookie:",
                                                   entry,
                                                   &entry_size);
    }
    while (cache_enum_handle != NULL) {
      if (COOKIE_CACHE_ENTRY == (entry->CacheEntryType & COOKIE_CACHE_ENTRY)) {
        std::wstring name = entry->lpszSourceUrlName;
        size_t name_separator_pos(name.find_first_of(L"@"));
        std::wstring domain = name.substr(name_separator_pos + 1);
        if (parsed_uri.find(domain) != std::wstring::npos) {
          if (file_list.size() > 0) {
            file_list.append(L"|");
          }
          file_list.append(entry->lpszLocalFileName);
        }
      }
      BOOL success = ::FindNextUrlCacheEntry(cache_enum_handle,
                                             entry,
                                             &entry_size);
      if (!success) {
        DWORD error = ::GetLastError();
        if (ERROR_INSUFFICIENT_BUFFER == error) {
          entry_buffer.resize(entry_size);
          BOOL other_success = ::FindNextUrlCacheEntry(cache_enum_handle,
                                                       entry,
                                                       &entry_size);
        } else if (ERROR_NO_MORE_ITEMS == error) {
          ::FindCloseUrlCache(cache_enum_handle);
          cache_enum_handle = NULL;
        }
      }
    }
    webdriver::HookProcessor::CopyWStringToBuffer(file_list);
    webdriver::HookProcessor::WriteBufferToPipe(driver_process_id);
  } else if (WD_SET_COOKIE == call_window_proc_struct->message) {
    DWORD set_cookie_flags = static_cast<DWORD>(call_window_proc_struct->wParam);
    std::wstring cookie_data = webdriver::HookProcessor::CopyWStringFromBuffer();
    size_t url_separator_pos = cookie_data.find_first_of(L"|");
    std::wstring url = cookie_data.substr(0, url_separator_pos);
    std::wstring cookie = cookie_data.substr(url_separator_pos + 1);

    CComPtr<IUri> uri_pointer;
    HRESULT hr = ::CreateUri(url.c_str(), Uri_CREATE_ALLOW_RELATIVE, 0, &uri_pointer);
    CComBSTR scheme_bstr;
    uri_pointer->GetSchemeName(&scheme_bstr);
    CComBSTR host_bstr;
    uri_pointer->GetHost(&host_bstr);
    std::wstring parsed_uri = scheme_bstr;
    parsed_uri.append(L"://");
    parsed_uri.append(host_bstr);

    // Leverage the shared data buffer size to return the error code
    // back to the driver, if necessary.
    DWORD cookie_set = ::InternetSetCookieEx(parsed_uri.c_str(),
                                             NULL,
                                             cookie.c_str(),
                                             set_cookie_flags,
                                             NULL);
    if (cookie_set) {
      webdriver::HookProcessor::SetDataBufferSize(0);
    } else {
      DWORD error = ::GetLastError();
      webdriver::HookProcessor::SetDataBufferSize(error);
    }
  }
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

#ifdef __cplusplus
}
#endif
