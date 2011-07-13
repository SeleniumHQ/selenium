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

#ifndef WEBDRIVER_IE_GETCURRENTURLCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETCURRENTURLCOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "logging.h"

namespace webdriver {

class GetCurrentUrlCommandHandler : public IECommandHandler {
public:
	GetCurrentUrlCommandHandler(void) {
	}

	virtual ~GetCurrentUrlCommandHandler(void) {
	}

protected:
	void GetCurrentUrlCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		BrowserHandle browser_wrapper;
		int status_code = executor.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}

		CComPtr<IHTMLDocument2> doc;
		browser_wrapper->GetDocument(&doc);

		if (!doc) {
			response->SetResponse(ENOSUCHDOCUMENT, "Unable to get document");
			return;
		}

		CComBSTR url;
		HRESULT hr = doc->get_URL(&url);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Unable to get current URL";
			response->SetSuccessResponse("");
			return;
		}

		std::string url_str = CW2A((LPCWSTR)url, CP_UTF8);
		response->SetSuccessResponse(url_str);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETCURRENTURLCOMMANDHANDLER_H_
