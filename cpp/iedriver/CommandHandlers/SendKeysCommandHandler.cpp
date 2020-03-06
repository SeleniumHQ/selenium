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

#include "SendKeysCommandHandler.h"
#include <ctime>
#include <iomanip>
#include <UIAutomation.h>
#include "errorcodes.h"
#include "keycodes.h"
#include "logging.h"
#include "../Browser.h"
#include "../BrowserFactory.h"
#include "../Element.h"
#include "../IECommandExecutor.h"
#include "../InputManager.h"
#include "../StringUtilities.h"
#include "../VariantUtilities.h"
#include "../WindowUtilities.h"

#define MAXIMUM_DIALOG_FIND_RETRIES 50
#define MAXIMUM_CONTROL_FIND_RETRIES 10

const LPCTSTR fileDialogNames[] = {
  _T("#32770"),
  _T("ComboBoxEx32"),
  _T("ComboBox"),
  _T("Edit"),
  NULL
};

namespace webdriver {

std::wstring SendKeysCommandHandler::error_text = L"";

struct DialogParentWindowInfo {
  DWORD process_id;
  const wchar_t* class_name;
  HWND window_handle;
};

SendKeysCommandHandler::SendKeysCommandHandler(void) {
}

SendKeysCommandHandler::~SendKeysCommandHandler(void) {
}

void SendKeysCommandHandler::ExecuteInternal(
    const IECommandExecutor& executor,
    const ParametersMap& command_parameters,
    Response* response) {
  ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
  ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("text");
  if (id_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter in URL: id");
    return;
  } else if (value_parameter_iterator == command_parameters.end()) {
    response->SetErrorResponse(400, "Missing parameter: text");
    return;
  } else {
    std::string element_id = id_parameter_iterator->second.asString();

    if (!value_parameter_iterator->second.isString()) {
      response->SetErrorResponse(ERROR_INVALID_ARGUMENT, "parameter 'text' must be a string");
      return;
    }
    std::wstring keys = StringUtilities::ToWString(value_parameter_iterator->second.asString());

    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != WD_SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get browser");
      return;
    }

    ElementHandle initial_element;
    status_code = this->GetElement(executor, element_id, &initial_element);

    if (status_code == WD_SUCCESS) {
      ElementHandle element_wrapper = initial_element;
      CComPtr<IHTMLOptionElement> option;
      HRESULT hr = initial_element->element()->QueryInterface<IHTMLOptionElement>(&option);
      if (SUCCEEDED(hr) && option) {
        // If this is an <option> element, we want to operate on its parent
        // <select> element.
        CComPtr<IHTMLElement> parent_node;
        hr = initial_element->element()->get_parentElement(&parent_node);
        while (SUCCEEDED(hr) && parent_node) {
          CComPtr<IHTMLSelectElement> select;
          HRESULT select_hr = parent_node->QueryInterface<IHTMLSelectElement>(&select);
          if (SUCCEEDED(select_hr) && select) {
            IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
            mutable_executor.AddManagedElement(parent_node, &element_wrapper);
            break;
          }
          hr = parent_node->get_parentElement(&parent_node);
        }
      }

      // Scroll the target element into view before executing the action
      // sequence.
      LocationInfo location = {};
      std::vector<LocationInfo> frame_locations;
      element_wrapper->GetLocationOnceScrolledIntoView(executor.input_manager()->scroll_behavior(),
                                                       &location,
                                                       &frame_locations);

      if (this->IsFileUploadElement(element_wrapper)) {
        if (executor.use_strict_file_interactability()) {
          std::string upload_error_description = "";
          if (!this->IsElementInteractable(element_wrapper,
                                           &upload_error_description)) {
            response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE,
                                       upload_error_description);
            return;
          }
        }
        this->UploadFile(browser_wrapper, element_wrapper, executor, keys, response);
        return;
      }

      std::string error_description = "";
      bool is_interactable = IsElementInteractable(element_wrapper,
                                                   &error_description);
      if (!is_interactable) {
        response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE,
                                   error_description);
        return;
      }

      if (!this->VerifyPageHasFocus(browser_wrapper)) {
        LOG(WARN) << "HTML rendering pane does not have the focus. Keystrokes may go to an unexpected UI element.";
      }
      if (!this->WaitUntilElementFocused(element_wrapper)) {
        error_description = "Element cannot be interacted with via the keyboard because it is not focusable";
        response->SetErrorResponse(ERROR_ELEMENT_NOT_INTERACTABLE,
                                   error_description);
        return;
      }

      Json::Value actions = this->CreateActionSequencePayload(executor, &keys);

      std::string error_info = "";
      status_code = executor.input_manager()->PerformInputSequence(browser_wrapper, actions, &error_info);
      response->SetSuccessResponse(Json::Value::null);
      return;
    } else {
      response->SetErrorResponse(status_code, "Element is no longer valid");
      return;
    }
  }
}

bool SendKeysCommandHandler::IsElementInteractable(ElementHandle element_wrapper,
                                                   std::string* error_description) {
  bool displayed;
  int status_code = element_wrapper->IsDisplayed(true, &displayed);
  if (status_code != WD_SUCCESS || !displayed) {
    *error_description = "Element cannot be interacted with via the keyboard because it is not displayed";
    return false;
  }

  if (!element_wrapper->IsEnabled()) {
    *error_description = "Element cannot be interacted with via the keyboard because it is not enabled";
    return false;
  }

  return true;
}

Json::Value SendKeysCommandHandler::CreateActionSequencePayload(const IECommandExecutor& executor,
                                                                std::wstring* keys) {
  bool shift_pressed = executor.input_manager()->is_shift_pressed();
  bool control_pressed = executor.input_manager()->is_control_pressed();
  bool alt_pressed = executor.input_manager()->is_alt_pressed();

  keys->push_back(static_cast<wchar_t>(WD_KEY_NULL));
  Json::Value key_array(Json::arrayValue);
  for (size_t i = 0; i < keys->size(); ++i) {
    std::wstring character = L"";
    character.push_back(keys->at(i));
    if (IS_HIGH_SURROGATE(keys->at(i))) {
      // We've converted the key string to a wstring, which contain
      // wchar_t elements. On Windows, wchar_t is 16 bits, meaning
      // the string has been encoded to UTF-16, which implies each
      // Unicode code point will be either one wchar_t (where the
      // value <= 0xFFFF), or two wchar_ts (where the code point is
      // represented by a surrogate pair). In the latter case, we
      // test for the first part of a surrogate pair, and if  it is
      // one, we grab the next wchar_t, and use the two together to
      // represent a single Unicode "character."
      ++i;
      character.push_back(keys->at(i));
    }

    std::string single_key = StringUtilities::ToString(character);

    if (keys->at(i) == WD_KEY_SHIFT) {
      Json::Value shift_key_value;
      shift_key_value["value"] = single_key;
      if (shift_pressed) {
        shift_key_value["type"] = "keyUp";
      } else {
        shift_key_value["type"] = "keyDown";
        shift_pressed = true;
      }
      key_array.append(shift_key_value);
      continue;
    } else if (keys->at(i) == WD_KEY_CONTROL) {
      Json::Value control_key_value;
      control_key_value["value"] = single_key;
      if (control_pressed) {
        control_key_value["type"] = "keyUp";
      } else {
        control_key_value["type"] = "keyDown";
        control_pressed = true;
      }
      key_array.append(control_key_value);
      continue;
    } else if (keys->at(i) == WD_KEY_ALT) {
      Json::Value alt_key_value;
      alt_key_value["value"] = single_key;
      if (alt_pressed) {
        alt_key_value["type"] = "keyUp";
      } else {
        alt_key_value["type"] = "keyDown";
        alt_pressed = true;
      }
      key_array.append(alt_key_value);
      continue;
    }

    Json::Value key_down_value;
    key_down_value["type"] = "keyDown";
    key_down_value["value"] = single_key;
    key_array.append(key_down_value);

    Json::Value key_up_value;
    key_up_value["type"] = "keyUp";
    key_up_value["value"] = single_key;
    key_array.append(key_up_value);
  }

  Json::Value value;
  value["type"] = "key";
  value["id"] = "send keys keyboard";
  value["actions"] = key_array;

  Json::Value actions(Json::arrayValue);
  actions.append(value);
  return actions;
}

bool SendKeysCommandHandler::HasMultipleAttribute(ElementHandle element_wrapper) {
  bool allows_multiple = false;
  CComVariant multiple_value;
  int status_code = element_wrapper->GetAttributeValue("multiple",
                                                       &multiple_value);
  if (status_code == WD_SUCCESS &&
      VariantUtilities::VariantIsString(multiple_value)) {
    if (0 == wcscmp(multiple_value.bstrVal, L"true")) {
      allows_multiple = true;
    }
  }
  return allows_multiple;
}

void SendKeysCommandHandler::UploadFile(BrowserHandle browser_wrapper,
                                        ElementHandle element_wrapper,
                                        const IECommandExecutor& executor,
                                        const std::wstring& keys,
                                        Response* response) {
  bool allows_multiple = this->HasMultipleAttribute(element_wrapper);

  std::vector<std::wstring> file_list;
  StringUtilities::Split(keys, L"\n", &file_list);

  if (file_list.size() == 0) {
    response->SetErrorResponse(EINVALIDARGUMENT,
                               "Upload file cannot be an empty string.");
    return;
  }

  if (!allows_multiple && file_list.size() > 1) {
    response->SetErrorResponse(EINVALIDARGUMENT,
                               "Attempting to upload multiple files to file upload element without multiple attribute.");
    return;
  }

  std::wstring file_directory = L"";
  std::wstring file_dialog_keys = L"";
  std::vector<std::wstring>::const_iterator iterator = file_list.begin();
  for (; iterator < file_list.end(); ++iterator) {
    std::wstring file_name = *iterator;
    // Key sequence should be a path and file name. Check
    // to see that the file exists before invoking the file
    // selection dialog. Note that we also error if the file
    // path passed in is valid, but is a directory instead of
    // a file.
    bool path_exists = ::PathFileExists(file_name.c_str()) == TRUE;
    if (!path_exists) {
      response->SetErrorResponse(EINVALIDARGUMENT,
                                 "Attempting to upload file '" + StringUtilities::ToString(file_name) + "' which does not exist.");
      return;
    }
    bool path_is_directory = ::PathIsDirectory(file_name.c_str()) == TRUE;
    if (path_is_directory) {
      response->SetErrorResponse(EINVALIDARGUMENT,
                                 "Attempting to upload file '" + StringUtilities::ToString(file_name) + "' which is a directory.");
      return;
    }

    if (allows_multiple) {
      std::vector<wchar_t> file_name_buffer;
      StringUtilities::ToBuffer(file_name, &file_name_buffer);
      ::PathRemoveFileSpec(&file_name_buffer[0]);
      std::wstring current_file_directory = &file_name_buffer[0];
      if (file_directory.size() == 0) {
        file_directory = current_file_directory;
      }

      if (file_directory != current_file_directory) {
        response->SetErrorResponse(EINVALIDARGUMENT,
                                   "Attempting to upload multiple files, but all files must be in the same directory.");
        return;
      }
    }

    if (allows_multiple && file_dialog_keys.size() > 0) {
      file_dialog_keys.append(L" ");
    }
    if (allows_multiple && file_name.at(0) != L'\"') {
      file_dialog_keys.append(L"\"");
    }
    file_dialog_keys.append(file_name);
    if (allows_multiple && file_name.at(file_name.size() - 1) != L'\"') {
      file_dialog_keys.append(L"\"");
    }
  }

  HWND window_handle = browser_wrapper->GetContentWindowHandle();
  HWND top_level_window_handle = browser_wrapper->GetTopLevelWindowHandle();

  DWORD ie_process_id;
  ::GetWindowThreadProcessId(window_handle, &ie_process_id);

  FileNameData key_data;
  key_data.main = top_level_window_handle;
  key_data.hwnd = window_handle;
  key_data.text = file_dialog_keys.c_str();
  key_data.ieProcId = ie_process_id;
  key_data.dialogTimeout = executor.file_upload_dialog_timeout();
  key_data.useLegacyDialogHandling = executor.use_legacy_file_upload_dialog_handling();

  unsigned int thread_id;
  HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                                 0,
                                                                 &SendKeysCommandHandler::SetFileValue,
                                                                 reinterpret_cast<void*>(&key_data),
                                                                 0,
                                                                 &thread_id));

  LOG(DEBUG) << "Clicking upload button and starting to handle file selection dialog";
  element_wrapper->element()->click();
  // We're now blocked until the dialog closes.
  ::CloseHandle(thread_handle);
  response->SetSuccessResponse(Json::Value::null);
}

bool SendKeysCommandHandler::IsFileUploadElement(ElementHandle element_wrapper) {
  CComPtr<IHTMLElement> element(element_wrapper->element());

  CComPtr<IHTMLInputFileElement> file;
  element->QueryInterface<IHTMLInputFileElement>(&file);
  CComPtr<IHTMLInputElement> input;
  element->QueryInterface<IHTMLInputElement>(&input);
  CComBSTR element_type;
  if (input) {
    input->get_type(&element_type);
    HRESULT hr = element_type.ToLower();
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Failed converting type attribute of <input> element to lowercase using ToLower() method of BSTR";
    }
  }
  bool is_file_element = (file != NULL) ||
                         (input != NULL && element_type == L"file");
  return is_file_element;
}

bool SendKeysCommandHandler::GetFileSelectionDialogCandidates(std::vector<HWND> parent_window_handles, IUIAutomation* ui_automation, IUIAutomationElementArray** dialog_candidates) {
  LOG(INFO) << "using " << parent_window_handles.size() << " parent windows";
  CComVariant dialog_control_type(UIA_WindowControlTypeId);
  CComPtr<IUIAutomationCondition> dialog_condition;
  HRESULT hr = ui_automation->CreatePropertyCondition(UIA_ControlTypePropertyId,
                                                      dialog_control_type,
                                                      &dialog_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for dialog";
    return false;
  }

  bool found_candidate_dialogs = false;
  int window_array_length = 0;
  std::vector<HWND>::const_iterator handle_iterator = parent_window_handles.begin();
  for (; handle_iterator != parent_window_handles.end(); ++handle_iterator) {
    CComPtr<IUIAutomationElement> parent_window;
    hr = ui_automation->ElementFromHandle(*handle_iterator, &parent_window);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Did not get parent window UI Automation object";
      continue;
    }

    CComPtr<IUIAutomationElementArray> current_dialog_candidates;
    hr = parent_window->FindAll(TreeScope::TreeScope_Children,
                                dialog_condition,
                                &current_dialog_candidates);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Process of finding child dialogs of parent window failed";
      continue;
    }

    if (!current_dialog_candidates) {
      LOGHR(WARN, hr) << "Found no dialogs as children of parent window (null candidates)";
      continue;
    }

    hr = current_dialog_candidates->get_Length(&window_array_length);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Could not get length of list of child dialogs of parent window";
      continue;
    }

    if (window_array_length == 0) {
      LOG(WARN) << "Found no dialogs as children of parent window (empty candidates)";
      continue;
    } else {
      // Use CComPtr::CopyTo() to increment the refcount, because when the
      // current dialog candidates pointer goes out of scope, it will decrement
      // the refcount, which will free the object when the refcount equals
      // zero.
      LOG(INFO) << "Found " << window_array_length << "children";
      current_dialog_candidates.CopyTo(dialog_candidates);
      found_candidate_dialogs = true;
      break;
    }
  }

  return found_candidate_dialogs;
}

bool SendKeysCommandHandler::FillFileName(const wchar_t* file_name,
                                          IUIAutomation* ui_automation,
                                          IUIAutomationElement* file_selection_dialog) {
  CComVariant file_name_combo_box_automation_id(L"1148");
  CComPtr<IUIAutomationCondition> file_name_combo_box_condition;
  HRESULT hr = ui_automation->CreatePropertyCondition(UIA_AutomationIdPropertyId,
                                                      file_name_combo_box_automation_id,
                                                      &file_name_combo_box_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for file selection combo box";
    return false;
  }

  CComPtr<IUIAutomationElement> file_name_combo_box;
  hr = file_selection_dialog->FindFirst(TreeScope::TreeScope_Children,
                                        file_name_combo_box_condition,
                                        &file_name_combo_box);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get file name combo box on current dialog, trying next dialog";
    return false;
  }

  CComVariant edit_control_type(UIA_EditControlTypeId);
  CComPtr<IUIAutomationCondition> file_name_edit_condition;
  hr = ui_automation->CreatePropertyCondition(UIA_ControlTypePropertyId,
                                              edit_control_type,
                                              &file_name_edit_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for file selection edit control";
    return false;
  }

  CComPtr<IUIAutomationElement> file_name_edit_box;
  hr = file_name_combo_box->FindFirst(TreeScope::TreeScope_Children,
                                      file_name_edit_condition,
                                      &file_name_edit_box);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get file name edit box from combo box on current dialog, trying next dialog";
    return false;
  }

  CComPtr<IUIAutomationValuePattern> file_name_value_pattern;
  hr = file_name_edit_box->GetCurrentPatternAs(UIA_ValuePatternId,
                                               IID_PPV_ARGS(&file_name_value_pattern));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get value pattern for file name edit box on current dialog, trying next dialog";
    return false;
  }

  CComBSTR file_name_bstr(file_name);
  hr = file_name_value_pattern->SetValue(file_name_bstr);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get set file name on current dialog, trying next dialog";
    return false;
  }

  return true;
}

bool SendKeysCommandHandler::AcceptFileSelection(IUIAutomation* ui_automation,
                                                 IUIAutomationElement* file_selection_dialog) {
  CComVariant open_button_automation_id(L"1");
  CComPtr<IUIAutomationCondition> open_button_condition;
  HRESULT hr = ui_automation->CreatePropertyCondition(UIA_AutomationIdPropertyId,
                                                      open_button_automation_id,
                                                      &open_button_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for open button";
    return false;
  }

  CComPtr<IUIAutomationElement> open_button;
  hr = file_selection_dialog->FindFirst(TreeScope::TreeScope_Children,
                                        open_button_condition,
                                        &open_button);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get open button on current dialog, trying next dialog";
    return false;
  }

  CComPtr<IUIAutomationInvokePattern> open_button_invoke_pattern;
  hr = open_button->GetCurrentPatternAs(UIA_InvokePatternId,
                                        IID_PPV_ARGS(&open_button_invoke_pattern));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get invoke pattern for open button on current dialog, trying next dialog";
    return false;
  }

  hr = open_button_invoke_pattern->Invoke();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to click open button on current dialog, trying next dialog";
    return false;
  }

  return true;
}

bool SendKeysCommandHandler::WaitForFileSelectionDialogClose(const int timeout,
                                                             IUIAutomationElement* file_selection_dialog) {
  HWND dialog_window_handle;
  HRESULT hr = file_selection_dialog->get_CurrentNativeWindowHandle(reinterpret_cast<UIA_HWND*>(&dialog_window_handle));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not get window handle for file selection dialog";
    return false;
  }
  int max_retries = timeout / 100;
  bool is_dialog_closed = ::IsWindow(dialog_window_handle) == FALSE;
  while (!is_dialog_closed && --max_retries) {
    ::Sleep(100);
    is_dialog_closed = ::IsWindow(dialog_window_handle) == FALSE;
  }

  return is_dialog_closed;
}

bool SendKeysCommandHandler::FindFileSelectionErrorDialog(IUIAutomation* ui_automation,
                                                          IUIAutomationElement* file_selection_dialog,
                                                          IUIAutomationElement** error_dialog) {
  CComVariant dialog_control_type(UIA_WindowControlTypeId);
  CComPtr<IUIAutomationCondition> dialog_condition;
  HRESULT hr = ui_automation->CreatePropertyCondition(UIA_ControlTypePropertyId,
                                                      dialog_control_type,
                                                      &dialog_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for dialog";
    return false;
  }

  hr = file_selection_dialog->FindFirst(TreeScope::TreeScope_Children,
                                        dialog_condition,
                                        error_dialog);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not find error dialog owned by file selection dialog";
    return false;
  }

  return true;
}

bool SendKeysCommandHandler::DismissFileSelectionErrorDialog(IUIAutomation* ui_automation,
                                                             IUIAutomationElement* error_dialog) {
  CComVariant error_dialog_text_automation_id(L"ContentText");
  CComPtr<IUIAutomationCondition> error_dialog_text_condition;
  HRESULT hr = ui_automation->CreatePropertyCondition(UIA_AutomationIdPropertyId,
                                                      error_dialog_text_automation_id,
                                                      &error_dialog_text_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for error text control";
    return false;
  }

  CComPtr<IUIAutomationElement> error_dialog_text_control;
  hr = error_dialog->FindFirst(TreeScope::TreeScope_Children,
                               error_dialog_text_condition,
                               &error_dialog_text_control);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get error message text control on error dialog";
  }

  CComBSTR error_dialog_text;
  hr = error_dialog_text_control->get_CurrentName(&error_dialog_text);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get error message text from text control on error dialog";
  }

  error_text = error_dialog_text;

  CComVariant error_dialog_ok_button_automation_id(L"CommandButton_1");
  CComPtr<IUIAutomationCondition> error_dialog_ok_button_condition;
  hr = ui_automation->CreatePropertyCondition(UIA_AutomationIdPropertyId,
                                              error_dialog_ok_button_automation_id,
                                              &error_dialog_ok_button_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for error message OK button";
    return false;
  }

  CComPtr<IUIAutomationElement> error_dialog_ok_button;
  hr = error_dialog->FindFirst(TreeScope::TreeScope_Children,
                               error_dialog_ok_button_condition,
                               &error_dialog_ok_button);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get OK button on error dialog";
    return false;
  }

  CComPtr<IUIAutomationInvokePattern> error_dialog_ok_button_invoke_pattern;
  hr = error_dialog_ok_button->GetCurrentPatternAs(UIA_InvokePatternId,
                                                   IID_PPV_ARGS(&error_dialog_ok_button_invoke_pattern));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get invoke pattern for OK button on error dialog";
    return false;
  }

  hr = error_dialog_ok_button_invoke_pattern->Invoke();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to click OK button on error dialog";
    return false;
  }

  return true;
}

bool SendKeysCommandHandler::DismissFileSelectionDialog(IUIAutomation* ui_automation,
                                                        IUIAutomationElement* file_selection_dialog) {
  CComVariant cancel_button_automation_id(L"2");
  CComPtr<IUIAutomationCondition> cancel_button_condition;
  HRESULT hr = ui_automation->CreatePropertyCondition(UIA_AutomationIdPropertyId,
                                                      cancel_button_automation_id,
                                                      &cancel_button_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Could not create condition to look for cancel button";
    return false;
  }

  CComPtr<IUIAutomationElement> cancel_button;
  hr = file_selection_dialog->FindFirst(TreeScope::TreeScope_Children,
                                        cancel_button_condition,
                                        &cancel_button);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get cancel button on current dialog";
    return false;
  }

  CComPtr<IUIAutomationInvokePattern> cancel_button_invoke_pattern;
  hr = cancel_button->GetCurrentPatternAs(UIA_InvokePatternId,
                                          IID_PPV_ARGS(&cancel_button_invoke_pattern));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get invoke pattern for cancel button on current dialog";
    return false;
  }

  hr = cancel_button_invoke_pattern->Invoke();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to cancel file selection dialog";
    return false;
  }

  return true;
}

std::vector<HWND> SendKeysCommandHandler::FindWindowCandidates(FileNameData* file_data) {
  // Find a dialog parent window with a class name of "Alternate
  // Modal Top Most" belonging to the same process as the IE
  // content process. If we find one, add it to the list of 
  // window handles that might be the file selection dialog's
  // direct parent.

  DialogParentWindowInfo window_info;
  window_info.process_id = file_data->ieProcId;
  window_info.class_name = L"Alternate Modal Top Most";
  window_info.window_handle = NULL;
  ::EnumWindows(&SendKeysCommandHandler::FindWindowWithClassNameAndProcess,
                reinterpret_cast<LPARAM>(&window_info));
  std::vector<HWND> window_handles;
  if (window_info.window_handle != NULL) {
    LOG(INFO) << "found \"" << window_info.class_name << "\" " << window_info.window_handle;
    window_handles.push_back(window_info.window_handle);
  }
  window_handles.push_back(file_data->main);
  return window_handles;
}

bool SendKeysCommandHandler::SendFileNameKeys(FileNameData* file_data) {
  CComPtr<IUIAutomation> ui_automation;
  HRESULT hr = ::CoCreateInstance(CLSID_CUIAutomation,
                                  NULL,
                                  CLSCTX_INPROC_SERVER,
                                  IID_IUIAutomation,
                                  reinterpret_cast<void**>(&ui_automation));

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to create global UI Automation object";
    error_text = L"The driver was unable to initialize the Windows UI Automation system. This is a Windows installation problem, not a driver problem.";
    return false;
  }

  std::vector<HWND> window_handles = FindWindowCandidates(file_data);
  // Find all candidates for the file selection dialog. Retry until timeout.
  int max_retries = file_data->dialogTimeout / 100;
  CComPtr<IUIAutomationElementArray> dialog_candidates;
  bool dialog_candidates_found = GetFileSelectionDialogCandidates(window_handles,
                                                                  ui_automation,
                                                                  &dialog_candidates);
  while (!dialog_candidates_found && --max_retries) {
    dialog_candidates.Release();
    ::Sleep(100);
    window_handles = FindWindowCandidates(file_data);
    dialog_candidates_found = GetFileSelectionDialogCandidates(window_handles,
                                                               ui_automation,
                                                               &dialog_candidates);
  }

  if (!dialog_candidates_found) {
    LOG(WARN) << "Did not find any dialogs after dialog timeout";
    error_text = L"The driver did not find the file selection dialog before the timeout.";
    return false;
  }

  // We must have a valid array of dialog candidates at this point,
  // so we should be able to safely ignore checking for error values.
  int window_array_length = 0;
  hr = dialog_candidates->get_Length(&window_array_length);

  for (int i = 0; i < window_array_length; ++i) {
    CComPtr<IUIAutomationElement> file_selection_dialog;
    hr = dialog_candidates->GetElement(i, &file_selection_dialog);
    if (FAILED(hr)) {
      LOGHR(WARN, hr) << "Failed to get element " << i << " from list of child dialogs of IE main window, trying next dialog";
      continue;
    }
    if (!FillFileName(file_data->text, ui_automation, file_selection_dialog)) {
      continue;
    }
    if (!AcceptFileSelection(ui_automation, file_selection_dialog)) {
      continue;
    }
    if (WaitForFileSelectionDialogClose(file_data->dialogTimeout,
                                        file_selection_dialog)) {
      // Full success case. Break out of loop and return true.
      break;
    }

    // At this point, successfully found a file selection dialog, set its file name
    // and attempted to accept the selection. However, the file selection dialog didn't
    // close in a timely fashion, which indicates an error condition thrown up by the
    // browser. Check for an error dialog, and if one is found, dismiss it and the file
    // selection dialog so as not to hang the driver.
    CComPtr<IUIAutomationElement> error_dialog;
    if (!FindFileSelectionErrorDialog(ui_automation,
                                      file_selection_dialog,
                                      &error_dialog)) {
      error_text = L"The driver found the file selection dialog, set the file information, and clicked the open button, but the dialog did not close in a timely manner.";
      return false;
    }

    if (!DismissFileSelectionErrorDialog(ui_automation, error_dialog)) {
      return false;
    }

    if (!DismissFileSelectionDialog(ui_automation, file_selection_dialog)) {
      return false;
    }
  }

  return true;
}

BOOL CALLBACK SendKeysCommandHandler::FindWindowWithClassNameAndProcess(HWND hwnd, LPARAM arg) {
  DialogParentWindowInfo* process_win_info = reinterpret_cast<DialogParentWindowInfo*>(arg);
  size_t number_of_characters = wcsnlen(process_win_info->class_name, 255);
  std::vector<wchar_t> class_name(number_of_characters + 1);
  if (::GetClassName(hwnd, &class_name[0], static_cast<int>(class_name.size())) == 0) {
    // No match found. Skip
    return TRUE;
  }

  if (wcscmp(process_win_info->class_name, &class_name[0]) != 0) {
    return TRUE;
  } else {
    DWORD process_id = NULL;
    ::GetWindowThreadProcessId(hwnd, &process_id);
    if (process_win_info->process_id == process_id) {
      // Once we've found the first dialog (#32770) window
      // for the process we want, we can stop.
      process_win_info->window_handle = hwnd;
      return FALSE;
    }
  }

  return TRUE;
}
unsigned int WINAPI SendKeysCommandHandler::SetFileValue(void *file_data) {
  FileNameData* data = reinterpret_cast<FileNameData*>(file_data);
  ::Sleep(100);

  bool file_name_successfully_sent = false;
  unsigned int return_value = 0;
  // On a separate thread, so must reinitialize COM.
  HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
  if (FAILED(hr)) {
    return_value = 1;
    LOGHR(WARN, hr) << "COM library initialization encountered an error";
    error_text = L"The driver could not initialize COM on the thread used to handle the file selection dialog.";
  } else {
    file_name_successfully_sent = SendFileNameKeys(data);
    ::CoUninitialize();
    if (!file_name_successfully_sent) {
      return_value = 1;
    }
  }

  // TODO: Remove this and the supporting functions once feedback
  // on the use of UI Automation is completed.
  if (!file_name_successfully_sent && data->useLegacyDialogHandling) {
    LegacySelectFile(data);
  }

  return return_value;
}

bool SendKeysCommandHandler::LegacySelectFile(FileNameData* data) {
  HWND ie_main_window_handle = data->main;
  HWND dialog_window_handle = ::GetLastActivePopup(ie_main_window_handle);

  int max_retries = data->dialogTimeout / 100;
  if (!dialog_window_handle ||
    (dialog_window_handle == ie_main_window_handle)) {
    LOG(DEBUG) << "No dialog directly owned by the top-level window found. "
      << "Beginning search for dialog. Will search for "
      << max_retries << " attempts at 100ms intervals.";
    // No dialog directly owned by the top-level window.
    // Look for a dialog belonging to the same process as
    // the IE server window. This isn't perfect, but it's
    // all we have for now.
    while ((dialog_window_handle == ie_main_window_handle) && --max_retries) {
      ::Sleep(100);
      ProcessWindowInfo process_win_info;
      process_win_info.dwProcessId = data->ieProcId;
      ::EnumWindows(&BrowserFactory::FindDialogWindowForProcess,
                    reinterpret_cast<LPARAM>(&process_win_info));
      if (process_win_info.hwndBrowser != NULL) {
        dialog_window_handle = process_win_info.hwndBrowser;
      }
    }
  }

  if (!dialog_window_handle ||
      (dialog_window_handle == ie_main_window_handle)) {
    LOG(DEBUG) << "Did not find dialog owned by IE process. "
               << "Searching again using GetLastActivePopup API.";
    max_retries = data->dialogTimeout / 100;
    while ((dialog_window_handle == ie_main_window_handle) && --max_retries) {
      ::Sleep(100);
      dialog_window_handle = ::GetLastActivePopup(ie_main_window_handle);
    }
  }

  if (!dialog_window_handle ||
      (dialog_window_handle == ie_main_window_handle)) {
    LOG(WARN) << "No dialog found";
    return false;
  }

  LOG(DEBUG) << "Found file upload dialog with handle "
             << StringUtilities::Format("0x%08X", dialog_window_handle)
             << ". Window has caption '"
             << WindowUtilities::GetWindowCaption(dialog_window_handle)
             << "' Starting to look for file name edit control.";
  return LegacySendKeysToFileUploadAlert(dialog_window_handle, data->text);
}

bool SendKeysCommandHandler::LegacySendKeysToFileUploadAlert(
    HWND dialog_window_handle,
    const wchar_t* value) {
  HWND edit_field_window_handle = NULL;
  int max_wait = MAXIMUM_CONTROL_FIND_RETRIES;
  while (!edit_field_window_handle && --max_wait) {
    WindowUtilities::Wait(200);
    edit_field_window_handle = dialog_window_handle;
    for (int i = 1; fileDialogNames[i]; ++i) {
      std::wstring child_window_class = fileDialogNames[i];
      edit_field_window_handle = WindowUtilities::GetChildWindow(
          edit_field_window_handle,
          child_window_class);
      if (!edit_field_window_handle) {
        LOG(WARN) << "Didn't find window with class name '"
                  << LOGWSTRING(child_window_class)
                  << "' during attempt "
                  << MAXIMUM_CONTROL_FIND_RETRIES - max_wait
                  << " of " << MAXIMUM_CONTROL_FIND_RETRIES << ".";
      }
    }
  }

  if (edit_field_window_handle) {
    // Attempt to set the value, looping until we succeed.
    LOG(DEBUG) << "Found edit control on file selection dialog";
    const wchar_t* filename = value;
    size_t expected = wcslen(filename);
    size_t curr = 0;

    max_wait = MAXIMUM_CONTROL_FIND_RETRIES;
    while ((expected != curr) && --max_wait) {
      ::SendMessage(edit_field_window_handle,
                    WM_SETTEXT,
                    0,
                    reinterpret_cast<LPARAM>(filename));
      WindowUtilities::Wait(1000);
      curr = ::SendMessage(edit_field_window_handle, WM_GETTEXTLENGTH, 0, 0);
    }

    if (expected != curr) {
      LOG(WARN) << "Did not send the expected number of characters to the "
        << "file name control. Expected: " << expected << ", "
        << "Actual: " << curr;
    }

    max_wait = MAXIMUM_DIALOG_FIND_RETRIES;
    bool triedToDismiss = false;
    for (int i = 0; i < max_wait; i++) {
      HWND open_button_window_handle = ::GetDlgItem(dialog_window_handle,
                                                    IDOK);
      if (open_button_window_handle) {
        LRESULT total = 0;
        total += ::SendMessage(open_button_window_handle,
                               WM_LBUTTONDOWN,
                               0,
                               0);
        total += ::SendMessage(open_button_window_handle,
                               WM_LBUTTONUP,
                               0,
                               0);

        // SendMessage should return zero for those messages if properly
        // processed.
        if (total == 0) {
          triedToDismiss = true;
          // Sometimes IE10 doesn't dismiss this dialog after the messages
          // are received, even though the messages were processed
          // successfully.  If not, try again, just in case.
          if (!::IsWindow(dialog_window_handle)) {
            LOG(DEBUG) << "Dialog successfully dismissed";
            return true;
          }
        }

        WindowUtilities::Wait(200);
      }
      else if (triedToDismiss) {
        // Probably just a slow close
        LOG(DEBUG) << "Did not find OK button, but did previously. Assume dialog dismiss worked.";
        return true;
      }
    }

    LOG(ERROR) << "Unable to set value of file input dialog";
    return false;
  }

  LOG(WARN) << "No edit found";
  return false;
}

bool SendKeysCommandHandler::VerifyPageHasFocus(BrowserHandle browser_wrapper) {
  HWND browser_pane_window_handle = browser_wrapper->GetContentWindowHandle();
  DWORD proc;
  DWORD thread_id = ::GetWindowThreadProcessId(browser_pane_window_handle, &proc);
  GUITHREADINFO info;
  info.cbSize = sizeof(GUITHREADINFO);
  ::GetGUIThreadInfo(thread_id, &info);

  if (info.hwndFocus != browser_pane_window_handle) {
    LOG(INFO) << "Focus is on a UI element other than the HTML viewer pane.";
    // The focus is on a UI element other than the HTML viewer pane (like
    // the address bar, for instance). This has implications for certain
    // keystrokes, like backspace. We need to set the focus to the HTML
    // viewer pane.
    // N.B. The SetFocus() API should *NOT* cause the IE browser window to
    // magically appear in the foreground. If that is not true, we will need
    // to find some other solution.
    // Send an explicit WM_KILLFOCUS message to free up SetFocus() to place the
    // focus on the correct window. While SetFocus() is supposed to already do
    // this, it seems to not work entirely correctly.
    ::SendMessage(info.hwndFocus, WM_KILLFOCUS, NULL, NULL);
    DWORD current_thread_id = ::GetCurrentThreadId();
    ::AttachThreadInput(current_thread_id, thread_id, TRUE);
    HWND previous_focus = ::SetFocus(browser_pane_window_handle);
    if (previous_focus == NULL) {
      LOGERR(WARN) << "SetFocus API call failed";
    }
    ::AttachThreadInput(current_thread_id, thread_id, FALSE);
    ::GetGUIThreadInfo(thread_id, &info);
  }
  return info.hwndFocus == browser_pane_window_handle;
}

bool SendKeysCommandHandler::WaitUntilElementFocused(ElementHandle element_wrapper) {
  // Check we have focused the element.
  CComPtr<IHTMLElement> element = element_wrapper->element();
  bool has_focus = false;
  CComPtr<IDispatch> dispatch;
  element->get_document(&dispatch);
  CComPtr<IHTMLDocument2> document;
  dispatch->QueryInterface<IHTMLDocument2>(&document);

  // If the element we want is already the focused element, we're done.
  CComPtr<IHTMLElement> active_element;
  if (document->get_activeElement(&active_element) == S_OK) {
    if (active_element.IsEqualObject(element)) {
      if (this->IsContentEditable(element)) {
        this->SetElementFocus(element);
      }
      return true;
    }
  }

  this->SetElementFocus(element);

  // Hard-coded 1 second timeout here. Possible TODO is make this adjustable.
  clock_t max_wait = clock() + CLOCKS_PER_SEC;
  for (int i = clock(); i < max_wait; i = clock()) {
    WindowUtilities::Wait(1);
    CComPtr<IHTMLElement> active_wait_element;
    if (document->get_activeElement(&active_wait_element) == S_OK && active_wait_element != NULL) {
      CComPtr<IHTMLElement2> element2;
      element->QueryInterface<IHTMLElement2>(&element2);
      CComPtr<IHTMLElement2> active_wait_element2;
      active_wait_element->QueryInterface<IHTMLElement2>(&active_wait_element2);
      if (element2.IsEqualObject(active_wait_element2)) {
        this->SetInsertionPoint(element);
        has_focus = true;
        break;
      }
    }
  }

  return has_focus;
}

bool SendKeysCommandHandler::SetInsertionPoint(IHTMLElement* element) {
  CComPtr<IHTMLTxtRange> range;
  CComPtr<IHTMLInputTextElement> input_element;
  HRESULT hr = element->QueryInterface<IHTMLInputTextElement>(&input_element);
  if (SUCCEEDED(hr) && input_element) {
    input_element->createTextRange(&range);
  } else {
    CComPtr<IHTMLTextAreaElement> text_area_element;
    hr = element->QueryInterface<IHTMLTextAreaElement>(&text_area_element);
    if (SUCCEEDED(hr) && text_area_element) {
      text_area_element->createTextRange(&range);
    } else {
      bool is_content_editable = this->IsContentEditable(element);
      if (is_content_editable) {
        CComPtr<IDispatch> dispatch;
        hr = element->get_document(&dispatch);
        if (dispatch) {
          CComPtr<IHTMLDocument2> doc;
          hr = dispatch->QueryInterface<IHTMLDocument2>(&doc);
          if (doc) {
            CComPtr<IHTMLElement> body;
            hr = doc->get_body(&body);
            if (body) {
              CComPtr<IHTMLBodyElement> body_element;
              hr = body->QueryInterface<IHTMLBodyElement>(&body_element);
              if (body_element) {
                hr = body_element->createTextRange(&range);
                range->moveToElementText(element);
              }
            }
          }
        }
      }
    }
  }

  if (range) {
    range->collapse(VARIANT_FALSE);
    range->select();
    return true;
  }

  return false;
}

bool SendKeysCommandHandler::IsContentEditable(IHTMLElement* element) {
  CComPtr<IHTMLElement3> element3;
  element->QueryInterface<IHTMLElement3>(&element3);
  VARIANT_BOOL is_content_editable_variant = VARIANT_FALSE;
  if (element3) {
    element3->get_isContentEditable(&is_content_editable_variant);
  }
  return is_content_editable_variant == VARIANT_TRUE;
}

void SendKeysCommandHandler::SetElementFocus(IHTMLElement* element) {
  CComPtr<IHTMLElement2> element2;
  element->QueryInterface<IHTMLElement2>(&element2);
  element2->focus();
}

} // namespace webdriver
