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


#ifndef WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_

#include "interactions.h"
#include "../Browser.h"
#include "../IECommandHandler.h"
#include "../IECommandExecutor.h"

namespace webdriver {

class SendModifierKeyCommandHandler : public IECommandHandler {
public:
	SendModifierKeyCommandHandler(void) {
	}

	virtual ~SendModifierKeyCommandHandler(void) {
	}

protected:
	void SendModifierKeyCommandHandler::ExecuteInternal(const IECommandExecutor& executor, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		ParametersMap::const_iterator value_parameter_iterator = command_parameters.find("value");
		ParametersMap::const_iterator is_down_parameter_iterator = command_parameters.find("isdown");
		if (value_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else if (command_parameters.find("isdown") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: isdown");
			return;
		} else {
			bool press_key = is_down_parameter_iterator->second.asBool();
			std::wstring key = CA2W(value_parameter_iterator->second.asCString(), CP_UTF8);
			BrowserHandle browser_wrapper;
			executor.GetCurrentBrowser(&browser_wrapper);
			HWND window_handle = browser_wrapper->GetWindowHandle();
			if (press_key) {
				sendKeyPress(window_handle, key.c_str());
			} else {
				sendKeyRelease(window_handle, key.c_str());
			}

			response->SetSuccessResponse(Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SENDMODIFIERKEYCOMMANDHANDLER_H_
