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
	void AcceptAlertCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		BrowserHandle browser_wrapper;
		executor.GetCurrentBrowser(&browser_wrapper);
		// This sleep is required to give IE time to draw the dialog.
		::Sleep(100);
		HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
		if (alert_handle == NULL) {
			response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
		} else {
			HWND button_handle = NULL;
			WPARAM param = IDOK;
			// Alert present, find the OK button.
			// Retry up to 10 times to find the dialog.
			int max_wait = 10;
			while ((button_handle == NULL) && --max_wait) {
				::EnumChildWindows(alert_handle, &AcceptAlertCommandHandler::FindOKButton, (LPARAM)&button_handle);
				if (button_handle == NULL) {
					::Sleep(50);
				}
			}

			// No OK button on dialog. Look for a cancel button
			// (JavaScript alert() dialogs have a single button, but its ID
			// can be that of a "cancel" button.
			if (button_handle == NULL) {
				max_wait = 10;
				while ((button_handle == NULL) && --max_wait) {
					::EnumChildWindows(alert_handle, &AcceptAlertCommandHandler::FindCancelButton, (LPARAM)&button_handle);
					if (button_handle == NULL) {
						::Sleep(50);
					} else {
						param = IDCANCEL;
					}
				}
			}

			if (button_handle == NULL) {
				response->SetErrorResponse(EUNHANDLEDERROR, "Could not find OK button");
			} else {
				// Now click on the OK button of the Alert
				::SendMessage(alert_handle, WM_COMMAND, param, NULL);
				response->SetSuccessResponse(Json::Value::null);
			}
		}
	}

private:
	static BOOL CALLBACK AcceptAlertCommandHandler::FindOKButton(HWND hwnd, LPARAM arg) {
		HWND* dialog_handle = reinterpret_cast<HWND*>(arg);
		int control_id = ::GetDlgCtrlID(hwnd);
		if (control_id == IDOK) {
			*dialog_handle = hwnd;
			return FALSE;
		}
		return TRUE;
	}

	static BOOL CALLBACK AcceptAlertCommandHandler::FindCancelButton(HWND hwnd, LPARAM arg) {
		HWND* dialog_handle = reinterpret_cast<HWND*>(arg);
		int control_id = ::GetDlgCtrlID(hwnd);
		if (control_id == IDCANCEL) {
			*dialog_handle = hwnd;
			return FALSE;
		}
		return TRUE;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ACCEPTALERTCOMMANDHANDLER_H_
