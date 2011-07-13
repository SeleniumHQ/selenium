// Copyright 2011 WebDriver committers
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

#ifndef WEBDRIVER_IE_IECOMMANDEXECUTOR_H_
#define WEBDRIVER_IE_IECOMMANDEXECUTOR_H_

#include <Objbase.h>
#include <algorithm>
#include <map>
#include <string>
#include <vector>
#include <unordered_map>
#include "Browser.h"
#include "command.h"
#include "command_types.h"
#include "IECommandHandler.h"
#include "Element.h"
#include "ElementFinder.h"
#include "HtmlDialog.h"
#include "messages.h"
#include "response.h"

#define WAIT_TIME_IN_MILLISECONDS 200
#define FIND_ELEMENT_WAIT_TIME_IN_MILLISECONDS 250

#define EVENT_NAME L"WD_START_EVENT"

using namespace std;

namespace webdriver {

// We use a CWindowImpl (creating a hidden window) here because we
// want to synchronize access to the command handler. For that we
// use SendMessage() most of the time, and SendMessage() requires
// a window handle.
class IECommandExecutor : public CWindowImpl<IECommandExecutor> {
public:
	DECLARE_WND_CLASS(L"WebDriverWndClass")

	BEGIN_MSG_MAP(Session)
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
		MESSAGE_HANDLER(WD_IS_SESSION_VALID, OnIsSessionValid)
		MESSAGE_HANDLER(WD_NEW_HTML_DIALOG, OnNewHtmlDialog)
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
	LRESULT OnIsSessionValid(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
	LRESULT OnNewHtmlDialog(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);

	std::wstring session_id(void) const { return this->session_id_; }

	static unsigned int WINAPI ThreadProc(LPVOID lpParameter);
	static unsigned int WINAPI WaitThreadProc(LPVOID lpParameter);

	std::wstring current_browser_id(void) const { return this->current_browser_id_; }
	void set_current_browser_id(const std::wstring& browser_id) { this->current_browser_id_ = browser_id; }

	int CreateNewBrowser(void);

	int GetManagedBrowser(const std::wstring& browser_id, BrowserHandle* browser_wrapper) const;
	int GetCurrentBrowser(BrowserHandle* browser_wrapper) const;
	void GetManagedBrowserHandles(std::vector<std::wstring> *managed_browser_handles) const;

	int GetManagedElement(const std::wstring& element_id, ElementHandle* element_wrapper) const;
	void AddManagedElement(IHTMLElement* element, ElementHandle* element_wrapper);
	void RemoveManagedElement(const std::wstring& element_id);
	void ListManagedElements(void);

	int GetElementFindMethod(const std::wstring& mechanism, std::wstring* translation) const;
	int LocateElement(const ElementHandle parent_wrapper, const std::wstring& mechanism, const std::wstring& criteria, Json::Value* found_element) const;
	int LocateElements(const ElementHandle parent_wrapper, const std::wstring& mechanism, const std::wstring& criteria, Json::Value* found_elements) const;

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

	bool is_valid(void) const { return this->is_valid_; }
	void set_is_valid(const bool session_is_valid) { this->is_valid_ = session_is_valid; }

	bool ignore_protected_mode_settings(void) const { return this->ignore_protected_mode_settings_; }
	void set_ignore_protected_mode_settings(const bool ignore_settings) { this->ignore_protected_mode_settings_ = ignore_settings; }

	ElementFinder element_finder(void) const { return this->element_finder_; }

	int browser_version(void) const { return this->factory_.browser_version(); }
	size_t managed_window_count(void) const { return this->managed_browsers_.size(); }

private:
	typedef std::tr1::unordered_map<std::wstring, BrowserHandle> BrowserMap;
	typedef std::tr1::unordered_map<std::wstring, ElementHandle> ElementMap;
	typedef std::map<std::wstring, std::wstring> ElementFindMethodMap;
	typedef std::map<int, CommandHandlerHandle> CommandHandlerMap;

	void AddManagedBrowser(BrowserHandle browser_wrapper);

	void DispatchCommand(void);

	void PopulateCommandHandlers(void);
	void PopulateElementFinderMethods(void);

	BrowserMap managed_browsers_;
	ElementMap managed_elements_;
	ElementFindMethodMap element_find_methods_;

	BrowserFactory factory_;
	std::wstring current_browser_id_;

	ElementFinder element_finder_;

	int speed_;
	int implicit_wait_timeout_;
	int async_script_timeout_;

	std::wstring session_id_;
	int port_;
	bool ignore_protected_mode_settings_;

	Command current_command_;
	std::wstring serialized_response_;
	CommandHandlerMap command_handlers_;
	bool is_waiting_;
	bool is_valid_;

	long last_known_mouse_x_;
	long last_known_mouse_y_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IECOMMANDEXECUTOR_H_
