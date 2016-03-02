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

#ifndef WEBDRIVER_IE_SENDKEYSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDKEYSCOMMANDHANDLER_H_

#include <ctime>
#include <iomanip>
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "../WindowUtilities.h"
#include "logging.h"

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

class SendKeysCommandHandler : public IECommandHandler {
 public:
  struct FileNameData {
    HWND main;
    HWND hwnd;
    DWORD ieProcId;
    DWORD dialogTimeout;
    const wchar_t* text;
  };

  SendKeysCommandHandler(void) {
  }

  virtual ~SendKeysCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const ParametersMap& command_parameters,
                       Response* response)
  {
    ParametersMap::const_iterator id_parameter_iterator = command_parameters.find("id");
    ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
    if (id_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter in URL: id");
      return;
    } else if (value_parameter_iterator == command_parameters.end()) {
      response->SetErrorResponse(400, "Missing parameter: value");
      return;
    } else {
      std::string element_id = id_parameter_iterator->second.asString();

      Json::Value key_array = value_parameter_iterator->second;

      BrowserHandle browser_wrapper;
      int status_code = executor.GetCurrentBrowser(&browser_wrapper);
      if (status_code != WD_SUCCESS) {
        response->SetErrorResponse(status_code, "Unable to get browser");
        return;
      }
      HWND window_handle = browser_wrapper->GetContentWindowHandle();
      HWND top_level_window_handle = browser_wrapper->GetTopLevelWindowHandle();

      ElementHandle element_wrapper;
      status_code = this->GetElement(executor, element_id, &element_wrapper);

      if (status_code == WD_SUCCESS) {
        CComPtr<IHTMLElement> element(element_wrapper->element());

        LocationInfo location = {};
        std::vector<LocationInfo> frame_locations;
        element_wrapper->GetLocationOnceScrolledIntoView(executor.input_manager()->scroll_behavior(),
                                                         &location,
                                                         &frame_locations);

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
        if (is_file_element) {
          std::string keys = "";
          for (unsigned int i = 0; i < key_array.size(); ++i ) {
            std::string key(key_array[i].asString());
            keys.append(key);
          }

          std::wstring full_keys = StringUtilities::ToWString(keys);

          // Key sequence should be a path and file name. Check
          // to see that the file exists before invoking the file
          // selection dialog. Note that we also error if the file
          // path passed in is valid, but is a directory instead of
          // a file.
          DWORD file_attributes = ::GetFileAttributes(full_keys.c_str());
          if (file_attributes == INVALID_FILE_ATTRIBUTES ||
              (file_attributes & FILE_ATTRIBUTE_DIRECTORY)) {
            response->SetErrorResponse(EUNHANDLEDERROR, "Attempting to upload file '" + keys + "' which does not exist.");
            return;
          }

          DWORD ie_process_id;
          ::GetWindowThreadProcessId(window_handle, &ie_process_id);

          FileNameData key_data;
          key_data.main = top_level_window_handle;
          key_data.hwnd = window_handle;
          key_data.text = full_keys.c_str();
          key_data.ieProcId = ie_process_id;
          key_data.dialogTimeout = executor.file_upload_dialog_timeout();

          unsigned int thread_id;
          HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                          0,
                                                          &SendKeysCommandHandler::SetFileValue,
                                                          reinterpret_cast<void*>(&key_data),
                                                          0,
                                                          &thread_id));

          LOG(DEBUG) << "Clicking upload button and starting to handle file selection dialog";
          element->click();
          // We're now blocked until the dialog closes.
          ::CloseHandle(thread_handle);
          response->SetSuccessResponse(Json::Value::null);
          return;
        }

        bool displayed;
        status_code = element_wrapper->IsDisplayed(true, &displayed);
        if (status_code != WD_SUCCESS || !displayed) {
          response->SetErrorResponse(EELEMENTNOTDISPLAYED,
                                     "Element is not displayed");
          return;
        }

        if (!element_wrapper->IsEnabled()) {
          response->SetErrorResponse(EELEMENTNOTENABLED,
                                     "Element is not enabled");
          return;
        }

        if (!this->VerifyPageHasFocus(top_level_window_handle, window_handle)) {
          LOG(WARN) << "HTML rendering pane does not have the focus. Keystrokes may go to an unexpected UI element.";
        }
        if (!this->WaitUntilElementFocused(element)) {
          LOG(WARN) << "Specified element is not the active element. Keystrokes may go to an unexpected DOM element.";
        }
        Json::Value value = this->RecreateJsonParameterObject(command_parameters);
        value["action"] = "keys";
        value["releaseModifiers"] = true;
        Json::UInt index = 0;
        Json::Value actions(Json::arrayValue);
        actions[index] = value;
        status_code = executor.input_manager()->PerformInputSequence(browser_wrapper, actions);
        response->SetSuccessResponse(Json::Value::null);
        return;
      } else {
        response->SetErrorResponse(status_code, "Element is no longer valid");
        return;
      }
    }
  }
 private:
  static unsigned int WINAPI SetFileValue(void *file_data) {
    FileNameData* data = reinterpret_cast<FileNameData*>(file_data);
    ::Sleep(100);
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
    return SendKeysToFileUploadAlert(dialog_window_handle, data->text);
  }

  static bool SendKeysToFileUploadAlert(HWND dialog_window_handle,
                                        const wchar_t* value) {
    HWND edit_field_window_handle = NULL;
    int max_wait = MAXIMUM_CONTROL_FIND_RETRIES;
    while (!edit_field_window_handle && --max_wait) {
      WindowUtilities::Wait(200);
      edit_field_window_handle = dialog_window_handle;
      for (int i = 1; fileDialogNames[i]; ++i) {
        std::wstring child_window_class = fileDialogNames[i];
        edit_field_window_handle = WindowUtilities::GetChildWindow(edit_field_window_handle,
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
        } else if (triedToDismiss) {
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

  bool VerifyPageHasFocus(HWND top_level_window_handle, HWND browser_pane_window_handle) {
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

  bool WaitUntilElementFocused(IHTMLElement *element) {
    // Check we have focused the element.
    bool has_focus = false;
    CComPtr<IDispatch> dispatch;
    element->get_document(&dispatch);
    CComPtr<IHTMLDocument2> document;
    dispatch->QueryInterface<IHTMLDocument2>(&document);

    // If the element we want is already the focused element, we're done.
    CComPtr<IHTMLElement> active_element;
    if (document->get_activeElement(&active_element) == S_OK) {
      if (active_element.IsEqualObject(element)) {
        return true;
      }
    }

    CComPtr<IHTMLElement2> element2;
    element->QueryInterface<IHTMLElement2>(&element2);
    element2->focus();

    // Hard-coded 1 second timeout here. Possible TODO is make this adjustable.
    clock_t max_wait = clock() + CLOCKS_PER_SEC;
    for (int i = clock(); i < max_wait; i = clock()) {
      WindowUtilities::Wait(1);
      CComPtr<IHTMLElement> active_wait_element;
      if (document->get_activeElement(&active_wait_element) == S_OK && active_wait_element != NULL) {
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

  bool SetInsertionPoint(IHTMLElement* element) {
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
      }
    }

    if (range) {
      range->collapse(VARIANT_FALSE);
      range->select();
      return true;
    }

    return false;
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDKEYSCOMMANDHANDLER_H_
