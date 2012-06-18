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

#ifndef WEBDRIVER_IE_ACCEPTALERTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ACCEPTALERTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class AcceptAlertCommandHandler : public IECommandHandler {
 public:
  AcceptAlertCommandHandler(void) {
  }

  virtual ~AcceptAlertCommandHandler(void) {
  }

 protected:
  void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    BrowserHandle browser_wrapper;
    int status_code = executor.GetCurrentBrowser(&browser_wrapper);
    if (status_code != SUCCESS) {
      response->SetErrorResponse(status_code, "Unable to get current browser");
      return;
    }
    // This sleep is required to give IE time to draw the dialog.
    ::Sleep(100);
    HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
    if (alert_handle == NULL) {
      response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
    } else {
      DialogButtonInfo button_info = this->GetDialogButton(alert_handle, OK);
      if (!button_info.button_exists) {
        // No OK button on dialog. Look for a cancel button
        // (JavaScript alert() dialogs have a single button, but its ID
        // can be that of a "cancel" button.)
        button_info = this->GetDialogButton(alert_handle, CANCEL);
      }
    
      if (!button_info.button_exists) {
        response->SetErrorResponse(EUNHANDLEDERROR,
                                   "Could not find OK button");
      } else {
        // Now click on the OK button of the Alert
        ::SendMessage(alert_handle,
                      WM_COMMAND,
                      button_info.button_control_id,
                      NULL);
        response->SetSuccessResponse(Json::Value::null);
      }
    }
  }

  struct DialogButtonInfo {
    HWND button_handle;
    int button_control_id;
    bool button_exists;
  };

  enum BUTTON_TYPE {
    OK,
    CANCEL
  };

  DialogButtonInfo GetDialogButton(HWND dialog_handle, BUTTON_TYPE button_type) {
    DialogButtonFindInfo button_find_info;
    button_find_info.button_handle = NULL;
    button_find_info.button_control_id = IDOK;
    if (button_type == OK) {
      button_find_info.match_proc = &AcceptAlertCommandHandler::IsOKButton;
    } else {
      button_find_info.match_proc = &AcceptAlertCommandHandler::IsCancelButton;
    }

    int max_wait = 10;
    // Retry up to 10 times to find the dialog.
    while ((button_find_info.button_handle == NULL) && --max_wait) {
      ::EnumChildWindows(dialog_handle,
                          &AcceptAlertCommandHandler::FindDialogButton,
                          reinterpret_cast<LPARAM>(&button_find_info));
      if (button_find_info.button_handle == NULL) {
        ::Sleep(50);
      } else {
        break;
      }
    }

    // Use the simple version of the struct so that subclasses do not
    // have to know anything about the function pointer definition.
    DialogButtonInfo button_info;
    button_info.button_handle = button_find_info.button_handle;
    button_info.button_control_id = button_find_info.button_control_id;
    button_info.button_exists = button_find_info.button_handle != NULL;
    return button_info;
  }

 private:
  typedef bool (__cdecl *ISBUTTONMATCHPROC)(int); 

  struct DialogButtonFindInfo {
    HWND button_handle;
    int button_control_id;
    ISBUTTONMATCHPROC match_proc;
  };

  static bool IsOKButton(int control_id) {
    return control_id == IDOK || control_id == IDYES;
  }

  static bool IsCancelButton(int control_id) {
    return control_id == IDCANCEL || control_id == IDNO;
  }

  static BOOL CALLBACK FindDialogButton(HWND hwnd, LPARAM arg) {
    DialogButtonFindInfo* button_info = reinterpret_cast<DialogButtonFindInfo*>(arg);
    int control_id = ::GetDlgCtrlID(hwnd);
    if (button_info->match_proc(control_id)) {
      button_info->button_handle = hwnd;
      button_info->button_control_id = control_id;
      return FALSE;
    }
    return TRUE;
  }
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ACCEPTALERTCOMMANDHANDLER_H_
