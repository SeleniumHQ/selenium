#ifndef WEBDRIVER_IE_BROWSERWRAPPER_H_
#define WEBDRIVER_IE_BROWSERWRAPPER_H_

#include <exdispid.h>
#include <exdisp.h>
#include <mshtml.h>
#include <rpc.h>
#include <iostream>
#include <queue>
#include <string>
#include "json.h"
#include "BrowserFactory.h"
#include "BrowserWrapperEvent.h"
#include "CommandValues.h"
#include "ErrorCodes.h"
#include "ScriptWrapper.h"

#define SCRIPT_ARGTYPE_STRING 0
#define SCRIPT_ARGTYPE_INT 1
#define SCRIPT_ARGTYPE_DOUBLE 2
#define SCRIPT_ARGTYPE_BOOL 3
#define SCRIPT_ARGTYPE_ELEMENT 4

#define BASE_TEN_BASE 10
#define MAX_DIGITS_OF_NUMBER 22

using namespace std;

namespace webdriver {

class BrowserWrapper : public IDispEventSimpleImpl<1, BrowserWrapper, &DIID_DWebBrowserEvents2> {
public:
	BrowserWrapper(IWebBrowser2* browser, HWND hwnd, BrowserFactory *factory);
	virtual ~BrowserWrapper(void);

	BrowserWrapperEvent<BrowserWrapper*> NewWindow;
	BrowserWrapperEvent<std::wstring> Quitting;

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

	static inline _ATL_FUNC_INFO* NewWindow3Info() {
		static _ATL_FUNC_INFO kNewWindow3 = { CC_STDCALL, VT_EMPTY, 5,
			{ VT_DISPATCH | VT_BYREF, VT_BOOL | VT_BYREF, VT_I4, VT_BSTR, VT_BSTR } };
		return &kNewWindow3;
	}

	BEGIN_SINK_MAP(BrowserWrapper)
		SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_BEFORENAVIGATE2, BeforeNavigate2, BeforeNavigate2Info())
		SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_DOCUMENTCOMPLETE, DocumentComplete, DocumentCompleteInfo())
		SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_ONQUIT, OnQuit, NoArgumentsInfo())
		SINK_ENTRY_INFO(1, DIID_DWebBrowserEvents2, DISPID_NEWWINDOW3, NewWindow3, NewWindow3Info())
	END_SINK_MAP()

	STDMETHOD_(void, BeforeNavigate2)(IDispatch * pObject, VARIANT * pvarUrl, VARIANT * pvarFlags,
		VARIANT * pvarTargetFrame, VARIANT * pvarData, VARIANT * pvarHeaders, VARIANT_BOOL * pbCancel);
	STDMETHOD_(void, DocumentComplete)(IDispatch *pDisp,VARIANT *URL);
	STDMETHOD_(void, OnQuit)();
	STDMETHOD_(void, NewWindow3)(IDispatch **ppDisp, VARIANT_BOOL * pbCancel, DWORD dwFlags, BSTR bstrUrlContext, BSTR bstrUrl);

	bool Wait(void);
	void GetDocument(IHTMLDocument2 **doc);
	int ExecuteScript(ScriptWrapper *script_wrapper);
	HWND GetWindowHandle(void);
	std::wstring GetTitle(void);
	std::wstring GetCookies(void);
	int AddCookie(std::wstring cookie);
	int DeleteCookie(std::wstring cookie_name);
	void AttachToWindowInputQueue(void);
	int SetFocusedFrameByIndex(int frame_index);
	int SetFocusedFrameByName(std::wstring frame_name);
	int SetFocusedFrameByElement(IHTMLElement *frame_element);
	HWND GetActiveDialogWindowHandle(void);

	std::wstring ConvertVariantToWString(VARIANT *to_convert);

	IWebBrowser2 *browser(void) { return this->browser_; }
	std::wstring browser_id(void) { return this->browser_id_; }

	bool wait_required(void) { return this->wait_required_; }
	void set_wait_required(bool value) { this->wait_required_ = value; }

private:
	void AttachEvents(void);
	void DetachEvents(void);
	bool IsDocumentNavigating(IHTMLDocument2 *doc);
	bool IsHtmlPage(IHTMLDocument2 *doc);
	bool GetEvalMethod(IHTMLDocument2* doc, DISPID* eval_id, bool* added);
	void RemoveScript(IHTMLDocument2* doc);
	bool CreateAnonymousFunction(IDispatch* script_engine, DISPID eval_id, const std::wstring *script, VARIANT* result);

	CComPtr<IHTMLWindow2> focused_frame_window_;
	CComPtr<IWebBrowser2> browser_;
	BrowserFactory *factory_;
	HWND window_handle_;
	std::wstring browser_id_;
	bool is_navigation_started_;
	bool wait_required_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSERWRAPPER_H_
