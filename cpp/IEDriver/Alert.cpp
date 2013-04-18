// Copyright 2012 Software Freedom Conservancy
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

#include "Alert.h"
#include "logging.h"

namespace webdriver {

Alert::Alert(BrowserHandle browser, HWND handle) {
  LOG(TRACE) << "Entering Alert::Alert";
  this->browser_ = browser;
  this->alert_handle_ = handle;

  HWND direct_ui_child = NULL;
  ::EnumChildWindows(this->alert_handle_,
                     &Alert::FindDirectUIChild,
                     reinterpret_cast<LPARAM>(&direct_ui_child));
  this->is_standard_alert_ = direct_ui_child == NULL;
}


Alert::~Alert(void) {
}

int Alert::Accept() {
  LOG(TRACE) << "Entering Alert::Accept";
  DialogButtonInfo button_info = this->GetDialogButton(OK);
  if (!button_info.button_exists) {
    // No OK button on dialog. Look for a cancel button
    // (JavaScript alert() dialogs have a single button, but its ID
    // can be that of a "cancel" button.)
    LOG(INFO) << "OK button does not exist on dialog; looking for Cancel button";
    button_info = this->GetDialogButton(CANCEL);
  }
    
  if (!button_info.button_exists) {
    LOG(WARN) << "OK and Cancel button do not exist on alert";
    return EUNHANDLEDERROR;
  } else {
    LOG(DEBUG) << "Closing alert using SendMessage";
    int status_code = this->ClickAlertButton(button_info);
  }
  return WD_SUCCESS;
}

int Alert::Dismiss() {
  LOG(TRACE) << "Entering Alert::Dismiss";
  DialogButtonInfo button_info = this->GetDialogButton(CANCEL);
  if (!button_info.button_exists) {
    LOG(WARN) << "Cancel button does not exist on alert";
    return EUNHANDLEDERROR;
  } else {
    // TODO(JimEvans): Check return code and return an appropriate
    // error if the alert didn't get closed properly.
    LOG(DEBUG) << "Closing alert using SendMessage";
    int status_code = this->ClickAlertButton(button_info);
  }
  return WD_SUCCESS;
}

int Alert::SendKeys(std::string keys) {
  LOG(TRACE) << "Entering Alert::SendKeys";
  HWND text_box_handle = NULL;
  // Alert present, find the OK button.
  // Retry up to 10 times to find the dialog.
  int max_wait = 10;
  while ((text_box_handle == NULL) && --max_wait) {
    ::EnumChildWindows(this->alert_handle_,
                       &Alert::FindTextBox,
                       reinterpret_cast<LPARAM>(&text_box_handle));
    if (text_box_handle == NULL) {
      ::Sleep(50);
    }
  }

  if (text_box_handle == NULL) {
    LOG(WARN) << "Text box not found on alert";
    return EELEMENTNOTDISPLAYED;
  } else {
    LOG(DEBUG) << "Sending keystrokes to alert using SendMessage";
    std::wstring text = StringUtilities::ToWString(keys);
    ::SendMessage(text_box_handle,
                  WM_SETTEXT,
                  NULL,
                  reinterpret_cast<LPARAM>(text.c_str()));
  }
  return WD_SUCCESS;
}

std::string Alert::GetText() {
  LOG(TRACE) << "Entering Alert::GetText";
  TextLabelFindInfo info;
  info.label_handle = NULL;
  info.control_id_found = 0;
  info.excluded_control_id = 0;

  // Alert present, find the OK button.
  // Retry up to 10 times to find the dialog.
  int max_wait = 10;
  while ((info.label_handle == NULL) && --max_wait) {
    ::EnumChildWindows(this->alert_handle_,
                       &Alert::FindTextLabel,
                       reinterpret_cast<LPARAM>(&info));
    if (info.label_handle == NULL) {
      ::Sleep(50);
    }
  }

  // BIG ASSUMPTION HERE! If we found the text label, assume that
  // all other controls on the alert are fully drawn too.
  HWND text_box_handle = NULL;
  ::EnumChildWindows(this->alert_handle_,
                     &Alert::FindTextBox,
                     reinterpret_cast<LPARAM>(&text_box_handle));
  if (text_box_handle) {
    // There's a text box on the alert. That means the first
    // label found is the system-provided label. Ignore that
    // one and return the next one.
    info.label_handle = NULL;
    info.excluded_control_id = info.control_id_found;
    info.control_id_found = 0;
    ::EnumChildWindows(this->alert_handle_,
                       &Alert::FindTextLabel,
                       reinterpret_cast<LPARAM>(&info));
  }
  
  std::string alert_text_value;
  if (info.label_handle == NULL) {
    alert_text_value = "";
  } else {
    int text_length = ::GetWindowTextLength(info.label_handle);
    std::vector<wchar_t> text_buffer(text_length + 1);
    ::GetWindowText(info.label_handle, &text_buffer[0], text_length + 1);
    std::wstring alert_text = &text_buffer[0];
    alert_text_value = StringUtilities::ToString(alert_text);
  }
  return alert_text_value;
}

int Alert::ClickAlertButton(DialogButtonInfo button_info) {
  LOG(TRACE) << "Entering Alert::ClickAlertButton";
  // Click on the appropriate button of the Alert
  if (this->is_standard_alert_) {
    ::SendMessage(this->alert_handle_,
                  WM_COMMAND,
                  button_info.button_control_id,
                  NULL);
  } else {
    // For non-standard alerts (that is, alerts that are not
    // created by alert(), confirm() or prompt() JavaScript
    // functions), we cheat. Sending the BN_CLICKED notification
    // via WM_COMMAND makes the dialog think that the proper
    // button was clicked, but it's not the same as sending the
    // click message to the button. N.B., sending the BM_CLICK
    // message to the button may fail if the dialog doesn't have
    // focus, so we do it this way. Also, we send the notification
    // to the immediate parent of the button, which, in turn,
    // notifies the top-level dialog.
    ::SendMessage(::GetParent(button_info.button_handle),
                  WM_COMMAND,
                  MAKEWPARAM(0, BN_CLICKED),
                  reinterpret_cast<LPARAM>(button_info.button_handle));
  }
  // Hack to make sure alert is really closed, and browser
  // is ready for the next operation. This may be a flawed
  // algorithim, since the busy property of the browser may
  // not be the right thing to check here.
  int retry_count = 20;
  bool is_alert_handle_valid = (::IsWindow(this->alert_handle_) == TRUE);
  while ((is_alert_handle_valid || this->browser_->IsBusy()) && retry_count > 0) {
    ::Sleep(50);
    is_alert_handle_valid = (::IsWindow(this->alert_handle_) == TRUE);
    retry_count--;
  }

  // TODO(JimEvans): Check for the following error conditions:
  // 1. Alert window still present (::IsWindow(this->alert_handle_) == TRUE)
  // 2. Browser still busy (this->browser_->IsBusy() == true)
  // and return an appropriate non-WD_SUCCESS error code.
  LOG(DEBUG) << "IsWindow() for alert handle 0x" << this->alert_handle_ << ": "
             << is_alert_handle_valid ? "true" : "false";
  return WD_SUCCESS;
}

Alert::DialogButtonInfo Alert::GetDialogButton(BUTTON_TYPE button_type) {
  LOG(TRACE) << "Entering Alert::GetDialogButton";
  DialogButtonFindInfo button_find_info;
  button_find_info.button_handle = NULL;
  button_find_info.button_control_id = this->is_standard_alert_ ? IDOK : INVALID_CONTROL_ID;
  if (button_type == OK) {
    button_find_info.match_proc = &Alert::IsOKButton;
  } else {
    button_find_info.match_proc = &Alert::IsCancelButton;
  }

  int max_wait = 10;
  // Retry up to 10 times to find the dialog.
  while ((button_find_info.button_handle == NULL) && --max_wait) {
    ::EnumChildWindows(this->alert_handle_,
                       &Alert::FindDialogButton,
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

bool Alert::IsOKButton(HWND button_handle) {
  int control_id = ::GetDlgCtrlID(button_handle);
  if (control_id != 0) {
    return control_id == IDOK || control_id == IDYES || control_id == IDRETRY;
  }
  std::vector<wchar_t> button_window_class(100);
  ::GetClassName(button_handle, &button_window_class[0], static_cast<int>(button_window_class.size()));
  if (wcscmp(&button_window_class[0], L"Button") == 0) {
    long window_long = ::GetWindowLong(button_handle, GWL_STYLE);
    return (window_long & BS_DEFCOMMANDLINK) == BS_DEFCOMMANDLINK;
  }
  return false;
}

bool Alert::IsCancelButton(HWND button_handle) {
  int control_id = ::GetDlgCtrlID(button_handle);
  if (control_id != 0) {
    return control_id == IDCANCEL || control_id == IDNO;
  }
  std::vector<wchar_t> button_window_class(100);
  ::GetClassName(button_handle, &button_window_class[0], static_cast<int>(button_window_class.size()));
  if (wcscmp(&button_window_class[0], L"Button") == 0) {
    long window_long = ::GetWindowLong(button_handle, GWL_STYLE);
    // The BS_DEFCOMMANDLINK mask includes BS_COMMANDLINK, but we
    // want only to match those without the default bits set.
    return (window_long & BS_DEFCOMMANDLINK) == BS_COMMANDLINK;
  }
  return false;
}

BOOL CALLBACK Alert::FindDialogButton(HWND hwnd, LPARAM arg) {
  Alert::DialogButtonFindInfo* button_info = reinterpret_cast<Alert::DialogButtonFindInfo*>(arg);
  int control_id = ::GetDlgCtrlID(hwnd);
  if (button_info->match_proc(hwnd)) {
    button_info->button_handle = hwnd;
    button_info->button_control_id = control_id;
    return FALSE;
  }
  return TRUE;
}

BOOL CALLBACK Alert::FindTextBox(HWND hwnd, LPARAM arg) {
  HWND *dialog_handle = reinterpret_cast<HWND*>(arg);
  std::vector<wchar_t> child_window_class(100);
  ::GetClassName(hwnd, &child_window_class[0], 100);

  if (wcscmp(&child_window_class[0], L"Edit") == 0) {
    *dialog_handle = hwnd;
    return FALSE;
  }
  return TRUE;
}

BOOL CALLBACK Alert::FindTextLabel(HWND hwnd, LPARAM arg) {
  TextLabelFindInfo* find_info = reinterpret_cast<TextLabelFindInfo*>(arg);
  std::vector<wchar_t> child_window_class(100);
  ::GetClassName(hwnd, &child_window_class[0], 100);

  if (wcscmp(&child_window_class[0], L"Static") != 0) {
    return TRUE;
  }

  int control_id = ::GetDlgCtrlID(hwnd);
  int text_length = ::GetWindowTextLength(hwnd);
  if (text_length > 0) {
    if (find_info->excluded_control_id == 0 ||
        control_id != find_info->excluded_control_id) {
      find_info->label_handle = hwnd;
      find_info->control_id_found = control_id;
      return FALSE;
    }
  }
  return TRUE;
}

BOOL CALLBACK Alert::FindDirectUIChild(HWND hwnd, LPARAM arg){
  HWND *dialog_handle = reinterpret_cast<HWND*>(arg);
  std::vector<wchar_t> child_window_class(100);
  ::GetClassName(hwnd, &child_window_class[0], 100);

  if (wcscmp(&child_window_class[0], L"DirectUIHWND") != 0) {
    return TRUE;
  }
  *dialog_handle = hwnd;
  return FALSE;
}

} // namespace webdriver