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

#ifndef WEBDRIVER_IE_IECOMMANDEXECUTOR_H_
#define WEBDRIVER_IE_IECOMMANDEXECUTOR_H_

#include <ctime>
#include <map>
#include <mutex>
#include <string>
#include <unordered_map>

#include "command.h"
#include "CustomTypes.h"
#include "IElementManager.h"
#include "messages.h"

namespace webdriver {

// Forward declaration of classes.
class BrowserFactory;
class CommandHandlerRepository;
class ElementFinder;
class ElementRepository;
class InputManager;
class ProxyManager;

// We use a CWindowImpl (creating a hidden window) here because we
// want to synchronize access to the command handler. For that we
// use SendMessage() most of the time, and SendMessage() requires
// a window handle.
class IECommandExecutor : public CWindowImpl<IECommandExecutor>, public IElementManager {
 public:
  DECLARE_WND_CLASS(L"WebDriverWndClass")

  BEGIN_MSG_MAP(Session)
    MESSAGE_HANDLER(WM_CREATE, OnCreate)
    MESSAGE_HANDLER(WM_DESTROY, OnDestroy)
    MESSAGE_HANDLER(WD_SET_COMMAND, OnSetCommand)
    MESSAGE_HANDLER(WD_EXEC_COMMAND, OnExecCommand)
    MESSAGE_HANDLER(WD_GET_RESPONSE_LENGTH, OnGetResponseLength)
    MESSAGE_HANDLER(WD_GET_RESPONSE, OnGetResponse)
    MESSAGE_HANDLER(WD_WAIT, OnWait)
    MESSAGE_HANDLER(WD_BROWSER_NEW_WINDOW, OnBrowserNewWindow)
    MESSAGE_HANDLER(WD_BEFORE_NEW_WINDOW, OnBeforeNewWindow)
    MESSAGE_HANDLER(WD_AFTER_NEW_WINDOW, OnAfterNewWindow)
    MESSAGE_HANDLER(WD_BROWSER_QUIT, OnBrowserQuit)
    MESSAGE_HANDLER(WD_BROWSER_CLOSE_WAIT, OnBrowserCloseWait)
    MESSAGE_HANDLER(WD_BEFORE_BROWSER_REATTACH, OnBeforeBrowserReattach)
    MESSAGE_HANDLER(WD_BROWSER_REATTACH, OnBrowserReattach)
    MESSAGE_HANDLER(WD_IS_SESSION_VALID, OnIsSessionValid)
    MESSAGE_HANDLER(WD_NEW_HTML_DIALOG, OnNewHtmlDialog)
    MESSAGE_HANDLER(WD_GET_QUIT_STATUS, OnGetQuitStatus)
    MESSAGE_HANDLER(WD_REFRESH_MANAGED_ELEMENTS, OnRefreshManagedElements)
    MESSAGE_HANDLER(WD_HANDLE_UNEXPECTED_ALERTS, OnHandleUnexpectedAlerts)
    MESSAGE_HANDLER(WD_QUIT, OnQuit)
    MESSAGE_HANDLER(WD_SCRIPT_WAIT, OnScriptWait)
    MESSAGE_HANDLER(WD_ASYNC_SCRIPT_TRANSFER_MANAGED_ELEMENT, OnTransferManagedElement)
    MESSAGE_HANDLER(WD_ASYNC_SCRIPT_SCHEDULE_REMOVE_MANAGED_ELEMENT, OnScheduleRemoveManagedElement)
  END_MSG_MAP()

  LRESULT OnCreate(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnDestroy(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnSetCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnExecCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnGetResponseLength(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnGetResponse(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnWait(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnBrowserNewWindow(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnBeforeNewWindow(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnAfterNewWindow(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnBrowserQuit(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnBrowserCloseWait(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnBeforeBrowserReattach(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnBrowserReattach(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnIsSessionValid(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnNewHtmlDialog(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnGetQuitStatus(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnRefreshManagedElements(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnHandleUnexpectedAlerts(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnQuit(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnScriptWait(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnTransferManagedElement(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnScheduleRemoveManagedElement(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);

  std::string session_id(void) const { return this->session_id_; }

  static unsigned int WINAPI ThreadProc(LPVOID lpParameter);
  static unsigned int WINAPI WaitThreadProc(LPVOID lpParameter);
  static unsigned int WINAPI ScriptWaitThreadProc(LPVOID lpParameter);
  static unsigned int WINAPI DelayPostMessageThreadProc(LPVOID lpParameter);

  std::string current_browser_id(void) const { 
    return this->current_browser_id_; 
  }
  void set_current_browser_id(const std::string& browser_id) {
    this->current_browser_id_ = browser_id;
  }

  int CreateNewBrowser(std::string* error_message);
  std::string OpenNewBrowsingContext(const std::string& window_type);

  int GetManagedBrowser(const std::string& browser_id,
                        BrowserHandle* browser_wrapper) const;
  int GetCurrentBrowser(BrowserHandle* browser_wrapper) const;
  void GetManagedBrowserHandles(
      std::vector<std::string> *managed_browser_handles) const;

  int GetManagedElement(const std::string& element_id,
                        ElementHandle* element_wrapper) const;
  bool AddManagedElement(IHTMLElement* element,
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

  HWND window_handle(void) const { return this->m_hWnd; }
  IElementManager* element_manager(void) { return this; }

  unsigned long long implicit_wait_timeout(void) const {
    return this->implicit_wait_timeout_; 
  }
  void set_implicit_wait_timeout(const unsigned long long timeout) {
    this->implicit_wait_timeout_ = timeout; 
  }

  long long  async_script_timeout(void) const { return this->async_script_timeout_;  }
  void set_async_script_timeout(const long long timeout) {
    this->async_script_timeout_ = timeout;
  }

  unsigned long long page_load_timeout(void) const { return this->page_load_timeout_;  }
  void set_page_load_timeout(const unsigned long long timeout) {
    this->page_load_timeout_ = timeout;
  }

  bool is_valid(void) const { return this->is_valid_; }
  void set_is_valid(const bool session_is_valid) {
    this->is_valid_ = session_is_valid; 
  }

  bool is_quitting(void) const { return this->is_quitting_; }
  void set_is_quitting(const bool session_is_quitting) {
    this->is_quitting_ = session_is_quitting; 
  }

  std::string unexpected_alert_behavior(void) const {
    return this->unexpected_alert_behavior_;
  }
  void set_unexpected_alert_behavior(const std::string& unexpected_alert_behavior) {
    this->unexpected_alert_behavior_ = unexpected_alert_behavior;
  }

  std::string page_load_strategy(void) const {
    return this->page_load_strategy_;
  }
  void set_page_load_strategy(const std::string& page_load_strategy) {
    this->page_load_strategy_ = page_load_strategy;
  }

  bool use_legacy_file_upload_dialog_handling(void) const {
    return this->use_legacy_file_upload_dialog_handling_;
  }
  void set_use_legacy_file_upload_dialog_handling(const bool use_legacy_dialog_handling) {
    this->use_legacy_file_upload_dialog_handling_ = use_legacy_dialog_handling;
  }

  int file_upload_dialog_timeout(void) const {
    return this->file_upload_dialog_timeout_;
  }
  void set_file_upload_dialog_timeout(const int file_upload_dialog_timeout) {
    this->file_upload_dialog_timeout_ = file_upload_dialog_timeout;
  }

  bool use_strict_file_interactability(void) const {
    return this->use_strict_file_interactability_;
  }
  void set_use_strict_file_interactability(const bool use_strict_file_interactability) {
    this->use_strict_file_interactability_ = use_strict_file_interactability;
  }

  ElementFinder* element_finder(void) const { return this->element_finder_; }
  InputManager* input_manager(void) const { return this->input_manager_; }
  ProxyManager* proxy_manager(void) const { return this->proxy_manager_; }
  BrowserFactory* browser_factory(void) const { return this->factory_; }

  int port(void) const { return this->port_; }

  size_t managed_window_count(void) const {
    return this->managed_browsers_.size();
  }

 private:
  typedef std::unordered_map<std::string, BrowserHandle> BrowserMap;
  typedef std::map<std::string, std::wstring> ElementFindMethodMap;

  void AddManagedBrowser(BrowserHandle browser_wrapper);

  void DispatchCommand(void);

  void PopulateElementFinderMethods(void);

  void CreateWaitThread(const std::string& deferred_response);
  void CreateWaitThread(const std::string& deferred_response,
                        const bool is_deferred_command_execution);
  void CreateDelayPostMessageThread(const DWORD delay_time,
                                    const HWND window_handle,
                                    const UINT message_to_post);
  bool IsCommandValidWithAlertPresent(void);
  bool IsAlertActive(BrowserHandle browser, HWND* alert_handle);
  bool HandleUnexpectedAlert(BrowserHandle browser,
                             HWND alert_handle,
                             bool force_use_dismiss,
                             std::string* alert_text);

  void PostBrowserReattachMessage(const DWORD current_process_id,
                                  const std::string& browser_id,
                                  const std::vector<DWORD>& known_process_ids);
  void GetNewBrowserProcessIds(std::vector<DWORD>* known_process_ids,
                               std::vector<DWORD>* new_process_ids);

  std::string OpenNewBrowsingContext(const std::string& window_type,
                                     const std::string& url);
  std::string OpenNewBrowserWindow(const std::wstring& url);
  std::string OpenNewBrowserTab(const std::wstring& url);
  static BOOL CALLBACK FindAllBrowserHandles(HWND hwnd, LPARAM arg);

  BrowserMap managed_browsers_;
  ElementRepository* managed_elements_;
  ElementFindMethodMap element_find_methods_;
  CommandHandlerRepository* command_handlers_;

  std::string current_browser_id_;

  ElementFinder* element_finder_;

  unsigned long long implicit_wait_timeout_;
  unsigned long long async_script_timeout_;
  unsigned long long page_load_timeout_;
  unsigned long long reattach_browser_timeout_;
  clock_t wait_timeout_;
  clock_t reattach_wait_timeout_;

  std::string session_id_;
  int port_;
  bool ignore_zoom_setting_;
  std::string initial_browser_url_;
  std::string unexpected_alert_behavior_;
  std::string page_load_strategy_;
  int file_upload_dialog_timeout_;
  bool use_legacy_file_upload_dialog_handling_;
  bool enable_full_page_screenshot_;
  bool use_strict_file_interactability_;

  Command current_command_;
  std::string serialized_response_;
  bool is_waiting_;
  bool is_valid_;
  bool is_quitting_;
  bool is_awaiting_new_window_;
  std::mutex set_command_mutex_;

  BrowserFactory* factory_;
  InputManager* input_manager_;
  ProxyManager* proxy_manager_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IECOMMANDEXECUTOR_H_
