#ifndef WEBDRIVER_IE_BROWSERMANAGER_H_
#define WEBDRIVER_IE_BROWSERMANAGER_H_

#include "StdAfx.h"
#include <Objbase.h>
#include <algorithm>
#include <map>
#include <string>
#include <vector>
#include <unordered_map>
#include "BrowserWrapper.h"
#include "ElementWrapper.h"
#include "ElementFinder.h"
#include "messages.h"
#include "WebDriverCommand.h"
#include "WebDriverCommandHandler.h"
#include "WebDriverResponse.h"

#define WAIT_TIME_IN_MILLISECONDS 200

#define EVENT_NAME L"WD_START_EVENT"

#define SPEED_SLOW "SLOW"
#define SPEED_MEDIUM "MEDIUM"
#define SPEED_FAST "FAST"

using namespace std;

namespace webdriver {

// We use a CWindowImpl (creating a hidden window) here because we
// want to synchronize access to the command handler. For that we
// use SendMessage() most of the time, and SendMessage() requires
// a window handle.
class BrowserManager : public CWindowImpl<BrowserManager> {
public:
	DECLARE_WND_CLASS(L"WebDriverWndClass")

	BEGIN_MSG_MAP(BrowserManager)
		MESSAGE_HANDLER(WM_CREATE, OnCreate)
		MESSAGE_HANDLER(WM_CLOSE, OnClose)
		MESSAGE_HANDLER(WM_DESTROY, OnDestroy)
		MESSAGE_HANDLER(WD_INIT, OnInit)
		MESSAGE_HANDLER(WD_SET_COMMAND, OnSetCommand)
		MESSAGE_HANDLER(WD_EXEC_COMMAND, OnExecCommand)
		MESSAGE_HANDLER(WD_GET_RESPONSE_LENGTH, OnGetResponseLength)
		MESSAGE_HANDLER(WD_GET_RESPONSE, OnGetResponse)
		MESSAGE_HANDLER(WD_WAIT, OnWait)
		MESSAGE_HANDLER(WD_BROWSER_NEW_WINDOW, OnBrowserNewWindow)
		MESSAGE_HANDLER(WD_BROWSER_QUIT, OnBrowserQuit)
	END_MSG_MAP()

	LRESULT OnCreate(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnClose(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnDestroy(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnInit(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnSetCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnExecCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnGetResponseLength(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnGetResponse(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnWait(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnBrowserNewWindow(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnBrowserQuit(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);

	std::wstring manager_id(void) const { return this->manager_id_; }

	static DWORD WINAPI ThreadProc(LPVOID lpParameter);
	static DWORD WINAPI WaitThreadProc(LPVOID lpParameter);

	std::wstring current_browser_id(void) const { return this->current_browser_id_; }
	void set_current_browser_id(const std::wstring& browser_id) { this->current_browser_id_ = browser_id; }

	void CreateNewBrowser(void);

	int GetManagedBrowser(const std::wstring& browser_id, BrowserWrapper **browser_wrapper);
	int GetCurrentBrowser(BrowserWrapper **browser_wrapper);
	void GetManagedBrowserHandles(std::vector<std::wstring> *managed_browser_handles);

	void AddManagedElement(IHTMLElement *element, ElementWrapper **element_wrapper);
	int GetManagedElement(const std::wstring& element_id, ElementWrapper **element_wrapper);
	void RemoveManagedElement(const std::wstring& element_id);
	void ListManagedElements(void);

	int GetElementFinder(const std::wstring& mechanism, std::tr1::shared_ptr<ElementFinder>* finder);

	int speed(void) const { return this->speed_; }
	void set_speed(const int speed) { this->speed_ = speed; }

	int implicit_wait_timeout(void) const { return this->implicit_wait_timeout_; }
	void set_implicit_wait_timeout(const int timeout) { this->implicit_wait_timeout_ = timeout; }

	int async_script_timeout(void) const { return this->async_script_timeout_; }
	void set_async_script_timeout(const int timeout) { this->async_script_timeout_ = timeout; }

	long last_known_mouse_x(void) const { return this->last_known_mouse_x_; }
	void set_last_known_mouse_x(const long x_coordinate) { this->last_known_mouse_x_ = x_coordinate; }

	long last_known_mouse_y(void) const { return this->last_known_mouse_y_; }
	void set_last_known_mouse_y(const long y_coordinate) { this->last_known_mouse_y_ = y_coordinate; }

private:
	void AddManagedBrowser(BrowserWrapper* browser_wrapper);

	void DispatchCommand(void);

	void PopulateCommandHandlerRepository(void);
	void PopulateElementFinderRepository(void);

	std::tr1::unordered_map<std::wstring, BrowserWrapper*> managed_browsers_;
	std::tr1::unordered_map<std::wstring, ElementWrapper*> managed_elements_;
	std::map<std::wstring, std::tr1::shared_ptr<ElementFinder>> element_finders_;

	BrowserFactory factory_;
	std::wstring current_browser_id_;

	int speed_;
	int implicit_wait_timeout_;
	int async_script_timeout_;

	std::wstring manager_id_;
	int port_;

	WebDriverCommand current_command_;
	std::wstring serialized_response_;
	int new_browser_event_id_;
	int browser_quitting_event_id_;
	std::map<int, std::tr1::shared_ptr<WebDriverCommandHandler>> command_handlers_;
	bool is_waiting_;

	long last_known_mouse_x_;
	long last_known_mouse_y_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSERMANAGER_H_
