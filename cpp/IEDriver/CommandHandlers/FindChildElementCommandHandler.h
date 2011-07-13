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

#ifndef WEBDRIVER_IE_FINDCHILDELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDCHILDELEMENTCOMMANDHANDLER_H_

#include <ctime>
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class FindChildElementCommandHandler : public IECommandHandler {
public:
	FindChildElementCommandHandler(void) {
	}

	virtual ~FindChildElementCommandHandler(void) {
	}

protected:
	void FindChildElementCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		ParametersMap::const_iterator using_parameter_iterator = command_parameters.find("using");
		ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (using_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: using");
			return;
		} else if (value_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else {
			std::wstring mechanism = CA2W(using_parameter_iterator->second.asString().c_str(), CP_UTF8);
			std::wstring value = CA2W(value_parameter_iterator->second.asString().c_str(), CP_UTF8);

			StringUtilities::ReplaceAllSubstrings(L"\\", L"\\\\", &value);
			StringUtilities::ReplaceAllSubstrings(L"\"", L"\\\"", &value);

			std::wstring mechanism_translation;
			int status_code = executor.GetElementFindMethod(mechanism, &mechanism_translation);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unknown finder mechanism: " + using_parameter_iterator->second.asString());
				return;
			}

			std::wstring element_id = CA2W(id_parameter_iterator->second.c_str(), CP_UTF8);

			ElementHandle parent_element_wrapper;
			status_code = this->GetElement(executor, element_id, &parent_element_wrapper);

			if (status_code == SUCCESS) {
				Json::Value found_element;

				int timeout = executor.implicit_wait_timeout();
				clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
				if (timeout > 0 && timeout < 1000) {
					end += 1 * CLOCKS_PER_SEC;
				}

				do {
					status_code = executor.LocateElement(parent_element_wrapper, mechanism_translation, value, &found_element);
					if (status_code == SUCCESS) {
						break;
					} else {
						// Release the thread so that the browser doesn't starve.
						::Sleep(FIND_ELEMENT_WAIT_TIME_IN_MILLISECONDS);
					}
				} while (clock() < end);

				if (status_code == SUCCESS) {
					response->SetSuccessResponse(found_element);
					return;
				} else {
					response->SetErrorResponse(status_code, "Unable to find element with " + using_parameter_iterator->second.asString() + " == " + value_parameter_iterator->second.asString());
					return;
				}
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDCHILDELEMENTCOMMANDHANDLER_H_
