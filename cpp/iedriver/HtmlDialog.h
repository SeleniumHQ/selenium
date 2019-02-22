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

#ifndef WEBDRIVER_IE_HTMLDIALOG_H_
#define WEBDRIVER_IE_HTMLDIALOG_H_

#include <mshtml.h>
#include <mshtmdid.h>

#include "DocumentHost.h"
#include "messages.h"

namespace webdriver {

struct DialogWindowInfo {
  HWND hwndOwner;
  HWND hwndDialog;
};

class HtmlDialog : public DocumentHost, public IDispEventSimpleImpl<1, HtmlDialog, &DIID_HTMLWindowEvents2>  {
 public:
  HtmlDialog(IHTMLWindow2* window, HWND hwnd, HWND session_handle);
  virtual ~HtmlDialog(void);

  static inline _ATL_FUNC_INFO* DocEventInfo() {
    static _ATL_FUNC_INFO kDocEvent = { CC_STDCALL, VT_EMPTY, 1, { VT_DISPATCH } };
    return &kDocEvent;
  }

  BEGIN_SINK_MAP(HtmlDialog)
    SINK_ENTRY_INFO(1, DIID_HTMLWindowEvents2, DISPID_HTMLWINDOWEVENTS2_ONBEFOREUNLOAD, OnBeforeUnload, DocEventInfo())
    SINK_ENTRY_INFO(1, DIID_HTMLWindowEvents2, DISPID_HTMLWINDOWEVENTS2_ONLOAD, OnLoad, DocEventInfo())
  END_SINK_MAP()

  STDMETHOD_(void, OnBeforeUnload)(IHTMLEventObj* pEvtObj);
  STDMETHOD_(void, OnLoad)(IHTMLEventObj* pEvtObj);

  void GetDocument(const bool force_top_level_document,
                   IHTMLDocument2** doc);
  void GetDocument(IHTMLDocument2** doc);
  void Close(void);
  bool Wait(const std::string& page_load_strategy);
  bool IsBusy(void);
  HWND GetContentWindowHandle(void);
  HWND GetBrowserWindowHandle(void);
  std::string GetWindowName(void);
  std::string GetTitle(void);
  std::string GetBrowserUrl(void);
  HWND GetActiveDialogWindowHandle(void);
  HWND GetTopLevelWindowHandle(void);

  long GetWidth(void);
  long GetHeight(void);
  void SetWidth(long width);
  void SetHeight(long height);

  int NavigateToUrl(const std::string& url);
  int NavigateBack(void);
  int NavigateForward(void);
  int Refresh(void);

  bool IsValidWindow(void);

  bool IsFullScreen(void);
  bool SetFullScreen(bool is_full_screen);

  void InitiateBrowserReattach(void) {};
  void ReattachBrowser(IWebBrowser2* browser) {};

  IWebBrowser2* browser(void) { return NULL; }

 private:
  static BOOL CALLBACK FindChildDialogWindow(HWND hwnd, LPARAM arg);

  void AttachEvents(void);
  void DetachEvents(void);

  bool is_navigating_;
  CComPtr<IHTMLWindow2> window_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_HTMLDIALOG_H_
