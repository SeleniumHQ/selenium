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

#ifndef WEBDRIVER_IE_HTMLDIALOG_H_
#define WEBDRIVER_IE_HTMLDIALOG_H_

#include <exdispid.h>
#include <exdisp.h>
#include <mshtml.h>
#include <mshtmdid.h>
#include "DocumentHost.h"
#include "messages.h"
#include "BrowserFactory.h"

using namespace std;

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

  void GetDocument(IHTMLDocument2** doc);
  void Close(void);
  bool Wait(void);
  bool IsBusy(void);
  HWND GetWindowHandle(void);
  std::string GetWindowName(void);
  std::string GetTitle(void);
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

private:
  static BOOL CALLBACK FindChildDialogWindow(HWND hwnd, LPARAM arg);

  void AttachEvents(void);
  void DetachEvents(void);

  bool is_navigating_;
  CComPtr<IHTMLWindow2> window_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_HTMLDIALOG_H_
