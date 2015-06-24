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
#include <map>
#include <UrlMon.h>
#include <wininet.h>
#include "BrowserCookie.h"
#include "HookProcessor.h"
#include "logging.h"
#include "messages.h"

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

bool CookieManager::SetCookie(std::string url, std::string cookie_data) {
  std::string full_data = url + "|" + cookie_data;
  HookSettings hook_settings;
  hook_settings.hook_procedure_name = "CookieWndProc";
  hook_settings.hook_procedure_type = WH_CALLWNDPROC;
  hook_settings.window_handle = this->window_handle_;
  hook_settings.communication_type = OneWay;

  HookProcessor hook;
  hook.Initialize(hook_settings);
  hook.PushData(StringUtilities::ToWString(full_data));
  ::SendMessage(this->window_handle_, WD_SET_COOKIE, NULL, NULL);
  int status = HookProcessor::GetDataBufferSize();
  if (status != 0) {
    return false;
  }
  return true;
}

int CookieManager::GetCookies(std::string url, std::vector<BrowserCookie>* all_cookies) {
  LOG(TRACE) << "Entering CookieManager::GetCookies";
  HookSettings hook_settings;
  hook_settings.hook_procedure_name = "CookieWndProc";
  hook_settings.hook_procedure_type = WH_CALLWNDPROC;
  hook_settings.window_handle = this->window_handle_;
  hook_settings.communication_type = TwoWay;

  HookProcessor hook;
  hook.Initialize(hook_settings);

  // Get all cookies for the current URL visible to JavaScript.
  std::wstring scriptable_cookie_string = 
      this->SendGetCookieMessage(StringUtilities::ToWString(url),
      WD_GET_SCRIPTABLE_COOKIES,
      &hook);
  std::map<std::string, std::string> scriptable_cookies;
  this->ParseCookieString(scriptable_cookie_string, &scriptable_cookies);

  // Get all cookies for the current URL, including HttpOnly cookies.
  std::wstring httponly_cookie_string = 
      this->SendGetCookieMessage(StringUtilities::ToWString(url),
                                 WD_GET_HTTPONLY_COOKIES,
                                 &hook);
  std::map<std::string, std::string> httponly_cookies;  
  this->ParseCookieString(httponly_cookie_string, &httponly_cookies);

  // Get all of the persistent cookie files in the cache for the 
  // URL currently being browsed.
  std::wstring file_list = this->SendGetCookieMessage(
      StringUtilities::ToWString(url),
      WD_GET_COOKIE_CACHE_FILES,
      &hook);
  std::vector<std::wstring> files;
  StringUtilities::Split(file_list, L"|", &files);

  // Parse the persistent cookie files to produce a list of
  // cookies.
  std::map<std::string, BrowserCookie> persistent_cookies;
  for (std::vector<std::wstring>::const_iterator file_iterator = files.begin();
       file_iterator != files.end();
       ++file_iterator) {
    this->ReadPersistentCookieFile(*file_iterator, &persistent_cookies);
  }

  // Loop through the entire list of cookies, including HttpOnly cookies.
  // If the cookie exists as a persistent cookie, use its data from the
  // cache. If the cookie is found in the list of cookies visible to 
  // JavaScript, set the HttpOnly property of the cookie to false.
  std::map<std::string, std::string>::const_iterator it = httponly_cookies.begin();
  for (; it != httponly_cookies.end(); ++it) {
    BrowserCookie browser_cookie;
    if (persistent_cookies.find(it->first) != persistent_cookies.end()) {
      browser_cookie = persistent_cookies[it->first];
    }
    browser_cookie.set_name(it->first);
    browser_cookie.set_value(it->second);
    browser_cookie.set_is_httponly(scriptable_cookies.find(it->first) == scriptable_cookies.end());
    all_cookies->push_back(browser_cookie);
  }
  return 0;
}

void CookieManager::ReadPersistentCookieFile(const std::wstring& file_name,
                                             std::map<std::string, BrowserCookie>* cookies) {
  LOG(TRACE) << "Entering CookieManager::ReadPersistentCookieFile";
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

  // Each cookie in the file is a record structure separated by
  // a line containing a single asterisk ('*'). Split the file 
  // content on this delimiter, and parse each record.
  std::vector<std::string> persistent_cookie_strings;
  StringUtilities::Split(cookie_file_contents, "\n*\n", &persistent_cookie_strings);
  std::vector<std::string>::const_iterator cookie_string_iterator = persistent_cookie_strings.begin();
  for (; cookie_string_iterator != persistent_cookie_strings.end(); ++cookie_string_iterator) {
    BrowserCookie persistent_cookie = this->ParsePersistentCookieInfo(*cookie_string_iterator);
    cookies->insert(std::pair<std::string, BrowserCookie>(persistent_cookie.name(), persistent_cookie));
  }
}

BrowserCookie CookieManager::ParsePersistentCookieInfo(const std::string& cookie) {
  LOG(TRACE) << "Entering CookieManager::ParsePersistentCookieInfo";
  // Persistent cookies are read from out of the cached
  // files on disk. Each cookie is represented by 8 lines
  // in the file separated by line feed (0xA) characters,
  // with the following format:
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

  unsigned long expiry_time_low = strtoul(cookie_parts[4].c_str(), NULL, 10);
  unsigned long expiry_time_high = strtoul(cookie_parts[5].c_str(), NULL, 10);
  unsigned long long expiration_time = (expiry_time_high * static_cast<long long>(pow(2.0, 32))) + expiry_time_low;

  // Cookie expiration time is stored in the file as the number
  // of 100-nanosecond ticks since 1 January 1601 12:00:00 AM GMT.
  // We need the number of seconds since 1 January 1970 12:00:00 AM GMT.
  // This is the conversion.
  unsigned long cookie_expiration_time = static_cast<unsigned long>((expiration_time / TICKS_PER_SECOND) - UNIX_TIME_OFFSET_SECONDS);
  cookie_to_return.set_expiration_time(cookie_expiration_time);
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

LRESULT CALLBACK CookieWndProc(int nCode, WPARAM wParam, LPARAM lParam) {
  CWPSTRUCT* call_window_proc_struct = reinterpret_cast<CWPSTRUCT*>(lParam);
  if (WM_COPYDATA == call_window_proc_struct->message) {
    COPYDATASTRUCT* data = reinterpret_cast<COPYDATASTRUCT*>(call_window_proc_struct->lParam);
    webdriver::HookProcessor::CopyDataToBuffer(data->cbData, data->lpData);
  } else if (WD_GET_HTTPONLY_COOKIES == call_window_proc_struct->message ||
             WD_GET_SCRIPTABLE_COOKIES == call_window_proc_struct->message) {
    std::wstring url = webdriver::HookProcessor::CopyWStringFromBuffer();
    int driver_process_id = static_cast<int>(call_window_proc_struct->wParam);
    DWORD get_cookie_error = 0;
    DWORD get_cookie_flags = 0;
    if (WD_GET_HTTPONLY_COOKIES == call_window_proc_struct->message) {
      get_cookie_flags = INTERNET_COOKIE_HTTPONLY;
    }

    // Call InternetGetCookieEx once to get the size of the buffer needed,
    // then call again with the appropriately sized buffer allocated.
    DWORD buffer_size = 0;
    BOOL success = ::InternetGetCookieEx(url.c_str(),
                                         NULL,
                                         NULL,
                                         &buffer_size,
                                         get_cookie_flags,
                                         NULL);
    if (success) {
      webdriver::HookProcessor::SetDataBufferSize(buffer_size);
      ::InternetGetCookieEx(url.c_str(),
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
    BOOL cookie_set = ::InternetSetCookie(parsed_uri.c_str(), NULL, cookie.c_str());
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
