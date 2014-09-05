// Copyright 2014 Software Freedom Conservancy
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

#include "IEWebDriverManagerCommandExecutor.h"
#include "CommandExecutor.h"
#include "command_types.h"
#include "errorcodes.h"
#include "IEWebDriverManagerIds.h"
#include "interactions.h"
#include "json.h"
#include "logging.h"
#include "StringUtilities.h"

namespace webdriver {

LRESULT IEWebDriverManagerCommandExecutor::OnCreate(UINT uMsg,
                                                    WPARAM wParam,
                                                    LPARAM lParam,
                                                    BOOL& bHandled) {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::OnCreate";
  
  CREATESTRUCT* create = reinterpret_cast<CREATESTRUCT*>(lParam);

  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  status = ::UuidToString(&guid, &guid_string);

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->SetWindowText(L"IEWebDriverManagerExecutor");

  std::string session_id = StringUtilities::ToString(cast_guid_string);
  this->session_id_ = session_id;
  this->is_valid_ = true;
  this->is_quitting_ = false;

  ::RpcStringFree(&guid_string);

  this->current_browser_id_ = "";
  this->serialized_response_ = "";

  // This call may not be required, but let's not take any chances.
  setEnablePersistentHover(false);
  this->factory_ = new BrowserFactory();

  HRESULT hr = ::CoCreateInstance(CLSID_IEWebDriverManager,
                                  NULL,
                                  CLSCTX_INPROC_SERVER,
                                  IID_IIEWebDriverManager,
                                  reinterpret_cast<void**>(&this->manager_));
  if (FAILED(hr)) {
    // TOOD: Handle the case where the COM object is not installed.
    LOGHR(WARN, hr) << "Could not create instance of class IEWebDriverManager";
  }

  return 0;
}

LRESULT IEWebDriverManagerCommandExecutor::OnDestroy(UINT uMsg,
                                     WPARAM wParam,
                                     LPARAM lParam,
                                     BOOL& bHandled) {
  LOG(DEBUG) << "Entering IEWebDriverManagerCommandExecutor::OnDestroy";

  LOG(DEBUG) << "Posting quit message";
  this->manager_.Release();
  ::PostQuitMessage(0);
  LOG(DEBUG) << "Leaving IEWebDriverManagerCommandExecutor::OnDestroy";
  return 0;
}

LRESULT IEWebDriverManagerCommandExecutor::OnSetCommand(UINT uMsg,
                                        WPARAM wParam,
                                        LPARAM lParam,
                                        BOOL& bHandled) {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::OnSetCommand";

  LPCSTR json_command = reinterpret_cast<LPCSTR>(lParam);
  this->current_command_.Deserialize(json_command);
  return 0;
}

LRESULT IEWebDriverManagerCommandExecutor::OnExecCommand(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::OnExecCommand";

  this->DispatchCommand();
  return 0;
}

LRESULT IEWebDriverManagerCommandExecutor::OnGetResponseLength(UINT uMsg,
                                               WPARAM wParam,
                                               LPARAM lParam,
                                               BOOL& bHandled) {
  // Not logging trace entering IEDevChannelCommandExecutor::OnGetResponseLength,
  // because it is polled repeatedly for a non-zero return value.
  size_t response_length = 0;
  if (!this->is_waiting_) {
    response_length = this->serialized_response_.size();
  }
  return response_length;
}

LRESULT IEWebDriverManagerCommandExecutor::OnGetResponse(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::OnGetResponse";

  LPSTR str = reinterpret_cast<LPSTR>(lParam);
  strcpy_s(str,
           this->serialized_response_.size() + 1,
           this->serialized_response_.c_str());

  // Reset the serialized response for the next command.
  this->serialized_response_ = "";
  return 0;
}

LRESULT IEWebDriverManagerCommandExecutor::OnIsSessionValid(UINT uMsg,
                                            WPARAM wParam,
                                            LPARAM lParam,
                                            BOOL& bHandled) {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::OnIsSessionValid";

  return this->is_valid_ ? 1 : 0;
}

LRESULT IEWebDriverManagerCommandExecutor::OnGetQuitStatus(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandled) {
  // At present, there is no need to track when the executor
  // is quitting. We can simply assume all instances have
  // appropriately quit, and can proceed with destroying the
  // executor.
  return 0;
}


unsigned int WINAPI IEWebDriverManagerCommandExecutor::ThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::ThreadProc";

  IECommandExecutorThreadContext* thread_context = reinterpret_cast<IECommandExecutorThreadContext*>(lpParameter);
  HWND window_handle = thread_context->hwnd;

  // it is better to use IECommandExecutorSessionContext instead
  // but use ThreadContext for code minimization
  IECommandExecutorThreadContext* session_context = new IECommandExecutorThreadContext();
  session_context->port = thread_context->port;

  DWORD error = 0;
  HRESULT hr = ::CoInitializeEx(NULL, COINIT_MULTITHREADED);
  if (FAILED(hr)) {
    LOGHR(DEBUG, hr) << "COM library initialization encountered an error";
  }

  IEWebDriverManagerCommandExecutor new_session;
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

void IEWebDriverManagerCommandExecutor::DispatchCommand() {
  LOG(TRACE) << "Entering IEWebDriverManagerCommandExecutor::DispatchCommand";
  std::wstring serialized_command = StringUtilities::ToWString(this->current_command_.Serialize());

  LPWSTR pszResult = nullptr;

  HRESULT hr = this->manager_->ExecuteCommand((LPWSTR)serialized_command.c_str(), &pszResult);
  std::wstring result(pszResult);
  Response actual_response;
  actual_response.Deserialize(StringUtilities::ToString(result));
  this->serialized_response_ = actual_response.Serialize();
  ::CoTaskMemFree(pszResult);

  if (this->current_command_.command_type() == webdriver::CommandType::Close ||
      this->current_command_.command_type() == webdriver::CommandType::Quit) {
    this->is_valid_ = false;
  }
}

} // namespace webdriver
