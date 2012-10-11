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

#ifndef WEBDRIVER_IE_IECOMMANDEXECUTOR_H_
#define WEBDRIVER_IE_IECOMMANDEXECUTOR_H_

#include <Objbase.h>
#include <algorithm>
#include <ctime>
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
#define IGNORE_UNEXPECTED_ALERTS "ignore"
#define ACCEPT_UNEXPECTED_ALERTS "accept"
#define DISMISS_UNEXPECTED_ALERTS "dismiss"

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

  std::string session_id(void) const { return this->session_id_; }

  static unsigned int WINAPI ThreadProc(LPVOID lpParameter);
  static unsigned int WINAPI WaitThreadProc(LPVOID lpParameter);

  std::string current_browser_id(void) const { 
    return this->current_browser_id_; 
  }
  void set_current_browser_id(const std::string& browser_id) {
    this->current_browser_id_ = browser_id;
  }

  int CreateNewBrowser(std::string* error_message);

  int GetManagedBrowser(const std::string& browser_id,
                        BrowserHandle* browser_wrapper) const;
  int GetCurrentBrowser(BrowserHandle* browser_wrapper) const;
  void GetManagedBrowserHandles(
      std::vector<std::string> *managed_browser_handles) const;

  int GetManagedElement(const std::string& element_id,
                        ElementHandle* element_wrapper) const;
  void AddManagedElement(IHTMLElement* element,
                         ElementHandle* element_wrapper);
  void RemoveManagedElement(const std::string& element_id);
  void ListManagedElements(void);

  int GetElementFindMethod(const std::string& mechanism,
                           std::wstring* translation) const;
  int LocateElement(const ElementHandle parent_wrapper,
                    const std::string& mechanism,
                    const std::string& criteria,
                    Json::Value* found_element) const;
  int LocateElements(const ElementHandle parent_wrapper,
                     const std::string& mechanism,
                     const std::string& criteria,
                     Json::Value* found_elements) const;

  int speed(void) const { return this->speed_; }
  void set_speed(const int speed) { this->speed_ = speed; }

  int implicit_wait_timeout(void) const { 
    return this->implicit_wait_timeout_; 
  }
  void set_implicit_wait_timeout(const int timeout) { 
    this->implicit_wait_timeout_ = timeout; 
  }

  int async_script_timeout(void) const { return this->async_script_timeout_;  }
  void set_async_script_timeout(const int timeout) {
    this->async_script_timeout_ = timeout;
  }

  int page_load_timeout(void) const { return this->page_load_timeout_;  }
  void set_page_load_timeout(const int timeout) {
    this->page_load_timeout_ = timeout;
  }

  long last_known_mouse_x(void) const { return this->last_known_mouse_x_;  }
  void set_last_known_mouse_x(const long x_coordinate) {
    this->last_known_mouse_x_ = x_coordinate; 
  }

  long last_known_mouse_y(void) const { return this->last_known_mouse_y_; }
  void set_last_known_mouse_y(const long y_coordinate) {
    this->last_known_mouse_y_ = y_coordinate;
  }

  bool is_valid(void) const { return this->is_valid_; }
  void set_is_valid(const bool session_is_valid) {
    this->is_valid_ = session_is_valid; 
  }

  bool ignore_protected_mode_settings(void) const {
    return this->ignore_protected_mode_settings_;
  }
  void set_ignore_protected_mode_settings(const bool ignore_settings) {
    this->ignore_protected_mode_settings_ = ignore_settings;
  }

  bool ignore_zoom_setting(void) const {
    return this->ignore_zoom_setting_;
  }
  void set_ignore_zoom_setting(const bool ignore_zoom) {
    this->ignore_zoom_setting_ = ignore_zoom;
  }

  bool enable_native_events(void) const {
    return this->enable_native_events_;
  }
  void set_enable_native_events(const bool enable_native_events) {
    this->enable_native_events_ = enable_native_events;
  }

  void set_enable_persistent_hover(const bool enable_persistent_hover) {
    this->enable_persistent_hover_ = enable_persistent_hover;
  }

  std::string initial_browser_url(void) const {
    return this->initial_browser_url_;
  }
  void set_initial_browser_url(const std::string& initial_browser_url) {
    this->initial_browser_url_ = initial_browser_url;
  }

  std::string unexpected_alert_behavior(void) const {
    return this->unexpected_alert_behavior_;
  }
  void set_unexpected_alert_behavior(const std::string& unexpected_alert_behavior) {
    this->unexpected_alert_behavior_ = unexpected_alert_behavior;
  }

  ElementFinder element_finder(void) const { return this->element_finder_; }

  int browser_version(void) const { return this->factory_.browser_version(); }
  size_t managed_window_count(void) const {
    return this->managed_browsers_.size();
  }

  ELEMENT_SCROLL_BEHAVIOR scroll_behavior(void) const { return this->scroll_behavior_; }
  void set_scroll_behavior(const ELEMENT_SCROLL_BEHAVIOR scroll_behavior) {
    this->scroll_behavior_ = scroll_behavior;
  }

  CComVariant keyboard_state(void) const { return this->keyboard_state_; }
  void set_keyboard_state(VARIANT state) { this->keyboard_state_ = state; }

  CComVariant mouse_state(void) const { return this->mouse_state_; }
  void set_mouse_state(VARIANT state) { this->mouse_state_ = state; }

 private:
  typedef std::tr1::unordered_map<std::string, ElementHandle> ElementMap;
  typedef std::tr1::unordered_map<std::string, BrowserHandle> BrowserMap;
  typedef std::map<std::string, std::wstring> ElementFindMethodMap;
  typedef std::map<int, CommandHandlerHandle> CommandHandlerMap;

  void AddManagedBrowser(BrowserHandle browser_wrapper);

  void DispatchCommand(void);

  void PopulateCommandHandlers(void);
  void PopulateElementFinderMethods(void);

  BrowserMap managed_browsers_;
  ElementMap managed_elements_;
  ElementFindMethodMap element_find_methods_;

  BrowserFactory factory_;
  std::string current_browser_id_;

  ElementFinder element_finder_;

  int speed_;
  int implicit_wait_timeout_;
  int async_script_timeout_;
  int page_load_timeout_;
  clock_t wait_timeout_;

  std::string session_id_;
  int port_;
  bool ignore_protected_mode_settings_;
  bool enable_native_events_;
  bool enable_persistent_hover_;
  bool ignore_zoom_setting_;
  std::string initial_browser_url_;
  std::string unexpected_alert_behavior_;

  Command current_command_;
  std::string serialized_response_;
  CommandHandlerMap command_handlers_;
  bool is_waiting_;
  bool is_valid_;

  long last_known_mouse_x_;
  long last_known_mouse_y_;

  ELEMENT_SCROLL_BEHAVIOR scroll_behavior_;

  CComVariant keyboard_state_;
  CComVariant mouse_state_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IECOMMANDEXECUTOR_H_
