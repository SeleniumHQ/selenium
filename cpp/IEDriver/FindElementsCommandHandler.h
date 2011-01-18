#ifndef WEBDRIVER_IE_FINDELEMENTSCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDELEMENTSCOMMANDHANDLER_H_

#include <ctime>
#include "BrowserManager.h"

namespace webdriver {

class FindElementsCommandHandler : public WebDriverCommandHandler {
public:
	FindElementsCommandHandler(void) {
	}

	virtual ~FindElementsCommandHandler(void) {
	}

protected:
	void FindElementsCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("using") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: using");
			return;
		} else if (command_parameters.find("value") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: value");
			return;
		} else {
			std::wstring mechanism = CA2W(command_parameters["using"].asString().c_str(), CP_UTF8);
			std::wstring value = CA2W(command_parameters["value"].asString().c_str(), CP_UTF8);

			ElementFinder *finder;
			int status_code = manager->GetElementFinder(mechanism, &finder);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unknown finder mechanism: " + command_parameters["using"].asString());
				return;
			}

			int timeout(manager->implicit_wait_timeout());
			clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
			if (timeout > 0 && timeout < 1000)  {
				end += 1 * CLOCKS_PER_SEC;
			}

			Json::Value found_elements(Json::arrayValue);
			do {
				status_code = finder->FindElements(manager, NULL, value, &found_elements);
				if (status_code == SUCCESS && found_elements.size() > 0) {
					break;
				} else {
					::Sleep(100);
				}
			} while (clock() < end);

			if (status_code == SUCCESS) {
				response->SetResponse(SUCCESS, found_elements);
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_FINDELEMENTSCOMMANDHANDLER_H_
