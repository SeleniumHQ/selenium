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
#include <mutex>

#include <iepmapi.h>

#include "command_types.h"
#include "errorcodes.h"
#include "logging.h"
#include "response.h"

#include "Alert.h"
#include "Browser.h"
#include "BrowserFactory.h"
#include "CommandExecutor.h"
#include "CommandHandlerRepository.h"
#include "CookieManager.h"
#include "Element.h"
#include "ElementFinder.h"
#include "ElementRepository.h"
#include "IECommandHandler.h"
#include "InputManager.h"
#include "HtmlDialog.h"
#include "ProxyManager.h"
#include "StringUtilities.h"
#include "Script.h"
#include "WebDriverConstants.h"
#include "WindowUtilities.h"

#define MAX_HTML_DIALOG_RETRIES 5
#define WAIT_TIME_IN_MILLISECONDS 50
#define DEFAULT_SCRIPT_TIMEOUT_IN_MILLISECONDS 30000
#define DEFAULT_PAGE_LOAD_TIMEOUT_IN_MILLISECONDS 300000
#define DEFAULT_FILE_UPLOAD_DIALOG_TIMEOUT_IN_MILLISECONDS 3000
#define DEFAULT_BROWSER_REATTACH_TIMEOUT_IN_MILLISECONDS 10000

namespace webdriver {

struct WaitThreadContext {
  HWND window_handle;
  bool is_deferred_command;
  LPSTR deferred_response;
};

struct DelayPostMessageThreadContext {
  HWND window_handle;
  DWORD delay;
  UINT msg;
};

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

  this->PopulateElementFinderMethods();
  this->current_browser_id_ = "";
  this->serialized_response_ = "";
  this->unexpected_alert_behavior_ = "";
  this->implicit_wait_timeout_ = 0;
  this->async_script_timeout_ = DEFAULT_SCRIPT_TIMEOUT_IN_MILLISECONDS;
  this->page_load_timeout_ = DEFAULT_PAGE_LOAD_TIMEOUT_IN_MILLISECONDS;
  this->reattach_browser_timeout_ = DEFAULT_BROWSER_REATTACH_TIMEOUT_IN_MILLISECONDS;
  this->is_waiting_ = false;
  this->is_quitting_ = false;
  this->is_awaiting_new_window_ = false;
  this->use_strict_file_interactability_ = false;
  this->page_load_strategy_ = "normal";
  this->file_upload_dialog_timeout_ = DEFAULT_FILE_UPLOAD_DIALOG_TIMEOUT_IN_MILLISECONDS;

  this->managed_elements_ = new ElementRepository();
  this->input_manager_ = new InputManager();
  this->proxy_manager_ = new ProxyManager();
  this->factory_ = new BrowserFactory();
  this->element_finder_ = new ElementFinder();
  this->command_handlers_ = new CommandHandlerRepository();

  return 0;
}

LRESULT IECommandExecutor::OnDestroy(UINT uMsg,
                                     WPARAM wParam,
                                     LPARAM lParam,
                                     BOOL& bHandled) {
  LOG(DEBUG) << "Entering IECommandExecutor::OnDestroy";

  LOG(DEBUG) << "Clearing managed element cache";
  this->managed_elements_->Clear();
  delete this->managed_elements_;
  LOG(DEBUG) << "Closing command handler repository";
  delete this->command_handlers_;
  LOG(DEBUG) << "Closing element finder";
  delete this->element_finder_;
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
  LRESULT set_command_result = 0;

  LPCSTR json_command = reinterpret_cast<LPCSTR>(lParam);
  Command requested_command;
  requested_command.Deserialize(json_command);

  this->set_command_mutex_.lock();
  if (this->current_command_.command_type() == CommandType::NoCommand ||
      requested_command.command_type() == CommandType::Quit) {
    this->current_command_.Deserialize(json_command);
    set_command_result = 1;
  }
  this->set_command_mutex_.unlock();

  return set_command_result;
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
  this->current_command_.Reset();
  return 0;
}

LRESULT IECommandExecutor::OnWait(UINT uMsg,
                                  WPARAM wParam,
                                  LPARAM lParam,
                                  BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnWait";

  LPCSTR str = reinterpret_cast<LPCSTR>(lParam);
  std::string deferred_response(str);
  delete[] str;

  LOG(DEBUG) << "Starting wait cycle.";
  if (this->is_awaiting_new_window_) {
    LOG(DEBUG) << "Awaiting new window. Aborting current wait cycle and "
               << "scheduling another.";
    this->CreateWaitThread(deferred_response);
    return 0;
  }

  bool is_single_wait = (wParam == 0);

  BrowserHandle browser;
  int status_code = this->GetCurrentBrowser(&browser);
  if (status_code == WD_SUCCESS) {
    if (!browser->is_closing()) {
      if (this->page_load_timeout_ >= 0 && this->wait_timeout_ < clock()) {
        LOG(DEBUG) << "Page load timeout reached. Ending wait cycle.";
        Response timeout_response;
        timeout_response.SetErrorResponse(ERROR_WEBDRIVER_TIMEOUT,
                                          "Timed out waiting for page to load.");
        browser->set_wait_required(false);
        this->serialized_response_ = timeout_response.Serialize();
        this->is_waiting_ = false;
        return 0;
      } else {
        LOG(DEBUG) << "Beginning wait.";
        this->is_waiting_ = !(browser->Wait(this->page_load_strategy_));
        if (is_single_wait) {
          LOG(DEBUG) << "Single requested wait with no deferred "
                     << "response complete. Ending wait cycle.";
          this->is_waiting_ = false;
          return 0;
        } else {
          if (this->is_waiting_) {
            LOG(DEBUG) << "Wait not complete. Scheduling another wait cycle.";
            this->CreateWaitThread(deferred_response);
            return 0;
          }
        }
      }
    }
  }
  LOG(DEBUG) << "Wait complete. Setting serialized response to deferred value "
             << deferred_response;
  this->serialized_response_ = deferred_response;
  this->is_waiting_ = false;
  return 0;
}

LRESULT IECommandExecutor::OnBeforeNewWindow(UINT uMsg,
                                             WPARAM wParam,
                                             LPARAM lParam,
                                             BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBeforeNewWindow";
  LOG(DEBUG) << "Setting await new window flag";
  this->is_awaiting_new_window_ = true;
  return 0;
}

LRESULT IECommandExecutor::OnAfterNewWindow(UINT uMsg,
                                            WPARAM wParam,
                                            LPARAM lParam,
                                            BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnAfterNewWindow";
  if (wParam > 0) {
    LOG(DEBUG) << "Creating thread and reposting message.";
    this->CreateDelayPostMessageThread(static_cast<DWORD>(wParam),
                                       this->m_hWnd,
                                       WD_AFTER_NEW_WINDOW);
  } else {
    LOG(DEBUG) << "Clearing await new window flag";
    this->is_awaiting_new_window_ = false;
  }
  return 0;
}

LRESULT IECommandExecutor::OnBrowserNewWindow(UINT uMsg,
                                              WPARAM wParam,
                                              LPARAM lParam,
                                              BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBrowserNewWindow";
  NewWindowInfo* info = reinterpret_cast<NewWindowInfo*>(lParam);
  std::string target_url = info->target_url;
  std::string new_browser_id = this->OpenNewBrowsingContext(WINDOW_WINDOW_TYPE,
                                                            target_url);
  BrowserHandle new_window_wrapper;
  this->GetManagedBrowser(new_browser_id, &new_window_wrapper);
  if (new_window_wrapper->IsCrossZoneUrl(target_url)) {
    new_window_wrapper->InitiateBrowserReattach();
  }

  LOG(DEBUG) << "Attempting to marshal interface pointer to requesting thread.";
  IWebBrowser2* browser = new_window_wrapper->browser();
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2,
                                                       browser,
                                                       &(info->browser_stream));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Marshalling of interface pointer b/w threads is failed.";
  }

  return 0;
}

LRESULT IECommandExecutor::OnBrowserCloseWait(UINT uMsg,
                                              WPARAM wParam,
                                              LPARAM lParam,
                                              BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBrowserCloseWait";

  LPCSTR str = reinterpret_cast<LPCSTR>(lParam);
  std::string browser_id(str);
  delete[] str;
  BrowserMap::iterator found_iterator = this->managed_browsers_.find(browser_id);
  if (found_iterator != this->managed_browsers_.end()) {
    HWND alert_handle;
    bool is_alert_active = this->IsAlertActive(found_iterator->second,
                                               &alert_handle);
    if (is_alert_active) {
      // If there's an alert window active, the browser's Quit event does
      // not fire until any alerts are handled. Note that OnBeforeUnload
      // alerts must be handled here; the driver contains the ability to
      // handle other standard alerts on the next received command. We rely
      // on the browser's Quit command to remove the driver from the list of
      // managed browsers.
      Alert dialog(found_iterator->second, alert_handle);
      if (!dialog.is_standard_alert()) {
        dialog.Accept();
        is_alert_active = false;
      }
    }
    if (!is_alert_active) {
      ::Sleep(100);
      // If no alert is present, repost the message to the message pump, so
      // that we can wait until the browser is fully closed to return the
      // proper still-open list of window handles.
      LPSTR message_payload = new CHAR[browser_id.size() + 1];
      strcpy_s(message_payload, browser_id.size() + 1, browser_id.c_str());
      ::PostMessage(this->m_hWnd,
                    WD_BROWSER_CLOSE_WAIT,
                    NULL,
                    reinterpret_cast<LPARAM>(message_payload));
      return 0;
    }
  } else {
    LOG(WARN) << "Unable to find browser to quit with ID " << browser_id;
  }
  Json::Value handles(Json::arrayValue);
  std::vector<std::string> handle_list;
  this->GetManagedBrowserHandles(&handle_list);
  std::vector<std::string>::const_iterator handle_iterator = handle_list.begin();
  for (; handle_iterator != handle_list.end(); ++handle_iterator) {
    handles.append(*handle_iterator);
  }

  Response close_window_response;
  close_window_response.SetSuccessResponse(handles);
  this->serialized_response_ = close_window_response.Serialize();
  this->is_waiting_ = false;
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

LRESULT IECommandExecutor::OnBeforeBrowserReattach(UINT uMsg,
                                                   WPARAM wParam,
                                                   LPARAM lParam,
                                                   BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBeforeBrowserReattach";
  if (this->factory_->ignore_protected_mode_settings()) {
    this->reattach_wait_timeout_ = clock() + (static_cast<int>(this->reattach_browser_timeout_) / 1000 * CLOCKS_PER_SEC);
  }
  return 0;
}

LRESULT IECommandExecutor::OnBrowserReattach(UINT uMsg,
                                             WPARAM wParam,
                                             LPARAM lParam,
                                             BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnBrowserReattach";
  BrowserReattachInfo* info = reinterpret_cast<BrowserReattachInfo*>(lParam);
  DWORD current_process_id = info->current_process_id;
  std::string browser_id = info->browser_id;
  std::vector<DWORD> known_process_ids = info->known_process_ids;
  delete info;

  if (!this->factory_->ignore_protected_mode_settings()) {
    return 0;
  }

  if (this->reattach_wait_timeout_ < clock()) {
    LOG(WARN) << "Reattach attempt has timed out";
    return 0;
  }

  LOG(DEBUG) << "Starting browser reattach process";

  std::vector<DWORD> new_process_ids;
  this->GetNewBrowserProcessIds(&known_process_ids, &new_process_ids);
  if (new_process_ids.size() == 0) {
    LOG(DEBUG) << "No new process found, rescheduling reattach";
    // If no new process IDs were found yet, repost the message
    this->PostBrowserReattachMessage(current_process_id,
                                     browser_id,
                                     known_process_ids);
  }
  if (new_process_ids.size() > 1) {
    LOG(WARN) << "Found more than one new iexplore.exe process. It is "
              << "impossible to know which is the proper one. Choosing one "
              << "at random.";
  }

  DWORD new_process_id = new_process_ids[0];
  if (!this->factory_->IsBrowserProcessInitialized(new_process_id)) {
    // If the browser for the new process ID is not yet ready,
    // repost the message
    LOG(DEBUG) << "Browser process " << new_process_id
               << " not initialized, rescheduling reattach";
    this->PostBrowserReattachMessage(current_process_id,
                                     browser_id,
                                     known_process_ids);
    return 0;
  }

  std::string error_message = "";
  ProcessWindowInfo process_window_info;
  process_window_info.dwProcessId = new_process_id;
  process_window_info.hwndBrowser = NULL;
  process_window_info.pBrowser = NULL;
  bool attached = this->factory_->AttachToBrowser(&process_window_info, &error_message);

  BrowserMap::iterator found_iterator = this->managed_browsers_.find(browser_id);
  if (found_iterator != this->managed_browsers_.end()) {
    this->proxy_manager_->SetProxySettings(process_window_info.hwndBrowser);
    found_iterator->second->cookie_manager()->Initialize(process_window_info.hwndBrowser);
    found_iterator->second->ReattachBrowser(process_window_info.pBrowser);
  } else {
    LOG(WARN) << "The managed browser was not found to reattach to.";
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
  return 0;
}

LRESULT IECommandExecutor::OnGetQuitStatus(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandled) {
  return this->is_quitting_ && this->managed_browsers_.size() > 0 ? 1 : 0;
}

LRESULT IECommandExecutor::OnScriptWait(UINT uMsg,
                                        WPARAM wParam,
                                        LPARAM lParam,
                                        BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnScriptWait";

  BrowserHandle browser;
  int status_code = this->GetCurrentBrowser(&browser);
  if (status_code == WD_SUCCESS && !browser->is_closing()) {
    if (this->async_script_timeout_ >= 0 && this->wait_timeout_ < clock()) {
      ::SendMessage(browser->script_executor_handle(),
                    WD_ASYNC_SCRIPT_DETACH_LISTENTER,
                    NULL,
                    NULL);
      Response timeout_response;
      timeout_response.SetErrorResponse(ERROR_SCRIPT_TIMEOUT,
                                        "Timed out waiting for script to complete.");
      this->serialized_response_ = timeout_response.Serialize();
      this->is_waiting_ = false;
      browser->set_script_executor_handle(NULL);
    } else {
      HWND alert_handle;
      bool is_execution_finished = ::SendMessage(browser->script_executor_handle(),
                                                 WD_ASYNC_SCRIPT_IS_EXECUTION_COMPLETE,
                                                 NULL,
                                                 NULL) != 0;
      bool is_alert_active = this->IsAlertActive(browser, &alert_handle);
      this->is_waiting_ = !is_execution_finished && !is_alert_active;
      if (this->is_waiting_) {
        // If we are still waiting, we need to wait a bit then post a message to
        // ourselves to run the wait again. However, we can't wait using Sleep()
        // on this thread. This call happens in a message loop, and we would be 
        // unable to process the COM events in the browser if we put this thread
        // to sleep.
        unsigned int thread_id = 0;
        HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                        0,
                                                        &IECommandExecutor::ScriptWaitThreadProc,
                                                        (void *)this->m_hWnd,
                                                        0,
                                                        &thread_id));
        if (thread_handle != NULL) {
          ::CloseHandle(thread_handle);
        } else {
          LOGERR(DEBUG) << "Unable to create waiter thread";
        }
      } else {
        Response response;
        Json::Value script_result;
        ::SendMessage(browser->script_executor_handle(),
                      WD_ASYNC_SCRIPT_DETACH_LISTENTER,
                      NULL,
                      NULL);
        int status_code = static_cast<int>(::SendMessage(browser->script_executor_handle(),
                                                         WD_ASYNC_SCRIPT_GET_RESULT,
                                                         NULL,
                                                         reinterpret_cast<LPARAM>(&script_result)));
        if (status_code != WD_SUCCESS) {
          std::string error_message = "Error executing JavaScript";
          if (script_result.isString()) {
            error_message = script_result.asString();
          }
          response.SetErrorResponse(status_code, error_message);
        } else {
          response.SetSuccessResponse(script_result);
        }
        ::SendMessage(browser->script_executor_handle(), WM_CLOSE, NULL, NULL);
        browser->set_script_executor_handle(NULL);
        this->serialized_response_ = response.Serialize();
      }
    }
  } else {
    this->is_waiting_ = false;
  }
  return 0;
}

LRESULT IECommandExecutor::OnRefreshManagedElements(UINT uMsg,
                                                    WPARAM wParam,
                                                    LPARAM lParam,
                                                    BOOL& bHandled) {
  this->managed_elements_->ClearCache();
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
      std::string alert_text;
      this->HandleUnexpectedAlert(it->second, alert_handle, true, &alert_text);
    }
  }
  return 0;
}

LRESULT IECommandExecutor::OnTransferManagedElement(UINT uMsg,
                                                    WPARAM wParam,
                                                    LPARAM lParam,
                                                    BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnTransferManagedElement";
  ElementInfo* info = reinterpret_cast<ElementInfo*>(lParam);
  std::string element_id = info->element_id;
  LPSTREAM element_stream = info->element_stream;
  BrowserHandle browser_handle;
  this->GetCurrentBrowser(&browser_handle);
  CComPtr<IHTMLElement> element;
  ::CoGetInterfaceAndReleaseStream(element_stream,
                                   IID_IHTMLElement,
                                   reinterpret_cast<void**>(&element));
  delete info;
  ElementHandle element_handle;
  this->managed_elements_->AddManagedElement(browser_handle,
                                             element,
                                             &element_handle);
  RemappedElementInfo* return_info = new RemappedElementInfo;
  return_info->original_element_id = element_id;
  return_info->element_id = element_handle->element_id();
  ::PostMessage(browser_handle->script_executor_handle(),
                WD_ASYNC_SCRIPT_NOTIFY_ELEMENT_TRANSFERRED,
                NULL,
                reinterpret_cast<LPARAM>(return_info));
  return WD_SUCCESS;
}

LRESULT IECommandExecutor::OnScheduleRemoveManagedElement(UINT uMsg,
                                                          WPARAM wParam,
                                                          LPARAM lParam,
                                                          BOOL& bHandled) {
  LOG(TRACE) << "Entering IECommandExecutor::OnScheduleRemoveManagedElement";
  ElementInfo* info = reinterpret_cast<ElementInfo*>(lParam);
  std::string element_id = info->element_id;
  delete info;
  this->RemoveManagedElement(element_id);
  return WD_SUCCESS;
}

unsigned int WINAPI IECommandExecutor::WaitThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering IECommandExecutor::WaitThreadProc";
  WaitThreadContext* thread_context = reinterpret_cast<WaitThreadContext*>(lpParameter);
  HWND window_handle = thread_context->window_handle;
  bool is_deferred_command = thread_context->is_deferred_command;
  std::string deferred_response(thread_context->deferred_response);
  delete thread_context->deferred_response;
  delete thread_context;

  LPSTR message_payload = new CHAR[deferred_response.size() + 1];
  strcpy_s(message_payload,
           deferred_response.size() + 1,
           deferred_response.c_str());

  ::Sleep(WAIT_TIME_IN_MILLISECONDS);
  ::PostMessage(window_handle,
                WD_WAIT,
                static_cast<WPARAM>(deferred_response.size()),
                reinterpret_cast<LPARAM>(message_payload));
  if (is_deferred_command) {
    // This wait is requested by the automatic handling of a user prompt
    // before a command was executed, so re-queue the command execution
    // for after the wait.
    ::PostMessage(window_handle, WD_EXEC_COMMAND, NULL, NULL);
  }
  return 0;
}

unsigned int WINAPI IECommandExecutor::ScriptWaitThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering IECommandExecutor::ScriptWaitThreadProc";
  HWND window_handle = reinterpret_cast<HWND>(lpParameter);
  ::Sleep(SCRIPT_WAIT_TIME_IN_MILLISECONDS);
  ::PostMessage(window_handle, WD_SCRIPT_WAIT, NULL, NULL);
  return 0;
}

unsigned int WINAPI IECommandExecutor::DelayPostMessageThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering IECommandExecutor::DelayPostMessageThreadProc";
  DelayPostMessageThreadContext* context = reinterpret_cast<DelayPostMessageThreadContext*>(lpParameter);
  HWND window_handle = context->window_handle;
  DWORD sleep_time = context->delay;
  UINT message_to_post = context->msg;
  delete context;

  ::Sleep(sleep_time);
  ::PostMessage(window_handle, message_to_post, NULL, NULL);
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
  HANDLE event_handle = ::OpenEvent(EVENT_ALL_ACCESS, FALSE, WEBDRIVER_START_EVENT_NAME);
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
        // We need to lock this mutex here to make sure only one thread is processing
        // win32 messages at a time.
        static std::mutex messageLock;
        std::lock_guard<std::mutex> lock(messageLock);
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

  Response response;

  if (!this->command_handlers_->IsValidCommand(this->current_command_.command_type())) {
    LOG(WARN) << "Unable to find command handler for " << this->current_command_.command_type();
    response.SetErrorResponse(ERROR_UNKNOWN_COMMAND, "Command not implemented");
  } else if (!this->current_command_.is_valid_parameters()) {
    response.SetErrorResponse(ERROR_INVALID_ARGUMENT, "parameters property of command is not a valid JSON object");
  } else {
    BrowserHandle browser;
    int status_code = WD_SUCCESS;
    std::string command_type = this->current_command_.command_type();
    if (command_type != webdriver::CommandType::NewSession) {
      // There should never be a modal dialog or alert to check for if the command
      // is the "newSession" command.
      status_code = this->GetCurrentBrowser(&browser);
      if (status_code == WD_SUCCESS) {
        LOG(DEBUG) << "Checking for alert before executing " << command_type << " command";
        HWND alert_handle = NULL;
        bool alert_is_active = this->IsAlertActive(browser, &alert_handle);
        if (alert_is_active) {
          if (this->IsCommandValidWithAlertPresent()) {
            LOG(DEBUG) << "Alert is detected, and the sent command is valid";
          } else {
            LOG(DEBUG) << "Unexpected alert is detected, and the sent command "
                       << "is invalid when an alert is present";
            bool is_quit_command = command_type == webdriver::CommandType::Quit;

            std::string alert_text;
            bool is_notify_unexpected_alert = this->HandleUnexpectedAlert(browser,
                                                                          alert_handle,
                                                                          is_quit_command,
                                                                          &alert_text);
            if (!is_quit_command) {
              if (is_notify_unexpected_alert) {
                // To keep pace with what the specification suggests, we'll
                // return the text of the alert in the error response.
                response.SetErrorResponse(EUNEXPECTEDALERTOPEN,
                                          "Modal dialog present with text: " + alert_text);
                response.AddAdditionalData("text", alert_text);
                this->serialized_response_ = response.Serialize();
                return;
              } else {
                LOG(DEBUG) << "Command other than quit was issued, and option "
                           << "to not notify was specified. Continuing with "
                           << "command after automatically closing alert.";
                // Push a wait cycle, then re-execute the current command (which
                // hasn't actually been executed yet). Note that an empty string
                // for the deferred response parameter of CreateWaitThread will
                // re-queue the execution of the command.
                this->CreateWaitThread("", true);
                return;
              }
            } else {
                LOG(DEBUG) << "Quit command was issued. Continuing with "
                           << "command after automatically closing alert.";
            }
          }
        }
      } else {
        LOG(WARN) << "Unable to find current browser";
      }
    }

    LOG(DEBUG) << "Executing command: " << command_type;
    CommandHandlerHandle command_handler = this->command_handlers_->GetCommandHandler(command_type);
    command_handler->Execute(*this, this->current_command_, &response);
    LOG(DEBUG) << "Command execution for " << command_type << " complete";

    status_code = this->GetCurrentBrowser(&browser);
    if (status_code == WD_SUCCESS) {
      if (browser->is_closing() && !this->is_quitting_) {
        // Case 1: The browser window is closing, but not via the Quit command,
        // so the executor must wait for the browser window to be closed and
        // removed from the list of managed browser windows.
        LOG(DEBUG) << "Browser is closing; awaiting close.";
        LPSTR message_payload = new CHAR[browser->browser_id().size() + 1];
        strcpy_s(message_payload,
                 browser->browser_id().size() + 1,
                 browser->browser_id().c_str());

        this->is_waiting_ = true;
        ::Sleep(WAIT_TIME_IN_MILLISECONDS);
        ::PostMessage(this->m_hWnd,
                      WD_BROWSER_CLOSE_WAIT,
                      NULL,
                      reinterpret_cast<LPARAM>(message_payload));
        return;
      } else if (browser->script_executor_handle() != NULL) {
        // Case 2: There is a pending asynchronous JavaScript execution in
        // progress, so the executor must wait for the script to complete
        // or a timeout.
        this->is_waiting_ = true;
        if (this->async_script_timeout_ >= 0) {
          this->wait_timeout_ = clock() + (static_cast<int>(this->async_script_timeout_) / 1000 * CLOCKS_PER_SEC);
        }
        LOG(DEBUG) << "Awaiting completion of in-progress asynchronous JavaScript execution.";
        ::PostMessage(this->m_hWnd, WD_SCRIPT_WAIT, NULL, NULL);
        return;
      } else if (browser->wait_required()) {
        // Case 3: The command handler has explicitly asked to wait for page
        // load, so the executor must wait for page load or timeout.
        this->is_waiting_ = true;
        if (this->page_load_timeout_ >= 0) {
          this->wait_timeout_ = clock() + (static_cast<int>(this->page_load_timeout_) / 1000 * CLOCKS_PER_SEC);
        }
        std::string deferred_response = response.Serialize();
        LOG(DEBUG) << "Command handler requested wait. This will cause a minimal wait of at least 50 milliseconds.";
        this->CreateWaitThread(deferred_response);
        return;
      }
    } else {
      if (this->current_command_.command_type() != webdriver::CommandType::Quit) {
        LOG(WARN) << "Unable to get current browser";
      }
    }
  }

  this->serialized_response_ = response.Serialize();
  LOG(DEBUG) << "Setting serialized response to " << this->serialized_response_;
  LOG(DEBUG) << "Is waiting flag: " << this->is_waiting_ ? "true" : "false";
}

bool IECommandExecutor::IsCommandValidWithAlertPresent() {
  std::string command_type = this->current_command_.command_type();
  if (command_type == webdriver::CommandType::GetAlertText ||
      command_type == webdriver::CommandType::SendKeysToAlert ||
      command_type == webdriver::CommandType::AcceptAlert ||
      command_type == webdriver::CommandType::DismissAlert ||
      command_type == webdriver::CommandType::SetAlertCredentials ||
      command_type == webdriver::CommandType::GetTimeouts ||
      command_type == webdriver::CommandType::SetTimeouts ||
      command_type == webdriver::CommandType::Screenshot ||
      command_type == webdriver::CommandType::ElementScreenshot ||
      command_type == webdriver::CommandType::GetCurrentWindowHandle ||
      command_type == webdriver::CommandType::GetWindowHandles ||
      command_type == webdriver::CommandType::SwitchToWindow) {
    return true;
  }
  return false;
}

void IECommandExecutor::CreateWaitThread(const std::string& deferred_response) {
  this->CreateWaitThread(deferred_response, false);
}

void IECommandExecutor::CreateWaitThread(const std::string& deferred_response,
                                         const bool is_deferred_command_execution) {
  // If we are still waiting, we need to wait a bit then post a message to
  // ourselves to run the wait again. However, we can't wait using Sleep()
  // on this thread. This call happens in a message loop, and we would be
  // unable to process the COM events in the browser if we put this thread
  // to sleep.
  LOG(DEBUG) << "Creating wait thread with deferred response of `" << deferred_response << "`";
  if (is_deferred_command_execution) {
    LOG(DEBUG) << "Command execution will be rescheduled.";
  }
  WaitThreadContext* thread_context = new WaitThreadContext;
  thread_context->window_handle = this->m_hWnd;
  thread_context->is_deferred_command = is_deferred_command_execution;
  thread_context->deferred_response = new CHAR[deferred_response.size() + 1];
  strcpy_s(thread_context->deferred_response,
           deferred_response.size() + 1,
           deferred_response.c_str());

  unsigned int thread_id = 0;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                                 0,
                                                                 &IECommandExecutor::WaitThreadProc,
                                                                 reinterpret_cast<void*>(thread_context),
                                                                 0,
                                                                 &thread_id));
  if (thread_handle != NULL) {
    ::CloseHandle(thread_handle);
  }
  else {
    LOGERR(DEBUG) << "Unable to create waiter thread";
  }
}

void IECommandExecutor::CreateDelayPostMessageThread(const DWORD delay_time,
                                                     const HWND window_handle,
                                                     const UINT message_to_post) {
  DelayPostMessageThreadContext* context = new DelayPostMessageThreadContext;
  context->delay = delay_time;
  context->window_handle = window_handle;
  context->msg = message_to_post;
  unsigned int thread_id = 0;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                                 0,
                                                                 &IECommandExecutor::DelayPostMessageThreadProc,
                                                                 reinterpret_cast<void*>(context),
                                                                 0,
                                                                 &thread_id));
  if (thread_handle != NULL) {
    ::CloseHandle(thread_handle);
  } else {
    LOGERR(DEBUG) << "Unable to create waiter thread";
  }
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
    } else if (strcmp(SECURITY_DIALOG_WINDOW_CLASS, &window_class_name[0]) == 0) {
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

bool IECommandExecutor::HandleUnexpectedAlert(BrowserHandle browser,
                                              HWND alert_handle,
                                              bool force_use_dismiss,
                                              std::string* alert_text) {
  LOG(TRACE) << "Entering IECommandExecutor::HandleUnexpectedAlert";
  clock_t end = clock() + 5 * CLOCKS_PER_SEC;
  bool is_visible = (::IsWindowVisible(alert_handle) == TRUE);
  while (!is_visible && clock() < end) {
    ::Sleep(50);
    is_visible = (::IsWindowVisible(alert_handle) == TRUE);
  }
  Alert dialog(browser, alert_handle);
  *alert_text = dialog.GetText();
  if (!dialog.is_standard_alert()) {
    // The dialog was non-standard. The most common case of this is
    // an onBeforeUnload dialog, which must be accepted to continue.
    dialog.Accept();
    return false;
  }
  if (this->unexpected_alert_behavior_ == ACCEPT_UNEXPECTED_ALERTS ||
      this->unexpected_alert_behavior_ == ACCEPT_AND_NOTIFY_UNEXPECTED_ALERTS) {
    LOG(DEBUG) << "Automatically accepting the alert";
    dialog.Accept();
  } else if (this->unexpected_alert_behavior_.size() == 0 ||
             this->unexpected_alert_behavior_ == DISMISS_UNEXPECTED_ALERTS ||
             this->unexpected_alert_behavior_ == DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS ||
             force_use_dismiss) {
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

  bool is_notify_unexpected_alert =
    this->unexpected_alert_behavior_.size() == 0 ||
    this->unexpected_alert_behavior_ == IGNORE_UNEXPECTED_ALERTS ||
    this->unexpected_alert_behavior_ == DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS ||
    this->unexpected_alert_behavior_ == ACCEPT_AND_NOTIFY_UNEXPECTED_ALERTS;
  is_notify_unexpected_alert = is_notify_unexpected_alert && dialog.is_standard_alert();
  return is_notify_unexpected_alert;
}

void IECommandExecutor::PostBrowserReattachMessage(const DWORD current_process_id,
                                                   const std::string& browser_id,
                                                   const std::vector<DWORD>& known_process_ids) {
  LOG(TRACE) << "Entering IECommandExecutor::PostBrowserReattachMessage";
  ::Sleep(100);
  BrowserReattachInfo* repost_info = new BrowserReattachInfo;
  repost_info->current_process_id = current_process_id;
  repost_info->browser_id = browser_id;
  repost_info->known_process_ids = known_process_ids;
  ::PostMessage(this->m_hWnd,
                WD_BROWSER_REATTACH,
                NULL,
                reinterpret_cast<LPARAM>(repost_info));
}

void IECommandExecutor::GetNewBrowserProcessIds(std::vector<DWORD>* known_process_ids,
                                                std::vector<DWORD>* new_process_ids) {
  LOG(TRACE) << "Entering IECommandExecutor::GetNewBrowserProcessIds";
  std::vector<DWORD> all_ie_process_ids;
  WindowUtilities::GetProcessesByName(L"iexplore.exe", &all_ie_process_ids);

  // Maximum size of the new process list is if all IE processes are unknown.
  std::vector<DWORD> temp_new_process_ids(all_ie_process_ids.size());
  std::sort(known_process_ids->begin(), known_process_ids->end());
  std::sort(all_ie_process_ids.begin(), all_ie_process_ids.end());
  std::vector<DWORD>::iterator end_iterator = std::set_difference(all_ie_process_ids.begin(),
                                                                  all_ie_process_ids.end(),
                                                                  known_process_ids->begin(),
                                                                  known_process_ids->end(),
                                                                  temp_new_process_ids.begin());
  temp_new_process_ids.resize(end_iterator - temp_new_process_ids.begin());
  *new_process_ids = temp_new_process_ids;
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

std::string IECommandExecutor::OpenNewBrowsingContext(const std::string& window_type) {
  return this->OpenNewBrowsingContext(window_type, "about:blank");
}

std::string IECommandExecutor::OpenNewBrowsingContext(const std::string& window_type,
                                                      const std::string& url) {
  LOG(TRACE) << "Entering IECommandExecutor::OpenNewBrowsingContext";
  std::wstring target_url = StringUtilities::ToWString(url);
  std::string new_browser_id = "";
  if (window_type == TAB_WINDOW_TYPE) {
    new_browser_id = this->OpenNewBrowserTab(target_url);
  } else {
    new_browser_id = this->OpenNewBrowserWindow(target_url);
  }

  BrowserHandle new_window_wrapper;
  this->GetManagedBrowser(new_browser_id, &new_window_wrapper);
  HWND new_window_handle = new_window_wrapper->GetBrowserWindowHandle();
  this->proxy_manager_->SetProxySettings(new_window_handle);
  new_window_wrapper->cookie_manager()->Initialize(new_window_handle);

  return new_browser_id;
}

std::string IECommandExecutor::OpenNewBrowserWindow(const std::wstring& url) {
  LOG(TRACE) << "Entering IECommandExecutor::OpenNewBrowserWindow";
  bool is_protected_mode_url = ::IEIsProtectedModeURL(url.c_str()) == S_OK;
  if (url.find(L"about:blank") == 0) {
    // Special-case URLs starting with about:blank, so that the new window
    // is in the same Protected Mode zone as the current window from which
    // it's being opened.
    BrowserHandle current_browser;
    this->GetCurrentBrowser(&current_browser);
    is_protected_mode_url = current_browser->IsProtectedMode();
  }
  CComPtr<IWebBrowser2> browser = this->factory_->CreateBrowser(is_protected_mode_url);
  if (browser == NULL) {
    // No browser was created, so we have to bail early.
    // Check the log for the HRESULT why.
    return "";
  }
  LOG(DEBUG) << "New browser window was opened.";
  BrowserHandle new_window_wrapper(new Browser(browser, NULL, this->m_hWnd));
  // It is acceptable to set the proxy settings here, as the newly-created
  // browser window has not yet been navigated to any page. Only after the
  // interface has been marshaled back across the thread boundary to the
  // NewWindow3 event handler will the navigation begin, which ensures that
  // even the initial navigation will get captured by the proxy, if one is
  // set. Likewise, the cookie manager needs to have its window handle
  // properly set to a non-NULL value so that windows messages are routed
  // to the correct window.
  // N.B. DocumentHost::GetBrowserWindowHandle returns the tab window handle
  // for IE 7 and above, and the top-level window for IE6. This is the window
  // required for setting the proxy settings.
  this->AddManagedBrowser(new_window_wrapper);
  return new_window_wrapper->browser_id();
}

std::string IECommandExecutor::OpenNewBrowserTab(const std::wstring& url) {
  LOG(TRACE) << "Entering IECommandExecutor::OpenNewBrowserTab";
  BrowserHandle browser_wrapper;
  this->GetCurrentBrowser(&browser_wrapper);
  HWND top_level_handle = browser_wrapper->GetTopLevelWindowHandle();

  std::vector<HWND> original_handles;
  ::EnumChildWindows(top_level_handle,
                     &IECommandExecutor::FindAllBrowserHandles,
                     reinterpret_cast<LPARAM>(&original_handles));
  std::sort(original_handles.begin(), original_handles.end());

  // IWebBrowser2::Navigate2 will open the specified URL in a new tab,
  // if requested. The Sleep() call after the navigate is necessary,
  // since the IECommandExecutor class doesn't have access to the events
  // to indicate the navigation is completed.
  CComVariant url_variant = url.c_str();
  CComVariant flags = navOpenInNewTab;
  browser_wrapper->browser()->Navigate2(&url_variant,
                                        &flags,
                                        NULL,
                                        NULL,
                                        NULL);
  ::Sleep(500);

  clock_t end_time = clock() + 5 * CLOCKS_PER_SEC;
  std::vector<HWND> new_handles;
  ::EnumChildWindows(top_level_handle,
                     &IECommandExecutor::FindAllBrowserHandles,
                     reinterpret_cast<LPARAM>(&new_handles));
  while (new_handles.size() <= original_handles.size() &&
         clock() < end_time) {
    ::Sleep(50);
    ::EnumChildWindows(top_level_handle,
                       &FindAllBrowserHandles,
                       reinterpret_cast<LPARAM>(&new_handles));
  }
  std::sort(new_handles.begin(), new_handles.end());

  if (new_handles.size() <= original_handles.size()) {
    LOG(WARN) << "No new window handle found after attempt to open";
    return "";
  }

  // We are guaranteed to have at least one HWND difference
  // between the two vectors if we reach this point, because
  // we know the vectors are different sizes.
  std::vector<HWND> diff(new_handles.size());
  std::vector<HWND>::iterator it = std::set_difference(new_handles.begin(),
                                                       new_handles.end(),
                                                       original_handles.begin(),
                                                       original_handles.end(),
                                                       diff.begin());
  diff.resize(it - diff.begin());
  if (diff.size() > 1) {
    std::string handle_list = "";
    std::vector<HWND>::const_iterator it = diff.begin();
    for (; it != diff.end(); ++it) {
      if (handle_list.size() > 0) {
        handle_list.append(", ");
      }
      handle_list.append(StringUtilities::Format("0x%08x", *it));
    }
    LOG(DEBUG) << "Found more than one new window handles! Found "
               << diff.size() << "windows [" << handle_list << "]";
  }
  HWND new_tab_window = diff[0];

  DWORD process_id;
  ::GetWindowThreadProcessId(new_tab_window, &process_id);
  clock_t end = clock() + (DEFAULT_BROWSER_REATTACH_TIMEOUT_IN_MILLISECONDS / 1000 * CLOCKS_PER_SEC);
  bool is_ready = this->factory_->IsBrowserProcessInitialized(process_id);
  while (!is_ready && clock() < end) {
    ::Sleep(100);
    is_ready = this->factory_->IsBrowserProcessInitialized(process_id);
  }

  ProcessWindowInfo info;
  info.dwProcessId = process_id;
  info.hwndBrowser = new_tab_window;
  info.pBrowser = NULL;
  std::string error_message = "";
  this->factory_->AttachToBrowser(&info, &error_message);
  BrowserHandle new_tab_wrapper(new Browser(info.pBrowser,
                                            NULL,
                                            this->m_hWnd));
  // Force a wait cycle to make sure the browser is finished initializing.
  new_tab_wrapper->Wait(NORMAL_PAGE_LOAD_STRATEGY);
  this->AddManagedBrowser(new_tab_wrapper);
  return new_tab_wrapper->browser_id();
}

BOOL CALLBACK IECommandExecutor::FindAllBrowserHandles(HWND hwnd, LPARAM arg) {
  std::vector<HWND>* handles = reinterpret_cast<std::vector<HWND>*>(arg);

  // Could this be an Internet Explorer Server window?
  // 25 == "Internet Explorer_Server\0"
  char name[25];
  if (::GetClassNameA(hwnd, name, 25) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (strcmp("Internet Explorer_Server", name) == 0) {
    handles->push_back(hwnd);
  }

  return TRUE;
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
  //this->input_manager_->StartPersistentEvents();
  LOG(INFO) << "Persistent hovering set to: "
            << this->input_manager_->use_persistent_hover();

  this->proxy_manager_->SetProxySettings(process_window_info.hwndBrowser);
  BrowserHandle wrapper(new Browser(process_window_info.pBrowser,
                                    process_window_info.hwndBrowser,
                                    this->m_hWnd));

  this->AddManagedBrowser(wrapper);
  bool is_busy = wrapper->IsBusy();
  if (is_busy) {
    LOG(WARN) << "Browser was launched and attached to, but is still busy.";
  }
  wrapper->SetFocusToBrowser();
  return WD_SUCCESS;
}

int IECommandExecutor::GetManagedElement(const std::string& element_id,
                                         ElementHandle* element_wrapper) const {
  LOG(TRACE) << "Entering IECommandExecutor::GetManagedElement";
  return this->managed_elements_->GetManagedElement(element_id, element_wrapper);
}

bool IECommandExecutor::AddManagedElement(IHTMLElement* element,
                                          ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering IECommandExecutor::AddManagedElement";
  BrowserHandle current_browser;
  this->GetCurrentBrowser(&current_browser);
  return this->managed_elements_->AddManagedElement(current_browser, element, element_wrapper);
}

void IECommandExecutor::RemoveManagedElement(const std::string& element_id) {
  LOG(TRACE) << "Entering IECommandExecutor::RemoveManagedElement";
  this->managed_elements_->RemoveManagedElement(element_id);
}

void IECommandExecutor::ListManagedElements() {
  LOG(TRACE) << "Entering IECommandExecutor::ListManagedElements";
  this->managed_elements_->ListManagedElements();
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
  return this->element_finder()->FindElement(*this,
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
  return this->element_finder()->FindElements(*this,
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

} // namespace webdriver
