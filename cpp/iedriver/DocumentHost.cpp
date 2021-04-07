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

#include "DocumentHost.h"

#include <IEPMapi.h>
#include <UIAutomation.h>

#include "errorcodes.h"
#include "logging.h"

#include "BrowserCookie.h"
#include "BrowserFactory.h"
#include "CookieManager.h"
#include "HookProcessor.h"
#include "messages.h"
#include "RegistryUtilities.h"
#include "Script.h"
#include "StringUtilities.h"

namespace webdriver {

DocumentHost::DocumentHost(HWND hwnd, HWND executor_handle) {
  LOG(TRACE) << "Entering DocumentHost::DocumentHost";

  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  if (status != RPC_S_OK) {
    // If we encounter an error, not bloody much we can do about it.
    // Just log it and continue.
    LOG(WARN) << "UuidCreate returned a status other then RPC_S_OK: " << status;
  }
  status = ::UuidToString(&guid, &guid_string);
  if (status != RPC_S_OK) {
    // If we encounter an error, not bloody much we can do about it.
    // Just log it and continue.
    LOG(WARN) << "UuidToString returned a status other then RPC_S_OK: " << status;
  }

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->browser_id_ = StringUtilities::ToString(cast_guid_string);

  ::RpcStringFree(&guid_string);
  this->window_handle_ = hwnd;
  this->executor_handle_ = executor_handle;
  this->script_executor_handle_ = NULL;
  this->is_closing_ = false;
  this->wait_required_ = false;
  this->is_awaiting_new_process_ = false;
  this->focused_frame_window_ = NULL;
  this->cookie_manager_ = new CookieManager();
  if (this->window_handle_ != NULL) {
    this->cookie_manager_->Initialize(this->window_handle_);
  }
}

DocumentHost::~DocumentHost(void) {
  delete this->cookie_manager_;
}

std::string DocumentHost::GetCurrentUrl() {
  LOG(TRACE) << "Entering DocumentHost::GetCurrentUrl";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
  if (!doc) {
    LOG(WARN) << "Unable to get document object, DocumentHost::GetDocument returned NULL. "
              << "Attempting to get URL from IWebBrowser2 object";
    return this->GetBrowserUrl();
  }

  CComBSTR url;
  HRESULT hr = doc->get_URL(&url);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get current URL, call to IHTMLDocument2::get_URL failed";
    return "";
  }

  std::wstring converted_url(url, ::SysStringLen(url));
  std::string current_url = StringUtilities::ToString(converted_url);
  return current_url;
}

std::string DocumentHost::GetPageSource() {
  LOG(TRACE) << "Entering DocumentHost::GetPageSource";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
  if (!doc) {
    LOG(WARN) << "Unable to get document object, DocumentHost::GetDocument did not return a valid IHTMLDocument2 pointer";
    return "";
  }

  CComPtr<IHTMLDocument3> doc3;
  HRESULT hr = doc->QueryInterface<IHTMLDocument3>(&doc3);
  if (FAILED(hr) || !doc3) {
    LOG(WARN) << "Unable to get document object, QueryInterface to IHTMLDocument3 failed";
    return "";
  }

  CComPtr<IHTMLElement> document_element;
  hr = doc3->get_documentElement(&document_element);
  if (FAILED(hr) || !document_element) {
    LOGHR(WARN, hr) << "Unable to get document element from page, call to IHTMLDocument3::get_documentElement failed";
    return "";
  }

  CComBSTR html;
  hr = document_element->get_outerHTML(&html);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Have document element but cannot read source, call to IHTMLElement::get_outerHTML failed";
    return "";
  }

  std::wstring converted_html = html;
  std::string page_source = StringUtilities::ToString(converted_html);
  return page_source;
}

void DocumentHost::Restore(void) {
  if (this->IsFullScreen()) {
    this->SetFullScreen(false);
  }
  HWND window_handle = this->GetTopLevelWindowHandle();
  if (::IsZoomed(window_handle) || ::IsIconic(window_handle)) {
    ::ShowWindow(window_handle, SW_RESTORE);
  }
}

int DocumentHost::SetFocusedFrameByElement(IHTMLElement* frame_element) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByElement";

  HRESULT hr = S_OK;
  if (!frame_element) {
    this->focused_frame_window_ = NULL;
    return WD_SUCCESS;
  }

  CComPtr<IHTMLWindow2> interim_result;
  CComPtr<IHTMLObjectElement4> object_element;
  hr = frame_element->QueryInterface<IHTMLObjectElement4>(&object_element);
  if (SUCCEEDED(hr) && object_element) {
	  CComPtr<IDispatch> object_disp;
	  object_element->get_contentDocument(&object_disp);
	  if (!object_disp) {
		  LOG(WARN) << "Cannot get IDispatch interface from IHTMLObjectElement4 element";
		  return ENOSUCHFRAME;
	  }

	  CComPtr<IHTMLDocument2> object_doc;
	  object_disp->QueryInterface<IHTMLDocument2>(&object_doc);
	  if (!object_doc) {
		  LOG(WARN) << "Cannot get IHTMLDocument2 document from IDispatch reference";
		  return ENOSUCHFRAME;
	  }

	  hr = object_doc->get_parentWindow(&interim_result);
	  if (FAILED(hr)) {
		  LOGHR(WARN, hr) << "Cannot get parentWindow from IHTMLDocument2, call to IHTMLDocument2::get_parentWindow failed";
		  return ENOSUCHFRAME;
	  }
  } else {
	  CComPtr<IHTMLFrameBase2> frame_base;
	  frame_element->QueryInterface<IHTMLFrameBase2>(&frame_base);
	  if (!frame_base) {
		  LOG(WARN) << "IHTMLElement is not a FRAME or IFRAME element";
		  return ENOSUCHFRAME;
	  }

	  hr = frame_base->get_contentWindow(&interim_result);
	  if (FAILED(hr)) {
		  LOGHR(WARN, hr) << "Cannot get contentWindow from IHTMLFrameBase2, call to IHTMLFrameBase2::get_contentWindow failed";
		  return ENOSUCHFRAME;
	  }
  }

  this->focused_frame_window_ = interim_result;
  return WD_SUCCESS;
}

int DocumentHost::SetFocusedFrameByName(const std::string& frame_name) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByName";
  CComVariant frame_identifier =  StringUtilities::ToWString(frame_name).c_str();
  return this->SetFocusedFrameByIdentifier(frame_identifier);
}

int DocumentHost::SetFocusedFrameByIndex(const int frame_index) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByIndex";
  CComVariant frame_identifier;
  frame_identifier.vt = VT_I4;
  frame_identifier.lVal = frame_index;
  return this->SetFocusedFrameByIdentifier(frame_identifier);
}

void DocumentHost::SetFocusedFrameToParent() {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameToParent";
  // Three possible outcomes.
  // Outcome 1: Already at top-level browsing context. No-op.
  if (this->focused_frame_window_ != NULL) {
    CComPtr<IHTMLWindow2> parent_window;
    HRESULT hr = this->focused_frame_window_->get_parent(&parent_window);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "IHTMLWindow2::get_parent call failed.";
    }
    CComPtr<IHTMLWindow2> top_window;
    hr = this->focused_frame_window_->get_top(&top_window);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "IHTMLWindow2::get_top call failed.";
    }
    if (top_window.IsEqualObject(parent_window)) {
      // Outcome 2: Focus is on a frame one level deep, making the
      // parent the top-level browsing context. Set focused frame
      // pointer to NULL.
      this->focused_frame_window_ = NULL;
    } else {
      // Outcome 3: Focus is on a frame more than one level deep.
      // Set focused frame pointer to parent frame.
      this->focused_frame_window_ = parent_window;
    }
  }
}

int DocumentHost::SetFocusedFrameByIdentifier(VARIANT frame_identifier) {
  LOG(TRACE) << "Entering DocumentHost::SetFocusedFrameByIdentifier";

  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);

  CComPtr<IHTMLFramesCollection2> frames;
  HRESULT hr = doc->get_frames(&frames);

  if (!frames) {
    LOG(WARN) << "No frames in document are set, IHTMLDocument2::get_frames returned NULL";
    return ENOSUCHFRAME;
  }

  long length = 0;
  frames->get_length(&length);
  if (!length) {
    LOG(WARN) << "No frames in document are found IHTMLFramesCollection2::get_length returned 0";
    return ENOSUCHFRAME;
  }

  // Find the frame
  CComVariant frame_holder;
  hr = frames->item(&frame_identifier, &frame_holder);

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Error retrieving frame holder, call to IHTMLFramesCollection2::item failed";
    return ENOSUCHFRAME;
  }

  CComPtr<IHTMLWindow2> interim_result;
  frame_holder.pdispVal->QueryInterface<IHTMLWindow2>(&interim_result);
  if (!interim_result) {
    LOG(WARN) << "Error retrieving frame, IDispatch cannot be cast to IHTMLWindow2";
    return ENOSUCHFRAME;
  }

  this->focused_frame_window_ = interim_result;
  return WD_SUCCESS;
}

void DocumentHost::PostQuitMessage() {
  LOG(TRACE) << "Entering DocumentHost::PostQuitMessage";

  LPSTR message_payload = new CHAR[this->browser_id_.size() + 1];
  strcpy_s(message_payload, this->browser_id_.size() + 1, this->browser_id_.c_str());
  ::PostMessage(this->executor_handle(),
                WD_BROWSER_QUIT,
                NULL,
                reinterpret_cast<LPARAM>(message_payload));
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

int DocumentHost::GetDocumentMode(IHTMLDocument2* doc) {
  LOG(TRACE) << "Entering DocumentHost::GetDocumentMode";
  CComPtr<IHTMLDocument6> mode_doc;
  doc->QueryInterface<IHTMLDocument6>(&mode_doc);
  if (!mode_doc) {
    LOG(DEBUG) << "QueryInterface for IHTMLDocument6 fails, so document mode must be 7 or less.";
    return 5;
  }
  CComVariant mode;
  HRESULT hr = mode_doc->get_documentMode(&mode);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "get_documentMode failed.";
    return 5;
  }
  int document_mode = static_cast<int>(mode.fltVal);
  return document_mode;
}

bool DocumentHost::IsStandardsMode(IHTMLDocument2* doc) {
  LOG(TRACE) << "Entering DocumentHost::IsStandardsMode";
  CComPtr<IHTMLDocument5> compatibility_mode_doc;
  doc->QueryInterface<IHTMLDocument5>(&compatibility_mode_doc);
  if (!compatibility_mode_doc) {
    LOG(WARN) << "Unable to cast document to IHTMLDocument5. IE6 or greater is required.";
    return false;
  }

  CComBSTR compatibility_mode;
  HRESULT hr = compatibility_mode_doc->get_compatMode(&compatibility_mode);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed calling get_compatMode.";
    return false;
  }
  // Compatibility mode should be "BackCompat" for quirks mode, and
  // "CSS1Compat" for standards mode. Check for "BackCompat" because
  // that's less likely to change.
  return compatibility_mode != L"BackCompat";
}

bool DocumentHost::GetDocumentDimensions(IHTMLDocument2* doc, LocationInfo* info) {
  LOG(TRACE) << "Entering DocumentHost::GetDocumentDimensions";
  CComVariant document_height;
  CComVariant document_width;

  // In non-standards-compliant mode, the BODY element represents the canvas.
  // In standards-compliant mode, the HTML element represents the canvas.
  CComPtr<IHTMLElement> canvas_element;
  if (!IsStandardsMode(doc)) {
    doc->get_body(&canvas_element);
    if (!canvas_element) {
      LOG(WARN) << "Unable to get canvas element from document in compatibility mode";
      return false;
    }
  } else {
    CComPtr<IHTMLDocument3> document_element_doc;
    doc->QueryInterface<IHTMLDocument3>(&document_element_doc);
    if (!document_element_doc) {
      LOG(WARN) << "Unable to get IHTMLDocument3 handle from document.";
      return false;
    }

    // The root node should be the HTML element.
    document_element_doc->get_documentElement(&canvas_element);
    if (!canvas_element) {
      LOG(WARN) << "Could not retrieve document element.";
      return false;
    }

    CComPtr<IHTMLHtmlElement> html_element;
    canvas_element->QueryInterface<IHTMLHtmlElement>(&html_element);
    if (!html_element) {
      LOG(WARN) << "Document element is not the HTML element.";
      return false;
    }
  }

  canvas_element->getAttribute(CComBSTR("scrollHeight"), 0, &document_height);
  canvas_element->getAttribute(CComBSTR("scrollWidth"), 0, &document_width);
  info->height = document_height.lVal;
  info->width = document_width.lVal;
  return true;
}

bool DocumentHost::IsCrossZoneUrl(std::string url) {
  LOG(TRACE) << "Entering Browser::IsCrossZoneUrl";
  std::wstring target_url = StringUtilities::ToWString(url);
  CComPtr<IUri> parsed_url;
  HRESULT hr = ::CreateUri(target_url.c_str(),
                           Uri_CREATE_IE_SETTINGS,
                           0,
                           &parsed_url);
  if (FAILED(hr)) {
    // If we can't parse the URL, assume that it's invalid, and
    // therefore won't cross a Protected Mode boundary.
    return false;
  }
  bool is_protected_mode_browser = this->IsProtectedMode();
  bool is_protected_mode_url = is_protected_mode_browser;
  if (url.find("about:blank") != 0) {
    // If the URL starts with "about:blank", it won't cross the Protected
    // Mode boundary, so skip checking if it's a Protected Mode URL.
    is_protected_mode_url = ::IEIsProtectedModeURL(target_url.c_str()) == S_OK;
  }
  bool is_cross_zone = is_protected_mode_browser != is_protected_mode_url;
  if (is_cross_zone) {
    LOG(DEBUG) << "Navigation across Protected Mode zone detected. URL: "
               << url
               << ", is URL Protected Mode: "
               << (is_protected_mode_url ? "true" : "false")
               << ", is IE in Protected Mode: "
               << (is_protected_mode_browser ? "true" : "false");
  }
  return is_cross_zone;
}

bool DocumentHost::IsProtectedMode() {
  LOG(TRACE) << "Entering DocumentHost::IsProtectedMode";
  HWND window_handle = this->GetBrowserWindowHandle();
  HookSettings hook_settings;
  hook_settings.hook_procedure_name = "ProtectedModeWndProc";
  hook_settings.hook_procedure_type = WH_CALLWNDPROC;
  hook_settings.window_handle = window_handle;
  hook_settings.communication_type = OneWay;

  HookProcessor hook;
  if (!hook.CanSetWindowsHook(window_handle)) {
    LOG(WARN) << "Cannot check Protected Mode because driver and browser are "
              << "not the same bit-ness.";
    return false;
  }
  hook.Initialize(hook_settings);
  HookProcessor::ResetFlag();
  ::SendMessage(window_handle, WD_IS_BROWSER_PROTECTED_MODE, NULL, NULL);
  bool is_protected_mode = HookProcessor::GetFlagValue();
  return is_protected_mode;
}

bool DocumentHost::SetFocusToBrowser() {
  LOG(TRACE) << "Entering DocumentHost::SetFocusToBrowser";

  HWND top_level_window_handle = this->GetTopLevelWindowHandle();
  HWND foreground_window = ::GetAncestor(::GetForegroundWindow(), GA_ROOT);
  if (foreground_window != top_level_window_handle) {
    LOG(TRACE) << "Top-level IE window is " << top_level_window_handle
               << " foreground window is " << foreground_window;
    CComPtr<IUIAutomation> ui_automation;
    HRESULT hr = ::CoCreateInstance(CLSID_CUIAutomation,
                                    NULL,
                                    CLSCTX_INPROC_SERVER,
                                    IID_IUIAutomation,
                                    reinterpret_cast<void**>(&ui_automation));
    if (SUCCEEDED(hr)) {
      LOG(TRACE) << "Using UI Automation to set window focus";
      CComPtr<IUIAutomationElement> parent_window;
      hr = ui_automation->ElementFromHandle(top_level_window_handle,
        &parent_window);
      if (SUCCEEDED(hr)) {
        CComPtr<IUIAutomationWindowPattern> window_pattern;
        hr = parent_window->GetCurrentPatternAs(UIA_WindowPatternId,
          IID_PPV_ARGS(&window_pattern));
        if (SUCCEEDED(hr)) {
          BOOL is_topmost;
          hr = window_pattern->get_CurrentIsTopmost(&is_topmost);
          WindowVisualState visual_state;
          hr = window_pattern->get_CurrentWindowVisualState(&visual_state);
          if (visual_state == WindowVisualState::WindowVisualState_Maximized ||
            visual_state == WindowVisualState::WindowVisualState_Normal) {
            parent_window->SetFocus();
            window_pattern->SetWindowVisualState(visual_state);
          }
        }
      }
    }
  }

  foreground_window = ::GetAncestor(::GetForegroundWindow(), GA_ROOT);
  if (foreground_window != top_level_window_handle) {
    HWND content_window_handle = this->GetContentWindowHandle();
    LOG(TRACE) << "Top-level IE window is " << top_level_window_handle
               << " foreground window is " << foreground_window;
    LOG(TRACE) << "Window still not in foreground; "
               << "attempting to use SetForegroundWindow API";
    UINT_PTR lock_timeout = 0;
    DWORD process_id = 0;
    DWORD thread_id = ::GetWindowThreadProcessId(top_level_window_handle,
                                                 &process_id);
    DWORD current_thread_id = ::GetCurrentThreadId();
    DWORD current_process_id = ::GetCurrentProcessId();
    if (current_thread_id != thread_id) {
      ::AttachThreadInput(current_thread_id, thread_id, TRUE);
      ::SystemParametersInfo(SPI_GETFOREGROUNDLOCKTIMEOUT,
                             0,
                             &lock_timeout,
                             0);
      ::SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT,
                             0,
                             0,
                             SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
      HookSettings hook_settings;
      hook_settings.hook_procedure_name = "AllowSetForegroundProc";
      hook_settings.hook_procedure_type = WH_CALLWNDPROC;
      hook_settings.window_handle = content_window_handle;
      hook_settings.communication_type = OneWay;

      HookProcessor hook;
      if (!hook.CanSetWindowsHook(content_window_handle)) {
        LOG(WARN) << "Setting window focus may fail because driver and browser "
                  << "are not the same bit-ness.";
        return false;
      }
      hook.Initialize(hook_settings);
      ::SendMessage(content_window_handle,
                    WD_ALLOW_SET_FOREGROUND,
                    NULL,
                    NULL);
      hook.Dispose();
    }
    ::SetForegroundWindow(top_level_window_handle);
    ::Sleep(100);
    if (current_thread_id != thread_id) {
      ::SystemParametersInfo(SPI_SETFOREGROUNDLOCKTIMEOUT,
                             0,
                             reinterpret_cast<void*>(lock_timeout),
                             SPIF_SENDWININICHANGE | SPIF_UPDATEINIFILE);
      ::AttachThreadInput(current_thread_id, thread_id, FALSE);
    }
  }
  foreground_window = ::GetAncestor(::GetForegroundWindow(), GA_ROOT);
  return foreground_window == top_level_window_handle;
}


} // namespace webdriver

#ifdef __cplusplus
extern "C" {
#endif

LRESULT CALLBACK ProtectedModeWndProc(int nCode, WPARAM wParam, LPARAM lParam) {
  CWPSTRUCT* call_window_proc_struct = reinterpret_cast<CWPSTRUCT*>(lParam);
  if (WD_IS_BROWSER_PROTECTED_MODE == call_window_proc_struct->message) {
    BOOL is_protected_mode = FALSE;
    HRESULT hr = ::IEIsProtectedModeProcess(&is_protected_mode);
    webdriver::HookProcessor::SetFlagValue(is_protected_mode == TRUE);
  }
  return ::CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK AllowSetForegroundProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if ((nCode == HC_ACTION) && (wParam == PM_REMOVE)) {
    MSG* msg = reinterpret_cast<MSG*>(lParam);
    if (msg->message == WD_ALLOW_SET_FOREGROUND) {
      ::AllowSetForegroundWindow(ASFW_ANY);
    }
  }

  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

#ifdef __cplusplus
}
#endif
