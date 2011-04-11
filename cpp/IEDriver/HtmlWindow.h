#ifndef WEBDRIVER_IE_HTMLWINDOW_H_
#define WEBDRIVER_IE_HTMLWINDOW_H_

#include <string>
#include <memory>
#include "BrowserFactory.h"
#include "ErrorCodes.h"
#include "ScriptWrapper.h"

using namespace std;

namespace webdriver {

class HtmlWindow {
public:
	HtmlWindow(HWND hwnd, HWND session_handle);
	virtual ~HtmlWindow(void);

	virtual void GetDocument(IHTMLDocument2** doc) = 0;
	virtual void Close(void) = 0;
	virtual bool Wait(void) = 0;
	virtual HWND GetWindowHandle(void) = 0;
	virtual std::wstring GetWindowName(void) = 0;
	virtual std::wstring GetTitle(void) = 0;
	virtual HWND GetActiveDialogWindowHandle(void) = 0;
	virtual HWND GetTopLevelWindowHandle(void) = 0;

	virtual int NavigateToUrl(const std::wstring& url) = 0;
	virtual int NavigateBack(void) = 0;
	virtual int NavigateForward(void) = 0;
	virtual int Refresh(void) = 0;
	
	std::wstring GetCookies(void);
	int AddCookie(const std::wstring& cookie);
	int DeleteCookie(const std::wstring& cookie_name);
	
	int SetFocusedFrameByIndex(const int frame_index);
	int SetFocusedFrameByName(const std::wstring& frame_name);
	int SetFocusedFrameByElement(IHTMLElement* frame_element);

	bool wait_required(void) const { return this->wait_required_; }
	void set_wait_required(const bool value) { this->wait_required_ = value; }

	bool is_closing(void) const { return this->is_closing_; }

	std::wstring browser_id(void) const { return this->browser_id_; }

protected:
	HWND window_handle(void) const { return this->window_handle_; }
	void set_window_handle(const HWND window_handle) { this->window_handle_ = window_handle; }

	HWND session_handle(void) const { return this->session_handle_; }

	void set_is_closing(const bool value) { this->is_closing_ = value; }

	IHTMLWindow2* focused_frame_window(void) { return this->focused_frame_window_; }

private:
	bool IsHtmlPage(IHTMLDocument2* doc);

	BrowserFactory factory_;
	CComPtr<IHTMLWindow2> focused_frame_window_;
	HWND window_handle_;
	HWND session_handle_;
	std::wstring browser_id_;
	bool wait_required_;
	bool is_closing_;
};

typedef std::tr1::shared_ptr<HtmlWindow> BrowserHandle;

} // namespace webdriver

#endif // WEBDRIVER_IE_HTMLWINDOW_H_
