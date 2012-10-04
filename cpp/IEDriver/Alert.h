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

#ifndef WEBDRIVER_ALERT_H_
#define WEBDRIVER_ALERT_H_

#include <string>
#include <vector>
#include "DocumentHost.h"
#include "ErrorCodes.h"

#define INVALID_CONTROL_ID -1

using namespace std;

namespace webdriver {

class Alert {
 public:
  Alert(BrowserHandle browser, HWND handle);
  virtual ~Alert(void);

  int Accept(void);
  int Dismiss(void);
  int SendKeys(std::string keys);
  std::string GetText(void);

  bool is_standard_alert(void) const { return this->is_standard_alert_; }

 private:
  typedef bool (__cdecl *ISBUTTONMATCHPROC)(HWND); 

  struct DialogButtonInfo {
    HWND button_handle;
    int button_control_id;
    bool button_exists;
  };

  struct DialogButtonFindInfo {
    HWND button_handle;
    int button_control_id;
    ISBUTTONMATCHPROC match_proc;
  };

  enum BUTTON_TYPE {
    OK,
    CANCEL
  };

  DialogButtonInfo GetDialogButton(BUTTON_TYPE button_type);
  int ClickAlertButton(DialogButtonInfo button_info);

  static bool IsOKButton(HWND button_handle);
  static bool IsCancelButton(HWND button_handle);
  static BOOL CALLBACK FindDialogButton(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindTextBox(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindTextLabel(HWND hwnd, LPARAM arg);
  static BOOL CALLBACK FindDirectUIChild(HWND hwnd, LPARAM arg);

  HWND alert_handle_;
  BrowserHandle browser_;
  bool is_standard_alert_;
};


} // namespace webdriver

#endif // WEBDRIVER_IE_BROWSER_H_
