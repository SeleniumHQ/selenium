#ifndef WEBDRIVER_IE_GETALLCOOKIESCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETALLCOOKIESCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class GetAllCookiesCommandHandler : public WebDriverCommandHandler {
public:
	GetAllCookiesCommandHandler(void) {
	}

	virtual ~GetAllCookiesCommandHandler(void) {
	}

protected:
	void GetAllCookiesCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		Json::Value response_value(Json::arrayValue);
		BrowserWrapper *browser_wrapper;
		int status_code = manager->GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}

		std::wstring cookie_string = browser_wrapper->GetCookies();
		while (cookie_string.size() > 0)
		{
			size_t cookie_delimiter_pos = cookie_string.find(L"; ");
			std::wstring cookie_element(cookie_string.substr(0, cookie_delimiter_pos));
			if (cookie_delimiter_pos == std::wstring::npos)
			{
				cookie_string = L"";
			}
			else
			{
				cookie_string = cookie_string.substr(cookie_delimiter_pos + 2);
			}

			Json::Value cookie_value(this->CreateJsonValueForCookie(cookie_element));
			response_value.append(cookie_value);
		}

		response->SetResponse(SUCCESS, response_value);
	}

private:
	Json::Value GetAllCookiesCommandHandler::CreateJsonValueForCookie(std::wstring cookie) {
		size_t cookie_element_separator_pos(cookie.find_first_of(L"="));
		std::string cookie_element_name(CW2A(cookie.substr(0, cookie_element_separator_pos).c_str(), CP_UTF8));
		std::string cookie_element_value(CW2A(cookie.substr(cookie_element_separator_pos + 1).c_str(), CP_UTF8));
		Json::Value cookie_value;
		cookie_value["name"] = cookie_element_name;
		cookie_value["value"] = cookie_element_value;
		cookie_value["secure"] = false;
		return cookie_value;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETALLCOOKIESCOMMANDHANDLER_H_
