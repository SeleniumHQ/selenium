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

#include "AsyncScriptExecutor.h"

#include <vector>

#include "errorcodes.h"
#include "logging.h"

#include "Script.h"

namespace webdriver {

LRESULT AsyncScriptExecutor::OnInit(UINT uMsg,
                                    WPARAM wParam,
                                    LPARAM lParam,
                                    BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnInit";
  return 0;
}

LRESULT AsyncScriptExecutor::OnCreate(UINT uMsg,
                                      WPARAM wParam,
                                      LPARAM lParam,
                                      BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnCreate";
  
  CREATESTRUCT* create = reinterpret_cast<CREATESTRUCT*>(lParam);
  AsyncScriptExecutorThreadContext* context = reinterpret_cast<AsyncScriptExecutorThreadContext*>(create->lpCreateParams);

  this->script_source_code_ = context->script_source;
  this->script_argument_count_ = context->script_argument_count;
  this->script_argument_index_ = 0;
  // Calling vector::resize() is okay here, because the vector
  // should be empty when Initialize() is called, and the
  // reallocation of variants shouldn't give us too much of a
  // negative impact.
  this->script_arguments_.resize(this->script_argument_count_);
  this->status_code_ = WD_SUCCESS;
  this->is_execution_completed_ = false;
  this->is_listener_attached_ = true;
  return 0;
}

LRESULT AsyncScriptExecutor::OnClose(UINT uMsg,
                                     WPARAM wParam,
                                     LPARAM lParam,
                                     BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnClose";
  this->DestroyWindow();
  return 0;
}

LRESULT AsyncScriptExecutor::OnDestroy(UINT uMsg,
                                       WPARAM wParam,
                                       LPARAM lParam,
                                       BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncAtomExecutor::OnDestroy";

  ::PostQuitMessage(0);
  return 0;
}

LRESULT AsyncScriptExecutor::OnSetDocument(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnSetDocument";
  CComPtr<IHTMLDocument2> doc;
  LPSTREAM initializer_payload = reinterpret_cast<LPSTREAM>(lParam);
  HRESULT hr = ::CoGetInterfaceAndReleaseStream(initializer_payload,
                                                IID_IHTMLDocument2,
                                                reinterpret_cast<void**>(&this->script_host_));
  return 0;
}

LRESULT AsyncScriptExecutor::OnSetArgument(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnSetArgument";
  VARTYPE variant_type = static_cast<VARTYPE>(wParam);
  switch (variant_type) {
    case VT_DISPATCH: {
      CComPtr<IDispatch> dispatch;
      LPSTREAM message_payload = reinterpret_cast<LPSTREAM>(lParam);
      HRESULT hr = ::CoGetInterfaceAndReleaseStream(message_payload,
                                                    IID_IDispatch,
                                                    reinterpret_cast<void**>(&dispatch));
      CComVariant dispatch_variant(dispatch);
      this->script_arguments_[this->script_argument_index_] = dispatch_variant;
      break;
    }
    default: {
      // TODO: Unmarshal arguments of types other than VT_DISPATCH. At present,
      // the asynchronous execution of JavaScript is only used for Automation
      // Atoms on an element which take a single argument, an IHTMLElement
      // object, which is represented as an IDispatch. This case statement
      // will get much more complex should the need arise to execute
      // arbitrary scripts in an asynchronous manner.
    }
  }
  ++this->script_argument_index_;
  return 0;
}

LRESULT AsyncScriptExecutor::OnExecuteScript(UINT uMsg,
                                             WPARAM wParam,
                                             LPARAM lParam,
                                             BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnExecuteScript";
  Script script_to_execute(this->script_host_,
                           this->script_source_code_,
                           this->script_argument_count_);
  for (size_t index = 0; index < this->script_arguments_.size(); ++index) {
    script_to_execute.AddArgument(this->script_arguments_[index]);
  }
  this->status_code_ = script_to_execute.Execute();
  this->is_execution_completed_ = true;
  if (!this->is_listener_attached_) {
    ::PostMessage(this->m_hWnd, WM_CLOSE, NULL, NULL);
  }
  return 0;
}

LRESULT AsyncScriptExecutor::OnDetachListener(UINT uMsg,
                                              WPARAM wParam,
                                              LPARAM lParam,
                                              BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnDetachListener";
  this->is_listener_attached_ = false;
  return 0;
}

LRESULT AsyncScriptExecutor::OnIsExecutionComplete(UINT uMsg,
                                                   WPARAM wParam,
                                                   LPARAM lParam,
                                                   BOOL& bHandled) {
  return this->is_execution_completed_ ? 1 : 0;
}

LRESULT AsyncScriptExecutor::OnGetResult(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnGetResult";
  // NOTE: We need to tell this window to close itself. If and when marshaling
  // of the actual variant result to the calling thread is implemented, posting
  // the message to close the window will have to be moved to the method that
  // retrieves the marshaled result.
  ::PostMessage(this->m_hWnd, WM_CLOSE, NULL, NULL);
  return this->status_code_;
}

unsigned int WINAPI AsyncScriptExecutor::ThreadProc(LPVOID lpParameter) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::ThreadProc";

  AsyncScriptExecutorThreadContext* thread_context = reinterpret_cast<AsyncScriptExecutorThreadContext*>(lpParameter);
  HWND window_handle = thread_context->hwnd;

  DWORD error = 0;
  HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
  if (FAILED(hr)) {
    LOGHR(DEBUG, hr) << "COM library initialization has some problem";
  }

  AsyncScriptExecutor async_executor;
  HWND async_executor_window_handle = async_executor.Create(/*HWND*/ HWND_MESSAGE,
                                                            /*_U_RECT rect*/ CWindow::rcDefault,
                                                            /*LPCTSTR szWindowName*/ NULL,
                                                            /*DWORD dwStyle*/ NULL,
                                                            /*DWORD dwExStyle*/ NULL,
                                                            /*_U_MENUorID MenuOrID*/ 0U,
                                                            /*LPVOID lpCreateParam*/ reinterpret_cast<LPVOID*>(thread_context));
  if (async_executor_window_handle == NULL) {
    LOGERR(WARN) << "Unable to create new AsyncScriptExecutor";
  }

  MSG msg;
  ::PeekMessage(&msg, NULL, WM_USER, WM_USER, PM_NOREMOVE);

  // Return the HWND back through lpParameter, and signal that the
  // window is ready for messages.
  thread_context->hwnd = async_executor_window_handle;
  HANDLE event_handle = ::OpenEvent(EVENT_ALL_ACCESS, FALSE, ASYNC_SCRIPT_EVENT_NAME);
  if (event_handle != NULL) {
    ::SetEvent(event_handle);
    ::CloseHandle(event_handle);
  } else {
    LOGERR(DEBUG) << "Unable to signal that window is ready";
  }

  // Run the message loop
  while (::GetMessage(&msg, NULL, 0, 0) > 0) {
    ::TranslateMessage(&msg);
    ::DispatchMessage(&msg);
  }

  ::CoUninitialize();
  return 0;
}

} // namespace webdriver
