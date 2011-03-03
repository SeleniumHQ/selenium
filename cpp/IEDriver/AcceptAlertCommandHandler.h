#ifndef WEBDRIVER_IE_ACCEPTALERTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_ACCEPTALERTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class AcceptAlertCommandHandler : public WebDriverCommandHandler {
public:
	AcceptAlertCommandHandler(void) {
	}

	virtual ~AcceptAlertCommandHandler(void) {
	}

protected:
	void AcceptAlertCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		BrowserWrapper* browser_wrapper;
		manager->GetCurrentBrowser(&browser_wrapper);
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
				response->SetResponse(SUCCESS, Json::Value::null);
			}
		}
	}

private:
	static BOOL CALLBACK AcceptAlertCommandHandler::FindOKButton(HWND hwnd, LPARAM arg) {
		HWND *dialog_handle = (HWND*)arg;
		int control_id = ::GetDlgCtrlID(hwnd);
		if (control_id == IDOK) {
			*dialog_handle = hwnd;
			return FALSE;
		}
		return TRUE;
	}

	static BOOL CALLBACK AcceptAlertCommandHandler::FindCancelButton(HWND hwnd, LPARAM arg) {
		HWND *dialog_handle = (HWND*)arg;
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
