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

#include "DocumentHost.h"
#include "Generated/cookies.h"
#include "logging.h"
#include "messages.h"

namespace webdriver {

DocumentHost::DocumentHost(HWND hwnd, HWND executor_handle) {
  LOG(TRACE) << "Entering DocumentHost::DocumentHost";

  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  status = ::UuidToString(&guid, &guid_string);

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->browser_id_ = CW2A(cast_guid_string, CP_UTF8);

  ::RpcStringFree(&guid_string);

  this->window_handle_ = hwnd;
  this->executor_handle_ = executor_handle;
  this->is_closing_ = false;
  this->wait_required_ = false;
  this->focused_frame_window_ = NULL;
}

DocumentHost::~DocumentHost(void) {
}

std::string DocumentHost::GetCurrentUrl() {
  LOG(TRACE) << "Entering DocumentHost::GetCurrentUrl";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
  if (!doc) {
    LOG(WARN) << "Unable to get document object, DocumentHost::GetDocument returned NULL";
    return "";
  }

  CComBSTR url;
  HRESULT hr = doc->get_URL(&url);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get current URL, call to IHTMLDocument2::get_URL failed";
    return "";
  }

  std::string current_url = CW2A(url, CP_UTF8);
  return current_url;
}

std::string DocumentHost::GetPageSource() {
  LOG(TRACE) << "Entering DocumentHost::GetPageSource";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
    
  CComPtr<IHTMLDocument3> doc3;
  CComQIPtr<IHTMLDocument3> doc_qi_pointer(doc);
  if (doc_qi_pointer) {
    doc3 = doc_qi_pointer.Detach();
  }

  if (!doc3) {
    LOG(WARN) << "Unable to get document object, QueryInterface to IHTMLDocument3 failed";
    return "";
  }

  CComPtr<IHTMLElement> document_element;
  HRESULT hr = doc3->get_documentElement(&document_element);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document element from page, call to IHTMLDocument3::get_documentElement failed";
    return "";
  }

  CComBSTR html;
  hr = document_element->get_outerHTML(&html);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Have document element but cannot read source, call to IHTMLElement::get_outerHTML failed";
    return "";
  }

  std::string page_source = CW2A(html, CP_UTF8);
  return page_source;
}

int DocumentHost::SetFocusedFrameByElement(IHTMLElement* frame_element) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByElement";

  HRESULT hr = S_OK;
  if (!frame_element) {
    this->focused_frame_window_ = NULL;
    return SUCCESS;
  }

  CComQIPtr<IHTMLFrameBase2> frame_base(frame_element);
  if (!frame_base) {
    LOG(WARN) << "IHTMLElement is not a FRAME or IFRAME element";
    return ENOSUCHFRAME;
  }

  CComQIPtr<IHTMLWindow2> interim_result;
  hr = frame_base->get_contentWindow(&interim_result);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Cannot get contentWindow from IHTMLFrameBase2, call to IHTMLFrameBase2::get_contentWindow failed";
    return ENOSUCHFRAME;
  }

  this->focused_frame_window_ = interim_result;
  return SUCCESS;
}

int DocumentHost::SetFocusedFrameByName(const std::string& frame_name) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByName";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);

  CComQIPtr<IHTMLFramesCollection2> frames;
  HRESULT hr = doc->get_frames(&frames);

  if (frames == NULL) {
    LOG(WARN) << "No frames in document are set, IHTMLDocument2::get_frames returned NULL";
    return ENOSUCHFRAME;
  }

  long length = 0;
  frames->get_length(&length);
  if (!length) { 
    LOG(WARN) << "No frames in document are found IHTMLFramesCollection2::get_length returned 0";
    return ENOSUCHFRAME;
  }

  CComVariant name;
  CComBSTR name_bstr(CA2W(frame_name.c_str(), CP_UTF8));
  hr = name_bstr.CopyTo(&name);

  // Find the frame
  CComVariant frame_holder;
  hr = frames->item(&name, &frame_holder);

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Error retrieving frame holder, call to IHTMLFramesCollection2::item failed";
    return ENOSUCHFRAME;
  }

  CComQIPtr<IHTMLWindow2> interim_result = frame_holder.pdispVal;
  if (!interim_result) {
    LOG(WARN) << "Error retrieving frame, IDispatch cannot be cast to IHTMLWindow2";
    return ENOSUCHFRAME;
  }

  this->focused_frame_window_ = interim_result;
  return SUCCESS;
}

int DocumentHost::SetFocusedFrameByIndex(const int frame_index) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByIndex";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);

  CComQIPtr<IHTMLFramesCollection2> frames;
  HRESULT hr = doc->get_frames(&frames);

  if (frames == NULL) {
    LOG(WARN) << "No frames in document are set, IHTMLDocument2::get_frames returned NULL";
    return ENOSUCHFRAME;
  }

  long length = 0;
  frames->get_length(&length);
  if (!length) {
    LOG(WARN) << "No frames in document are found IHTMLFramesCollection2::get_length returned 0";
    return ENOSUCHFRAME;
  }

  CComVariant index;
  index.vt = VT_I4;
  index.lVal = frame_index;

  // Find the frame
  CComVariant frame_holder;
  hr = frames->item(&index, &frame_holder);

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Error retrieving frame holder, call to IHTMLFramesCollection2::item failed";
    return ENOSUCHFRAME;
  }

  CComQIPtr<IHTMLWindow2> interim_result = frame_holder.pdispVal;
  if (!interim_result) {
    LOG(WARN) << "Error retrieving frame, IDispatch cannot be cast to IHTMLWindow2";
    return ENOSUCHFRAME;
  }

  this->focused_frame_window_ = interim_result;
  return SUCCESS;
}

void DocumentHost::GetCookies(std::map<std::string, std::string>* cookies) {
  LOG(TRACE) << "Entering DocumentHost::GetCookies";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);

  if (!doc) {
    LOG(WARN) << "Unable to get document";
    return;
  }

  CComBSTR cookie_bstr;
  HRESULT hr = doc->get_cookie(&cookie_bstr);
  if (!cookie_bstr) {
    LOG(WARN) << "Unable to get cookie str, call to IHTMLDocument2::get_cookie failed";
    cookie_bstr = L"";
  }

  std::wstring cookie_string = cookie_bstr;
  while (cookie_string.size() > 0) {
    size_t cookie_delimiter_pos = cookie_string.find(L"; ");
    std::wstring cookie = cookie_string.substr(0, cookie_delimiter_pos);
    if (cookie_delimiter_pos == std::wstring::npos) {
      cookie_string = L"";
    } else {
      cookie_string = cookie_string.substr(cookie_delimiter_pos + 2);
    }
    size_t cookie_separator_pos(cookie.find_first_of(L"="));
    std::string cookie_name(CW2A(cookie.substr(0, cookie_separator_pos).c_str(), CP_UTF8));
    std::string cookie_value(CW2A(cookie.substr(cookie_separator_pos + 1).c_str(), CP_UTF8));
    cookies->insert(std::pair<std::string, std::string>(cookie_name, cookie_value));
  }
}

int DocumentHost::AddCookie(const std::string& cookie) {
  LOG(TRACE) << "Entering DocumentHost::AddCookie";

  CComBSTR cookie_bstr(CA2W(cookie.c_str(), CP_UTF8));

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);

  if (!doc) {
    LOG(WARN) << "Unable to get document";
    return EUNHANDLEDERROR;
  }

  if (!this->IsHtmlPage(doc)) {
    LOG(WARN) << "Unable to add cookie, document does not appear to be an HTML page";
    return ENOSUCHDOCUMENT;
  }

  HRESULT hr = doc->put_cookie(cookie_bstr);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to put cookie to document, call to IHTMLDocument2::put_cookie failed";
    return EUNHANDLEDERROR;
  }

  return SUCCESS;
}

int DocumentHost::DeleteCookie(const std::string& cookie_name) {
  LOG(TRACE) << "Entering DocumentHost::DeleteCookie";

  // Construct the delete cookie script
  std::wstring script_source;
  for (int i = 0; DELETECOOKIES[i]; i++) {
    script_source += DELETECOOKIES[i];
  }

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
  Script script_wrapper(doc, script_source, 1);
  script_wrapper.AddArgument(cookie_name);
  int status_code = script_wrapper.Execute();
  return status_code;
}

void DocumentHost::PostQuitMessage() {
  LOG(TRACE) << "Entering DocumentHost::PostQuitMessage";

  this->set_is_closing(true);

  LPSTR message_payload = new CHAR[this->browser_id_.size() + 1];
  strcpy_s(message_payload, this->browser_id_.size() + 1, this->browser_id_.c_str());
  ::PostMessage(this->executor_handle(),
                WD_BROWSER_QUIT,
                NULL,
                reinterpret_cast<LPARAM>(message_payload));
}

bool DocumentHost::IsHtmlPage(IHTMLDocument2* doc) {
  LOG(TRACE) << "Entering DocumentHost::IsHtmlPage";

  CComBSTR type;
  if (!SUCCEEDED(doc->get_mimeType(&type))) {
    LOG(WARN) << "Unable to get mime type for document, call to IHTMLDocument2::get_mimeType failed";
    return false;
  }

  std::wstring document_type_key_name= L"";
  if (this->factory_.GetRegistryValue(HKEY_CURRENT_USER,
                                      L"Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice",
                                      L"Progid",
                                      &document_type_key_name)) {
    // Look for the user-customization under Vista/Windows 7 first. If it's
    // IE, set the document friendly name lookup key to 'htmlfile'. If not,
    // set it to blank so that we can look up the proper HTML type.
    if (document_type_key_name == L"IE.HTTP") {
      document_type_key_name = L"htmlfile";
    } else {
      LOG(DEBUG) << "Unable to support custom document type: " << LOGWSTRING(document_type_key_name.c_str());
      document_type_key_name = L"";
    }
  } else {
    LOG(DEBUG) << "Unable to read document type from registry";
  }

  if (document_type_key_name == L"") {
    // To be technically correct, we should look up the extension specified
    // for the text/html MIME type first (located in the "Extension" value
    // of HKEY_CLASSES_ROOT\MIME\Database\Content Type\text/html), but that
    // should always resolve to ".htm" anyway. From the extension, we can 
    // find the browser-specific subkey of HKEY_CLASSES_ROOT, the default 
    // value of which should contain the browser-specific friendly name of
    // the MIME type for HTML documents, which is what 
    // IHTMLDocument2::get_mimeType() returns.
    if (!this->factory_.GetRegistryValue(HKEY_CLASSES_ROOT,
                                         L".htm",
                                         L"",
                                         &document_type_key_name)) {
      LOG(WARN) << "Unable to read document type from registry for '.htm'";
      return false;
    }
  }

  // First try the (default) value for the subkey. Some browsers (Opera)
  // do not write this information in the (default) value, so if that fails,
  // try the FriendlyTypeName value.
  std::wstring mime_type_name;
  if (!this->factory_.GetRegistryValue(HKEY_CLASSES_ROOT,
                                       document_type_key_name,
                                       L"",
                                       &mime_type_name)) {
    if (!this->factory_.GetRegistryValue(HKEY_CLASSES_ROOT,
                                         document_type_key_name,
                                         L"FriendlyTypeName",
                                         &mime_type_name)) {
      LOG(WARN) << "Unable to read mime type from registry for document type";
      return false;
    }
  }

  std::wstring type_string = type;

  if (type_string == mime_type_name) {
	  return true;
  }

  // If the user set Firefox as a default browser at any point, the MIME type
  // appears to be "sticky". This isn't elegant, but it appears to alleviate
  // the worst symptoms. Tested by using both Safari and Opera as the default
  // browser, even after setting IE as the default after Firefox (so the chain
  // of defaults looks like (IE -> Firefox -> IE -> Opera)

  if (L"Firefox HTML Document" == mime_type_name) {
    LOG(INFO) << "It looks like Firefox was once the default browser. " 
        << "Guessing the page type from mime type alone";
    return true;
  }

  return false;
}

HWND DocumentHost::FindContentWindowHandle(HWND top_level_window_handle) {
  LOG(TRACE) << "Entering DocumentHost::FindContentWindowHandle";

  ProcessWindowInfo process_window_info;
  process_window_info.pBrowser = NULL;
  process_window_info.hwndBrowser = NULL;
  DWORD process_id;
  ::GetWindowThreadProcessId(top_level_window_handle, &process_id);
  process_window_info.dwProcessId = process_id;

  ::EnumChildWindows(top_level_window_handle,
                     &BrowserFactory::FindChildWindowForProcess,
                     reinterpret_cast<LPARAM>(&process_window_info));
  return process_window_info.hwndBrowser;
}

} // namespace webdriver