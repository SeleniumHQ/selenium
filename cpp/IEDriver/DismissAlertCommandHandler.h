#ifndef WEBDRIVER_IE_DISMISSALERTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_DISMISSALERTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class DismissAlertCommandHandler : public WebDriverCommandHandler {
public:
	DismissAlertCommandHandler(void) {
	}

	virtual ~DismissAlertCommandHandler(void) {
	}

protected:
	void DismissAlertCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
		manager->GetCurrentBrowser(&browser_wrapper);
		// This sleep is required to give IE time to draw the dialog.
		::Sleep(100);
		HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
		if (alert_handle == NULL) {
			response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
		} else {
			HWND button_handle = NULL;
			// Alert present, find the Cancel button.
			// Retry up to 10 times to find the dialog.
			int max_wait = 10;
			while ((button_handle == NULL) && --max_wait) {
				::EnumChildWindows(alert_handle, &DismissAlertCommandHandler::FindCancelButton, (LPARAM)&button_handle);
				if (button_handle == NULL) {
					::Sleep(50);
				}
			}

			if (button_handle == NULL) {
				response->SetErrorResponse(EUNHANDLEDERROR, "Could not find Cancel button");
			} else {
				// Now click on the Cancel button of the Alert
				::SendMessage(alert_handle, WM_COMMAND, IDCANCEL, NULL);
				response->SetResponse(SUCCESS, Json::Value::null);
			}
		}
	}

private:
	static BOOL CALLBACK DismissAlertCommandHandler::FindCancelButton(HWND hwnd, LPARAM arg) {
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

#endif // WEBDRIVER_IE_DISMISSALERTCOMMANDHANDLER_H_
