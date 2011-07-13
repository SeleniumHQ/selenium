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

#ifndef WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_

#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class GetElementTagNameCommandHandler : public IECommandHandler {
public:
	GetElementTagNameCommandHandler(void) {
	}

	virtual ~GetElementTagNameCommandHandler(void) {
	}

protected:
	void GetElementTagNameCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else {
			std::wstring element_id = CA2W(id_parameter_iterator->second.c_str(), CP_UTF8);
			ElementHandle element_wrapper;
			int status_code = this->GetElement(executor, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				CComBSTR temp;
				element_wrapper->element()->get_tagName(&temp);
				std::wstring tag_name = (BSTR)temp;
				std::transform(tag_name.begin(), tag_name.end(), tag_name.begin(), tolower);
				std::string return_value = CW2A(tag_name.c_str(), CP_UTF8);
				response->SetSuccessResponse(return_value);
				return;
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTTAGNAMECOMMANDHANDLER_H_
