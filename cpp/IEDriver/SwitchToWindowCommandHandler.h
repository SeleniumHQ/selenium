#ifndef WEBDRIVER_IE_SWITCHTOWINDOWCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SWITCHTOWINDOWCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class SwitchToWindowCommandHandler : public WebDriverCommandHandler {
public:
	SwitchToWindowCommandHandler(void) {
	}

	virtual ~SwitchToWindowCommandHandler(void) {
	}

protected:
	void ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, Json::Value>::const_iterator name_parameter_iterator = command_parameters.find("name");
		if (name_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: name");
			return;
		} else {
			std::wstring found_browser_handle = L"";
			std::string desired_name = name_parameter_iterator->second.asString();

			std::vector<std::wstring> handle_list;
			manager->GetManagedBrowserHandles(&handle_list);
			for (unsigned int i = 0; i < handle_list.size(); ++i) {
				BrowserWrapper *browser_wrapper;
				int get_handle_loop_status_code = manager->GetManagedBrowser(handle_list[i], &browser_wrapper);
				if (get_handle_loop_status_code == SUCCESS) {
					std::string browser_name = this->GetWindowName(browser_wrapper->browser());
					if (browser_name == desired_name) {
						found_browser_handle = handle_list[i];
						break;
					}

					std::string browser_handle(CW2A(handle_list[i].c_str(), CP_UTF8));
					if (browser_handle == desired_name) {
						found_browser_handle = handle_list[i];
						break;
					}
				}
			}

			if (found_browser_handle == L"") {
				response->SetErrorResponse(ENOSUCHWINDOW, "No window found");
				return;
			} else {
				// Reset the path to the focused frame before switching window context.
				BrowserWrapper *current_browser;
				int status_code = manager->GetCurrentBrowser(&current_browser);
				if (status_code == SUCCESS) {
					current_browser->SetFocusedFrameByElement(NULL);
				}

				manager->set_current_browser_id(found_browser_handle);
				status_code = manager->GetCurrentBrowser(&current_browser);
				current_browser->set_wait_required(true);
				response->SetResponse(SUCCESS, Json::Value::null);
			}
		}
	}

private:
	std::string GetWindowName(IWebBrowser2* browser) {
		CComPtr<IDispatch> dispatch;
		HRESULT hr = browser->get_Document(&dispatch);
		if (FAILED(hr)) {
			return "";
		}
		CComQIPtr<IHTMLDocument2> doc(dispatch);
		if (!doc) {
			return "";
		}

		CComPtr<IHTMLWindow2> window;
		hr = doc->get_parentWindow(&window);
		if (FAILED(hr)) {
			return "";
		}

		std::string name("");
		CComBSTR window_name;
		hr = window->get_name(&window_name);
		if (window_name) {
			name = CW2A((BSTR)window_name, CP_UTF8);
		}
		return name;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SWITCHTOWINDOWCOMMANDHANDLER_H_
