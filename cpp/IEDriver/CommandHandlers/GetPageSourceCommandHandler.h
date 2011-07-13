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

#ifndef WEBDRIVER_IE_GETPAGESOURCECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETPAGESOURCECOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"
#include "logging.h"

namespace webdriver {

class GetPageSourceCommandHandler : public IECommandHandler {
public:
	GetPageSourceCommandHandler(void) {
	}

	virtual ~GetPageSourceCommandHandler(void) {
	}

protected:
	void GetPageSourceCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		BrowserHandle browser_wrapper;
		int status_code = executor.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}

		CComPtr<IHTMLDocument2> doc;
		browser_wrapper->GetDocument(&doc);
		
		CComPtr<IHTMLDocument3> doc3;
		CComQIPtr<IHTMLDocument3> doc_qi_pointer(doc);
		if (doc_qi_pointer) {
			doc3 = doc_qi_pointer.Detach();
		}

		if (!doc3) {
			response->SetErrorResponse(ENOSUCHDOCUMENT, "Unable to get document");
			return;
		}

		CComPtr<IHTMLElement> document_element;
		HRESULT hr = doc3->get_documentElement(&document_element);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Unable to get document element from page";
			response->SetSuccessResponse("");
			return;
		}

		CComBSTR html;
		hr = document_element->get_outerHTML(&html);
		if (FAILED(hr)) {
			LOGHR(WARN, hr) << "Have document element but cannot read source.";
			response->SetSuccessResponse("");
			return;
		}

		std::string page_source = CW2A(html, CP_UTF8);
		response->SetResponse(SUCCESS,page_source);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETPAGESOURCECOMMANDHANDLER_H_
