/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#ifndef JOBBIE_IESINK_H_
#define JOBBIE_IESINK_H_

#include <exdispid.h>
#include <mshtml.h>

class IeThread;

class IeSink : 
	public IDispEventSimpleImpl<1, IeSink, &DIID_DWebBrowserEvents2>
{
 public:
	IeSink();
	~IeSink();
	
	static inline _ATL_FUNC_INFO* BeforeNavigate2Info() {
	  static _ATL_FUNC_INFO kBeforeNavigate2 = { CC_STDCALL, VT_EMPTY, 7,
        { VT_DISPATCH, VT_VARIANT | VT_BYREF, VT_VARIANT | VT_BYREF, VT_VARIANT | VT_BYREF, VT_VARIANT | VT_BYREF, VT_VARIANT | VT_BYREF, VT_BOOL | VT_BYREF } };
	  return &kBeforeNavigate2;
	}

	static inline _ATL_FUNC_INFO* DocumentCompleteInfo() {
      static _ATL_FUNC_INFO kDocumentComplete = { CC_STDCALL, VT_EMPTY, 2, { VT_DISPATCH, VT_VARIANT|VT_BYREF } };
	  return &kDocumentComplete;
	}

	static inline _ATL_FUNC_INFO* NoArgumentsInfo() {
	  static _ATL_FUNC_INFO kNoArguments = { CC_STDCALL, VT_EMPTY, 0 };
	  return &kNoArguments;
	}

	BEGIN_SINK_MAP(IeSink)
	 SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_BEFORENAVIGATE2, BeforeNavigate2, BeforeNavigate2Info())
	 SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_DOCUMENTCOMPLETE, DocumentComplete, DocumentCompleteInfo())
	 SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_DOWNLOADBEGIN, DownloadBegin, NoArgumentsInfo())
	 SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_DOWNLOADCOMPLETE, DownloadComplete, NoArgumentsInfo())
	 SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_ONQUIT, OnQuit, NoArgumentsInfo())
	END_SINK_MAP()

	STDMETHOD_(void, BeforeNavigate2)(IDispatch * pObject, VARIANT * pvarUrl, VARIANT * pvarFlags,
        VARIANT * pvarTargetFrame, VARIANT * pvarData, VARIANT * pvarHeaders, VARIANT_BOOL * pbCancel);
    STDMETHOD_(void, DocumentComplete)(IDispatch *pDisp,VARIANT *URL);
	STDMETHOD_(void, OnQuit)();
	STDMETHOD_(void, DownloadBegin)();
	STDMETHOD_(void, DownloadComplete)();

 public:
	void ConnectionAdvise();
	void ConnectionUnAdvise();

	IeThread *p_Thread;
};

#endif // JOBBIE_IESINK_H_