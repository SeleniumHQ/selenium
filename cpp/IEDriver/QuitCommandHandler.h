#ifndef WEBDRIVER_IE_QUITCOMMANDHANDLER_H_
#define WEBDRIVER_IE_QUITCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class QuitCommandHandler : public WebDriverCommandHandler {
public:
	QuitCommandHandler(void) {
	}

	virtual ~QuitCommandHandler(void) {
	}

protected:
	void QuitCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::vector<std::wstring> managed_browser_handles;
		manager->GetManagedBrowserHandles(&managed_browser_handles);

		std::vector<std::wstring>::iterator end = managed_browser_handles.end();
		for (std::vector<std::wstring>::iterator it = managed_browser_handles.begin(); it != end; ++it) {
			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetManagedBrowser(*it, &browser_wrapper);
			if (status_code == SUCCESS && !browser_wrapper->is_closing()) {
				HRESULT hr = browser_wrapper->browser()->Quit();
				if (FAILED(hr)) {
					cout << "Quit failed: " << hr << "\r\n";
				}
			}
		}

		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_QUITCOMMANDHANDLER_H_
