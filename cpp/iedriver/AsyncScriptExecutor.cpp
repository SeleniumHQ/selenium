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

#include "Element.h"
#include "ElementRepository.h"
#include "Script.h"
#include "StringUtilities.h"
#include "WebDriverConstants.h"

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
  std::wstring serialized_args = context->serialized_script_args;
  this->main_element_repository_handle_ = context->main_element_repository_handle;
  if (serialized_args.size() > 0) {
    std::string parse_errors;
    std::stringstream json_stream;
    json_stream.str(StringUtilities::ToString(serialized_args));
    Json::parseFromStream(Json::CharReaderBuilder(),
                          json_stream,
                          &this->script_args_,
                          &parse_errors);

    if (this->script_args_.isArray()) {
      this->GetElementIdList(this->script_args_);
      this->script_argument_count_ = this->script_args_.size();
    }
  } else {
    this->main_element_repository_handle_ = NULL;
    this->script_args_ = Json::Value::null;
  }
  // Calling vector::resize() is okay here, because the vector
  // should be empty when Initialize() is called, and the
  // reallocation of variants shouldn't give us too much of a
  // negative impact.
  this->script_arguments_.resize(this->script_argument_count_);
  this->status_code_ = WD_SUCCESS;
  this->is_execution_completed_ = false;
  this->is_listener_attached_ = true;
  this->element_repository_ = new ElementRepository();
  this->polling_script_source_code_ = L"";
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
  delete this->element_repository_;
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

LRESULT AsyncScriptExecutor::OnSetElementArgument(UINT uMsg,
                                                  WPARAM wParam,
                                                  LPARAM lParam,
                                                  BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnSetElementArgument";
  ElementInfo* info = reinterpret_cast<ElementInfo*>(lParam);
  std::string element_id = info->element_id;
  std::vector<std::string>::iterator item = std::find(this->element_id_list_.begin(),
                                                      this->element_id_list_.end(),
                                                      element_id);
  if (item == this->element_id_list_.end()) {
    LOG(WARN) << "Invalid element ID sent from main repository: " << element_id;
  }
  CComPtr<IHTMLElement> element;
  ::CoGetInterfaceAndReleaseStream(info->element_stream,
                                   IID_IHTMLElement,
                                   reinterpret_cast<void**>(&element));
  delete info;
  ElementHandle element_handle(new Element(element, NULL, element_id));
  this->element_repository_->AddManagedElement(element_handle);
  this->element_id_list_.erase(item);
  return WD_SUCCESS;
}

LRESULT AsyncScriptExecutor::OnGetRequiredElementList(UINT uMsg,
                                                      WPARAM wParam,
                                                      LPARAM lParam,
                                                      BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnGetRequiredElementList";
  Json::Value element_id_list(Json::arrayValue);
  std::vector<std::string>::const_iterator it = this->element_id_list_.begin();
  for (; it != this->element_id_list_.end(); ++it) {
    element_id_list.append(*it);
  }
  Json::StreamWriterBuilder writer;
  std::string serialized_element_list = Json::writeString(writer, element_id_list);
  std::string* return_string = reinterpret_cast<std::string*>(lParam);
  *return_string = serialized_element_list.c_str();
  return 0;
}

LRESULT AsyncScriptExecutor::OnIsExecutionReady(UINT uMsg,
                                                WPARAM wParam,
                                                LPARAM lParam,
                                                BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnIsExecutionReady";
  return this->element_id_list_.size() == 0 ? 1 : 0;
}

LRESULT AsyncScriptExecutor::OnSetPollingScript(UINT uMsg,
                                                WPARAM wParam,
                                                LPARAM lParam,
                                                BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnSetPollingScript";
  LPCTSTR polling_script = reinterpret_cast<LPCTSTR>(lParam);
  std::wstring script(polling_script);
  this->polling_script_source_code_ = script;
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
  this->status_code_ = script_to_execute.AddArguments(this,
                                                      this->script_args_);

  if (this->status_code_ == WD_SUCCESS) {
    this->status_code_ = script_to_execute.Execute();
  }

  if (!this->is_listener_attached_) {
    ::PostMessage(this->m_hWnd, WM_CLOSE, NULL, NULL);
  } else {
    if (this->status_code_ == WD_SUCCESS) {
      if (this->polling_script_source_code_.size() > 0) {
          bool polling_script_succeeded = this->WaitForPollingScript();
          if (!polling_script_succeeded) {
            // The polling script either detected a page reload, or it timed out.
            // In either case, this script execution is completed.
            this->is_execution_completed_ = true;
            return 0;
          }
      } else {
        this->status_code_ = script_to_execute.ConvertResultToJsonValue(this,
                                                                        &this->script_result_);
      }
      if (this->element_id_list_.size() > 0) {
        // There are newly discovered elements to be managed, and they
        // need to be marshaled back to the main executor thread. Note
        // that we return without setting execution complete, because
        // execution isn't done until the marshalling is done.
        TransferReturnedElements();
        return 0;
      }
    } else {
      if (script_to_execute.ResultIsString()) {
        script_to_execute.ConvertResultToJsonValue(this,
                                                   &this->script_result_);
      }
    }
  }
  this->is_execution_completed_ = true;
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
  if (this->main_element_repository_handle_ != NULL) {
    Json::Value* result = reinterpret_cast<Json::Value*>(lParam);
    *result = this->script_result_;
  } else {
    ::PostMessage(this->m_hWnd, WM_CLOSE, NULL, NULL);
  }
  return this->status_code_;
}

LRESULT AsyncScriptExecutor::OnNotifyElementTransferred(UINT uMsg,
                                                        WPARAM wParam,
                                                        LPARAM lParam,
                                                        BOOL& bHandled) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::OnNotifyElementTransferred";
  RemappedElementInfo* info = reinterpret_cast<RemappedElementInfo*>(lParam);
  std::string element_id = info->element_id;
  std::string original_element_id = info->original_element_id;
  delete info;
  this->ReplaceTransferredElementResult(original_element_id, element_id, &this->script_result_);
  std::vector<std::string>::const_iterator item = std::find(this->element_id_list_.begin(),
                                                            this->element_id_list_.end(),
                                                            original_element_id);
  this->element_id_list_.erase(item);
  if (this->element_id_list_.size() == 0) {
    this->is_execution_completed_ = true;
  }
  return WD_SUCCESS;
}
void AsyncScriptExecutor::ReplaceTransferredElementResult(std::string original_element_id,
                                                          std::string element_id,
                                                          Json::Value* result) {
  if (result->isArray()) {
    for (Json::ArrayIndex i = 0; i < result->size(); ++i) {
      this->ReplaceTransferredElementResult(original_element_id,
                                            element_id,
                                            &((*result)[i]));
    }
  } else if (result->isObject()) {
    if (result->isMember(JSON_ELEMENT_PROPERTY_NAME) &&
        (*result)[JSON_ELEMENT_PROPERTY_NAME] == original_element_id) {
      (*result)[JSON_ELEMENT_PROPERTY_NAME] = element_id;
    } else {
      std::vector<std::string> member_names = result->getMemberNames();
      std::vector<std::string>::const_iterator it = member_names.begin();
      for (; it != member_names.end(); ++it) {
        this->ReplaceTransferredElementResult(original_element_id,
                                              element_id,
                                              &((*result)[*it]));
      }
    }
  }
}

int AsyncScriptExecutor::GetManagedElement(const std::string& element_id,
                                           ElementHandle* element_wrapper) const {
  LOG(TRACE) << "Entering AsyncScriptExecutor::GetManagedElement";
  return this->element_repository_->GetManagedElement(element_id,
                                                      element_wrapper);
}

bool AsyncScriptExecutor::AddManagedElement(IHTMLElement* element,
                                            ElementHandle* element_wrapper) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::AddManagedElement";
  bool is_new_element = this->element_repository_->AddManagedElement(NULL,
                                                                     element,
                                                                     element_wrapper);
  if (is_new_element) {
    this->element_id_list_.push_back((*element_wrapper)->element_id());
  }
  return is_new_element;
}

void AsyncScriptExecutor::RemoveManagedElement(const std::string& element_id) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::RemoveManagedElement";
  this->element_repository_->RemoveManagedElement(element_id);

  // Simply forward on the request to remove the element from the
  // main element repository. We shouldn't need to worry about waiting
  // for the removal to be processed; it should be scheduled to happen
  // before the next command can arrive.
  ElementInfo* info = new ElementInfo;
  info->element_id = element_id.c_str();
  ::PostMessage(this->main_element_repository_handle_,
                WD_ASYNC_SCRIPT_SCHEDULE_REMOVE_MANAGED_ELEMENT,
                NULL,
                reinterpret_cast<LPARAM>(info));
}

void AsyncScriptExecutor::GetElementIdList(const Json::Value& json_object) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::GetElementIdList";
  if (json_object.isArray()) {
    for (unsigned int i = 0; i < json_object.size(); ++i) {
      GetElementIdList(json_object[i]);
    }
  } else if (json_object.isObject()) {
    if (json_object.isMember(JSON_ELEMENT_PROPERTY_NAME)) {
      // Capture the ID of any element in the arg list, and 
      std::string element_id;
      element_id = json_object[JSON_ELEMENT_PROPERTY_NAME].asString();
      this->element_id_list_.push_back(element_id);
    } else {
      std::vector<std::string> property_names = json_object.getMemberNames();
      std::vector<std::string>::const_iterator it = property_names.begin();
      for (; it != property_names.end(); ++it) {
        this->GetElementIdList(json_object[*it]);
      }
    }
  }
}

void AsyncScriptExecutor::TransferReturnedElements() {
  LOG(TRACE) << "Entering AsyncScriptExecutor::TransferReturnedElements";
  std::vector<std::string>::const_iterator it = this->element_id_list_.begin();
  for (; it != this->element_id_list_.end(); ++it) {
    std::string element_id = *it;
    ElementHandle element_handle;
    this->element_repository_->GetManagedElement(element_id,
                                                 &element_handle);
    ElementInfo* info = new ElementInfo;
    info->element_id = element_id.c_str();
    ::CoMarshalInterThreadInterfaceInStream(IID_IHTMLElement,
                                            element_handle->element(),
                                            &info->element_stream);
    ::PostMessage(this->main_element_repository_handle_,
                  WD_ASYNC_SCRIPT_TRANSFER_MANAGED_ELEMENT,
                  NULL,
                  reinterpret_cast<LPARAM>(info));
  }
}

bool AsyncScriptExecutor::WaitForPollingScript(void) {
  LOG(TRACE) << "Entering AsyncScriptExecutor::WaitForPollingScript";
  Script polling_script(this->script_host_, this->polling_script_source_code_, 0);
  while (this->is_listener_attached_ && this->status_code_ == WD_SUCCESS) {
    int polling_status_code = polling_script.Execute();
    if (polling_status_code != WD_SUCCESS) {
      this->status_code_ = EUNEXPECTEDJSERROR;
      this->script_result_ = "Page reload detected during async script";
    } else {
      Json::Value polling_script_result;
      polling_script.ConvertResultToJsonValue(this, &polling_script_result);
      if (!polling_script_result.isObject()) {
        this->status_code_ = EUNEXPECTEDJSERROR;
        this->script_result_ = "Polling script did not return expected object";
      }
      if (!polling_script_result.isMember("status")) {
        this->status_code_ = EUNEXPECTEDJSERROR;
        this->script_result_ = "Polling script did not return expected object";
      }
      std::string polling_script_status = polling_script_result["status"].asString();
      if (polling_script_status == "reload") {
        this->status_code_ = EUNEXPECTEDJSERROR;
        this->script_result_ = "Page reload detected during async script";
      }
      if (polling_script_status == "timeout") {
        this->status_code_ = ESCRIPTTIMEOUT;
        this->script_result_ = "Timeout expired waiting for async script";
      }
      if (polling_script_status == "complete") {
        this->status_code_ = WD_SUCCESS;
        this->script_result_ = polling_script_result["value"];
        break;
      }
    }
  }
  return this->status_code_ == WD_SUCCESS;
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
  HANDLE event_handle = ::OpenEvent(EVENT_ALL_ACCESS,
                                    FALSE,
                                    ASYNC_SCRIPT_EVENT_NAME);
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
