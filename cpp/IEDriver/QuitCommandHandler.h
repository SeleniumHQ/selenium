#ifndef WEBDRIVER_IE_QUITCOMMANDHANDLER_H_
#define WEBDRIVER_IE_QUITCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class QuitCommandHandler : public WebDriverCommandHandler {
public:
	QuitCommandHandler(void) {
	}

	virtual ~QuitCommandHandler(void) {
	}

protected:
	void QuitCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, WebDriverResponse * response) {
		std::vector<std::wstring> managed_browser_handles;
		session.GetManagedBrowserHandles(&managed_browser_handles);

		std::vector<std::wstring>::iterator end = managed_browser_handles.end();
		for (std::vector<std::wstring>::iterator it = managed_browser_handles.begin(); it != end; ++it) {
			BrowserHandle browser_wrapper;
			int status_code = session.GetManagedBrowser(*it, &browser_wrapper);
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
