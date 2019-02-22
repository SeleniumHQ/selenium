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

#include "Browser.h"

#include <comutil.h>
#include <ShlGuid.h>

#include "errorcodes.h"
#include "logging.h"

#include "Alert.h"
#include "BrowserFactory.h"
#include "CustomTypes.h"
#include "messages.h"
#include "HookProcessor.h"
#include "Script.h"
#include "StringUtilities.h"
#include "WebDriverConstants.h"
#include "WindowUtilities.h"

namespace webdriver {

Browser::Browser(IWebBrowser2* browser, HWND hwnd, HWND session_handle) : DocumentHost(hwnd, session_handle) {
  LOG(TRACE) << "Entering Browser::Browser";
  this->is_explicit_close_requested_ = false;
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
  LOG(TRACE) << "Entering Browser::BeforeNavigate2";
  std::wstring url(pvarUrl->bstrVal);

  LOG(DEBUG) << "BeforeNavigate2: Url: " << LOGWSTRING(url) << ", TargetFrame: " << pvarTargetFrame->bstrVal;
}

void __stdcall Browser::OnQuit() {
  LOG(TRACE) << "Entering Browser::OnQuit";
  if (!this->is_explicit_close_requested_) {
    if (this->is_awaiting_new_process()) {
      LOG(WARN) << "A new browser process was requested. This means a Protected "
                << "Mode boundary has been crossed, and that future commands to "
                << "the current browser instance will fail. The driver will "
                << "attempt to reconnect to the newly created browser object, "
                << "but there is no guarantee it will work.";
      DWORD process_id;
      HWND window_handle = this->GetBrowserWindowHandle();
      ::GetWindowThreadProcessId(window_handle, &process_id);

      BrowserReattachInfo* info = new BrowserReattachInfo;
      info->browser_id = this->browser_id();
      info->current_process_id = process_id;
      info->known_process_ids = this->known_process_ids_;

      this->DetachEvents();
      this->browser_ = NULL;
      ::PostMessage(this->executor_handle(),
                    WD_BROWSER_REATTACH,
                    NULL,
                    reinterpret_cast<LPARAM>(info));
      return;
    } else {
      LOG(WARN) << "This instance of Internet Explorer (" << this->browser_id()
                << ") is exiting without an explicit request to close it. "
                << "Unless you clicked a link that specifically attempts to "
                << "close the page, that likely means a Protected Mode "
                << "boundary has been crossed (either entering or exiting "
                << "Protected Mode). It is highly likely that any subsequent "
                << "commands to this driver instance will fail. THIS IS NOT A "
                << "BUG IN THE IE DRIVER! Fix your code and/or browser "
                << "configuration so that a Protected Mode boundary is not "
                << "crossed.";
    }
  }
  this->PostQuitMessage();
}

void __stdcall Browser::NewProcess(DWORD lCauseFlag,
                                   IDispatch* pWB2,
                                   VARIANT_BOOL* pbCancel) {
  LOG(TRACE) << "Entering Browser::NewProcess";
  this->InitiateBrowserReattach();
}

void __stdcall Browser::NewWindow3(IDispatch** ppDisp,
                                   VARIANT_BOOL* pbCancel,
                                   DWORD dwFlags,
                                   BSTR bstrUrlContext,
                                   BSTR bstrUrl) {
  LOG(TRACE) << "Entering Browser::NewWindow3";
  // Handle the NewWindow3 event to allow us to immediately hook
  // the events of the new browser window opened by the user action.
  // The three ways we can respond to this event are documented at
  // http://msdn.microsoft.com/en-us/library/aa768337%28v=vs.85%29.aspx
  // We potentially use two of those response methods.
  // This will not allow us to handle windows created by the JavaScript
  // showModalDialog function().
  ::PostMessage(this->executor_handle(), WD_BEFORE_NEW_WINDOW, NULL, NULL);
  std::wstring url = bstrUrl;
  IWebBrowser2* browser;
  NewWindowInfo info;
  info.target_url = StringUtilities::ToString(url);
  LRESULT create_result = ::SendMessage(this->executor_handle(),
                                        WD_BROWSER_NEW_WINDOW,
                                        NULL,
                                        reinterpret_cast<LPARAM>(&info));
  if (create_result != 0) {
    // The new, blank IWebBrowser2 object was not created,
    // so we can't really do anything appropriate here.
    // Note this is "response method 2" of the aforementioned
    // documentation.
    LOG(WARN) << "A valid IWebBrowser2 object could not be created.";
    *pbCancel = VARIANT_TRUE;
    ::PostMessage(this->executor_handle(), WD_AFTER_NEW_WINDOW, NULL, NULL);
    return;
  }

  // We received a valid IWebBrowser2 pointer, so deserialize it onto this
  // thread, and pass the result back to the caller.
  HRESULT hr = ::CoGetInterfaceAndReleaseStream(info.browser_stream,
                                                IID_IWebBrowser2,
                                                reinterpret_cast<void**>(&browser));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to marshal IWebBrowser2 interface from stream.";
  }

  *ppDisp = browser;
  ::PostMessage(this->executor_handle(), WD_AFTER_NEW_WINDOW, 1000, NULL);
}

void __stdcall Browser::DocumentComplete(IDispatch* pDisp, VARIANT* URL) {
  LOG(TRACE) << "Entering Browser::DocumentComplete";

  // Flag the browser as navigation having started.
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
  if (dispatch.IsEqualObject(pDisp)) {
    if (this->focused_frame_window() != NULL) {
      LOG(DEBUG) << "DocumentComplete happened from within a frameset";
      this->SetFocusedFrameByElement(NULL);
    }
  }
}

void Browser::InitiateBrowserReattach() {
  LOG(TRACE) << "Entering Browser::InitiateBrowserReattach";
  LOG(DEBUG) << "Requesting browser reattach";
  this->known_process_ids_.clear();
  WindowUtilities::GetProcessesByName(L"iexplore.exe",
                                      &this->known_process_ids_);
  this->set_is_awaiting_new_process(true);
  ::SendMessage(this->executor_handle(), WD_BEFORE_BROWSER_REATTACH, NULL, NULL);
}

void Browser::ReattachBrowser(IWebBrowser2* browser) {
  LOG(TRACE) << "Entering Browser::ReattachBrowser";
  this->browser_ = browser;
  this->AttachEvents();
  this->set_is_awaiting_new_process(false);
  LOG(DEBUG) << "Reattach complete";
}

void Browser::GetDocument(IHTMLDocument2** doc) {
  this->GetDocument(false, doc);
}

void Browser::GetDocument(const bool force_top_level_document,
                          IHTMLDocument2** doc) {
  LOG(TRACE) << "Entering Browser::GetDocument";
  CComPtr<IHTMLWindow2> window;

  if (this->focused_frame_window() == NULL || force_top_level_document) {
    LOG(INFO) << "No child frame focus. Focus is on top-level frame";

    CComPtr<IDispatch> dispatch;
    HRESULT hr = this->browser_->get_Document(&dispatch);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to get document, IWebBrowser2::get_Document call failed";
      return;
    }

    CComPtr<IHTMLDocument2> dispatch_doc;
    hr = dispatch->QueryInterface(&dispatch_doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Have document but cannot cast, IDispatch::QueryInterface call failed";
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
  } else {
    LOG(WARN) << "No window is found";
  }
}

std::string Browser::GetTitle() {
  LOG(TRACE) << "Entering Browser::GetTitle";

  CComPtr<IDispatch> dispatch;
  HRESULT hr = this->browser_->get_Document(&dispatch);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document, IWebBrowser2::get_Document call failed";
    return "";
  }

  CComPtr<IHTMLDocument2> doc;
  hr = dispatch->QueryInterface(&doc);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Have document but cannot cast, IDispatch::QueryInterface call failed";
    return "";
  }

  CComBSTR title;
  hr = doc->get_title(&title);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document title, call to IHTMLDocument2::get_title failed";
    return "";
  }

  std::wstring converted_title = title;
  std::string title_string = StringUtilities::ToString(converted_title);
  return title_string;
}

std::string Browser::GetBrowserUrl() {
  LOG(TRACE) << "Entering Browser::GetBrowserUrl";

  CComBSTR url;
  HRESULT hr = this->browser_->get_LocationURL(&url);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get current URL, call to IWebBrowser2::get_LocationURL failed";
    return "";
  }

  std::wstring converted_url = url;
  std::string current_url = StringUtilities::ToString(converted_url);
  return current_url;
}

HWND Browser::GetContentWindowHandle() {
  LOG(TRACE) << "Entering Browser::GetContentWindowHandle";

  HWND current_content_window_handle = this->window_handle();
  // If this window is closing, the only reason to care about
  // a valid window handle is to check for alerts whose parent
  // is this window handle, so return the stored window handle.
  if (!this->is_closing()) {
    // If, for some reason, the window handle is no longer valid, set the
    // member variable to NULL so that we can reacquire the valid window
    // handle. Note that this can happen when browsing from one type of
    // content to another, like from HTML to a transformed XML page that
    // renders content. If the member variable is NULL upon entering this
    // method, that is okay, as it typically means only that this object
    // is newly constructed, and has not yet had its handle set.
    bool window_handle_is_valid = ::IsWindow(current_content_window_handle);
    if (!window_handle_is_valid) {
      LOG(INFO) << "Flushing window handle as it is no longer valid";
      this->set_window_handle(NULL);
    }

    if (this->window_handle() == NULL) {
      LOG(INFO) << "Restore window handle from tab";
      // GetBrowserWindowHandle gets the TabWindowClass window in IE 7 and 8,
      // and the top-level window frame in IE 6. The window we need is the
      // InternetExplorer_Server window.
      HWND tab_window_handle = this->GetBrowserWindowHandle();
      if (tab_window_handle == NULL) {
        LOG(WARN) << "No tab window found";
      }
      HWND content_window_handle = this->FindContentWindowHandle(tab_window_handle);
      this->set_window_handle(content_window_handle);
    }
  }

  return this->window_handle();
}

std::string Browser::GetWindowName() {
  LOG(TRACE) << "Entering Browser::GetWindowName";

  CComPtr<IDispatch> dispatch;
  HRESULT hr = this->browser_->get_Document(&dispatch);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document, IWebBrowser2::get_Document call failed";
    return "";
  }

  CComPtr<IHTMLDocument2> doc;
  dispatch->QueryInterface<IHTMLDocument2>(&doc);
  if (!doc) {
    LOGHR(WARN, hr) << "Have document but cannot cast, IDispatch::QueryInterface call failed";
    return "";
  }

  CComPtr<IHTMLWindow2> window;
  hr = doc->get_parentWindow(&window);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get parent window, call to IHTMLDocument2::get_parentWindow failed";
    return "";
  }

  std::string name = "";
  CComBSTR window_name;
  hr = window->get_name(&window_name);
  if (window_name) {
    std::wstring converted_window_name = window_name;
    name = StringUtilities::ToString(converted_window_name);
  } else {
    LOG(WARN) << "Unable to get window name, IHTMLWindow2::get_name failed or returned a NULL value";
  }

  return name;
}

long Browser::GetWidth() {
  LOG(TRACE) << "Entering Browser::GetWidth";
  long width = 0;
  this->browser_->get_Width(&width);
  return width;
}

long Browser::GetHeight() {
  LOG(TRACE) << "Entering Browser::GetHeight";
  long height = 0;
  this->browser_->get_Height(&height);
  return height;
}

void Browser::SetWidth(long width) {
  LOG(TRACE) << "Entering Browser::SetWidth";
  this->browser_->put_Width(width);
}

void Browser::SetHeight(long height) {
  LOG(TRACE) << "Entering Browser::SetHeight";
  this->browser_->put_Height(height);
}

void Browser::AttachEvents() {
  LOG(TRACE) << "Entering Browser::AttachEvents";
  CComPtr<IUnknown> unknown;
  this->browser_->QueryInterface<IUnknown>(&unknown);
  HRESULT hr = this->DispEventAdvise(unknown);
}

void Browser::DetachEvents() {
  LOG(TRACE) << "Entering Browser::DetachEvents";
  CComPtr<IUnknown> unknown;
  this->browser_->QueryInterface<IUnknown>(&unknown);
  HRESULT hr = this->DispEventUnadvise(unknown);
}

void Browser::Close() {
  LOG(TRACE) << "Entering Browser::Close";
  this->is_explicit_close_requested_ = true;
  this->set_is_closing(true);
  // Closing the browser, so having focus on a frame doesn't
  // make any sense.
  this->SetFocusedFrameByElement(NULL);
  HRESULT hr = this->browser_->Quit();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to IWebBrowser2::Quit failed";
  }
}

int Browser::NavigateToUrl(const std::string& url) {
  LOG(TRACE) << "Entring Browser::NavigateToUrl";

  std::wstring wide_url = StringUtilities::ToWString(url);
  CComVariant url_variant(wide_url.c_str());
  CComVariant dummy;

  // TODO: check HRESULT for error
  HRESULT hr = this->browser_->Navigate2(&url_variant,
                                         &dummy,
                                         &dummy,
                                         &dummy,
                                         &dummy);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to IWebBrowser2::Navigate2 failed";
    return EUNHANDLEDERROR;
  }

  this->set_wait_required(true);
  return WD_SUCCESS;
}

int Browser::NavigateBack() {
  LOG(TRACE) << "Entering Browser::NavigateBack";
  LPSTREAM stream;
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2, this->browser_, &stream);
  unsigned int thread_id = 0;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                  0,
                                                  &Browser::GoBackThreadProc,
                                                  (void *)stream,
                                                  0,
                                                  &thread_id));
  if (thread_handle != NULL) {
    ::CloseHandle(thread_handle);
  }

  this->set_wait_required(true);
  return WD_SUCCESS;
}

unsigned int WINAPI Browser::GoBackThreadProc(LPVOID param) {
  HRESULT hr = ::CoInitialize(NULL);
  IWebBrowser2* browser;
  LPSTREAM message_payload = reinterpret_cast<LPSTREAM>(param);
  hr = ::CoGetInterfaceAndReleaseStream(message_payload,
                                        IID_IWebBrowser2,
                                        reinterpret_cast<void**>(&browser));
  if (browser != NULL) {
    hr = browser->GoBack();
  }
  return 0;
}

int Browser::NavigateForward() {
  LOG(TRACE) << "Entering Browser::NavigateForward";
  LPSTREAM stream;
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2, this->browser_, &stream);
  unsigned int thread_id = 0;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                  0,
                                                  &Browser::GoForwardThreadProc,
                                                  (void *)stream,
                                                  0,
                                                  &thread_id));
  if (thread_handle != NULL) {
    ::CloseHandle(thread_handle);
  }

  this->set_wait_required(true);
  return WD_SUCCESS;
}

unsigned int WINAPI Browser::GoForwardThreadProc(LPVOID param) {
  HRESULT hr = ::CoInitialize(NULL);
  IWebBrowser2* browser;
  LPSTREAM message_payload = reinterpret_cast<LPSTREAM>(param);
  hr = ::CoGetInterfaceAndReleaseStream(message_payload,
                                        IID_IWebBrowser2,
                                        reinterpret_cast<void**>(&browser));
  if (browser != NULL) {
    hr = browser->GoForward();
  }
  return 0;
}

int Browser::Refresh() {
  LOG(TRACE) << "Entering Browser::Refresh";

  HRESULT hr = this->browser_->Refresh();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Call to IWebBrowser2::Refresh failed";
  }

  this->set_wait_required(true);
  return WD_SUCCESS;
}

HWND Browser::GetTopLevelWindowHandle() {
  LOG(TRACE) << "Entering Browser::GetTopLevelWindowHandle";

  HWND top_level_window_handle = NULL;
  HRESULT hr = this->browser_->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&top_level_window_handle));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Getting HWND property of IWebBrowser2 object failed";
  }

  return top_level_window_handle;
}

bool Browser::IsValidWindow() {
  LOG(TRACE) << "Entering Browser::IsValidWindow";
  // This is a no-op for this class. Full browser windows can properly notify
  // of their window's validity by using the proper events.
  return true;
}

bool Browser::IsBusy() {
  VARIANT_BOOL is_busy(VARIANT_FALSE);
  HRESULT hr = this->browser_->get_Busy(&is_busy);
  return SUCCEEDED(hr) && is_busy == VARIANT_TRUE;
}

bool Browser::Wait(const std::string& page_load_strategy) {
  LOG(TRACE) << "Entering Browser::Wait";

  if (page_load_strategy == NONE_PAGE_LOAD_STRATEGY) {
    LOG(DEBUG) << "Page load strategy is 'none'. Aborting wait.";
    this->set_wait_required(false);
    return true;
  }

  if (this->is_awaiting_new_process()) {
    return false;
  }

  bool is_navigating = true;

  LOG(DEBUG) << "Navigate Events Completed.";
  this->is_navigation_started_ = false;

  HWND dialog = this->GetActiveDialogWindowHandle();
  if (dialog != NULL) {
    LOG(DEBUG) << "Found alert. Aborting wait.";
    this->set_wait_required(false);
    return true;
  }

  // Navigate events completed. Waiting for browser.Busy != false...
  is_navigating = this->is_navigation_started_;
  if (is_navigating || (page_load_strategy == NORMAL_PAGE_LOAD_STRATEGY && this->IsBusy())) {
    if (is_navigating) {
      LOG(DEBUG) << "DocumentComplete event fired, indicating a new navigation.";
    } else {
      LOG(DEBUG) << "Browser busy property is true.";
    }
    return false;
  }

  READYSTATE expected_ready_state = READYSTATE_COMPLETE;
  if (page_load_strategy == EAGER_PAGE_LOAD_STRATEGY) {
    expected_ready_state = READYSTATE_INTERACTIVE;
  }

  // Waiting for browser.ReadyState >= expected ready state
  is_navigating = this->is_navigation_started_;
  READYSTATE ready_state;
  HRESULT hr = this->browser_->get_ReadyState(&ready_state);
  if (is_navigating || FAILED(hr) || ready_state < expected_ready_state) {
    if (is_navigating) {
      LOG(DEBUG) << "DocumentComplete event fired, indicating a new navigation.";
    } else if (FAILED(hr)) {
      LOGHR(DEBUG, hr) << "IWebBrowser2::get_ReadyState failed.";
    } else {
      LOG(DEBUG) << "Browser ReadyState is not at least '" << expected_ready_state << "'; it was " << ready_state;
    }
    return false;
  }

  // Waiting for document property != null...
  is_navigating = this->is_navigation_started_;
  CComPtr<IDispatch> document_dispatch;
  hr = this->browser_->get_Document(&document_dispatch);
  if (is_navigating || FAILED(hr) || !document_dispatch) {
    if (is_navigating) {
      LOG(DEBUG) << "DocumentComplete event fired, indicating a new navigation.";
    } else if (FAILED(hr)) {
      LOGHR(DEBUG, hr) << "IWebBrowser2::get_Document failed.";
    } else {
      LOG(DEBUG) << "Get Document failed; IWebBrowser2::get_Document did not return a valid IDispatch object.";
    }
    return false;
  }

  // Waiting for document to complete...
  CComPtr<IHTMLDocument2> doc;
  hr = document_dispatch->QueryInterface(&doc);
  if (SUCCEEDED(hr)) {
    LOG(DEBUG) << "Waiting for document to complete...";
    is_navigating = this->IsDocumentNavigating(page_load_strategy, doc);
  }

  if (!is_navigating) {
    LOG(DEBUG) << "Not in navigating state";
    this->set_wait_required(false);
  }

  return !is_navigating;
}

bool Browser::IsDocumentNavigating(const std::string& page_load_strategy,
                                   IHTMLDocument2* doc) {
  LOG(TRACE) << "Entering Browser::IsDocumentNavigating";

  bool is_navigating = true;

  // Starting WaitForDocumentComplete()
  is_navigating = this->is_navigation_started_;
  CComBSTR ready_state_bstr;
  HRESULT hr = doc->get_readyState(&ready_state_bstr);
  if (FAILED(hr) || is_navigating) {
    if (FAILED(hr)) {
      LOGHR(DEBUG, hr) << "IHTMLDocument2::get_readyState failed.";
    } else if (is_navigating) {
      LOG(DEBUG) << "DocumentComplete event fired, indicating a new navigation.";
    }
    return true;
  } else {
    std::wstring ready_state = ready_state_bstr;
    if ((ready_state == L"complete") ||
        (page_load_strategy == EAGER_PAGE_LOAD_STRATEGY && ready_state == L"interactive")) {
      is_navigating = false;
    } else {
      if (page_load_strategy == EAGER_PAGE_LOAD_STRATEGY) {
        LOG(DEBUG) << "document.readyState is not 'complete' or 'interactive'; it was " << LOGWSTRING(ready_state);
      } else {
        LOG(DEBUG) << "document.readyState is not 'complete'; it was " << LOGWSTRING(ready_state);
      }
      return true;
    }
  }

  // document.readyState == complete
  is_navigating = this->is_navigation_started_;
  CComPtr<IHTMLFramesCollection2> frames;
  hr = doc->get_frames(&frames);
  if (is_navigating || FAILED(hr)) {
    LOG(DEBUG) << "Could not get frames, navigation has started or call to IHTMLDocument2::get_frames failed";
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
        LOGHR(DEBUG, hr) << "Could not get frame item for index "
                         << i
                         << ", call to IHTMLFramesCollection2::item failed, frame/frameset is broken";
        continue;
      }

      CComPtr<IHTMLWindow2> window;
      result.pdispVal->QueryInterface<IHTMLWindow2>(&window);
      if (!window) {        
        LOG(DEBUG) << "Could not get window for frame item with index "
                   << i 
                   << ", cast to IHTMLWindow2 failed, frame is not an HTML frame";
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
        is_navigating = this->IsDocumentNavigating(page_load_strategy, frame_document);
        if (is_navigating) {
          break;
        }
      }
    }
  } else {
    LOG(DEBUG) << "IHTMLDocument2.get_frames() returned empty collection";
  }
  return is_navigating;
}

bool Browser::GetDocumentFromWindow(IHTMLWindow2* window,
                                    IHTMLDocument2** doc) {
  LOG(TRACE) << "Entering Browser::GetDocumentFromWindow";

  HRESULT hr = window->get_document(doc);
  if (SUCCEEDED(hr)) {
    return true;
  }

  if (hr == E_ACCESSDENIED) {
    // Cross-domain documents may throw Access Denied. If so,
    // get the document through the IWebBrowser2 interface.
    CComPtr<IServiceProvider> service_provider;
    hr = window->QueryInterface<IServiceProvider>(&service_provider);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to get browser, call to IHTMLWindow2::QueryService failed for IServiceProvider";
      return false;
    }

    CComPtr<IWebBrowser2> window_browser;
    hr = service_provider->QueryService(IID_IWebBrowserApp, &window_browser);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to get browser, call to IServiceProvider::QueryService failed for IID_IWebBrowserApp";
      return false;
    }

    CComPtr<IDispatch> document_dispatch;
    hr = window_browser->get_Document(&document_dispatch);
    if (FAILED(hr) || hr == S_FALSE) {
      LOGHR(WARN, hr) << "Unable to get document, call to IWebBrowser2::get_Document failed";
      return false;
    }

    hr = document_dispatch->QueryInterface(doc);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Unable to query document, call to IDispatch::QueryInterface failed.";
      return false;
    }

    return true;
  } else {
    LOGHR(WARN, hr) << "Unable to get main document, IHTMLWindow2::get_document returned other than E_ACCESSDENIED";
  }

  return false;
}

HWND Browser::GetBrowserWindowHandle() {
  LOG(TRACE) << "Entering Browser::GetBrowserWindowHandle";

  HWND hwnd = NULL;
  CComPtr<IServiceProvider> service_provider;
  HRESULT hr = this->browser_->QueryInterface(IID_IServiceProvider,
                                              reinterpret_cast<void**>(&service_provider));
  HWND hwnd_tmp = NULL;
  this->browser_->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&hwnd_tmp));
  if (SUCCEEDED(hr)) {
    CComPtr<IOleWindow> window;
    hr = service_provider->QueryService(SID_SShellBrowser,
                                        IID_IOleWindow,
                                        reinterpret_cast<void**>(&window));
    if (SUCCEEDED(hr)) {
      // This gets the TabWindowClass window in IE 7 and 8,
      // and the top-level window frame in IE 6.
      window->GetWindow(&hwnd);
    } else {
      LOGHR(WARN, hr) << "Unable to get window, call to IOleWindow::QueryService for SID_SShellBrowser failed";
    }
  } else {
    LOGHR(WARN, hr) << "Unable to get service, call to IWebBrowser2::QueryInterface for IID_IServiceProvider failed";
  }

  return hwnd;
}

bool Browser::SetFullScreen(bool is_full_screen) {
  VARIANT_BOOL full_screen_value = VARIANT_TRUE;
  std::wstring full_screen_script = L"window.fullScreen = true;";
  if (!is_full_screen) {
    full_screen_value = VARIANT_FALSE;
    full_screen_script = L"delete window.fullScreen;";
  }
  this->browser_->put_FullScreen(full_screen_value);

  // IE does not support the W3C Fullscreen API (and likely never will).
  // The prefixed version cannot be triggered via JavaScript outside of
  // a user interaction, so we're going to cheat here and manually set
  // the fullScreen property of the window object to the appropriate
  // value. This may interfere with polyfills in use, and if that's
  // the case, we'll revisit this hack.
  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(true, &doc);
  std::wstring script = ANONYMOUS_FUNCTION_START;
  script += full_screen_script;
  script += ANONYMOUS_FUNCTION_END;
  Script script_wrapper(doc, script, 0);
  script_wrapper.Execute();
  return true;
}

bool Browser::IsFullScreen() {
  VARIANT_BOOL is_full_screen = VARIANT_FALSE;
  this->browser_->get_FullScreen(&is_full_screen);
  return is_full_screen == VARIANT_TRUE;
}

HWND Browser::GetActiveDialogWindowHandle() {
  LOG(TRACE) << "Entering Browser::GetActiveDialogWindowHandle";

  HWND active_dialog_handle = NULL;

  HWND content_window_handle = this->GetContentWindowHandle();
  if (content_window_handle == NULL) {
    return active_dialog_handle;
  }

  DWORD process_id = 0;
  ::GetWindowThreadProcessId(content_window_handle, &process_id);
  if (process_id == 0) {
    return active_dialog_handle;
  }

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
  LOG(TRACE) << "Entering Browser::CheckDialogType";

  std::vector<char> window_class_name(34);
  if (GetClassNameA(dialog_window_handle, &window_class_name[0], 34)) {
    if (strcmp(HTML_DIALOG_WINDOW_CLASS,
        &window_class_name[0]) == 0) {
      HWND content_window_handle = this->FindContentWindowHandle(dialog_window_handle);
      ::PostMessage(this->executor_handle(),
                    WD_NEW_HTML_DIALOG,
                    NULL,
                    reinterpret_cast<LPARAM>(content_window_handle));
    }
  }
}

} // namespace webdriver
