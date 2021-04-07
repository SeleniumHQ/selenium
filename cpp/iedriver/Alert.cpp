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

#include "Alert.h"

#include <UIAutomation.h>

#include "errorcodes.h"
#include "logging.h"
#include "DocumentHost.h"
#include "StringUtilities.h"
#include "WebDriverConstants.h"

#define INVALID_CONTROL_ID -1

namespace webdriver {

Alert::Alert(std::shared_ptr<DocumentHost> browser, HWND handle) {
  LOG(TRACE) << "Entering Alert::Alert";
  this->browser_ = browser;
  this->alert_handle_ = handle;

  this->is_standard_alert_ = true;
  this->is_standard_control_alert_ = true;
  HWND direct_ui_child = this->GetDirectUIChild();
  if (direct_ui_child) {
    this->is_standard_control_alert_ = false;
    DialogButtonInfo cancel_button_info = this->GetDialogButton(CANCEL);
    if (cancel_button_info.button_exists) {
      this->is_standard_alert_ = !IsLinkButton(cancel_button_info.button_handle);
    } else {
      DialogButtonInfo ok_button_info = this->GetDialogButton(OK);
      if (ok_button_info.button_exists) {
        this->is_standard_alert_ = !IsLinkButton(ok_button_info.button_handle);
      } else {
        this->is_standard_alert_ = false;
      }
    }
  }

  std::vector<char> window_class(30);
  ::GetClassNameA(handle, &window_class[0], 30);

  if (strcmp(&window_class[0], SECURITY_DIALOG_WINDOW_CLASS) == 0) {
    this->is_standard_alert_ = false;
    this->is_standard_control_alert_ = false;
    this->is_security_alert_ = true;
  } else {
    std::vector<HWND> text_boxes;
    ::EnumChildWindows(this->alert_handle_,
                      &Alert::FindTextBoxes,
                      reinterpret_cast<LPARAM>(&text_boxes));
    this->is_security_alert_ = text_boxes.size() > 1;
  }
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
  }

  LOG(DEBUG) << "Closing alert using SendMessage";
  int status_code = this->ClickAlertButton(button_info);
  return WD_SUCCESS;
}

int Alert::Dismiss() {
  LOG(TRACE) << "Entering Alert::Dismiss";
  DialogButtonInfo button_info = this->GetDialogButton(CANCEL);
  if (!button_info.button_exists) {
    if (!this->is_standard_control_alert_) {
      // If this is not a standard control alert (i.e., has the
      // "do not create any more dialogs check box"), the use of
      // dialog control IDs won't work, so we have to look explicitly
      // for the OK button.
      button_info = this->GetDialogButton(OK);
    }
  }

  if (!button_info.button_exists) {
    LOG(WARN) << "Cancel button does not exist on alert";
    return EUNHANDLEDERROR;
  }

  // TODO(JimEvans): Check return code and return an appropriate
  // error if the alert didn't get closed properly.
  LOG(DEBUG) << "Closing alert using SendMessage";
  int status_code = this->ClickAlertButton(button_info);
  return WD_SUCCESS;
}

int Alert::SendKeys(const std::string& keys) {
  LOG(TRACE) << "Entering Alert::SendKeys";
  TextBoxFindInfo text_box_find_info;
  text_box_find_info.textbox_handle = NULL;
  text_box_find_info.match_proc = &Alert::IsSimpleEdit;
  return this->SendKeysInternal(keys, &text_box_find_info);
}

int Alert::SetUserName(const std::string& username) {
  LOG(TRACE) << "Entering Alert::SetUserName";
  // If this isn't a security alert, return an error.
  if (!this->is_security_alert_) {
    return EUNEXPECTEDALERTOPEN;
  }
  return this->SendKeys(username);
}

int Alert::SetPassword(const std::string& password) {
  LOG(TRACE) << "Entering Alert::SetPassword";
  // If this isn't a security alert, return an error.
  if (!this->is_security_alert_) {
    return EUNEXPECTEDALERTOPEN;
  }
  TextBoxFindInfo text_box_find_info;
  text_box_find_info.textbox_handle = NULL;
  text_box_find_info.match_proc = &Alert::IsPasswordEdit;
  return this->SendKeysInternal(password, &text_box_find_info);
}

int Alert::SendKeysInternal(const std::string& keys,
                            TextBoxFindInfo* text_box_find_info) {
  LOG(TRACE) << "Entering Alert::SendKeysInternal";
  if (!this->is_standard_alert_) {
    return EUNSUPPORTEDOPERATION;
  }
  // Alert present, find the text box.
  // Retry up to 10 times to find the dialog.
  int max_wait = 10;
  while ((text_box_find_info->textbox_handle == NULL) && --max_wait) {
    ::EnumChildWindows(this->alert_handle_,
                       &Alert::FindTextBox,
                       reinterpret_cast<LPARAM>(text_box_find_info));
    if (text_box_find_info->textbox_handle == NULL) {
      ::Sleep(50);
    }
  }

  if (text_box_find_info->textbox_handle == NULL) {
    LOG(WARN) << "Text box not found on alert";
    return EELEMENTNOTDISPLAYED;
  } else {
    LOG(DEBUG) << "Sending keystrokes to alert using SendMessage";
    std::wstring text = StringUtilities::ToWString(keys);
    ::SendMessage(text_box_find_info->textbox_handle,
                  WM_SETTEXT,
                  NULL,
                  reinterpret_cast<LPARAM>(text.c_str()));
  }
  return WD_SUCCESS;
}

std::string Alert::GetText() {
  LOG(TRACE) << "Entering Alert::GetText";
  std::string alert_text_value = "";
  if (this->is_standard_control_alert_) {
    alert_text_value = this->GetStandardDialogText();
  } else {
    std::string alert_text = this->GetDirectUIDialogText();
    if (!this->is_security_alert_) {
      if (!this->is_standard_alert_) {
        // This means the alert is from onbeforeunload, and we need to
        // strip off everything up to and including the first CR-LF pair.
        size_t first_crlf = alert_text.find("\r\n\r\n");
        if (first_crlf != std::string::npos && first_crlf + 4 < alert_text.size()) {
          alert_text_value = alert_text.substr(first_crlf + 4);
        }
      } else {
        alert_text_value = alert_text;
      }
    }
  }
  return alert_text_value;
}

std::string Alert::GetStandardDialogText() {
  LOG(TRACE) << "Entering Alert::GetStandardDialogText";
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
  TextBoxFindInfo textbox_find_info;
  textbox_find_info.textbox_handle = NULL;
  textbox_find_info.match_proc = &Alert::IsSimpleEdit;
  ::EnumChildWindows(this->alert_handle_,
                     &Alert::FindTextBox,
                     reinterpret_cast<LPARAM>(&textbox_find_info));
  if (textbox_find_info.textbox_handle) {
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

std::string Alert::GetDirectUIDialogText() {
  LOG(TRACE) << "Entering Alert::GetDirectUIDialogText";
  std::string alert_text_value = "";
  HWND direct_ui_child_handle = this->GetDirectUIChild();

  CComPtr<IAccessible> window_object;
  HRESULT hr = ::AccessibleObjectFromWindow(
      direct_ui_child_handle,
      OBJID_WINDOW,
      IID_IAccessible,
      reinterpret_cast<void**>(&window_object));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get Active Accessibility window object from dialog";
    return alert_text_value;
  }

  // ASSUMPTION: There is an object with the role of "pane" as a child of
  // the window object.
  CComPtr<IAccessible> pane_object = this->GetChildWithRole(window_object,
                                                            ROLE_SYSTEM_PANE,
                                                            0);
  if (!pane_object) {
    LOG(WARN) << "Failed to get Active Accessibility pane child object from window";
    return alert_text_value;
  }

  int child_index = 0;
  if (!this->is_standard_alert_) {
    // ASSUMPTION: This means the alert is from onbeforeunload, and
    // the second "static text" accessibility object is the one
    // that contains the message.
    child_index = 1;
  }

  CComPtr<IAccessible> message_text_object = this->GetChildWithRole(
      pane_object,
      ROLE_SYSTEM_STATICTEXT,
      child_index);
  if (!message_text_object) {
    LOG(WARN) << "Failed to get Active Accessibility text child object from pane";
    return alert_text_value;
  }

  CComVariant child_id;
  child_id.vt = VT_I4;
  child_id.lVal = CHILDID_SELF;

  CComBSTR text_bstr;
  hr = message_text_object->get_accName(child_id, &text_bstr);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get accName property from text object";
    return alert_text_value;
  } else if (hr != S_OK) {
    // N.B., get_accName can return an error value without it being a
    // standard COM error.
    LOG(WARN) << "Getting accName property from text object returned an error "
              << "(value: " << hr << "). The text object may not have a name.";
    return alert_text_value;
  } else if (text_bstr == NULL) {
    LOG(WARN) << "Getting accName property from text object returned a null "
              << "value";
    return alert_text_value;
  }

  std::wstring text = text_bstr;
  alert_text_value = StringUtilities::ToString(text);
  return alert_text_value;
}

IAccessible* Alert::GetChildWithRole(IAccessible* parent, long expected_role, int index) {
  LOG(TRACE) << "Entering Alert::GetChildWithRole";
  IAccessible* child = NULL;
  long child_count;
  HRESULT hr = parent->get_accChildCount(&child_count);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Failed to get accChildCount property from Active Accessibility object";
    return child;
  }

  long returned_children = 0;
  std::vector<CComVariant> child_array(child_count);
  hr = ::AccessibleChildren(parent, 0, child_count, &child_array[0], &returned_children);

  int found_index = 0;
  for (long i = 0; i < child_count; ++i) {
    if (child_array[i].vt == VT_DISPATCH) {
      CComPtr<IAccessible> child_object;
      hr = child_array[i].pdispVal->QueryInterface<IAccessible>(&child_object);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "QueryInterface for IAccessible failed for child object with index " << i;
      }

      CComVariant child_id;
      child_id.vt = VT_I4;
      child_id.lVal = CHILDID_SELF;

      CComVariant actual_role;
      hr = child_object->get_accRole(child_id, &actual_role);
      if (FAILED(hr)) {
        LOGHR(WARN, hr) << "Failed to get accRole property from Active Accessibility object";
      }

      if (expected_role == actual_role.lVal) {
        if (found_index == index) {
          child = child_object.Detach();
        } else {
          ++found_index;
        }
      }
      LOG(DEBUG) << "accRole for child with index " << i << ": " << actual_role.lVal;
    }
  }
  return child;
}

HWND Alert::GetDirectUIChild() {
  LOG(TRACE) << "Entering Alert::GetDirectUIChild";
  HWND direct_ui_child = NULL;
  ::EnumChildWindows(this->alert_handle_,
                     &Alert::FindDirectUIChild,
                     reinterpret_cast<LPARAM>(&direct_ui_child));
  return direct_ui_child;
}

int Alert::ClickAlertButton(DialogButtonInfo button_info) {
  LOG(TRACE) << "Entering Alert::ClickAlertButton";
  // Click on the appropriate button of the Alert
  if (this->is_standard_control_alert_) {
    ::SendMessage(this->alert_handle_,
                  WM_COMMAND,
                  button_info.button_control_id,
                  NULL);
  } else {
    if (button_info.use_accessibility) {
      int status_code = ClickAlertButtonUsingAccessibility(button_info.accessibility_id);
      if (status_code != WD_SUCCESS) {
        return status_code;
      }
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
  // Return the simple version of the struct so that subclasses do not
  // have to know anything about the function pointer definition.
  DialogButtonInfo button_info;
  if (this->is_standard_alert_ || !this->is_security_alert_) {
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
    button_info.button_handle = button_find_info.button_handle;
    button_info.button_control_id = button_find_info.button_control_id;
    button_info.button_exists = button_find_info.button_handle != NULL;
    button_info.accessibility_id = "";
    button_info.use_accessibility = false;
  } else {
    button_info.button_handle = NULL;
    button_info.button_control_id = 0;
    button_info.button_exists = true;
    button_info.accessibility_id = button_type == OK ? "OKButton" : "CancelButton";
    button_info.use_accessibility = true;
  }

  return button_info;
}

int Alert::ClickAlertButtonUsingAccessibility(const std::string& automation_id) {
  CComPtr<IUIAutomation> ui_automation;
  HRESULT hr = ::CoCreateInstance(CLSID_CUIAutomation,
                                  NULL,
                                  CLSCTX_INPROC_SERVER,
                                  IID_IUIAutomation,
                                  reinterpret_cast<void**>(&ui_automation));

  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to create global UI Automation object";
    return EUNHANDLEDERROR;
  }

  CComPtr<IUIAutomationElement> parent_window;
  hr = ui_automation->ElementFromHandle(this->alert_handle_,
                                        &parent_window);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get automation object from window handle";
    return EUNHANDLEDERROR;
  }

  CComVariant button_automation_id = automation_id.c_str();
  CComPtr<IUIAutomationCondition> button_condition;
  hr = ui_automation->CreatePropertyCondition(UIA_AutomationIdPropertyId,
                                              button_automation_id,
                                              &button_condition);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to create button finding condition";
    return EUNHANDLEDERROR;
  }

  CComPtr<IUIAutomationElement> button;
  hr = parent_window->FindFirst(TreeScope::TreeScope_Children,
                                button_condition,
                                &button);
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to find button";
    return EUNHANDLEDERROR;
  }

  CComPtr<IUIAutomationInvokePattern> button_invoke_pattern;
  hr = button->GetCurrentPatternAs(UIA_InvokePatternId,
                                   IID_PPV_ARGS(&button_invoke_pattern));
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to get invoke pattern on button";
    return EUNHANDLEDERROR;
  }

  hr = button_invoke_pattern->Invoke();
  if (FAILED(hr)) {
    LOGHR(WARN, hr) << "Unable to invoke button";
    return EUNHANDLEDERROR;
  }

  return WD_SUCCESS;
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
    long button_style = window_long & BS_TYPEMASK;
    return button_style == BS_DEFCOMMANDLINK || button_style == BS_DEFPUSHBUTTON;
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
    long button_style = window_long & BS_TYPEMASK;
    // The BS_DEFCOMMANDLINK mask includes BS_COMMANDLINK, but we
    // want only to match those without the default bits set.
    return button_style == BS_COMMANDLINK || button_style == BS_PUSHBUTTON;
  }
  return false;
}

bool Alert::IsLinkButton(HWND button_handle) {
  std::vector<wchar_t> button_window_class(100);
  ::GetClassName(button_handle, &button_window_class[0], static_cast<int>(button_window_class.size()));
  if (wcscmp(&button_window_class[0], L"Button") == 0) {
    long window_long = ::GetWindowLong(button_handle, GWL_STYLE);
    long button_style = window_long & BS_TYPEMASK;
    return button_style == BS_COMMANDLINK;
  }
  return false;
}

bool Alert::IsSimpleEdit(HWND edit_handle) {
  std::vector<wchar_t> child_window_class(100);
  ::GetClassName(edit_handle, &child_window_class[0], 100);

  if (wcscmp(&child_window_class[0], L"Edit") == 0) {
    long window_long = ::GetWindowLong(edit_handle, GWL_STYLE);
    bool is_read_only = (window_long & ES_READONLY) == ES_READONLY;
    bool is_password = (window_long & ES_PASSWORD) == ES_PASSWORD;
    return !is_read_only && !is_password;
  }
  return false;
}

bool Alert::IsPasswordEdit(HWND edit_handle) {
  std::vector<wchar_t> child_window_class(100);
  ::GetClassName(edit_handle, &child_window_class[0], 100);

  if (wcscmp(&child_window_class[0], L"Edit") == 0) {
    long window_long = ::GetWindowLong(edit_handle, GWL_STYLE);
    bool is_password = (window_long & ES_PASSWORD) == ES_PASSWORD;
    return is_password;
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
  TextBoxFindInfo* find_info = reinterpret_cast<TextBoxFindInfo*>(arg);
  if (find_info->match_proc(hwnd)) {
    find_info->textbox_handle = hwnd;
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

BOOL CALLBACK Alert::FindTextBoxes(HWND hwnd, LPARAM arg) {
  std::vector<HWND>* dialog_handles = reinterpret_cast<std::vector<HWND>*>(arg);
  std::vector<wchar_t> child_window_class(100);
  ::GetClassName(hwnd, &child_window_class[0], 100);

  if (wcscmp(&child_window_class[0], L"Edit") == 0) {
    dialog_handles->push_back(hwnd);
  }
  return TRUE;
}

} // namespace webdriver
