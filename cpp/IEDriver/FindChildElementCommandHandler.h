#ifndef WEBDRIVER_IE_FINDCHILDELEMENTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_FINDCHILDELEMENTCOMMANDHANDLER_H_

#include <ctime>
#include "BrowserManager.h"

namespace webdriver {

class FindChildElementCommandHandler : public WebDriverCommandHandler {
public:
	FindChildElementCommandHandler(void) {
	}

	virtual ~FindChildElementCommandHandler(void) {
	}

protected:
	void FindChildElementCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (locator_parameters.find("id") == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (command_parameters.find("using") == command_parameters.end()) {
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

			std::wstring element_id(CA2W(locator_parameters["id"].c_str(), CP_UTF8));

			ElementWrapper *parent_element_wrapper;
			status_code = this->GetElement(manager, element_id, &parent_element_wrapper);

			if (status_code == SUCCESS) {
				ElementWrapper *found_element;

				int timeout(manager->implicit_wait_timeout());
				clock_t end = clock() + (timeout / 1000 * CLOCKS_PER_SEC);
				if (timeout > 0 && timeout < 1000) {
					end += 1 * CLOCKS_PER_SEC;
				}

				do {
					status_code = finder->FindElement(manager, parent_element_wrapper, value, &found_element);
					if (status_code == SUCCESS)
					{
						break;
					}
				} while (clock() < end);

				if (status_code == SUCCESS) {
					response->SetResponse(SUCCESS, found_element->ConvertToJson());
					return;
				} else {
					response->SetErrorResponse(status_code, "Unable to find element with " + command_parameters["using"].asString() + " == " + command_parameters["value"].asString());
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
