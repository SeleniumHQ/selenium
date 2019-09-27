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

#include "HtmlDialog.h"

#include "errorcodes.h"
#include "logging.h"

#include "BrowserFactory.h"
#include "StringUtilities.h"
#include "WebDriverConstants.h"

#define HIDDEN_PARENT_WINDOW_CLASS "Internet Explorer_Hidden"

namespace webdriver {

HtmlDialog::HtmlDialog(IHTMLWindow2* window, HWND hwnd, HWND session_handle) : DocumentHost(hwnd, session_handle) {
  LOG(TRACE) << "Entering HtmlDialog::HtmlDialog";
  this->is_navigating_ = false;
  this->window_ = window;
  this->AttachEvents();
}

HtmlDialog::~HtmlDialog(void) {
}

void HtmlDialog::AttachEvents() {
  CComPtr<IUnknown> unknown;
  this->window_->QueryInterface<IUnknown>(&unknown);
  HRESULT hr = this->DispEventAdvise(unknown);
}

void HtmlDialog::DetachEvents() {
  LOG(TRACE) << "Entering HtmlDialog::DetachEvents";
  CComPtr<IUnknown> unknown;
  this->window_->QueryInterface<IUnknown>(&unknown);
  HRESULT hr = this->DispEventUnadvise(unknown);
}

void __stdcall HtmlDialog::OnBeforeUnload(IHTMLEventObj *pEvtObj) {
  LOG(TRACE) << "Entering HtmlDialog::OnBeforeUnload";
  this->is_navigating_ = true;
}

void __stdcall HtmlDialog::OnLoad(IHTMLEventObj *pEvtObj) {
  LOG(TRACE) << "Entering HtmlDialog::OnLoad";
  this->is_navigating_ = false;
}

void HtmlDialog::GetDocument(IHTMLDocument2** doc) {
  this->GetDocument(false, doc);
}

void HtmlDialog::GetDocument(const bool force_top_level_document,
                             IHTMLDocument2** doc) {
  LOG(TRACE) << "Entering HtmlDialog::GetDocument";
  HRESULT hr = S_OK;
  if (this->focused_frame_window() == NULL || force_top_level_document) {
    hr = this->window_->get_document(doc);
  } else {
    hr = this->focused_frame_window()->get_document(doc);
  }

  if (FAILED(hr)) {
    LOGHR(DEBUG, hr) << "Unable to get document";
  }
}

void HtmlDialog::Close() {
  LOG(TRACE) << "Entering HtmlDialog::Close";
  if (!this->is_closing()) {
    this->is_navigating_ = false;
    this->set_is_closing(true);
    // Closing the browser, so having focus on a frame doesn't
    // make any sense.
    this->SetFocusedFrameByElement(NULL);
    this->DetachEvents();
    this->window_->close();

    // Must manually release the CComPtr<IHTMLWindow> so that the
    // destructor will not try to release a no-longer-valid object.
    this->window_.Release();
    this->window_ = NULL;

    this->PostQuitMessage();
  }
}

bool HtmlDialog::IsValidWindow() {
  LOG(TRACE) << "Entering HtmlDialog::IsValidWindow";
  // If the window handle is no longer valid, the window is closing,
  // and we must post the quit message.
  if (!::IsWindow(this->GetTopLevelWindowHandle())) {
    this->is_navigating_ = false;
    this->DetachEvents();
    this->PostQuitMessage();
    return false;
  }
  return true;
}

bool HtmlDialog::SetFullScreen(bool is_full_screen) {
  return false;
}

bool HtmlDialog::IsFullScreen() {
  return false;
}

bool HtmlDialog::IsBusy() {
  LOG(TRACE) << "Entering HtmlDialog::IsBusy";
  return false;
}

bool HtmlDialog::Wait(const std::string& page_load_strategy) {
  LOG(TRACE) << "Entering HtmlDialog::Wait";
  // If the window is no longer valid, the window is closing,
  // and the wait is completed.
  if (!this->is_closing() && !this->IsValidWindow()) {
    return true;
  }

  // Check to see if a new dialog has opened up on top of this one.
  // If so, the wait is completed, no matter whether the OnUnload
  // event has fired signaling navigation started, nor whether the
  // OnLoad event has fired signaling navigation complete. Set the
  // flag so that the Wait method is no longer called.
  HWND child_dialog_handle = this->GetActiveDialogWindowHandle();
  if (child_dialog_handle != NULL) {
    this->is_navigating_ = false;
    this->set_wait_required(false);
    return true;
  }

  // Otherwise, we wait a short amount and see if navigation is complete
  // (signaled by the OnLoad event firing).
  ::Sleep(250);
  return !this->is_navigating_;
}

HWND HtmlDialog::GetContentWindowHandle() {
  LOG(TRACE) << "Entering HtmlDialog::GetContentWindowHandle";
  return this->window_handle();
}

HWND HtmlDialog::GetBrowserWindowHandle() {
  LOG(TRACE) << "Entering HtmlDialog::GetBrowserWindowHandle";
  return this->window_handle();
}

std::string HtmlDialog::GetWindowName() {
  LOG(TRACE) << "Entering HtmlDialog::GetWindowName";
  return "";
}

std::string HtmlDialog::GetBrowserUrl() {
  LOG(TRACE) << "Entering HtmlDialog::GetBrowserUrl";
  return "";
}

std::string HtmlDialog::GetTitle() {
  LOG(TRACE) << "Entering HtmlDialog::GetTitle";
  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
  CComBSTR title;
  HRESULT hr = doc->get_title(&title);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document title";
    return "";
  }

  std::wstring converted_title = title;
  std::string title_string = StringUtilities::ToString(converted_title);
  return title_string;
}

HWND HtmlDialog::GetTopLevelWindowHandle(void) {
  LOG(TRACE) << "Entering HtmlDialog::GetTopLevelWindowHandle";
  HWND parent_handle = ::GetParent(this->window_handle());

  // "Internet Explorer_Hidden\0" == 25
  std::vector<char> parent_class_buffer(25);
  if (::GetClassNameA(parent_handle, &parent_class_buffer[0], 25)) {
    if (strcmp(HIDDEN_PARENT_WINDOW_CLASS, &parent_class_buffer[0]) == 0) {
      // Some versions of Internet Explorer re-parent a closing showModalDialog
      // window to a hidden parent window. If that is what we see happening
      // here, that will be equivalent to the parent window no longer being
      // valid, and we can return an invalid handle, indicating the window is
      // "closed."
      return NULL;
    }
  }
  return parent_handle;
}

HWND HtmlDialog::GetActiveDialogWindowHandle() {
  LOG(TRACE) << "Entering HtmlDialog::GetActiveDialogWindowHandle";
  DialogWindowInfo info;
  info.hwndOwner = this->GetTopLevelWindowHandle();
  info.hwndDialog = NULL;
  if (info.hwndOwner != NULL) {
    ::EnumWindows(&HtmlDialog::FindChildDialogWindow, reinterpret_cast<LPARAM>(&info));
  }
  if (info.hwndDialog != NULL) {
    std::vector<char> window_class_name(34);
    if (::GetClassNameA(info.hwndDialog, &window_class_name[0], 34)) {
      if (strcmp(HTML_DIALOG_WINDOW_CLASS, &window_class_name[0]) == 0) {
        HWND content_window_handle = this->FindContentWindowHandle(info.hwndDialog);
        if (content_window_handle != NULL) {
          // Must have a sleep here to give IE a chance to draw the window.
          ::Sleep(250);
          ::PostMessage(this->executor_handle(),
                        WD_NEW_HTML_DIALOG,
                        NULL,
                        reinterpret_cast<LPARAM>(content_window_handle));
        }
      }
    }
  }
  return info.hwndDialog;
}

long HtmlDialog::GetWidth() {
  LOG(TRACE) << "Entering HtmlDialog::GetWidth";
  // TODO: calculate width
  return 0L;
}

long HtmlDialog::GetHeight() {
  LOG(TRACE) << "Entering HtmlDialog::GetHeight";
  // TODO: calculate height
  return 0L;
}

void HtmlDialog::SetWidth(long width) { 
  LOG(TRACE) << "Entering HtmlDialog::SetWidth";
}

void HtmlDialog::SetHeight(long height) {
  LOG(TRACE) << "Entering HtmlDialog::SetHeight";
}

int HtmlDialog::NavigateToUrl(const std::string& url) {
  LOG(TRACE) << "Entering HtmlDialog::NavigateToUrl";
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

int HtmlDialog::NavigateBack() {
  LOG(TRACE) << "Entering HtmlDialog::NavigateBack";
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

int HtmlDialog::NavigateForward() {
  LOG(TRACE) << "Entering HtmlDialog::NavigateForward";
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

int HtmlDialog::Refresh() {
  LOG(TRACE) << "Entering HtmlDialog::Refresh";
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

BOOL CALLBACK HtmlDialog::FindChildDialogWindow(HWND hwnd, LPARAM arg) {
  DialogWindowInfo* window_info = reinterpret_cast<DialogWindowInfo*>(arg);
  if (::GetWindow(hwnd, GW_OWNER) != window_info->hwndOwner) {
    return TRUE;
  }
  std::vector<char> window_class_name(34);
  if (::GetClassNameA(hwnd, &window_class_name[0], 34) == 0) {
    // No match found. Skip
    return TRUE;
  }
  if (strcmp(ALERT_WINDOW_CLASS, &window_class_name[0]) != 0 && 
      strcmp(HTML_DIALOG_WINDOW_CLASS, &window_class_name[0]) != 0) {
    return TRUE;
  } else {
    // If the window style has the WS_DISABLED bit set or the 
    // WS_VISIBLE bit unset, it can't  be handled via the UI, 
    // and must not be a visible dialog.
    if ((::GetWindowLong(hwnd, GWL_STYLE) & WS_DISABLED) != 0 ||
        (::GetWindowLong(hwnd, GWL_STYLE) & WS_VISIBLE) == 0) {
      return TRUE;
    }
  }
  window_info->hwndDialog = hwnd;
  return FALSE;
}

} // namespace webdriver
