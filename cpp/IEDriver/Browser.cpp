// Copyright 2011 Software Freedom Conservatory
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

#include "Browser.h"
#include "logging.h"
#include <comutil.h>

namespace webdriver {

Browser::Browser(IWebBrowser2* browser, HWND hwnd, HWND session_handle) : DocumentHost(hwnd, session_handle) {
  this->is_navigation_started_ = false;
  this->browser_ = browser;
  this->AttachEvents();
}

Browser::~Browser(void) {
  this->DetachEvents();
}

void __stdcall Browser::BeforeNavigate2(IDispatch* pObject,
                                        VARIANT* pvarUrl,
                                        VARIANT* pvarFlags,
                                        VARIANT* pvarTargetFrame,
                                        VARIANT* pvarData,
                                        VARIANT* pvarHeaders,
                                        VARIANT_BOOL* pbCancel) {
  // std::cout << "BeforeNavigate2\r\n";
}

void __stdcall Browser::OnQuit() {
  this->PostQuitMessage();
}

void __stdcall Browser::NewWindow3(IDispatch** ppDisp,
                                   VARIANT_BOOL* pbCancel,
                                   DWORD dwFlags,
                                   BSTR bstrUrlContext,
                                   BSTR bstrUrl) {
  // Handle the NewWindow3 event to allow us to immediately hook
  // the events of the new browser window opened by the user action.
  // This will not allow us to handle windows created by the JavaScript
  // showModalDialog function().
  IWebBrowser2* browser;
  LPSTREAM message_payload;
  ::SendMessage(this->executor_handle(),
                WD_BROWSER_NEW_WINDOW,
                NULL,
                reinterpret_cast<LPARAM>(&message_payload));
  HRESULT hr = ::CoGetInterfaceAndReleaseStream(message_payload,
                                                IID_IWebBrowser2,
                                                reinterpret_cast<void**>(&browser));
  *ppDisp = browser;
}

void __stdcall Browser::DocumentComplete(IDispatch* pDisp, VARIANT* URL) {
  // Flag the browser as navigation having started.
  // std::cout << "DocumentComplete\r\n";
  this->is_navigation_started_ = true;

  // DocumentComplete fires last for the top-level frame. If it fires
  // for the top-level frame and the focused_frame_window_ member variable
  // is not NULL, we assume we have navigated from within a frameset to a
  // link that has a target of "_top", which replaces the frameset with the
  // target page. On a top-level navigation, we are supposed to reset the
  // focused frame to the top-level, so we do that here.
  // NOTE: This is a possible source of unreliability if the above 
  // assumptions turn out to be wrong and/or the event firing doesn't work
  // the way we expect it to.
  CComPtr<IDispatch> dispatch(this->browser_);
  if (dispatch.IsEqualObject(pDisp) && this->focused_frame_window() != NULL) {
    this->SetFocusedFrameByElement(NULL);
  }
}

void Browser::GetDocument(IHTMLDocument2** doc) {
  CComPtr<IHTMLWindow2> window;

  if (this->focused_frame_window() == NULL) {
    CComPtr<IDispatch> dispatch;
    HRESULT hr = this->browser_->get_Document(&dispatch);
    if (FAILED(hr)) {
      LOGHR(DEBUG, hr) << "Unable to get document";
      return;
    }

    CComPtr<IHTMLDocument2> dispatch_doc;
    hr = dispatch->QueryInterface(&dispatch_doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Have document but cannot cast";
      return;
    }

    dispatch_doc->get_parentWindow(&window);
  } else {
    window = this->focused_frame_window();
  }

  if (window) {
    bool result = this->GetDocumentFromWindow(window, doc);
    if (!result) {
      LOG(WARN) << "Cannot get document";
    }
  }
}

std::string Browser::GetTitle() {
  CComPtr<IDispatch> dispatch;
  HRESULT hr = this->browser_->get_Document(&dispatch);
  if (FAILED(hr)) {
    LOGHR(DEBUG, hr) << "Unable to get document";
    return "";
  }

  CComPtr<IHTMLDocument2> doc;
  hr = dispatch->QueryInterface(&doc);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Have document but cannot cast";
    return "";
  }

  CComBSTR title;
  hr = doc->get_title(&title);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document title";
    return "";
  }

  std::string title_string = CW2A(title, CP_UTF8);
  return title_string;
}

HWND Browser::GetWindowHandle() {
  // If, for some reason, the window handle is no longer valid,
  // set the member variable to NULL so that we can reacquire
  // the valid window handle. Note that this can happen when
  // browsing from one type of content to another, like from
  // HTML to a transformed XML page that renders content.
  if (!::IsWindow(this->window_handle())) {
    this->set_window_handle(NULL);
  }

  if (this->window_handle() == NULL) {
    this->set_window_handle(this->GetTabWindowHandle());
  }

  return this->window_handle();
}

std::string Browser::GetWindowName() {
  CComPtr<IDispatch> dispatch;
  HRESULT hr = this->browser_->get_Document(&dispatch);
  if (FAILED(hr)) {
    return "";
  }
  CComQIPtr<IHTMLDocument2> doc(dispatch);
  if (!doc) {
    return "";
  }

  CComPtr<IHTMLWindow2> window;
  hr = doc->get_parentWindow(&window);
  if (FAILED(hr)) {
    return "";
  }

  std::string name = "";
  CComBSTR window_name;
  hr = window->get_name(&window_name);
  if (window_name) {
    name = CW2A(window_name, CP_UTF8);
  }
  return name;
}

long Browser::GetWidth() {
  long width = 0;
  this->browser_->get_Width(&width);
  return width;
}

long Browser::GetHeight() {
  long height = 0;
  this->browser_->get_Height(&height);
  return height;
}

void Browser::SetWidth(long width) {
  this->browser_->put_Width(width);
}

void Browser::SetHeight(long height) {
  this->browser_->put_Height(height);
}

void Browser::AttachEvents() {
  CComQIPtr<IDispatch> dispatch(this->browser_);
  CComPtr<IUnknown> unknown(dispatch);
  HRESULT hr = this->DispEventAdvise(unknown);
}

void Browser::DetachEvents() {
  CComQIPtr<IDispatch> dispatch(this->browser_);
  CComPtr<IUnknown> unknown(dispatch);
  HRESULT hr = this->DispEventUnadvise(unknown);
}

void Browser::Close() {
  HRESULT hr = this->browser_->Quit();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Quit failed";
  }
}

int Browser::NavigateToUrl(const std::string& url) {
  std::wstring wide_url = CA2W(url.c_str(), CP_UTF8);
  CComVariant url_variant(wide_url.c_str());
  CComVariant dummy;

  // TODO: check HRESULT for error
  HRESULT hr = this->browser_->Navigate2(&url_variant,
                                         &dummy,
                                         &dummy,
                                         &dummy,
                                         &dummy);
  this->set_wait_required(true);
  return SUCCESS;
}

int Browser::NavigateBack() { 
  HRESULT hr = this->browser_->GoBack();
  this->set_wait_required(true);
  return SUCCESS;
}

int Browser::NavigateForward() { 
  HRESULT hr = this->browser_->GoForward();
  this->set_wait_required(true);
  return SUCCESS;
}

int Browser::Refresh() {
  HRESULT hr = this->browser_->Refresh();
  this->set_wait_required(true);
  return SUCCESS;
}

HWND Browser::GetTopLevelWindowHandle() { 
  HWND top_level_window_handle = NULL;
  this->browser_->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&top_level_window_handle));
  return top_level_window_handle;
}

bool Browser::Wait() {
  bool is_navigating = true;

  //std::cout << "Navigate Events Completed." << std::endl;
  this->is_navigation_started_ = false;

  HWND dialog = this->GetActiveDialogWindowHandle();
  if (dialog != NULL) {
    //std::cout "Found alert. Aborting wait." << std::endl;
    this->set_wait_required(false);
    return true;
  }

  // Navigate events completed. Waiting for browser.Busy != false...
  is_navigating = this->is_navigation_started_;
  VARIANT_BOOL is_busy(VARIANT_FALSE);
  HRESULT hr = this->browser_->get_Busy(&is_busy);
  if (is_navigating || FAILED(hr) || is_busy) {
    //std::cout << "Browser busy property is true.\r\n";
    return false;
  }

  // Waiting for browser.ReadyState == READYSTATE_COMPLETE...;
  is_navigating = this->is_navigation_started_;
  READYSTATE ready_state;
  hr = this->browser_->get_ReadyState(&ready_state);
  if (is_navigating || FAILED(hr) || ready_state != READYSTATE_COMPLETE) {
    //std::cout << "readyState is not 'Complete'.\r\n";
    return false;
  }

  // Waiting for document property != null...
  is_navigating = this->is_navigation_started_;
  CComQIPtr<IDispatch> document_dispatch;
  hr = this->browser_->get_Document(&document_dispatch);
  if (is_navigating && FAILED(hr) && !document_dispatch) {
    //std::cout << "Get Document failed.\r\n";
    return false;
  }

  // Waiting for document to complete...
  CComPtr<IHTMLDocument2> doc;
  hr = document_dispatch->QueryInterface(&doc);
  if (SUCCEEDED(hr)) {
    is_navigating = this->IsDocumentNavigating(doc);
  }

  if (!is_navigating) {
    this->set_wait_required(false);
  }

  return !is_navigating;
}

bool Browser::IsDocumentNavigating(IHTMLDocument2* doc) {
  bool is_navigating = true;
  // Starting WaitForDocumentComplete()
  is_navigating = this->is_navigation_started_;
  CComBSTR ready_state;
  HRESULT hr = doc->get_readyState(&ready_state);
  if (FAILED(hr) || is_navigating || _wcsicmp(ready_state, L"complete") != 0) {
    //std::cout << "readyState is not complete\r\n";
    return true;
  } else {
    is_navigating = false;
  }

  // document.readyState == complete
  is_navigating = this->is_navigation_started_;
  CComPtr<IHTMLFramesCollection2> frames;
  hr = doc->get_frames(&frames);
  if (is_navigating || FAILED(hr)) {
    //std::cout << "could not get frames\r\n";
    return true;
  }

  if (frames != NULL) {
    long frame_count = 0;
    hr = frames->get_length(&frame_count);

    CComVariant index;
    index.vt = VT_I4;
    for (long i = 0; i < frame_count; ++i) {
      // Waiting on each frame
      index.lVal = i;
      CComVariant result;
      hr = frames->item(&index, &result);
      if (FAILED(hr)) {
        return true;
      }

      CComQIPtr<IHTMLWindow2> window(result.pdispVal);
      if (!window) {
        // Frame is not an HTML frame.
        continue;
      }

      CComPtr<IHTMLDocument2> frame_document;
      bool is_valid_frame_document = this->GetDocumentFromWindow(window,
                                                                 &frame_document);

      is_navigating = this->is_navigation_started_;
      if (is_navigating) {
        break;
      }

      // Recursively call to wait for the frame document to complete
      if (is_valid_frame_document) {
        is_navigating = this->IsDocumentNavigating(frame_document);
        if (is_navigating) {
          break;
      }
      }
    }
  }
  return is_navigating;
}

bool Browser::GetDocumentFromWindow(IHTMLWindow2* window,
                                    IHTMLDocument2** doc) {
  HRESULT hr = window->get_document(doc);
  if (SUCCEEDED(hr)) {
    return true;
  }

  if (hr == E_ACCESSDENIED) {
    // Cross-domain documents may throw Access Denied. If so,
    // get the document through the IWebBrowser2 interface.
    CComPtr<IWebBrowser2> window_browser;
    CComQIPtr<IServiceProvider> service_provider(window);
    hr = service_provider->QueryService(IID_IWebBrowserApp, &window_browser);
    if (FAILED(hr)) {
      return false;
    }
    CComQIPtr<IDispatch> document_dispatch;
    hr = window_browser->get_Document(&document_dispatch);
    if (FAILED(hr)) {
      return false;
    }
    hr = document_dispatch->QueryInterface(doc);
    if (FAILED(hr)) {
      return false;
    }
    return true;
  }
  return false;
}

HWND Browser::GetTabWindowHandle() {
  HWND hwnd = NULL;
  CComQIPtr<IServiceProvider> service_provider;
  HRESULT hr = this->browser_->QueryInterface(IID_IServiceProvider,
                                              reinterpret_cast<void**>(&service_provider));
  if (SUCCEEDED(hr)) {
    CComPtr<IOleWindow> window;
    hr = service_provider->QueryService(SID_SShellBrowser,
                                        IID_IOleWindow,
                                        reinterpret_cast<void**>(&window));
    if (SUCCEEDED(hr)) {
      // This gets the TabWindowClass window in IE 7 and 8,
      // and the top-level window frame in IE 6. The window
      // we need is the InternetExplorer_Server window.
      window->GetWindow(&hwnd);
      hwnd = this->FindContentWindowHandle(hwnd);
    }
  }

  return hwnd;
}

HWND Browser::GetActiveDialogWindowHandle() {
  HWND active_dialog_handle = NULL;
  DWORD process_id;
  ::GetWindowThreadProcessId(this->GetWindowHandle(), &process_id);
  ProcessWindowInfo process_win_info;
  process_win_info.dwProcessId = process_id;
  process_win_info.hwndBrowser = NULL;
  ::EnumWindows(&BrowserFactory::FindDialogWindowForProcess,
                reinterpret_cast<LPARAM>(&process_win_info));
  if (process_win_info.hwndBrowser != NULL) {
    active_dialog_handle = process_win_info.hwndBrowser;
    this->CheckDialogType(active_dialog_handle);
  }
  return active_dialog_handle;
}

void Browser::CheckDialogType(HWND dialog_window_handle) {
  vector<char> window_class_name(34);
  if (GetClassNameA(dialog_window_handle, &window_class_name[0], 34)) {
    if (strcmp("Internet Explorer_TridentDlgFrame",
        &window_class_name[0]) == 0) {
      HWND content_window_handle = this->FindContentWindowHandle(dialog_window_handle);
      ::PostMessage(this->executor_handle(),
                    WD_NEW_HTML_DIALOG,
                    NULL,
                    reinterpret_cast<LPARAM>(content_window_handle));
    }
  }
}

HWND Browser::FindContentWindowHandle(HWND top_level_window_handle) {
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