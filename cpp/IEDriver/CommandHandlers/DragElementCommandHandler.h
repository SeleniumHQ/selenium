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

#ifndef WEBDRIVER_IE_DRAGELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_DRAGELEMENTCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class DragElementCommandHandler : public CommandHandler {
public:
	DragElementCommandHandler(void) {
	}

	virtual ~DragElementCommandHandler(void) {
	}

protected:
	void DragElementCommandHandler::ExecuteInternal(const IESessionWindow& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		LocatorMap::const_iterator id_parameter_iterator = locator_parameters.find("id");
		ParametersMap::const_iterator x_parameter_iterator = command_parameters.find("x");
		ParametersMap::const_iterator y_parameter_iterator = command_parameters.find("y");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (x_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: x");
			return;
		} else if (y_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: y");
			return;
		} else {
			std::wstring element_id = CA2W(id_parameter_iterator->second.c_str(), CP_UTF8);

			int x = x_parameter_iterator->second.asInt();
			int y = y_parameter_iterator->second.asInt();

			BrowserHandle browser_wrapper;
			int status_code = session.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ElementHandle element_wrapper;
			status_code = this->GetElement(session, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				status_code = element_wrapper->DragBy(x, y, session.speed());
				if (status_code == SUCCESS) {
					response->SetResponse(SUCCESS, Json::Value::null);
					return;
				} else {
					response->SetErrorResponse(status_code, "Drag element failed.");
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

#endif // WEBDRIVER_IE_DRAGELEMENTCOMMANDHANDLER_H_
