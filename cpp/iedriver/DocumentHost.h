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

#ifndef WEBDRIVER_IE_DOCUMENTHOST_H_
#define WEBDRIVER_IE_DOCUMENTHOST_H_

#include <map>
#include <memory>
#include <string>

#include "LocationInfo.h"

namespace webdriver {

// Forward declaration of classes.
class BrowserCookie;
class CookieManager;

class DocumentHost {
 public:
  DocumentHost(HWND hwnd, HWND executor_handle);
  virtual ~DocumentHost(void);

  virtual void GetDocument(const bool force_top_level_document,
                           IHTMLDocument2** doc) = 0;
  virtual void GetDocument(IHTMLDocument2** doc) = 0;
  virtual void Close(void) = 0;
  virtual bool Wait(const std::string& page_load_strategy) = 0;
  virtual bool IsBusy(void) = 0;
  virtual HWND GetContentWindowHandle(void) = 0;
  virtual HWND GetBrowserWindowHandle(void) = 0;
  virtual std::string GetWindowName(void) = 0;
  virtual std::string GetTitle(void) = 0;
  virtual std::string GetBrowserUrl(void) = 0;
  virtual HWND GetActiveDialogWindowHandle(void) = 0;
  virtual HWND GetTopLevelWindowHandle(void) = 0;

  virtual long GetWidth(void) = 0;
  virtual long GetHeight(void) = 0;
  virtual void SetWidth(long width) = 0;
  virtual void SetHeight(long height) = 0;

  virtual int NavigateToUrl(const std::string& url) = 0;
  virtual int NavigateBack(void) = 0;
  virtual int NavigateForward(void) = 0;
  virtual int Refresh(void) = 0;

  virtual bool IsValidWindow(void) = 0;

  virtual bool IsFullScreen(void) = 0;
  virtual bool SetFullScreen(bool is_full_screen) = 0;
  void Restore(void);

  virtual bool IsProtectedMode(void);
  virtual bool IsCrossZoneUrl(std::string url);
  virtual void InitiateBrowserReattach(void) = 0;
  virtual void ReattachBrowser(IWebBrowser2* browser) = 0;

  virtual IWebBrowser2* browser(void) = 0;

  std::string GetCurrentUrl(void);
  std::string GetPageSource(void);

  static int GetDocumentMode(IHTMLDocument2* doc);
  static bool IsStandardsMode(IHTMLDocument2* doc);
  static bool GetDocumentDimensions(IHTMLDocument2* doc, LocationInfo* info);

  int SetFocusedFrameByIndex(const int frame_index);
  int SetFocusedFrameByName(const std::string& frame_name);
  int SetFocusedFrameByElement(IHTMLElement* frame_element);
  void SetFocusedFrameToParent(void);
  bool SetFocusToBrowser(void);

  bool wait_required(void) const { return this->wait_required_; }
  void set_wait_required(const bool value) { this->wait_required_ = value; }

  bool script_wait_required(void) const { return this->script_wait_required_; }
  void set_script_wait_required(const bool value) { this->script_wait_required_ = value; }

  HWND script_executor_handle(void) const { return this->script_executor_handle_; }
  void set_script_executor_handle(HWND value) { this->script_executor_handle_ = value; }

  bool is_closing(void) const { return this->is_closing_; }
  bool is_awaiting_new_process(void) const { return this->is_awaiting_new_process_; }

  std::string browser_id(void) const { return this->browser_id_; }
  HWND window_handle(void) const { return this->window_handle_; }
  CookieManager* cookie_manager(void) { return this->cookie_manager_; }

 protected:
  void PostQuitMessage(void);
  HWND FindContentWindowHandle(HWND top_level_window_handle);

  void set_window_handle(const HWND window_handle) { 
    this->window_handle_ = window_handle; 
  }

  HWND executor_handle(void) const { return this->executor_handle_; }

  void set_is_closing(const bool value) { this->is_closing_ = value; }
  void set_is_awaiting_new_process(const bool value) {
    this->is_awaiting_new_process_ = value;
  }

  IHTMLWindow2* focused_frame_window(void) { 
    return this->focused_frame_window_;
  }

 private:
  int SetFocusedFrameByIdentifier(VARIANT frame_identifier);

  CookieManager* cookie_manager_;
  CComPtr<IHTMLWindow2> focused_frame_window_;
  HWND window_handle_;
  HWND executor_handle_;
  HWND script_executor_handle_;
  std::string browser_id_;
  bool wait_required_;
  bool script_wait_required_;
  bool is_closing_;
  bool is_awaiting_new_process_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_DOCUMENTHOST_H_
