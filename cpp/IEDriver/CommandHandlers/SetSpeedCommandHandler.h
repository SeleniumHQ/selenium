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

#ifndef WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class SetSpeedCommandHandler : public CommandHandler {
public:
	SetSpeedCommandHandler(void) {
	}

	virtual ~SetSpeedCommandHandler(void) {
	}

protected:
	void SetSpeedCommandHandler::ExecuteInternal(const IESessionWindow& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		ParametersMap::const_iterator speed_parameter_iterator = command_parameters.find("speed");
		if (speed_parameter_iterator == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: speed");
			return;
		} else {
			std::string speed = speed_parameter_iterator->second.asString();
			IESessionWindow& mutable_session = const_cast<IESessionWindow&>(session);
			if (strcmp(speed.c_str(), SPEED_SLOW) == 0) {
				mutable_session.set_speed(1000);
			} else if (strcmp(speed.c_str(), SPEED_MEDIUM) == 0) {
				mutable_session.set_speed(500);
			} else {
				mutable_session.set_speed(0);
			}
			response->SetResponse(SUCCESS, Json::Value::null);
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_SETSPEEDCOMMANDHANDLER_H_
