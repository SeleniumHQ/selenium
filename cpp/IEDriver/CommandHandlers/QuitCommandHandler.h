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

#ifndef WEBDRIVER_IE_QUITCOMMANDHANDLER_H_
#define WEBDRIVER_IE_QUITCOMMANDHANDLER_H_

#include "Session.h"

namespace webdriver {

class QuitCommandHandler : public CommandHandler {
public:
	QuitCommandHandler(void) {
	}

	virtual ~QuitCommandHandler(void) {
	}

protected:
	void QuitCommandHandler::ExecuteInternal(const IESessionWindow& session, const LocatorMap& locator_parameters, const ParametersMap& command_parameters, Response * response) {
		std::vector<std::wstring> managed_browser_handles;
		session.GetManagedBrowserHandles(&managed_browser_handles);

		std::vector<std::wstring>::iterator end = managed_browser_handles.end();
		for (std::vector<std::wstring>::iterator it = managed_browser_handles.begin(); it != end; ++it) {
			BrowserHandle browser_wrapper;
			int status_code = session.GetManagedBrowser(*it, &browser_wrapper);
			if (status_code == SUCCESS && !browser_wrapper->is_closing()) {
				browser_wrapper->Close();
			}
		}

		// Calling quit will always result in an invalid session.
		IESessionWindow& mutable_session = const_cast<IESessionWindow&>(session);
		mutable_session.set_is_valid(false);
		response->SetResponse(SUCCESS, Json::Value::null);
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_QUITCOMMANDHANDLER_H_
