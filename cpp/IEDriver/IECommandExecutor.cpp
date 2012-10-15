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

#include "IECommandExecutor.h"
#include "logging.h"
#include "CommandHandlers/AcceptAlertCommandHandler.h"
#include "CommandHandlers/AddCookieCommandHandler.h"
#include "CommandHandlers/ClickElementCommandHandler.h"
#include "CommandHandlers/ClearElementCommandHandler.h"
#include "CommandHandlers/CloseWindowCommandHandler.h"
#include "CommandHandlers/DeleteAllCookiesCommandHandler.h"
#include "CommandHandlers/DeleteCookieCommandHandler.h"
#include "CommandHandlers/DismissAlertCommandHandler.h"
#include "CommandHandlers/ElementEqualsCommandHandler.h"
#include "CommandHandlers/ExecuteAsyncScriptCommandHandler.h"
#include "CommandHandlers/ExecuteScriptCommandHandler.h"
#include "CommandHandlers/FindChildElementCommandHandler.h"
#include "CommandHandlers/FindChildElementsCommandHandler.h"
#include "CommandHandlers/FindElementCommandHandler.h"
#include "CommandHandlers/FindElementsCommandHandler.h"
#include "CommandHandlers/GetActiveElementCommandHandler.h"
#include "CommandHandlers/GetAlertTextCommandHandler.h"
#include "CommandHandlers/GetAllCookiesCommandHandler.h"
#include "CommandHandlers/GetAllWindowHandlesCommandHandler.h"
#include "CommandHandlers/GetCurrentUrlCommandHandler.h"
#include "CommandHandlers/GetCurrentWindowHandleCommandHandler.h"
#include "CommandHandlers/GetElementAttributeCommandHandler.h"
#include "CommandHandlers/GetElementLocationCommandHandler.h"
#include "CommandHandlers/GetElementLocationOnceScrolledIntoViewCommandHandler.h"
#include "CommandHandlers/GetElementSizeCommandHandler.h"
#include "CommandHandlers/GetElementTagNameCommandHandler.h"
#include "CommandHandlers/GetElementTextCommandHandler.h"
#include "CommandHandlers/GetElementValueOfCssPropertyCommandHandler.h"
#include "CommandHandlers/GetSessionCapabilitiesCommandHandler.h"
#include "CommandHandlers/GetPageSourceCommandHandler.h"
#include "CommandHandlers/GetTitleCommandHandler.h"
#include "CommandHandlers/GetWindowPositionCommandHandler.h"
#include "CommandHandlers/GetWindowSizeCommandHandler.h"
#include "CommandHandlers/GoBackCommandHandler.h"
#include "CommandHandlers/GoForwardCommandHandler.h"
#include "CommandHandlers/GoToUrlCommandHandler.h"
#include "CommandHandlers/IsElementDisplayedCommandHandler.h"
#include "CommandHandlers/IsElementEnabledCommandHandler.h"
#include "CommandHandlers/IsElementSelectedCommandHandler.h"
#include "CommandHandlers/MaximizeWindowCommandHandler.h"
#include "CommandHandlers/MouseMoveToCommandHandler.h"
#include "CommandHandlers/MouseClickCommandHandler.h"
#include "CommandHandlers/MouseDoubleClickCommandHandler.h"
#include "CommandHandlers/MouseButtonDownCommandHandler.h"
#include "CommandHandlers/MouseButtonUpCommandHandler.h"
#include "CommandHandlers/NewSessionCommandHandler.h"
#include "CommandHandlers/QuitCommandHandler.h"
#include "CommandHandlers/RefreshCommandHandler.h"
#include "CommandHandlers/ScreenshotCommandHandler.h"
#include "CommandHandlers/SendKeysCommandHandler.h"
#include "CommandHandlers/SendKeysToActiveElementCommandHandler.h"
#include "CommandHandlers/SendKeysToAlertCommandHandler.h"
#include "CommandHandlers/SetAsyncScriptTimeoutCommandHandler.h"
#include "CommandHandlers/SetImplicitWaitTimeoutCommandHandler.h"
#include "CommandHandlers/SetTimeoutCommandHandler.h"
#include "CommandHandlers/SetWindowPositionCommandHandler.h"
#include "CommandHandlers/SetWindowSizeCommandHandler.h"
#include "CommandHandlers/SubmitElementCommandHandler.h"
#include "CommandHandlers/SwitchToFrameCommandHandler.h"
#include "CommandHandlers/SwitchToWindowCommandHandler.h"

namespace webdriver {

LRESULT IECommandExecutor::OnInit(UINT uMsg,
                                  WPARAM wParam,
                                  LPARAM lParam,
                                  BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnInit";

  // If we wanted to be a little more clever, we could create a struct
  // containing the HWND and the port number and pass them into the
  // ThreadProc via lpParameter and avoid this message handler altogether.
  this->port_ = (int)wParam;
  return 0;
}

LRESULT IECommandExecutor::OnCreate(UINT uMsg,
                                    WPARAM wParam,
                                    LPARAM lParam,
                                    BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnCreate";

  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  status = ::UuidToString(&guid, &guid_string);

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->SetWindowText(cast_guid_string);

  std::string session_id = CW2A(cast_guid_string, CP_UTF8);
  this->session_id_ = session_id;
  this->is_valid_ = true;

  ::RpcStringFree(&guid_string);

  this->PopulateCommandHandlers();
  this->PopulateElementFinderMethods();
  this->current_browser_id_ = "";
  this->serialized_response_ = "";
  this->initial_browser_url_ = "";
  this->ignore_protected_mode_settings_ = false;
  this->ignore_zoom_setting_ = false;
  this->enable_native_events_ = true;
  this->enable_persistent_hover_ = true;
  this->unexpected_alert_behavior_ = IGNORE_UNEXPECTED_ALERTS;
  this->speed_ = 0;
  this->implicit_wait_timeout_ = 0;
  this->async_script_timeout_ = -1;
  this->page_load_timeout_ = -1;
  this->last_known_mouse_x_ = 0;
  this->last_known_mouse_y_ = 0;

  CComVariant keyboard_state;
  keyboard_state.vt = VT_NULL;
  this->keyboard_state_ = keyboard_state;

  CComVariant mouse_state;
  mouse_state.vt = VT_NULL;
  this->mouse_state_ = mouse_state;

  return 0;
}

LRESULT IECommandExecutor::OnClose(UINT uMsg,
                                   WPARAM wParam,
                                   LPARAM lParam,
                                   BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnClose";

  this->managed_elements_.clear();
  this->DestroyWindow();
  return 0;
}

LRESULT IECommandExecutor::OnDestroy(UINT uMsg,
                                     WPARAM wParam,
                                     LPARAM lParam,
                                     BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnDestroy";

  ::PostQuitMessage(0);
  return 0;
}

LRESULT IECommandExecutor::OnSetCommand(UINT uMsg,
                                        WPARAM wParam,
                                        LPARAM lParam,
                                        BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnSetCommand";

  LPCSTR json_command = reinterpret_cast<LPCSTR>(lParam);
  this->current_command_.Populate(json_command);
  return 0;
}

LRESULT IECommandExecutor::OnExecCommand(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnExecCommand";

  this->DispatchCommand();
  return 0;
}

LRESULT IECommandExecutor::OnGetResponseLength(UINT uMsg,
                                               WPARAM wParam,
                                               LPARAM lParam,
                                               BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnGetResponseLength";

  size_t response_length = 0;
  if (!this->is_waiting_) {
    response_length = this->serialized_response_.size();
  }
  return response_length;
}

LRESULT IECommandExecutor::OnGetResponse(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnGetResponse";

  LPSTR str = reinterpret_cast<LPSTR>(lParam);
  strcpy_s(str,
           this->serialized_response_.size() + 1,
           this->serialized_response_.c_str());

  // Reset the serialized response for the next command.
  this->serialized_response_ = "";
  return 0;
}

LRESULT IECommandExecutor::OnWait(UINT uMsg,
                                  WPARAM wParam,
                                  LPARAM lParam,
                                  BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnWait";

  BrowserHandle browser;
  int status_code = this->GetCurrentBrowser(&browser);
  if (status_code == SUCCESS && !browser->is_closing()) {
    if (this->page_load_timeout_ >= 0 && this->wait_timeout_ < clock()) {
      Response timeout_response;
      timeout_response.SetErrorResponse(ETIMEOUT, "Timed out waiting for page to load.");
      this->serialized_response_ = timeout_response.Serialize();
      this->is_waiting_ = false;
      browser->set_wait_required(false);
    } else {
      this->is_waiting_ = !(browser->Wait());
      if (this->is_waiting_) {
        // If we are still waiting, we need to wait a bit then post a message to
        // ourselves to run the wait again. However, we can't wait using Sleep()
        // on this thread. This call happens in a message loop, and we would be 
        // unable to process the COM events in the browser if we put this thread
        // to sleep.
        unsigned int thread_id = 0;
        HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                        0,
                                                        &IECommandExecutor::WaitThreadProc,
                                                        (void *)this->m_hWnd,
                                                        0,
                                                        &thread_id));
        if (thread_handle != NULL) {
          ::CloseHandle(thread_handle);
        }
      }
    }
  } else {
    this->is_waiting_ = false;
  }
  return 0;
}

LRESULT IECommandExecutor::OnBrowserNewWindow(UINT uMsg,
                                              WPARAM wParam,
                                              LPARAM lParam,
                                              BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBrowserNewWindow";

  IWebBrowser2* browser = this->factory_.CreateBrowser();
  BrowserHandle new_window_wrapper(new Browser(browser, NULL, this->m_hWnd));
  this->AddManagedBrowser(new_window_wrapper);
  LPSTREAM* stream = reinterpret_cast<LPSTREAM*>(lParam);
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2,
                                                       browser,
                                                       stream);
  return 0;
}

LRESULT IECommandExecutor::OnBrowserQuit(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBrowserQuit";

  LPCSTR str = reinterpret_cast<LPCSTR>(lParam);
  std::string browser_id(str);
  delete[] str;
  BrowserMap::iterator found_iterator = this->managed_browsers_.find(browser_id);
  if (found_iterator != this->managed_browsers_.end()) {
    this->managed_browsers_.erase(browser_id);
    if (this->managed_browsers_.size() == 0) {
      this->current_browser_id_ = "";
    }
  } else {
    LOG(WARN) << "Unable to find browser to quit with ID " << browser_id;
  }
  return 0;
}

LRESULT IECommandExecutor::OnIsSessionValid(UINT uMsg,
                                            WPARAM wParam,
                                            LPARAM lParam,
                                            BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnIsSessionValid";

  return this->is_valid_ ? 1 : 0;
}

LRESULT IECommandExecutor::OnNewHtmlDialog(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandles) {
  LOG(TRACE) << "Entering IECommandExecutor::OnNewHtmlDialog";

  HWND dialog_handle = reinterpret_cast<HWND>(lParam);
  BrowserMap::const_iterator it = this->managed_browsers_.begin();
  for (; it != this->managed_browsers_.end(); ++it) {
    if (dialog_handle == it->second->window_handle()) {
      LOG(DEBUG) << "Dialog is equal to one managed browser";
      return 0;
    }
  }

  CComPtr<IHTMLDocument2> document;
  if (this->factory_.GetDocumentFromWindowHandle(dialog_handle, &document)) {
    CComPtr<IHTMLWindow2> window;
    document->get_parentWindow(&window);
    this->AddManagedBrowser(BrowserHandle(new HtmlDialog(window,
                                                         dialog_handle,
                                                         this->m_hWnd)));
  } else {
    LOG(WARN) << "Unable to get document from dialog";
  }
  return 0;
}

unsigned int WINAPI IECommandExecutor::WaitThreadProc(LPVOID lpParameter) {
  HWND window_handle = reinterpret_cast<HWND>(lpParameter);
  ::Sleep(WAIT_TIME_IN_MILLISECONDS);
  ::PostMessage(window_handle, WD_WAIT, NULL, NULL);
  return 0;
}


unsigned int WINAPI IECommandExecutor::ThreadProc(LPVOID lpParameter) {
  // Optional TODO: Create a struct to pass in via lpParameter
  // instead of just a pointer to an HWND. That way, we could
  // pass the mongoose server port via a single call, rather than
  // having to send an init message after the window is created.
  HWND *window_handle = reinterpret_cast<HWND*>(lpParameter);
  DWORD error = 0;
  HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
  IECommandExecutor new_session;
  HWND session_window_handle = new_session.Create(HWND_MESSAGE,
                                                  CWindow::rcDefault);
  if (session_window_handle == NULL) {
    error = ::GetLastError();
    LOG(WARN) << "Unable to create new session: " << error;
  }

  // Return the HWND back through lpParameter, and signal that the
  // window is ready for messages.
  *window_handle = session_window_handle;
  HANDLE event_handle = ::OpenEvent(EVENT_ALL_ACCESS, FALSE, EVENT_NAME);
  if (event_handle != NULL) {
    ::SetEvent(event_handle);
    ::CloseHandle(event_handle);
  }

    // Run the message loop
  MSG msg;
  while (::GetMessage(&msg, NULL, 0, 0) > 0) {
    ::TranslateMessage(&msg);
    ::DispatchMessage(&msg);
  }

  ::CoUninitialize();
  return 0;
}

void IECommandExecutor::DispatchCommand() {
  LOG(TRACE) << "Entering IECommandExecutor::DispatchCommand";

  Response response(this->session_id_);
  CommandHandlerMap::const_iterator found_iterator = 
      this->command_handlers_.find(this->current_command_.command_type());

  if (found_iterator == this->command_handlers_.end()) {
    LOG(WARN) << "Unable to find command handler for " << this->current_command_.command_type();
    response.SetErrorResponse(501, "Command not implemented");
  } else {
    BrowserHandle browser;
    int status_code = this->GetCurrentBrowser(&browser);
    if (status_code == SUCCESS) {
      bool alert_is_active = false;
      HWND alert_handle = browser->GetActiveDialogWindowHandle();
      if (alert_handle != NULL) {
        // Found a window handle, make sure it's an actual alert,
        // and not a showModalDialog() window.
        vector<char> window_class_name(34);
        ::GetClassNameA(alert_handle, &window_class_name[0], 34);
        if (strcmp(ALERT_WINDOW_CLASS, &window_class_name[0]) == 0) {
          alert_is_active = true;
        } else {
          LOG(WARN) << "Found alert handle does not have a window class consistent with an alert";
        }
      } else {
        LOG(DEBUG) << "No alert handle is found";
      }
      if (alert_is_active) {
        Alert dialog(browser, alert_handle);
        int command_type = this->current_command_.command_type();
        if (command_type == GetAlertText ||
            command_type == SendKeysToAlert ||
            command_type == AcceptAlert ||
            command_type == DismissAlert) {
          LOG(DEBUG) << "Alert is detected, and the sent command is valid";
        } else {
          LOG(DEBUG) << "Unexpected alert is detected, and the sent command is invalid when an alert is present";
          std::string alert_text = dialog.GetText();
          if (this->unexpected_alert_behavior_ == ACCEPT_UNEXPECTED_ALERTS) {
            LOG(DEBUG) << "Automatically accepting the alert";
            dialog.Accept();
          } else if (this->unexpected_alert_behavior_ == DISMISS_UNEXPECTED_ALERTS || command_type == Quit) {
            // If a quit command was issued, we should not ignore an unhandled
            // alert, even if the alert behavior is set to "ignore".
            LOG(DEBUG) << "Automatically dismissing the alert";
            if (dialog.is_standard_alert()) {
              dialog.Dismiss();
            } else {
              // The dialog was non-standard. The most common case of this is
              // an onBeforeUnload dialog, which must be accepted to continue.
              dialog.Accept();
            }
          }
          if (command_type != Quit) {
            // To keep pace with what Firefox does, we'll return the text of the
            // alert in the error response.
            Json::Value response_value;
            response_value["message"] = "Modal dialog present";
            response_value["alert"]["text"] = alert_text;
            response.SetResponse(EMODALDIALOGOPENED, response_value);
            this->serialized_response_ = response.Serialize();
            return;
          } else {
            LOG(DEBUG) << "Quit command was issued. Continuing with command after automatically closing alert.";
          }
        }
      }
    } else {
      LOG(WARN) << "Unable to find current browser";
    }

	  CommandHandlerHandle command_handler = found_iterator->second;
    command_handler->Execute(*this, this->current_command_, &response);

    status_code = this->GetCurrentBrowser(&browser);
    if (status_code == SUCCESS) {
      this->is_waiting_ = browser->wait_required();
      if (this->is_waiting_) {
        if (this->page_load_timeout_ >= 0) {
          this->wait_timeout_ = clock() + (this->page_load_timeout_ / 1000 * CLOCKS_PER_SEC);
        }
        ::PostMessage(this->m_hWnd, WD_WAIT, NULL, NULL);
      }
    } else {
      LOG(WARN) << "Unable to get current browser";
    }
  }

  this->serialized_response_ = response.Serialize();
}

int IECommandExecutor::GetCurrentBrowser(BrowserHandle* browser_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetCurrentBrowser";
  return this->GetManagedBrowser(this->current_browser_id_, browser_wrapper);
}

int IECommandExecutor::GetManagedBrowser(const std::string& browser_id,
                                         BrowserHandle* browser_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedBrowser";

  if (!this->is_valid()) {
    return ENOSUCHDRIVER;
  }

  if (browser_id == "") {
    LOG(WARN) << "Browser ID requested was an empty string";
    return ENOSUCHWINDOW;
  }

  BrowserMap::const_iterator found_iterator = 
      this->managed_browsers_.find(browser_id);
  if (found_iterator == this->managed_browsers_.end()) {
    LOG(WARN) << "Unable to find managed browser with id " << browser_id;
    return ENOSUCHWINDOW;
  }

  *browser_wrapper = found_iterator->second;
  return SUCCESS;
}

void IECommandExecutor::GetManagedBrowserHandles(std::vector<std::string>* managed_browser_handles) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedBrowserHandles";

  BrowserMap::const_iterator it = this->managed_browsers_.begin();
  for (; it != this->managed_browsers_.end(); ++it) {
    managed_browser_handles->push_back(it->first);

    // Look for browser windows created by showModalDialog().
    it->second->GetActiveDialogWindowHandle();
  }
}

void IECommandExecutor::AddManagedBrowser(BrowserHandle browser_wrapper) {
  LOG(TRACE) << "Entering IECommandExecutor::AddManagedBrowser";

  this->managed_browsers_[browser_wrapper->browser_id()] = browser_wrapper;
  if (this->current_browser_id_ == "") {
    LOG(TRACE) << "Setting current browser id to " << browser_wrapper->browser_id();
    this->current_browser_id_ = browser_wrapper->browser_id();
  }
}

int IECommandExecutor::CreateNewBrowser(std::string* error_message) {
  LOG(TRACE) << "Entering IECommandExecutor::CreateNewBrowser";

  vector<char> port_buffer(10);
  _itoa_s(this->port_, &port_buffer[0], 10, 10);
  std::string port(&port_buffer[0]);

  std::string initial_url = this->initial_browser_url_;
  if (this->initial_browser_url_ == "") {
    initial_url = "http://localhost:" + port + "/";
  }

  DWORD process_id = this->factory_.LaunchBrowserProcess(initial_url,
      this->ignore_protected_mode_settings_, error_message);
  if (process_id == NULL) {
    LOG(WARN) << "Unable to launch browser, received NULL process ID";
    this->is_waiting_ = false;
    return ENOSUCHDRIVER;
  }

  ProcessWindowInfo process_window_info;
  process_window_info.dwProcessId = process_id;
  process_window_info.hwndBrowser = NULL;
  process_window_info.pBrowser = NULL;
  bool attached = this->factory_.AttachToBrowser(&process_window_info,
                                                 this->ignore_zoom_setting_,
                                                 error_message);
  if (!attached) { 
    LOG(WARN) << "Unable to attach to browser COM object";
    this->is_waiting_ = false;
    return ENOSUCHDRIVER;
  }
  // Set persistent hover functionality in the interactions implementation. 
  setEnablePersistentHover(this->enable_persistent_hover_);
  LOG(INFO) << "Persistent hovering set to: " << this->enable_persistent_hover_;
  if (!this->enable_persistent_hover_) {
    LOG(INFO) << "Stopping previously-running persistent event thread.";
    stopPersistentEventFiring();
  }

  BrowserHandle wrapper(new Browser(process_window_info.pBrowser,
                                    process_window_info.hwndBrowser,
                                    this->m_hWnd));

  this->AddManagedBrowser(wrapper);
  return SUCCESS;
}

int IECommandExecutor::GetManagedElement(const std::string& element_id,
                                         ElementHandle* element_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedElement";

  ElementMap::const_iterator found_iterator = this->managed_elements_.find(element_id);
  if (found_iterator == this->managed_elements_.end()) {
    LOG(DEBUG) << "Unable to find managed element with id " << element_id;
    return ENOSUCHELEMENT;
  }

  *element_wrapper = found_iterator->second;
  return SUCCESS;
}

void IECommandExecutor::AddManagedElement(IHTMLElement* element,
                                          ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering IECommandExecutor::AddManagedElement";

  // TODO: This method needs much work. If we are already managing a
  // given element, we don't want to assign it a new ID, but to find
  // out if we're managing it already, we need to compare to all of 
  // the elements already in our map, which means iterating through
  // the map. For long-running tests, this means the addition of a
  // new managed element may take longer and longer as we have no
  // good algorithm for removing dead elements from the map.
  bool element_already_managed = false;
  ElementMap::iterator it = this->managed_elements_.begin();
  for (; it != this->managed_elements_.end(); ++it) {
    if (it->second->element() == element) {
      *element_wrapper = it->second;
      element_already_managed = true;
      break;
    }
  }

  if (!element_already_managed) {
    LOG(DEBUG) << "Element is not yet managed";
    BrowserHandle current_browser;
    this->GetCurrentBrowser(&current_browser);
    ElementHandle new_wrapper(new Element(element,
                                          current_browser->GetWindowHandle()));
    this->managed_elements_[new_wrapper->element_id()] = new_wrapper;
    *element_wrapper = new_wrapper;
  } else {
    LOG(DEBUG) << "Element is already managed";
  }
}

void IECommandExecutor::RemoveManagedElement(const std::string& element_id) {
  LOG(TRACE) << "Entering IECommandExecutor::RemoveManagedElement";

  ElementMap::iterator found_iterator = this->managed_elements_.find(element_id);
  if (found_iterator != this->managed_elements_.end()) {
    this->managed_elements_.erase(element_id);
  } else {
    LOG(DEBUG) << "Unable to find element to remove with id " << element_id;
  }
}

void IECommandExecutor::ListManagedElements() {
  LOG(TRACE) << "Entering IECommandExecutor::ListManagedElements";

  ElementMap::iterator it = this->managed_elements_.begin();
  for (; it != this->managed_elements_.end(); ++it) {
    LOG(DEBUG) << "Managed element: " << it->first;
  }
}

int IECommandExecutor::GetElementFindMethod(const std::string& mechanism,
                                            std::wstring* translation) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetElementFindMethod";

  ElementFindMethodMap::const_iterator found_iterator =
      this->element_find_methods_.find(mechanism);
  if (found_iterator == this->element_find_methods_.end()) {
    LOG(WARN) << "Unable to determine find method " << mechanism;
    return EUNHANDLEDERROR;
  }

  *translation = found_iterator->second;
  return SUCCESS;
}

int IECommandExecutor::LocateElement(const ElementHandle parent_wrapper,
                                     const std::string& mechanism,
                                     const std::string& criteria,
                                     Json::Value* found_element) const {
  LOG(TRACE) << "Entering IECommandExecutor::LocateElement";

  std::wstring mechanism_translation = L"";
  int status_code = this->GetElementFindMethod(mechanism,
                                               &mechanism_translation);
  if (status_code != SUCCESS) {
    LOG(WARN) << "Unable to determine mechanism translation for " << mechanism;
    return status_code;
  }

  std::wstring wide_criteria = CA2W(criteria.c_str(), CP_UTF8);
  return this->element_finder().FindElement(*this,
                                            parent_wrapper,
                                            mechanism_translation,
                                            wide_criteria,
                                            found_element);
}

int IECommandExecutor::LocateElements(const ElementHandle parent_wrapper,
                                      const std::string& mechanism,
                                      const std::string& criteria,
                                      Json::Value* found_elements) const {
  LOG(TRACE) << "Entering IECommandExecutor::LocateElements";

  std::wstring mechanism_translation = L"";
  int status_code = this->GetElementFindMethod(mechanism,
                                               &mechanism_translation);
  if (status_code != SUCCESS) {
    LOG(WARN) << "Unable to determine mechanism translation for " << mechanism;
    return status_code;
  }

  std::wstring wide_criteria = CA2W(criteria.c_str(), CP_UTF8);
  return this->element_finder().FindElements(*this,
                                             parent_wrapper,
                                             mechanism_translation,
                                             wide_criteria,
                                             found_elements);
}

void IECommandExecutor::PopulateElementFinderMethods(void) {
  LOG(TRACE) << "Entering IECommandExecutor::PopulateElementFinderMethods";

  this->element_find_methods_["id"] = L"id";
  this->element_find_methods_["name"] = L"name";
  this->element_find_methods_["tag name"] = L"tagName";
  this->element_find_methods_["link text"] = L"linkText";
  this->element_find_methods_["partial link text"] = L"partialLinkText";
  this->element_find_methods_["class name"] = L"className";
  this->element_find_methods_["xpath"] = L"xpath";
  this->element_find_methods_["css selector"] = L"css";
}

void IECommandExecutor::PopulateCommandHandlers() {
  LOG(TRACE) << "Entering IECommandExecutor::PopulateCommandHandlers";

  this->command_handlers_[NoCommand] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetCurrentWindowHandle] = CommandHandlerHandle(new GetCurrentWindowHandleCommandHandler);
  this->command_handlers_[GetWindowHandles] = CommandHandlerHandle(new GetAllWindowHandlesCommandHandler);
  this->command_handlers_[SwitchToWindow] = CommandHandlerHandle(new SwitchToWindowCommandHandler);
  this->command_handlers_[SwitchToFrame] = CommandHandlerHandle(new SwitchToFrameCommandHandler);
  this->command_handlers_[Get] = CommandHandlerHandle(new GoToUrlCommandHandler);
  this->command_handlers_[GoForward] = CommandHandlerHandle(new GoForwardCommandHandler);
  this->command_handlers_[GoBack] = CommandHandlerHandle(new GoBackCommandHandler);
  this->command_handlers_[Refresh] = CommandHandlerHandle(new RefreshCommandHandler);
  this->command_handlers_[ImplicitlyWait] = CommandHandlerHandle(new SetImplicitWaitTimeoutCommandHandler);
  this->command_handlers_[SetAsyncScriptTimeout] = CommandHandlerHandle(new SetAsyncScriptTimeoutCommandHandler);
  this->command_handlers_[SetTimeout] = CommandHandlerHandle(new SetTimeoutCommandHandler);
  this->command_handlers_[NewSession] = CommandHandlerHandle(new NewSessionCommandHandler);
  this->command_handlers_[GetSessionCapabilities] = CommandHandlerHandle(new GetSessionCapabilitiesCommandHandler);
  this->command_handlers_[Close] = CommandHandlerHandle(new CloseWindowCommandHandler);
  this->command_handlers_[Quit] = CommandHandlerHandle(new QuitCommandHandler);
  this->command_handlers_[GetTitle] = CommandHandlerHandle(new GetTitleCommandHandler);
  this->command_handlers_[GetPageSource] = CommandHandlerHandle(new GetPageSourceCommandHandler);
  this->command_handlers_[GetCurrentUrl] = CommandHandlerHandle(new GetCurrentUrlCommandHandler);
  this->command_handlers_[ExecuteAsyncScript] = CommandHandlerHandle(new ExecuteAsyncScriptCommandHandler);
  this->command_handlers_[ExecuteScript] = CommandHandlerHandle(new ExecuteScriptCommandHandler);
  this->command_handlers_[GetActiveElement] = CommandHandlerHandle(new GetActiveElementCommandHandler);
  this->command_handlers_[FindElement] = CommandHandlerHandle(new FindElementCommandHandler);
  this->command_handlers_[FindElements] = CommandHandlerHandle(new FindElementsCommandHandler);
  this->command_handlers_[FindChildElement] = CommandHandlerHandle(new FindChildElementCommandHandler);
  this->command_handlers_[FindChildElements] = CommandHandlerHandle(new FindChildElementsCommandHandler);
  this->command_handlers_[GetElementTagName] = CommandHandlerHandle(new GetElementTagNameCommandHandler);
  this->command_handlers_[GetElementLocation] = CommandHandlerHandle(new GetElementLocationCommandHandler);
  this->command_handlers_[GetElementSize] = CommandHandlerHandle(new GetElementSizeCommandHandler);
  this->command_handlers_[GetElementLocationOnceScrolledIntoView] = CommandHandlerHandle(new GetElementLocationOnceScrolledIntoViewCommandHandler);
  this->command_handlers_[GetElementAttribute] = CommandHandlerHandle(new GetElementAttributeCommandHandler);
  this->command_handlers_[GetElementText] = CommandHandlerHandle(new GetElementTextCommandHandler);
  this->command_handlers_[GetElementValueOfCssProperty] = CommandHandlerHandle(new GetElementValueOfCssPropertyCommandHandler);
  this->command_handlers_[ClickElement] = CommandHandlerHandle(new ClickElementCommandHandler);
  this->command_handlers_[ClearElement] = CommandHandlerHandle(new ClearElementCommandHandler);
  this->command_handlers_[SubmitElement] = CommandHandlerHandle(new SubmitElementCommandHandler);
  this->command_handlers_[IsElementDisplayed] = CommandHandlerHandle(new IsElementDisplayedCommandHandler);
  this->command_handlers_[IsElementSelected] = CommandHandlerHandle(new IsElementSelectedCommandHandler);
  this->command_handlers_[IsElementEnabled] = CommandHandlerHandle(new IsElementEnabledCommandHandler);
  this->command_handlers_[SendKeysToElement] = CommandHandlerHandle(new SendKeysCommandHandler);
  this->command_handlers_[ElementEquals] = CommandHandlerHandle(new ElementEqualsCommandHandler);
  this->command_handlers_[AddCookie] = CommandHandlerHandle(new AddCookieCommandHandler);
  this->command_handlers_[GetAllCookies] = CommandHandlerHandle(new GetAllCookiesCommandHandler);
  this->command_handlers_[DeleteCookie] = CommandHandlerHandle(new DeleteCookieCommandHandler);
  this->command_handlers_[DeleteAllCookies] = CommandHandlerHandle(new DeleteAllCookiesCommandHandler);
  this->command_handlers_[Screenshot] = CommandHandlerHandle(new ScreenshotCommandHandler);

  this->command_handlers_[AcceptAlert] = CommandHandlerHandle(new AcceptAlertCommandHandler);
  this->command_handlers_[DismissAlert] = CommandHandlerHandle(new DismissAlertCommandHandler);
  this->command_handlers_[GetAlertText] = CommandHandlerHandle(new GetAlertTextCommandHandler);
  this->command_handlers_[SendKeysToAlert] = CommandHandlerHandle(new SendKeysToAlertCommandHandler);

  this->command_handlers_[MouseMoveTo] = CommandHandlerHandle(new MouseMoveToCommandHandler);
  this->command_handlers_[MouseClick] = CommandHandlerHandle(new MouseClickCommandHandler);
  this->command_handlers_[MouseDoubleClick] = CommandHandlerHandle(new MouseDoubleClickCommandHandler);
  this->command_handlers_[MouseButtonDown] = CommandHandlerHandle(new MouseButtonDownCommandHandler);
  this->command_handlers_[MouseButtonUp] = CommandHandlerHandle(new MouseButtonUpCommandHandler);
  this->command_handlers_[SendKeysToActiveElement] = CommandHandlerHandle(new SendKeysToActiveElementCommandHandler);

  this->command_handlers_[GetWindowSize] = CommandHandlerHandle(new GetWindowSizeCommandHandler);
  this->command_handlers_[SetWindowSize] = CommandHandlerHandle(new SetWindowSizeCommandHandler);
  this->command_handlers_[GetWindowPosition] = CommandHandlerHandle(new GetWindowPositionCommandHandler);
  this->command_handlers_[SetWindowPosition] = CommandHandlerHandle(new SetWindowPositionCommandHandler);
  this->command_handlers_[MaximizeWindow] = CommandHandlerHandle(new MaximizeWindowCommandHandler);

  // As-yet unimplemented commands
  this->command_handlers_[Status] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetSessionList] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetOrientation] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[SetOrientation] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[ListAvailableImeEngines] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetActiveImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[IsImeActivated] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[ActivateImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[DeactivateImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchClick] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchDown] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchUp] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchMove] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchScroll] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchDoubleClick] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchLongClick] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[TouchFlick] = CommandHandlerHandle(new IECommandHandler);
}

} // namespace webdriver
