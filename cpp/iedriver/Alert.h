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

#ifndef WEBDRIVER_ALERT_H_
#define WEBDRIVER_ALERT_H_

#include <memory>
#include <string>
#include <vector>

namespace webdriver {

// Forward declaration of classes.
class DocumentHost;

class Alert {
 public:
  Alert(std::shared_ptr<DocumentHost> browser, HWND handle);
  virtual ~Alert(void);

  int Accept(void);
  int Dismiss(void);
  int SendKeys(const std::string& keys);
  std::string GetText(void);
  int SetUserName(const std::string& username);
  int SetPassword(const std::string& password);

  bool is_standard_alert(void) const { return this->is_standard_alert_; }
  bool is_security_alert(void) const { return this->is_security_alert_; }

 private:
  typedef bool (__cdecl *ISBUTTONMATCHPROC)(HWND); 
  typedef bool (__cdecl *ISEDITMATCHPROC)(HWND);

  struct DialogButtonInfo {
    HWND button_handle;
    int button_control_id;
    bool button_exists;
    std::string accessibility_id;
    bool use_accessibility;
  };

  struct DialogButtonFindInfo {
    HWND button_handle;
    int button_control_id;
    ISBUTTONMATCHPROC match_proc;
  };

  struct TextLabelFindInfo {
    HWND label_handle;
    int control_id_found;
    int excluded_control_id;
  };

  struct TextBoxFindInfo {
    HWND textbox_handle;
    ISEDITMATCHPROC match_proc;
  };

  enum BUTTON_TYPE {
    OK,
    CANCEL
  };

  int SendKeysInternal(const std::string& keys,
                       TextBoxFindInfo* text_box_find_info);

  DialogButtonInfo GetDialogButton(BUTTON_TYPE button_type);
  int ClickAlertButton(DialogButtonInfo button_info);
  int ClickAlertButtonUsingAccessibility(const std::string& automation_id);
  std::string GetStandardDialogText(void);
  std::string GetDirectUIDialogText(void);
  HWND GetDirectUIChild(void);
  IAccessible* GetChildWithRole(IAccessible* parent,
                                long expected_role,
                                int index);

  static bool IsOKButton(HWND button_handle);
  static bool IsCancelButton(HWND button_handle);
  static bool IsLinkButton(HWND button_handle);
  static bool IsSimpleEdit(HWND edit_handle);
  static bool IsPasswordEdit(HWND edit_handle);
  static BOOL CALLBACK FindDialogButton(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindTextBox(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindTextLabel(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindDirectUIChild(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindTextBoxes(HWND hwnd, LPARAM arg);

  HWND alert_handle_;
  std::shared_ptr<DocumentHost> browser_;
  bool is_standard_alert_;
  bool is_security_alert_;
  bool is_standard_control_alert_;
};


} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSER_H_
