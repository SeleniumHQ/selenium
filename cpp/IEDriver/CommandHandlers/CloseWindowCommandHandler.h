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

#ifndef WEBDRIVER_IE_CLOSEWINDOWCOMMANDHANDLER_H_
#define WEBDRIVER_IE_CLOSEWINDOWCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class CloseWindowCommandHandler : public CommandHandler {
public:
	CloseWindowCommandHandler(void) {
	}

	virtual ~CloseWindowCommandHandler(void) {
	}

protected:
	void CloseWindowCommandHandler::ExecuteInternal(const Session& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		// The session should end if the user sends a quit command,
		// or if the user sends a close command with exactly 1 window
		// open, per spec. Removing the window from the managed browser
		// list depends on events, which may be asynchronous, so cache
		// the window count *before* closing the current window.
		size_t current_window_count = session.managed_window_count();

		// TODO: Check HRESULT values for errors.
		BrowserHandle browser_wrapper;
		int status_code = session.GetCurrentBrowser(&browser_wrapper);
		if (status_code != SUCCESS) {
			response->SetErrorResponse(status_code, "Unable to get browser");
			return;
		}
		browser_wrapper->Close();

		if (current_window_count == 1) {
			Session& mutable_session = const_cast<Session&>(session);
			mutable_session.set_is_valid(false);
		}
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_CLOSEWINDOWCOMMANDHANDLER_H_
