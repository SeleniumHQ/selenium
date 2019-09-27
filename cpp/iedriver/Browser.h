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

#ifndef WEBDRIVER_IE_BROWSER_H_
#define WEBDRIVER_IE_BROWSER_H_

#include <string>
#include <vector>

#include <exdispid.h>
#include <mshtml.h>

#include "DocumentHost.h"

namespace webdriver {

struct BrowserReattachInfo {
  DWORD current_process_id;
  std::vector<DWORD> known_process_ids;
  std::string browser_id;
};

struct NewWindowInfo {
  std::string target_url;
  LPSTREAM browser_stream;
};

// Forward declaration of classes to avoid
// circular include files.
class ElementRepository;

class Browser : public DocumentHost, public IDispEventSimpleImpl<1, Browser, &DIID_DWebBrowserEvents2> {
 public:
  Browser(IWebBrowser2* browser, HWND hwnd, HWND session_handle);
  virtual ~Browser(void);

  static inline _ATL_FUNC_INFO* BeforeNavigate2Info() {
    static _ATL_FUNC_INFO kBeforeNavigate2 = { CC_STDCALL,
                                               VT_EMPTY,
                                               7,
                                               { VT_DISPATCH,
                                                 VT_VARIANT | VT_BYREF,
                                                 VT_VARIANT | VT_BYREF,
                                                 VT_VARIANT | VT_BYREF,
                                                 VT_VARIANT | VT_BYREF,
                                                 VT_VARIANT | VT_BYREF,
                                                 VT_BOOL | VT_BYREF } };
    return &kBeforeNavigate2;
  }

  static inline _ATL_FUNC_INFO* DocumentCompleteInfo() {
    static _ATL_FUNC_INFO kDocumentComplete = { CC_STDCALL,
                                                VT_EMPTY,
                                                2,
                                                { VT_DISPATCH,
                                                  VT_VARIANT|VT_BYREF } };
    return &kDocumentComplete;
  }

  static inline _ATL_FUNC_INFO* NoArgumentsInfo() {
    static _ATL_FUNC_INFO kNoArguments = { CC_STDCALL, VT_EMPTY, 0 };
    return &kNoArguments;
  }

  static inline _ATL_FUNC_INFO* NewWindow3Info() {
    static _ATL_FUNC_INFO kNewWindow3 = { CC_STDCALL, VT_EMPTY, 5,
                                          { VT_DISPATCH | VT_BYREF, 
                                            VT_BOOL | VT_BYREF, 
                                            VT_I4,
                                            VT_BSTR,
                                            VT_BSTR } };
    return &kNewWindow3;
  }

  static inline _ATL_FUNC_INFO* NewProcessInfo() {
    static _ATL_FUNC_INFO kNewProcess = { CC_STDCALL, VT_EMPTY, 3,
                                          { VT_I4,
                                            VT_DISPATCH,
                                            VT_BOOL | VT_BYREF } };
    return &kNewProcess;
  }

  BEGIN_SINK_MAP(Browser)
    SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_BEFORENAVIGATE2, BeforeNavigate2, BeforeNavigate2Info())
    SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_DOCUMENTCOMPLETE, DocumentComplete, DocumentCompleteInfo())
    SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_ONQUIT, OnQuit, NoArgumentsInfo())
    SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_NEWWINDOW3, NewWindow3, NewWindow3Info())
    SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_NEWPROCESS, NewProcess, NewProcessInfo())
  END_SINK_MAP()

  STDMETHOD_(void, BeforeNavigate2)(IDispatch* pObject, VARIANT* pvarUrl, VARIANT* pvarFlags,
    VARIANT* pvarTargetFrame, VARIANT* pvarData, VARIANT* pvarHeaders, VARIANT_BOOL* pbCancel);
  STDMETHOD_(void, DocumentComplete)(IDispatch* pDisp, VARIANT* URL);
  STDMETHOD_(void, OnQuit)();
  STDMETHOD_(void, NewWindow3)(IDispatch** ppDisp, VARIANT_BOOL* pbCancel, DWORD dwFlags, BSTR bstrUrlContext, BSTR bstrUrl);
  STDMETHOD_(void, NewProcess)(DWORD lCauseFlag, IDispatch* pWB2, VARIANT_BOOL* pbCancel);

  bool Wait(const std::string& page_load_strategy);
  void Close(void);
  bool IsBusy(void);
  void GetDocument(const bool force_top_level_document,
                   IHTMLDocument2** doc);
  void GetDocument(IHTMLDocument2** doc);
  std::string GetWindowName(void);
  std::string GetTitle(void);
  std::string GetBrowserUrl(void);
  HWND GetContentWindowHandle(void);
  HWND GetBrowserWindowHandle(void);
  HWND GetTopLevelWindowHandle(void);
  HWND GetActiveDialogWindowHandle(void);

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

  void InitiateBrowserReattach(void);
  void ReattachBrowser(IWebBrowser2* browser);

  bool is_explicit_close_requested(void) const {
    return this->is_explicit_close_requested_;
  }
  IWebBrowser2* browser(void) { return this->browser_; }

 private:
  void AttachEvents(void);
  void DetachEvents(void);
  bool IsDocumentNavigating(const std::string& page_load_strategy,
                            IHTMLDocument2* doc);
  bool GetDocumentFromWindow(IHTMLWindow2* window, IHTMLDocument2** doc);
  void CheckDialogType(HWND dialog_window_handle);

  static unsigned int WINAPI GoBackThreadProc(LPVOID param);
  static unsigned int WINAPI GoForwardThreadProc(LPVOID param);

  CComPtr<IWebBrowser2> browser_;
  bool is_navigation_started_;
  bool is_explicit_close_requested_;
  std::vector<DWORD> known_process_ids_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSER_H_
