#ifndef WEBDRIVER_IE_HTMLDIALOG_H_
#define WEBDRIVER_IE_HTMLDIALOG_H_

#include <exdispid.h>
#include <exdisp.h>
#include <mshtml.h>
#include <mshtmdid.h>
#include "HtmlWindow.h"

using namespace std;

namespace webdriver {

struct DialogWindowInfo {
	HWND hwndOwner;
	HWND hwndDialog;
};

class HtmlDialog : public HtmlWindow, public IDispEventSimpleImpl<1, HtmlDialog, &DIID_HTMLWindowEvents2>  {
public:
	HtmlDialog(IHTMLDocument2* document, HWND hwnd, HWND session_handle);
	virtual ~HtmlDialog(void);

	static inline _ATL_FUNC_INFO* DocEventInfo() {
		static _ATL_FUNC_INFO kDocEvent = { CC_STDCALL, VT_EMPTY, 1, { VT_DISPATCH } };
	  return &kDocEvent;
	}

	BEGIN_SINK_MAP(HtmlDialog)
		SINK_ENTRY_INFO(1, DIID_HTMLWindowEvents2, DISPID_HTMLWINDOWEVENTS2_ONUNLOAD, OnUnload, DocEventInfo())
	END_SINK_MAP()

	STDMETHOD_(void, OnUnload)(IHTMLEventObj* pEvtObj);

	void GetDocument(IHTMLDocument2** doc);
	void Close(void);
	bool Wait(void);
	HWND GetWindowHandle(void);
	std::wstring GetWindowName(void);
	std::wstring GetTitle(void);
	HWND GetActiveDialogWindowHandle(void);
	HWND GetTopLevelWindowHandle(void);

	int NavigateToUrl(const std::wstring& url);
	int NavigateBack(void);
	int NavigateForward(void);
	int Refresh(void);

private:
	static BOOL CALLBACK FindChildDialogWindow(HWND hwnd, LPARAM arg);
	CComPtr<IHTMLDocument2> document_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_HTMLDIALOG_H_
