// Copyright 2011 WebDriver committers
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
	void GetAlertTextCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		BrowserHandle browser_wrapper;
		executor.GetCurrentBrowser(&browser_wrapper);
		// This sleep is required to give IE time to draw the dialog.
		::Sleep(100);
		HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
		if (alert_handle == NULL) {
			response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
		} else {
			HWND label_handle = NULL;
			// Alert present, find the OK button.
			// Retry up to 10 times to find the dialog.
			int max_wait = 10;
			while ((label_handle == NULL) && --max_wait) {
				::EnumChildWindows(alert_handle, &GetAlertTextCommandHandler::FindTextLabel, reinterpret_cast<LPARAM>(&label_handle));
				if (label_handle == NULL) {
					::Sleep(50);
				}
			}

			if (label_handle == NULL) {
				response->SetErrorResponse(EUNHANDLEDERROR, "Could not find text");
			} else {
				int text_length = ::GetWindowTextLength(label_handle);
				std::vector<wchar_t> text_buffer(text_length + 1);
				::GetWindowText(label_handle, &text_buffer[0], text_length + 1);
				std::wstring alert_text = &text_buffer[0];
				std::string alert_text_value = CW2A(alert_text.c_str(), CP_UTF8);
				response->SetSuccessResponse(alert_text_value);
			}
		}
	}

private:
	static BOOL CALLBACK GetAlertTextCommandHandler::FindTextLabel(HWND hwnd, LPARAM arg) {
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
