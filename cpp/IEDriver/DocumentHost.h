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

#ifndef WEBDRIVER_IE_DOCUMENTHOST_H_
#define WEBDRIVER_IE_DOCUMENTHOST_H_

#include <string>
#include <memory>
#include "BrowserFactory.h"
#include "ErrorCodes.h"
#include "Script.h"

#define EELEMENTCLICKPOINTNOTSCROLLED 100

using namespace std;

namespace webdriver {

class DocumentHost {
 public:
  DocumentHost(HWND hwnd, HWND executor_handle);
  virtual ~DocumentHost(void);

  virtual void GetDocument(IHTMLDocument2** doc) = 0;
  virtual void Close(void) = 0;
  virtual bool Wait(void) = 0;
  virtual bool IsBusy(void) = 0;
  virtual HWND GetWindowHandle(void) = 0;
  virtual std::string GetWindowName(void) = 0;
  virtual std::string GetTitle(void) = 0;
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

  std::string GetCurrentUrl(void);
  std::string GetPageSource(void);

  void GetCookies(std::map<std::string, std::string>* cookies);
  int AddCookie(const std::string& cookie);
  int DeleteCookie(const std::string& cookie_name);
  
  int SetFocusedFrameByIndex(const int frame_index);
  int SetFocusedFrameByName(const std::string& frame_name);
  int SetFocusedFrameByElement(IHTMLElement* frame_element);

  bool wait_required(void) const { return this->wait_required_; }
  void set_wait_required(const bool value) { this->wait_required_ = value; }

  bool is_closing(void) const { return this->is_closing_; }

  std::string browser_id(void) const { return this->browser_id_; }
  HWND window_handle(void) const { return this->window_handle_; }

 protected:
  void PostQuitMessage(void);
  HWND FindContentWindowHandle(HWND top_level_window_handle);

  void set_window_handle(const HWND window_handle) { 
    this->window_handle_ = window_handle; 
  }

  HWND executor_handle(void) const { return this->executor_handle_; }

  void set_is_closing(const bool value) { this->is_closing_ = value; }

  IHTMLWindow2* focused_frame_window(void) { 
    return this->focused_frame_window_;
  }

 private:
  bool IsHtmlPage(IHTMLDocument2* doc);

  BrowserFactory factory_;
  CComPtr<IHTMLWindow2> focused_frame_window_;
  HWND window_handle_;
  HWND executor_handle_;
  std::string browser_id_;
  bool wait_required_;
  bool is_closing_;
};

typedef std::tr1::shared_ptr<DocumentHost> BrowserHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_DOCUMENTHOST_H_
