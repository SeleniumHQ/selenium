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

#ifndef WEBDRIVER_IE_GETALERTTEXTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETALERTTEXTCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class GetAlertTextCommandHandler : public IECommandHandler {
 public:
  GetAlertTextCommandHandler(void) {
  }

  virtual ~GetAlertTextCommandHandler(void) {
  }

 protected:
    void ExecuteInternal(const IECommandExecutor& executor,
                       const LocatorMap& locator_parameters,
                       const ParametersMap& command_parameters,
                       Response* response) {
    BrowserHandle browser_wrapper;
    executor.GetCurrentBrowser(&browser_wrapper);

	int timeout = executor.implicit_wait_timeout();
    clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
    if (timeout > 0 && timeout < 1000) {
      end += 1 * CLOCKS_PER_SEC;
    }

    std::string alert_text_value = "";
    HWND alert_handle = NULL;
    do
    {
      alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
      if (alert_handle != NULL) {
        HWND label_handle = NULL;
        // Alert present, find the text label, if present.
        ::EnumChildWindows(alert_handle,
                           &GetAlertTextCommandHandler::FindTextLabel,
                           reinterpret_cast<LPARAM>(&label_handle));

        if (label_handle != NULL) {
          int text_length = ::GetWindowTextLength(label_handle);
          std::vector<wchar_t> text_buffer(text_length + 1);
          ::GetWindowText(label_handle, &text_buffer[0], text_length + 1);
          std::wstring alert_text = &text_buffer[0];
          alert_text_value = CW2A(alert_text.c_str(), CP_UTF8);
          break;
        }
      }
      if (timeout > 0) {
        // Release the thread so that the browser doesn't starve.
        ::Sleep(WAIT_TIME_IN_MILLISECONDS);
      }
    } while (clock() < end);

    if (alert_handle == NULL) {
      response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
      return;
    }

    response->SetSuccessResponse(alert_text_value);
    return;
  }

private:
  static BOOL CALLBACK FindTextLabel(HWND hwnd, LPARAM arg) {
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
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETALERTTEXTCOMMANDHANDLER_H_
