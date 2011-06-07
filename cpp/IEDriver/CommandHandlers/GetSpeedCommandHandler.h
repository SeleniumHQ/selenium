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
#ifndef WEBDRIVER_IE_GETSPEEDCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETSPEEDCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class GetSpeedCommandHandler : public CommandHandler {
public:
	GetSpeedCommandHandler(void) {
	}

	virtual ~GetSpeedCommandHandler(void) {
	}

protected:
	void GetSpeedCommandHandler::ExecuteInternal(const IESessionWindow& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		int speed = session.speed();
		switch (speed) {
		  case 1000:
			response->SetResponse(SUCCESS, "SLOW");
			break;
		  case 500:
			response->SetResponse(SUCCESS, "MEDIUM");
			break;
		  default:
			response->SetResponse(SUCCESS, "FAST");
			break;
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE__H_
