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

#include "IECommandExecutor.h"
#include <algorithm>
#include <ctime>
#include <vector>
#include "CommandExecutor.h"
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
#include "CommandHandlers/SetAlertCredentialsCommandHandler.h"
#include "CommandHandlers/SetAsyncScriptTimeoutCommandHandler.h"
#include "CommandHandlers/SetImplicitWaitTimeoutCommandHandler.h"
#include "CommandHandlers/SetTimeoutCommandHandler.h"
#include "CommandHandlers/SetWindowPositionCommandHandler.h"
#include "CommandHandlers/SetWindowSizeCommandHandler.h"
#include "CommandHandlers/SubmitElementCommandHandler.h"
#include "CommandHandlers/SwitchToFrameCommandHandler.h"
#include "CommandHandlers/SwitchToParentFrameCommandHandler.h"
#include "CommandHandlers/SwitchToWindowCommandHandler.h"
#include "HtmlDialog.h"
#include "StringUtilities.h"

namespace webdriver {

LRESULT IECommandExecutor::OnCreate(UINT uMsg,
                                    WPARAM wParam,
                                    LPARAM lParam,
                                    BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnCreate";
  
  CREATESTRUCT* create = reinterpret_cast<CREATESTRUCT*>(lParam);
  IECommandExecutorThreadContext* context = reinterpret_cast<IECommandExecutorThreadContext*>(create->lpCreateParams);
  this->port_ = context->port;

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

  std::string session_id = StringUtilities::ToString(cast_guid_string);
  this->session_id_ = session_id;
  this->is_valid_ = true;

  ::RpcStringFree(&guid_string);

  this->PopulateCommandHandlers();
  this->PopulateElementFinderMethods();
  this->current_browser_id_ = "";
  this->serialized_response_ = "";
  this->enable_element_cache_cleanup_ = true;
  this->enable_persistent_hover_ = true;
  this->unexpected_alert_behavior_ = IGNORE_UNEXPECTED_ALERTS;
  this->implicit_wait_timeout_ = 0;
  this->async_script_timeout_ = -1;
  this->page_load_timeout_ = -1;
  this->is_waiting_ = false;
  this->page_load_strategy_ = "normal";
  this->file_upload_dialog_timeout_ = DEFAULT_FILE_UPLOAD_DIALOG_TIMEOUT_IN_MILLISECONDS;
  this->enable_full_page_screenshot_ = true;

  this->input_manager_ = new InputManager();
  this->input_manager_->Initialize(&this->managed_elements_);
  this->proxy_manager_ = new ProxyManager();
  this->factory_ = new BrowserFactory();

  return 0;
}

LRESULT IECommandExecutor::OnDestroy(UINT uMsg,
                                     WPARAM wParam,
                                     LPARAM lParam,
                                     BOOL& bHandled) {
  LOG(DEBUG) << "Entering IECommandExecutor::OnDestroy";

  LOG(DEBUG) << "Clearing managed element cache";
  this->managed_elements_.Clear();
  LOG(DEBUG) << "Closing input manager";
  delete this->input_manager_;
  LOG(DEBUG) << "Closing proxy manager";
  delete this->proxy_manager_;
  LOG(DEBUG) << "Closing browser factory";
  delete this->factory_;
  LOG(DEBUG) << "Posting quit message";
  ::PostQuitMessage(0);
  LOG(DEBUG) << "Leaving IECommandExecutor::OnDestroy";
  return 0;
}

LRESULT IECommandExecutor::OnSetCommand(UINT uMsg,
                                        WPARAM wParam,
                                        LPARAM lParam,
                                        BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnSetCommand";

  LPCSTR json_command = reinterpret_cast<LPCSTR>(lParam);
  this->current_command_.Deserialize(json_command);
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
  // Not logging trace entering IECommandExecutor::OnGetResponseLength,
  // because it is polled repeatedly for a non-zero return value.
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
  if (status_code == WD_SUCCESS && !browser->is_closing()) {
    if (this->page_load_timeout_ >= 0 && this->wait_timeout_ < clock()) {
      Response timeout_response;
      timeout_response.SetErrorResponse(ETIMEOUT, "Timed out waiting for page to load.");
      this->serialized_response_ = timeout_response.Serialize();
      this->is_waiting_ = false;
      browser->set_wait_required(false);
    } else {
      this->is_waiting_ = !(browser->Wait(this->page_load_strategy_));
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
        } else {
          LOGERR(DEBUG) << "Unable to create waiter thread";
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

  IWebBrowser2* browser = this->factory_->CreateBrowser();
  if (browser == NULL) {
    // No browser was created, so we have to bail early.
    // Check the log for the HRESULT why.
    return 1;
  }
  BrowserHandle new_window_wrapper(new Browser(browser, NULL, this->m_hWnd));
  // It is acceptable to set the proxy settings here, as the newly-created
  // browser window has not yet been navigated to any page. Only after the
  // interface has been marshaled back across the thread boundary to the
  // NewWindow3 event handler will the navigation begin, which ensures that
  // even the initial navigation will get captured by the proxy, if one is
  // set.
  // N.B. DocumentHost::GetBrowserWindowHandle returns the tab window handle
  // for IE 7 and above, and the top-level window for IE6. This is the window
  // required for setting the proxy settings.
  this->proxy_manager_->SetProxySettings(new_window_wrapper->GetBrowserWindowHandle());
  this->AddManagedBrowser(new_window_wrapper);
  LPSTREAM* stream = reinterpret_cast<LPSTREAM*>(lParam);
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2,
                                                       browser,
                                                       stream);
  if (FAILED(hr)) {
    LOGHR(DEBUG, hr) << "Marshalling of interface pointer b/w threads is failed.";
  }

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
    // If there's still an alert window active, repost this message to
    // ourselves, since the alert will be handled either automatically or
    // manually by the user.
    HWND alert_handle;
    if (this->IsAlertActive(found_iterator->second, &alert_handle)) {
      LOG(DEBUG) << "Alert is active on closing browser window. Reposting message.";
      LPSTR message_payload = new CHAR[browser_id.size() + 1];
      strcpy_s(message_payload, browser_id.size() + 1, browser_id.c_str());
      ::PostMessage(this->m_hWnd,
                    WD_BROWSER_QUIT,
                    NULL,
                    reinterpret_cast<LPARAM>(message_payload));
    } else {
      this->managed_browsers_.erase(browser_id);
      if (this->managed_browsers_.size() == 0) {
        this->current_browser_id_ = "";
      }
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

  int retry_count = 0;
  CComPtr<IHTMLDocument2> document;
  bool found_document = this->factory_->GetDocumentFromWindowHandle(dialog_handle, &document);
  while (found_document && retry_count < MAX_HTML_DIALOG_RETRIES) {
    CComPtr<IHTMLWindow2> window;
    HRESULT hr = document->get_parentWindow(&window);
    if (FAILED(hr)) {
      // Getting the parent window of the dialog's document failed. This
      // usually means that the document changed out from under us before we
      // could get the window reference. The canonical case for this is a
      // redirect using JavaScript. Sleep for a short time, then retry to
      // obtain the reference.
      LOGHR(DEBUG, hr) << "IHTMLDocument2::get_parentWindow failed. Retrying.";
      ::Sleep(100);
      document.Release();
      found_document = this->factory_->GetDocumentFromWindowHandle(dialog_handle, &document);
      ++retry_count;
    } else {
      this->AddManagedBrowser(BrowserHandle(new HtmlDialog(window,
                                                           dialog_handle,
                                                           this->m_hWnd)));
      return 0;
    }
  }
  if (found_document) {
    LOG(WARN) << "Got document from dialog, but could not get window";
  } else {
    LOG(WARN) << "Unable to get document from dialog";
  }
  return 0;
}

LRESULT IECommandExecutor::OnQuit(UINT uMsg,
                                  WPARAM wParam,
                                  LPARAM lParam,
                                  BOOL& bHandled) {
  this->input_manager_->StopPersistentEvents();
  return 0;
}

LRESULT IECommandExecutor::OnGetQuitStatus(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandled) {
  return this->is_quitting_ && this->managed_browsers_.size() > 0 ? 1 : 0;
}

LRESULT IECommandExecutor::OnRefreshManagedElements(UINT uMsg,
                                                    WPARAM wParam,
                                                    LPARAM lParam,
                                                    BOOL& bHandled) {
  if (this->enable_element_cache_cleanup_) {
    this->managed_elements_.ClearCache();
  }
  return 0;
}

LRESULT IECommandExecutor::OnHandleUnexpectedAlerts(UINT uMsg,
                                                    WPARAM wParam,
                                                    LPARAM lParam,
                                                    BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnHandleUnexpectedAlerts";
  BrowserMap::const_iterator it = this->managed_browsers_.begin();
  for (; it != this->managed_browsers_.end(); ++it) {
    HWND alert_handle = it->second->GetActiveDialogWindowHandle();
    if (alert_handle != NULL) {
      this->HandleUnexpectedAlert(it->second, alert_handle, true);
      it->second->Close();
    }
  }
  return 0;
}

unsigned int WINAPI IECommandExecutor::WaitThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering IECommandExecutor::WaitThreadProc";
  HWND window_handle = reinterpret_cast<HWND>(lpParameter);
  ::Sleep(WAIT_TIME_IN_MILLISECONDS);
  ::PostMessage(window_handle, WD_WAIT, NULL, NULL);
  return 0;
}


unsigned int WINAPI IECommandExecutor::ThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering IECommandExecutor::ThreadProc";

  IECommandExecutorThreadContext* thread_context = reinterpret_cast<IECommandExecutorThreadContext*>(lpParameter);
  HWND window_handle = thread_context->hwnd;

  // it is better to use IECommandExecutorSessionContext instead
  // but use ThreadContext for code minimization
  IECommandExecutorThreadContext* session_context = new IECommandExecutorThreadContext();
  session_context->port = thread_context->port;

  DWORD error = 0;
  HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
  if (FAILED(hr)) {
    LOGHR(DEBUG, hr) << "COM library initialization encountered an error";
  }

  IECommandExecutor new_session;
  HWND session_window_handle = new_session.Create(/*HWND*/ HWND_MESSAGE,
                                                  /*_U_RECT rect*/ CWindow::rcDefault,
                                                  /*LPCTSTR szWindowName*/ NULL,
                                                  /*DWORD dwStyle*/ NULL,
                                                  /*DWORD dwExStyle*/ NULL,
                                                  /*_U_MENUorID MenuOrID*/ 0U,
                                                  /*LPVOID lpCreateParam*/ reinterpret_cast<LPVOID*>(session_context));
  if (session_window_handle == NULL) {
    LOGERR(WARN) << "Unable to create new IECommandExecutor session";
  }

  MSG msg;
  ::PeekMessage(&msg, NULL, WM_USER, WM_USER, PM_NOREMOVE);

  // Return the HWND back through lpParameter, and signal that the
  // window is ready for messages.
  thread_context->hwnd = session_window_handle;
  HANDLE event_handle = ::OpenEvent(EVENT_ALL_ACCESS, FALSE, EVENT_NAME);
  if (event_handle != NULL) {
    ::SetEvent(event_handle);
    ::CloseHandle(event_handle);
  } else {
    LOGERR(DEBUG) << "Unable to signal that window is ready";
  }

  // Run the message loop
  BOOL get_message_return_value;
  while ((get_message_return_value = ::GetMessage(&msg, NULL, 0, 0)) != 0) {
    if (get_message_return_value == -1) {
      LOGERR(WARN) << "Windows GetMessage() API returned error";
      break;
    } else {
      if (msg.message == WD_SHUTDOWN) {
        LOG(DEBUG) << "Shutdown message received";
        new_session.DestroyWindow();
        LOG(DEBUG) << "Returned from DestroyWindow()";
        break;
      } else {
        ::TranslateMessage(&msg);
        ::DispatchMessage(&msg);
      }
    }
  }

  LOG(DEBUG) << "Exited IECommandExecutor thread message loop";
  ::CoUninitialize();
  delete session_context;
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
    int status_code = WD_SUCCESS;
    if (this->current_command_.command_type() != webdriver::CommandType::NewSession) {
      // There should never be a modal dialog or alert to check for if the command
      // is the "newSession" command.
      status_code = this->GetCurrentBrowser(&browser);
      if (status_code == WD_SUCCESS) {
        HWND alert_handle = NULL;
        bool alert_is_active = this->IsAlertActive(browser, &alert_handle);
        if (alert_is_active) {
          std::string command_type = this->current_command_.command_type();
          if (command_type == webdriver::CommandType::GetAlertText ||
              command_type == webdriver::CommandType::SendKeysToAlert ||
              command_type == webdriver::CommandType::AcceptAlert ||
              command_type == webdriver::CommandType::DismissAlert ||
              command_type == webdriver::CommandType::SetAlertCredentials) {
            LOG(DEBUG) << "Alert is detected, and the sent command is valid";
          } else {
            LOG(DEBUG) << "Unexpected alert is detected, and the sent command is invalid when an alert is present";
            std::string alert_text = this->HandleUnexpectedAlert(browser,
                                                                 alert_handle,
                                                                 command_type == webdriver::CommandType::Quit);
            if (command_type != webdriver::CommandType::Quit) {
              // To keep pace with what Firefox does, we'll return the text of the
              // alert in the error response.
              Json::Value response_value;
              response_value["message"] = "Modal dialog present";
              response_value["alert"]["text"] = alert_text;
              response.SetResponse(EUNEXPECTEDALERTOPEN, response_value);
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
    }
    CommandHandlerHandle command_handler = found_iterator->second;
    command_handler->Execute(*this, this->current_command_, &response);

    status_code = this->GetCurrentBrowser(&browser);
    if (status_code == WD_SUCCESS) {
      this->is_waiting_ = browser->wait_required();
      if (this->is_waiting_) {
        if (this->page_load_timeout_ >= 0) {
          this->wait_timeout_ = clock() + (this->page_load_timeout_ / 1000 * CLOCKS_PER_SEC);
        }
        ::PostMessage(this->m_hWnd, WD_WAIT, NULL, NULL);
      }
    } else {
      if (this->current_command_.command_type() != webdriver::CommandType::Quit) {
        LOG(WARN) << "Unable to get current browser";
      }
    }
  }

  this->serialized_response_ = response.Serialize();
}

bool IECommandExecutor::IsAlertActive(BrowserHandle browser, HWND* alert_handle) {
  LOG(TRACE) << "Entering IECommandExecutor::IsAlertActive";
  HWND dialog_handle = browser->GetActiveDialogWindowHandle();
  if (dialog_handle != NULL) {
    // Found a window handle, make sure it's an actual alert,
    // and not a showModalDialog() window.
    std::vector<char> window_class_name(34);
    ::GetClassNameA(dialog_handle, &window_class_name[0], 34);
    if (strcmp(ALERT_WINDOW_CLASS, &window_class_name[0]) == 0) {
      *alert_handle = dialog_handle;
      return true;
    } else {
      LOG(WARN) << "Found alert handle does not have a window class consistent with an alert";
    }
  } else {
    LOG(DEBUG) << "No alert handle is found";
  }
  return false;
}

std::string IECommandExecutor::HandleUnexpectedAlert(BrowserHandle browser,
                                                     HWND alert_handle,
                                                     bool force_use_dismiss) {
  LOG(TRACE) << "Entering IECommandExecutor::HandleUnexpectedAlert";
  Alert dialog(browser, alert_handle);
  std::string alert_text = dialog.GetText();
  if (this->unexpected_alert_behavior_ == ACCEPT_UNEXPECTED_ALERTS) {
    LOG(DEBUG) << "Automatically accepting the alert";
    dialog.Accept();
  } else if (this->unexpected_alert_behavior_ == DISMISS_UNEXPECTED_ALERTS || force_use_dismiss) {
    // If a quit command was issued, we should not ignore an unhandled
    // alert, even if the alert behavior is set to "ignore".
    LOG(DEBUG) << "Automatically dismissing the alert";
    if (dialog.is_standard_alert() || dialog.is_security_alert()) {
      dialog.Dismiss();
    } else {
      // The dialog was non-standard. The most common case of this is
      // an onBeforeUnload dialog, which must be accepted to continue.
      dialog.Accept();
    }
  }
  return alert_text;
}

int IECommandExecutor::GetCurrentBrowser(BrowserHandle* browser_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetCurrentBrowser";
  return this->GetManagedBrowser(this->current_browser_id_, browser_wrapper);
}

int IECommandExecutor::GetManagedBrowser(const std::string& browser_id,
                                         BrowserHandle* browser_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedBrowser";

  if (!this->is_valid()) {
    LOG(TRACE) << "Current command executor is not valid";
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
  return WD_SUCCESS;
}

void IECommandExecutor::GetManagedBrowserHandles(std::vector<std::string>* managed_browser_handles) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedBrowserHandles";

  BrowserMap::const_iterator it = this->managed_browsers_.begin();
  for (; it != this->managed_browsers_.end(); ++it) {
    if (it->second->IsValidWindow()) {
      managed_browser_handles->push_back(it->first);
    }

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

  DWORD process_id = this->factory_->LaunchBrowserProcess(error_message);
  if (process_id == NULL) {
    LOG(WARN) << "Unable to launch browser, received NULL process ID";
    this->is_waiting_ = false;
    return ENOSUCHDRIVER;
  }

  ProcessWindowInfo process_window_info;
  process_window_info.dwProcessId = process_id;
  process_window_info.hwndBrowser = NULL;
  process_window_info.pBrowser = NULL;
  bool attached = this->factory_->AttachToBrowser(&process_window_info,
                                                  error_message);
  if (!attached) { 
    LOG(WARN) << "Unable to attach to browser COM object";
    this->is_waiting_ = false;
    return ENOSUCHDRIVER;
  }
  // Set persistent hover functionality in the interactions implementation. 
  this->input_manager_->SetPersistentEvents(this->enable_persistent_hover_);
  LOG(INFO) << "Persistent hovering set to: " << this->enable_persistent_hover_;
  if (!this->enable_persistent_hover_) {
    LOG(INFO) << "Stopping previously-running persistent event thread.";
    this->input_manager_->StopPersistentEvents();
  }

  this->proxy_manager_->SetProxySettings(process_window_info.hwndBrowser);
  BrowserHandle wrapper(new Browser(process_window_info.pBrowser,
                                    process_window_info.hwndBrowser,
                                    this->m_hWnd));

  this->AddManagedBrowser(wrapper);
  bool is_busy = wrapper->IsBusy();
  if (is_busy) {
    LOG(WARN) << "Browser was launched and attached to, but is still busy.";
  }
  return WD_SUCCESS;
}

int IECommandExecutor::GetManagedElement(const std::string& element_id,
                                         ElementHandle* element_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedElement";
  return this->managed_elements_.GetManagedElement(element_id, element_wrapper);
}

void IECommandExecutor::AddManagedElement(IHTMLElement* element,
                                          ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering IECommandExecutor::AddManagedElement";
  BrowserHandle current_browser;
  this->GetCurrentBrowser(&current_browser);
  this->managed_elements_.AddManagedElement(current_browser, element, element_wrapper);
}

void IECommandExecutor::RemoveManagedElement(const std::string& element_id) {
  LOG(TRACE) << "Entering IECommandExecutor::RemoveManagedElement";
  this->managed_elements_.RemoveManagedElement(element_id);
}

void IECommandExecutor::ListManagedElements() {
  LOG(TRACE) << "Entering IECommandExecutor::ListManagedElements";
  this->managed_elements_.ListManagedElements();
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
  return WD_SUCCESS;
}

int IECommandExecutor::LocateElement(const ElementHandle parent_wrapper,
                                     const std::string& mechanism,
                                     const std::string& criteria,
                                     Json::Value* found_element) const {
  LOG(TRACE) << "Entering IECommandExecutor::LocateElement";

  std::wstring mechanism_translation = L"";
  int status_code = this->GetElementFindMethod(mechanism,
                                               &mechanism_translation);
  if (status_code != WD_SUCCESS) {
    LOG(WARN) << "Unable to determine mechanism translation for " << mechanism;
    return status_code;
  }

  std::wstring wide_criteria = StringUtilities::ToWString(criteria);
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
  if (status_code != WD_SUCCESS) {
    LOG(WARN) << "Unable to determine mechanism translation for " << mechanism;
    return status_code;
  }

  std::wstring wide_criteria = StringUtilities::ToWString(criteria);
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

  this->command_handlers_[webdriver::CommandType::NoCommand] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::GetCurrentWindowHandle] = CommandHandlerHandle(new GetCurrentWindowHandleCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetWindowHandles] = CommandHandlerHandle(new GetAllWindowHandlesCommandHandler);
  this->command_handlers_[webdriver::CommandType::SwitchToWindow] = CommandHandlerHandle(new SwitchToWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::SwitchToFrame] = CommandHandlerHandle(new SwitchToFrameCommandHandler);
  this->command_handlers_[webdriver::CommandType::SwitchToParentFrame] = CommandHandlerHandle(new SwitchToParentFrameCommandHandler);
  this->command_handlers_[webdriver::CommandType::Get] = CommandHandlerHandle(new GoToUrlCommandHandler);
  this->command_handlers_[webdriver::CommandType::GoForward] = CommandHandlerHandle(new GoForwardCommandHandler);
  this->command_handlers_[webdriver::CommandType::GoBack] = CommandHandlerHandle(new GoBackCommandHandler);
  this->command_handlers_[webdriver::CommandType::Refresh] = CommandHandlerHandle(new RefreshCommandHandler);
  this->command_handlers_[webdriver::CommandType::ImplicitlyWait] = CommandHandlerHandle(new SetImplicitWaitTimeoutCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetAsyncScriptTimeout] = CommandHandlerHandle(new SetAsyncScriptTimeoutCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetTimeout] = CommandHandlerHandle(new SetTimeoutCommandHandler);
  this->command_handlers_[webdriver::CommandType::NewSession] = CommandHandlerHandle(new NewSessionCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetSessionCapabilities] = CommandHandlerHandle(new GetSessionCapabilitiesCommandHandler);
  this->command_handlers_[webdriver::CommandType::Close] = CommandHandlerHandle(new CloseWindowCommandHandler);
  this->command_handlers_[webdriver::CommandType::Quit] = CommandHandlerHandle(new QuitCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetTitle] = CommandHandlerHandle(new GetTitleCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetPageSource] = CommandHandlerHandle(new GetPageSourceCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetCurrentUrl] = CommandHandlerHandle(new GetCurrentUrlCommandHandler);
  this->command_handlers_[webdriver::CommandType::ExecuteAsyncScript] = CommandHandlerHandle(new ExecuteAsyncScriptCommandHandler);
  this->command_handlers_[webdriver::CommandType::ExecuteScript] = CommandHandlerHandle(new ExecuteScriptCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetActiveElement] = CommandHandlerHandle(new GetActiveElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindElement] = CommandHandlerHandle(new FindElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindElements] = CommandHandlerHandle(new FindElementsCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindChildElement] = CommandHandlerHandle(new FindChildElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::FindChildElements] = CommandHandlerHandle(new FindChildElementsCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementTagName] = CommandHandlerHandle(new GetElementTagNameCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementLocation] = CommandHandlerHandle(new GetElementLocationCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementSize] = CommandHandlerHandle(new GetElementSizeCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementLocationOnceScrolledIntoView] = CommandHandlerHandle(new GetElementLocationOnceScrolledIntoViewCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementAttribute] = CommandHandlerHandle(new GetElementAttributeCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementText] = CommandHandlerHandle(new GetElementTextCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetElementValueOfCssProperty] = CommandHandlerHandle(new GetElementValueOfCssPropertyCommandHandler);
  this->command_handlers_[webdriver::CommandType::ClickElement] = CommandHandlerHandle(new ClickElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::ClearElement] = CommandHandlerHandle(new ClearElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::SubmitElement] = CommandHandlerHandle(new SubmitElementCommandHandler);
  this->command_handlers_[webdriver::CommandType::IsElementDisplayed] = CommandHandlerHandle(new IsElementDisplayedCommandHandler);
  this->command_handlers_[webdriver::CommandType::IsElementSelected] = CommandHandlerHandle(new IsElementSelectedCommandHandler);
  this->command_handlers_[webdriver::CommandType::IsElementEnabled] = CommandHandlerHandle(new IsElementEnabledCommandHandler);
  this->command_handlers_[webdriver::CommandType::SendKeysToElement] = CommandHandlerHandle(new SendKeysCommandHandler);
  this->command_handlers_[webdriver::CommandType::ElementEquals] = CommandHandlerHandle(new ElementEqualsCommandHandler);
  this->command_handlers_[webdriver::CommandType::AddCookie] = CommandHandlerHandle(new AddCookieCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetAllCookies] = CommandHandlerHandle(new GetAllCookiesCommandHandler);
  this->command_handlers_[webdriver::CommandType::DeleteCookie] = CommandHandlerHandle(new DeleteCookieCommandHandler);
  this->command_handlers_[webdriver::CommandType::DeleteAllCookies] = CommandHandlerHandle(new DeleteAllCookiesCommandHandler);
  this->command_handlers_[webdriver::CommandType::Screenshot] = CommandHandlerHandle(new ScreenshotCommandHandler);

  this->command_handlers_[webdriver::CommandType::AcceptAlert] = CommandHandlerHandle(new AcceptAlertCommandHandler);
  this->command_handlers_[webdriver::CommandType::DismissAlert] = CommandHandlerHandle(new DismissAlertCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetAlertText] = CommandHandlerHandle(new GetAlertTextCommandHandler);
  this->command_handlers_[webdriver::CommandType::SendKeysToAlert] = CommandHandlerHandle(new SendKeysToAlertCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetAlertCredentials] = CommandHandlerHandle(new SetAlertCredentialsCommandHandler);

  this->command_handlers_[webdriver::CommandType::MouseMoveTo] = CommandHandlerHandle(new MouseMoveToCommandHandler);
  this->command_handlers_[webdriver::CommandType::MouseClick] = CommandHandlerHandle(new MouseClickCommandHandler);
  this->command_handlers_[webdriver::CommandType::MouseDoubleClick] = CommandHandlerHandle(new MouseDoubleClickCommandHandler);
  this->command_handlers_[webdriver::CommandType::MouseButtonDown] = CommandHandlerHandle(new MouseButtonDownCommandHandler);
  this->command_handlers_[webdriver::CommandType::MouseButtonUp] = CommandHandlerHandle(new MouseButtonUpCommandHandler);
  this->command_handlers_[webdriver::CommandType::SendKeysToActiveElement] = CommandHandlerHandle(new SendKeysToActiveElementCommandHandler);

  this->command_handlers_[webdriver::CommandType::GetWindowSize] = CommandHandlerHandle(new GetWindowSizeCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetWindowSize] = CommandHandlerHandle(new SetWindowSizeCommandHandler);
  this->command_handlers_[webdriver::CommandType::GetWindowPosition] = CommandHandlerHandle(new GetWindowPositionCommandHandler);
  this->command_handlers_[webdriver::CommandType::SetWindowPosition] = CommandHandlerHandle(new SetWindowPositionCommandHandler);
  this->command_handlers_[webdriver::CommandType::MaximizeWindow] = CommandHandlerHandle(new MaximizeWindowCommandHandler);

  // As-yet unimplemented commands
  this->command_handlers_[webdriver::CommandType::GetOrientation] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::SetOrientation] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::ListAvailableImeEngines] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::GetActiveImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::IsImeActivated] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::ActivateImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::DeactivateImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchClick] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchDown] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchUp] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchMove] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchScroll] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchDoubleClick] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchLongClick] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::TouchFlick] = CommandHandlerHandle(new IECommandHandler);

  // Commands intercepted by the server before reaching the command executor
  this->command_handlers_[webdriver::CommandType::Status] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[webdriver::CommandType::GetSessionList] = CommandHandlerHandle(new IECommandHandler);
}

} // namespace webdriver
