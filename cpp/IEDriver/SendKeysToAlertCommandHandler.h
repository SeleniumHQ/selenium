#ifndef WEBDRIVER_IE_SENDKEYSTOALERTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDKEYSTOALERTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class SendKeysToAlertCommandHandler : public WebDriverCommandHandler {
public:

	SendKeysToAlertCommandHandler(void)
	{
	}

	virtual ~SendKeysToAlertCommandHandler(void)
	{
	}
protected:
	void SendKeysToAlertCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, Json::Value>::const_iterator text_parameter_iterator = command_parameters.find("text");
		if (text_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: text");
			return;
		}

		std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
		manager->GetCurrentBrowser(&browser_wrapper);
		// This sleep is required to give IE time to draw the dialog.
		::Sleep(100);
		HWND alert_handle = browser_wrapper->GetActiveDialogWindowHandle();
		if (alert_handle == NULL) {
			response->SetErrorResponse(EMODALDIALOGOPEN, "No alert is active");
		} else {
			HWND text_box_handle = NULL;
			// Alert present, find the OK button.
			// Retry up to 10 times to find the dialog.
			int max_wait = 10;
			while ((text_box_handle == NULL) && --max_wait) {
				::EnumChildWindows(alert_handle, &SendKeysToAlertCommandHandler::FindTextBox, (LPARAM)&text_box_handle);
				if (text_box_handle == NULL) {
					::Sleep(50);
				}
			}

			if (text_box_handle == NULL) {
				response->SetErrorResponse(EUNHANDLEDERROR, "Could not find text box");
			} else {
				std::wstring text(CA2W(text_parameter_iterator->second.asString().c_str(), CP_UTF8));
				::SendMessage(text_box_handle, WM_SETTEXT, NULL, (LPARAM)text.c_str());
				response->SetResponse(SUCCESS, Json::Value::null);
			}
		}
	}

private:
	static BOOL CALLBACK SendKeysToAlertCommandHandler::FindTextBox(HWND hwnd, LPARAM arg) {
		HWND *dialog_handle = (HWND*)arg;
		TCHAR child_window_class[100];
		::GetClassName(hwnd, child_window_class, 100);

		if (wcscmp(child_window_class, L"Edit") == 0) {
			*dialog_handle = hwnd;
			return FALSE;
		}
		return TRUE;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDKEYSTOALERTCOMMANDHANDLER_H_
