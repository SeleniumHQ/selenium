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

#include "HtmlDialog.h"
#include "logging.h"

namespace webdriver {

HtmlDialog::HtmlDialog(IHTMLWindow2* window, HWND hwnd, HWND session_handle) : DocumentHost(hwnd, session_handle) {
  this->is_navigating_ = false;
  this->window_ = window;
  this->AttachEvents();
}

HtmlDialog::~HtmlDialog(void) {
}

void HtmlDialog::AttachEvents() {
  CComQIPtr<IDispatch> dispatch(this->window_);
  CComPtr<IUnknown> unknown(dispatch);
  HRESULT hr = this->DispEventAdvise(unknown);
}

void HtmlDialog::DetachEvents() {
  CComQIPtr<IDispatch> dispatch(this->window_);
  CComPtr<IUnknown> unknown(dispatch);
  HRESULT hr = this->DispEventUnadvise(unknown);
}

void __stdcall HtmlDialog::OnBeforeUnload(IHTMLEventObj *pEvtObj) {
  this->is_navigating_ = true;
}

void __stdcall HtmlDialog::OnLoad(IHTMLEventObj *pEvtObj) {
  this->is_navigating_ = false;
}

void HtmlDialog::GetDocument(IHTMLDocument2** doc) {
  this->window_->get_document(doc);
}

void HtmlDialog::Close() {
  if (!this->is_closing()) {
    this->is_navigating_ = false;
    this->DetachEvents();
    this->window_->close();

    // Must manually release the CComPtr<IHTMLWindow> so that the
    // destructor will not try to release a no-longer-valid object.
    this->window_.Release();
    this->window_ = NULL;

    this->PostQuitMessage();
  }
}

bool HtmlDialog::Wait() {
  // If the window handle is no longer valid, the window is closing,
  // the wait is completed, and we must post the quit message.
  if (!this->is_closing() && !::IsWindow(this->GetTopLevelWindowHandle())) {
    this->is_navigating_ = false;
    this->DetachEvents();
    this->PostQuitMessage();
    return true;
  }

  // If we're not navigating to a new location, we should check to see if
  // a new modal dialog has been opened. If one has, the wait is complete,
  // so we must set the flag indicating to the message loop not to call wait
  // anymore.
  if (!this->is_navigating_) {
    HWND child_dialog_handle = this->GetActiveDialogWindowHandle();
    if (child_dialog_handle != NULL) {
      HWND content_window_handle = this->FindContentWindowHandle(child_dialog_handle);
      if (content_window_handle != NULL) {
        // Must have a sleep here to give IE a chance to draw the window.
        ::Sleep(250);
        ::PostMessage(this->executor_handle(),
                      WD_NEW_HTML_DIALOG,
                      NULL,
                      reinterpret_cast<LPARAM>(content_window_handle));
        this->set_wait_required(false);
        return true;
      }
    }
  }

  // Otherwise, we wait until navigation is complete.
  ::Sleep(250);
  return !this->is_navigating_;
}

HWND HtmlDialog::GetWindowHandle() {
  return this->window_handle();
}

std::string HtmlDialog::GetWindowName() {
  return "";
}

std::string HtmlDialog::GetTitle() {
  CComPtr<IHTMLDocument2> doc;
  this->GetDocument(&doc);
  CComBSTR title;
  HRESULT hr = doc->get_title(&title);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get document title";
    return "";
  }

  std::string title_string = CW2A(title, CP_UTF8);
  return title_string;
}

HWND HtmlDialog::GetTopLevelWindowHandle(void) {
  return ::GetParent(this->window_handle());
}

HWND HtmlDialog::GetActiveDialogWindowHandle() {
  DialogWindowInfo info;
  info.hwndOwner = this->GetTopLevelWindowHandle();
  info.hwndDialog = NULL;
  ::EnumWindows(&HtmlDialog::FindChildDialogWindow, reinterpret_cast<LPARAM>(&info));
  return info.hwndDialog;
}

long HtmlDialog::GetWidth() {
  // TODO: calculate width
  return 0L;
}

long HtmlDialog::GetHeight() {
  // TODO: calculate height
  return 0L;
}

void HtmlDialog::SetWidth(long width) { 
}

void HtmlDialog::SetHeight(long height) {
}

int HtmlDialog::NavigateToUrl(const std::string& url) {
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

int HtmlDialog::NavigateBack() {
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

int HtmlDialog::NavigateForward() {
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

int HtmlDialog::Refresh() {
  // Cannot force navigation on windows opened with showModalDialog();
  return ENOTIMPLEMENTED;
}

BOOL CALLBACK HtmlDialog::FindChildDialogWindow(HWND hwnd, LPARAM arg) {
  DialogWindowInfo* window_info = reinterpret_cast<DialogWindowInfo*>(arg);
  if (::GetWindow(hwnd, GW_OWNER) == window_info->hwndOwner) {
    vector<char> window_class_name(34);
    if (GetClassNameA(hwnd, &window_class_name[0], 34)) {
      if (strcmp("Internet Explorer_TridentDlgFrame",
          &window_class_name[0]) == 0) {
        window_info->hwndDialog = hwnd;
        return FALSE;
      }
    }
  }
  return TRUE;
}

} // namespace webdriver
