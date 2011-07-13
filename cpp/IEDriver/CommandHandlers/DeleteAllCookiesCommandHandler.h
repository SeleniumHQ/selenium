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

#ifndef WEBDRIVER_IE_DELETEALLCOOKIESCOMMANDHANDLER_H_
#define WEBDRIVER_IE_DELETEALLCOOKIESCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class DeleteAllCookiesCommandHandler : public IECommandHandler {
public:
	DeleteAllCookiesCommandHandler(void) {
	}

	virtual ~DeleteAllCookiesCommandHandler(void) {
	}

protected:
	void DeleteAllCookiesCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		BrowserHandle browser_wrapper;
		int status_code = executor.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}

		std::wstring cookie_string = browser_wrapper->GetCookies();
		while (cookie_string.size() > 0) {
			size_t cookie_delimiter_pos = cookie_string.find(L"; ");
			std::wstring cookie_element = cookie_string.substr(0, cookie_delimiter_pos);
			if (cookie_delimiter_pos == std::wstring::npos) {
				cookie_string = L"";
			} else {
				cookie_string = cookie_string.substr(cookie_delimiter_pos + 2);
			}

			std::wstring cookie_name = this->GetCookieName(cookie_element);
			status_code = browser_wrapper->DeleteCookie(cookie_name);
			if (status_code != SUCCESS) {
				std::string error_cookie_name(CW2A(cookie_name.c_str(), CP_UTF8));
				response->SetErrorResponse(status_code, "Unable to delete cookie with name '" + error_cookie_name + "'");
				return;
			}
		}

		response->SetSuccessResponse(Json::Value::null);
	}

private:
	std::wstring DeleteAllCookiesCommandHandler::GetCookieName(const std::wstring& cookie) {
		size_t cookie_separator_pos = cookie.find_first_of(L"=");
		std::wstring cookie_name = cookie.substr(0, cookie_separator_pos);
		return cookie_name;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_DELETEALLCOOKIESCOMMANDHANDLER_H_
