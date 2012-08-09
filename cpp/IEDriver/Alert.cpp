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

Alert::Alert(HWND handle) {
  LOG(TRACE) << "Entering Alert::Alert";
  this->alert_handle_ = handle;
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
    LOG(WARN) << "OK and Cancel button do not exist on dialog";
    return EUNHANDLEDERROR;
  } else {
    LOG(DEBUG) << "Closing dialog using SendMessage";
    // Now click on the appropriate button of the Alert
    ::SendMessage(this->alert_handle_,
                  WM_COMMAND,
                  button_info.button_control_id,
                  NULL);
  }
  return SUCCESS;
}

int Alert::Dismiss() {
  LOG(TRACE) << "Entering Alert::Dismiss";
  DialogButtonInfo button_info = this->GetDialogButton(CANCEL);
  if (!button_info.button_exists) {
    LOG(WARN) << "Cancel button does not exist on dialog";
    return EUNHANDLEDERROR;
  } else {
    LOG(DEBUG) << "Closing dialog using SendMessage";
    // Now click on the Cancel button of the Alert
    ::SendMessage(this->alert_handle_,
                  WM_COMMAND,
                  button_info.button_control_id,
                  NULL);
  }
  return SUCCESS;
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
    LOG(DEBUG) << "Sending keystrokes to dialog using SendMessage";
    std::wstring text = CA2W(keys.c_str(), CP_UTF8);
    ::SendMessage(text_box_handle,
                  WM_SETTEXT,
                  NULL,
                  reinterpret_cast<LPARAM>(text.c_str()));
  }
  return SUCCESS;
}

std::string Alert::GetText() {
  HWND label_handle = NULL;
  // Alert present, find the OK button.
  // Retry up to 10 times to find the dialog.
  int max_wait = 10;
  while ((label_handle == NULL) && --max_wait) {
    ::EnumChildWindows(this->alert_handle_,
                       &Alert::FindTextLabel,
                       reinterpret_cast<LPARAM>(&label_handle));
    if (label_handle == NULL) {
      ::Sleep(50);
    }
  }

  std::string alert_text_value;
  if (label_handle == NULL) {
    alert_text_value = "";
  } else {
    int text_length = ::GetWindowTextLength(label_handle);
    std::vector<wchar_t> text_buffer(text_length + 1);
    ::GetWindowText(label_handle, &text_buffer[0], text_length + 1);
    std::wstring alert_text = &text_buffer[0];
    alert_text_value = CW2A(alert_text.c_str(), CP_UTF8);
  }
  return alert_text_value;
}

Alert::DialogButtonInfo Alert::GetDialogButton(BUTTON_TYPE button_type) {
  LOG(TRACE) << "Entering Alert::GetDialogButton";
  DialogButtonFindInfo button_find_info;
  button_find_info.button_handle = NULL;
  button_find_info.button_control_id = IDOK;
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

bool Alert::IsOKButton(int control_id) {
  return control_id == IDOK || control_id == IDYES;
}

bool Alert::IsCancelButton(int control_id) {
  return control_id == IDCANCEL || control_id == IDNO;
}

BOOL CALLBACK Alert::FindDialogButton(HWND hwnd, LPARAM arg) {
  Alert::DialogButtonFindInfo* button_info = reinterpret_cast<Alert::DialogButtonFindInfo*>(arg);
  int control_id = ::GetDlgCtrlID(hwnd);
  if (button_info->match_proc(control_id)) {
    button_info->button_handle = hwnd;
    button_info->button_control_id = control_id;
    return FALSE;
  }
  return TRUE;
}

BOOL CALLBACK Alert::FindTextBox(HWND hwnd, LPARAM arg) {
  HWND *dialog_handle = reinterpret_cast<HWND*>(arg);
  TCHAR child_window_class[100];
  ::GetClassName(hwnd, child_window_class, 100);

  if (wcscmp(child_window_class, L"Edit") == 0) {
    *dialog_handle = hwnd;
    return FALSE;
  }
  return TRUE;
}

BOOL CALLBACK Alert::FindTextLabel(HWND hwnd, LPARAM arg) {
  HWND *dialog_handle = reinterpret_cast<HWND*>(arg);
  TCHAR child_window_class[100];
  ::GetClassName(hwnd, child_window_class, 100);

  if (wcscmp(child_window_class, L"Static") != 0) {
    return TRUE;
  }

  int text_length = ::GetWindowTextLength(hwnd);
  if (text_length > 0) {
    *dialog_handle = hwnd;
    return FALSE;
  }
  return TRUE;
}

} // namespace webdriver