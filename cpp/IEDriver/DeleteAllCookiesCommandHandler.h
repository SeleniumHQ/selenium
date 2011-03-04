#ifndef WEBDRIVER_IE_DELETEALLCOOKIESCOMMANDHANDLER_H_
#define WEBDRIVER_IE_DELETEALLCOOKIESCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class DeleteAllCookiesCommandHandler : public WebDriverCommandHandler {
public:
	DeleteAllCookiesCommandHandler(void) {
	}

	virtual ~DeleteAllCookiesCommandHandler(void) {
	}

protected:
	void DeleteAllCookiesCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::tr1::shared_ptr<BrowserWrapper> browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}

		std::wstring cookie_string = browser_wrapper->GetCookies();
		while (cookie_string.size() > 0) {
			size_t cookie_delimiter_pos = cookie_string.find(L"; ");
			std::wstring cookie_element(cookie_string.substr(0, cookie_delimiter_pos));
			if (cookie_delimiter_pos == std::wstring::npos) {
				cookie_string = L"";
			} else {
				cookie_string = cookie_string.substr(cookie_delimiter_pos + 2);
			}

			std::wstring cookie_name(this->GetCookieName(cookie_element));
			status_code = browser_wrapper->DeleteCookie(cookie_name);
			if (status_code != SUCCESS) {
				std::string error_cookie_name(CW2A(cookie_name.c_str(), CP_UTF8));
				response->SetErrorResponse(status_code, "Unable to delete cookie with name '" + error_cookie_name + "'");
				return;
			}
		}

		response->SetResponse(SUCCESS, Json::Value::null);
	}

private:
	std::wstring DeleteAllCookiesCommandHandler::GetCookieName(std::wstring cookie) {
		size_t cookie_separator_pos(cookie.find_first_of(L"="));
		std::wstring cookie_name(cookie.substr(0, cookie_separator_pos));
		return cookie_name;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_DELETEALLCOOKIESCOMMANDHANDLER_H_
