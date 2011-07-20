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

#ifndef WEBDRIVER_IE_MOUSEMOVETOCOMMANDHANDLER_H_
#define WEBDRIVER_IE_MOUSEMOVETOCOMMANDHANDLER_H_

#include "interactions.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class MouseMoveToCommandHandler : public IECommandHandler {
public:
	MouseMoveToCommandHandler(void) {
	}

	virtual ~MouseMoveToCommandHandler(void) {
	}

protected:
	void MouseMoveToCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		ParametersMap::const_iterator element_parameter_iterator = command_parameters.find("element");
		ParametersMap::const_iterator xoffset_parameter_iterator = command_parameters.find("xoffset");
		ParametersMap::const_iterator yoffset_parameter_iterator = command_parameters.find("yoffset");
		bool element_specified(element_parameter_iterator != command_parameters.end());
		bool offset_specified((xoffset_parameter_iterator != command_parameters.end()) && (yoffset_parameter_iterator != command_parameters.end()));
		if (!element_specified && !offset_specified) {
			response->SetErrorResponse(400, "Missing parameters: element, xoffset, yoffset");
			return;
		} else {
			int status_code = SUCCESS;

			long start_x = executor.last_known_mouse_x();
			long start_y = executor.last_known_mouse_y();

			long end_x = start_x;
			long end_y = start_y;
			if (element_specified && !element_parameter_iterator->second.isNull()) {
				std::string element_id = element_parameter_iterator->second.asString();
				status_code = this->GetElementCoordinates(executor, element_id, offset_specified, &end_x, &end_y);
				if (status_code != SUCCESS) {
					response->SetErrorResponse(status_code, "Unable to locate element with id " + element_parameter_iterator->second.asString());
				}
			}

			if (offset_specified) {
				end_x += xoffset_parameter_iterator->second.asInt();
				end_y += yoffset_parameter_iterator->second.asInt();
			}

			BrowserHandle browser_wrapper;
			status_code = executor.GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get current browser");
			}

			HWND browser_window_handle = browser_wrapper->GetWindowHandle();
			LRESULT move_result = mouseMoveTo(browser_window_handle, executor.speed(), start_x, start_y, end_x, end_y);

			IECommandExecutor& mutable_executor = const_cast<IECommandExecutor&>(executor);
			mutable_executor.set_last_known_mouse_x(end_x);
			mutable_executor.set_last_known_mouse_y(end_y);

			response->SetSuccessResponse(Json::Value::null);
			return;
		}
	}

private:
	int MouseMoveToCommandHandler::GetElementCoordinates(const IECommandExecutor& executor, const std::string& element_id, bool get_element_origin, long *x_coordinate, long *y_coordinate) {
		ElementHandle target_element;
		int status_code = this->GetElement(executor, element_id, &target_element);
		if (status_code != SUCCESS) {
			return status_code;
		}

		long element_x, element_y, element_width, element_height;
		status_code = target_element->GetLocationOnceScrolledIntoView(&element_x, &element_y, &element_width, &element_height);
		if (status_code == SUCCESS) {
			if (get_element_origin) {
				*x_coordinate = element_x;
				*y_coordinate = element_y;
			} else {
				*x_coordinate = element_x + (element_width / 2);
				*y_coordinate = element_y + (element_height / 2);
			}
		}

		return SUCCESS;
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_MOUSEMOVETOCOMMANDHANDLER_H_
